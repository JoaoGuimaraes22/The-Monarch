// src/lib/novels/act-service.ts
// Act operations including create, update, delete, and reorder

import { prisma } from "@/lib/prisma";
import { Act, UpdateActData, CreateActOptions } from "./types";
import { closeOrderGaps, getNextOrder } from "./utils/order-management";

export class ActService {
  /**
   * Update act metadata
   */
  async updateAct(actId: string, data: UpdateActData): Promise<Act> {
    try {
      const updatedAct = await prisma.act.update({
        where: { id: actId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              scenes: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      return updatedAct;
    } catch (error) {
      console.error("Error updating act:", error);
      throw new Error("Failed to update act");
    }
  }

  /**
   * Create a new act in a novel
   */
  async createAct(options: CreateActOptions): Promise<Act> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify novel exists
        const novel = await tx.novel.findUnique({
          where: { id: options.novelId },
          include: {
            acts: {
              orderBy: { order: "asc" },
            },
          },
        });

        if (!novel) {
          throw new Error("Novel not found");
        }

        // Determine the order for the new act
        let newOrder = 1;

        if (options.insertAfterActId) {
          // Insert after specific act
          const afterAct = novel.acts.find(
            (a) => a.id === options.insertAfterActId
          );
          if (afterAct) {
            newOrder = afterAct.order + 1;

            // Shift all acts after this position
            await tx.act.updateMany({
              where: {
                novelId: options.novelId,
                order: {
                  gte: newOrder,
                },
              },
              data: {
                order: {
                  increment: 1,
                },
              },
            });
          }
        } else {
          // Add at the end
          newOrder = getNextOrder(novel.acts);
        }

        // Generate default title if not provided
        const actTitle = options.title || `Act ${newOrder}`;

        // Create the new act
        const newAct = await tx.act.create({
          data: {
            title: actTitle,
            order: newOrder,
            novelId: options.novelId,
          },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: {
                scenes: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        });

        // Automatically create Chapter 1 with Scene 1 for the new act
        await tx.chapter.create({
          data: {
            title: "Chapter 1",
            order: 1,
            actId: newAct.id,
            scenes: {
              create: {
                title: "Scene 1",
                content: "", // Empty content initially
                wordCount: 0,
                order: 1, // First scene
                status: "draft",
                povCharacter: null,
                sceneType: "",
                notes: "",
              },
            },
          },
        });

        // Return the act with the newly created chapter and scene
        const actWithStructure = await tx.act.findUnique({
          where: { id: newAct.id },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: {
                scenes: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        });

        return actWithStructure!;
      });
    } catch (error) {
      console.error("Error creating act:", error);
      throw new Error("Failed to create act");
    }
  }

  /**
   * Delete a specific act and all its chapters/scenes
   */
  async deleteAct(actId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get the act to find the novel ID for word count update
        const act = await tx.act.findUnique({
          where: { id: actId },
          include: {
            chapters: {
              include: {
                scenes: true,
              },
            },
          },
        });

        if (!act) {
          throw new Error("Act not found");
        }

        const deletedOrder = act.order;
        const novelId = act.novelId;

        // Delete all scenes in this act
        await tx.scene.deleteMany({
          where: {
            chapter: {
              actId: actId,
            },
          },
        });

        // Delete all chapters in this act
        await tx.chapter.deleteMany({
          where: { actId: actId },
        });

        // Delete the act
        await tx.act.delete({
          where: { id: actId },
        });

        // Get remaining acts
        const remainingActs = await tx.act.findMany({
          where: { novelId },
          orderBy: { order: "asc" },
        });

        // Close gaps in the order sequence
        await closeOrderGaps(
          remainingActs,
          deletedOrder,
          async (id: string, order: number) => {
            await tx.act.update({
              where: { id },
              data: { order, updatedAt: new Date() },
            });
          }
        );

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
          where: {
            chapter: {
              act: {
                novelId: novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: novelId },
          data: { wordCount: totalWordCount },
        });
      });
    } catch (error) {
      console.error("Error deleting act:", error);
      throw new Error("Failed to delete act");
    }
  }

  /**
   * Reorder an act within the same novel (DRAG-AND-DROP)
   */
  async reorderAct(actId: string, newOrder: number): Promise<Act> {
    try {
      console.log("🔄 Starting act reorder transaction:", {
        actId,
        newOrder,
      });

      const result = await prisma.$transaction(async (tx) => {
        // Get the act to move
        const actToMove = await tx.act.findUnique({
          where: { id: actId },
        });

        if (!actToMove) {
          throw new Error("Act not found");
        }

        const novelId = actToMove.novelId;
        const oldOrder = actToMove.order;

        console.log("📊 Act move details:", {
          novelId,
          oldOrder,
          newOrder,
        });

        if (oldOrder === newOrder) {
          console.log("⚡ No change needed - same position");
          // Still need to return with full structure
          return await tx.act.findUnique({
            where: { id: actId },
            include: {
              chapters: {
                orderBy: { order: "asc" },
                include: {
                  scenes: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          });
        }

        if (oldOrder < newOrder) {
          // Moving down: shift acts between oldOrder+1 and newOrder down by 1
          await tx.act.updateMany({
            where: {
              novelId: novelId,
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        } else {
          // Moving up: shift acts between newOrder and oldOrder-1 up by 1
          await tx.act.updateMany({
            where: {
              novelId: novelId,
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }

        // Update the moved act and include full structure to match interface
        return await tx.act.update({
          where: { id: actId },
          data: {
            order: newOrder,
            updatedAt: new Date(),
          },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: {
                scenes: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        });
      });

      if (!result) {
        throw new Error("Failed to reorder act");
      }

      console.log("✅ Act reorder completed");
      return result;
    } catch (error) {
      console.error("❌ Act reorder failed:", error);
      throw new Error(
        `Failed to reorder act: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get act by ID with full structure
   */
  async getActById(actId: string): Promise<Act | null> {
    try {
      const act = await prisma.act.findUnique({
        where: { id: actId },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              scenes: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
      return act;
    } catch (error) {
      console.error("Error fetching act:", error);
      throw new Error("Failed to fetch act");
    }
  }

  /**
   * Get all acts in a novel
   */
  async getActsByNovel(novelId: string): Promise<Act[]> {
    try {
      const acts = await prisma.act.findMany({
        where: { novelId },
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              scenes: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
      return acts;
    } catch (error) {
      console.error("Error fetching acts by novel:", error);
      throw new Error("Failed to fetch acts");
    }
  }
}
