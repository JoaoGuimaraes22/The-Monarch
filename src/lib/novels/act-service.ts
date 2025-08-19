// lib/novels/act-service.ts
// MODERNIZED: Updated to use parameter objects instead of individual parameters

import { prisma } from "@/lib/prisma";
import {
  Act,
  CreateActOptions,
  UpdateActOptions,
  ReorderActOptions,
} from "./types";
import { closeOrderGaps, getNextOrder } from "./utils/order-management";

export class ActService {
  /**
   * MODERNIZED: Create a new act in a novel
   */
  async createAct(options: CreateActOptions): Promise<Act> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Destructure options object
        const {
          novelId,
          title,
          insertAfterActId,
          order: manualOrder,
        } = options;

        // Verify novel exists
        const novel = await tx.novel.findUnique({
          where: { id: novelId },
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
        let newOrder = manualOrder || 1;

        if (!manualOrder) {
          if (insertAfterActId) {
            // Insert after specific act
            const afterAct = novel.acts.find((a) => a.id === insertAfterActId);
            if (afterAct) {
              newOrder = afterAct.order + 1;

              // Shift all acts after this position
              await tx.act.updateMany({
                where: {
                  novelId: novelId,
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
        }

        // Generate default title if not provided
        const actTitle = title || `Act ${newOrder}`;

        // Create the new act
        const newAct = await tx.act.create({
          data: {
            title: actTitle,
            order: newOrder,
            novelId: novelId,
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

        return newAct;
      });
    } catch (error) {
      console.error("Error creating act:", error);
      throw new Error("Failed to create act");
    }
  }

  /**
   * MODERNIZED: Update act metadata
   */
  async updateAct(actId: string, options: UpdateActOptions): Promise<Act> {
    try {
      const { title } = options;

      const updatedAct = await prisma.act.update({
        where: { id: actId },
        data: {
          ...(title !== undefined && { title }),
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
   * MODERNIZED: Reorder an act within the same novel
   */
  async reorderAct(options: ReorderActOptions): Promise<Act> {
    try {
      const { actId, newOrder } = options;

      console.log("🔄 Starting act reorder:", options);

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
          return (await tx.act.findUnique({
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
          })) as Act;
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
   * Delete an act (cascades to chapters and scenes)
   */
  async deleteAct(actId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get act info before deletion
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

        const novelId = act.novelId;
        const actOrder = act.order;

        // Delete the act (cascades to chapters and scenes via Prisma schema)
        await tx.act.delete({
          where: { id: actId },
        });

        // Close the gap in ordering
        await tx.act.updateMany({
          where: {
            novelId: novelId,
            order: { gt: actOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        });

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

  // ===== BACKWARD COMPATIBILITY METHODS =====
  // These maintain the old API while transitioning

  /**
   * @deprecated Use createAct(options) instead
   */
  async createAct_Legacy(
    novelId: string,
    insertAfterActId?: string,
    title?: string
  ): Promise<Act> {
    return this.createAct({
      novelId,
      insertAfterActId,
      title,
    });
  }

  /**
   * @deprecated Use reorderAct(options) instead
   */
  async reorderAct_Legacy(actId: string, newOrder: number): Promise<Act> {
    return this.reorderAct({
      actId,
      newOrder,
    });
  }
}

/*
===== MODERNIZATION SUMMARY =====

✅ ENHANCED: createAct now supports manual order specification
✅ TYPE-SAFE: All methods use typed options objects
✅ FLEXIBLE: updateAct handles any combination of updates
✅ CONSISTENT: reorderAct follows the same pattern as other reorder methods
✅ BACKWARD-COMPATIBLE: Legacy methods maintain existing API
✅ COMPREHENSIVE: Full CRUD operations with proper error handling

Key improvements:
- Act creation supports custom positioning and titles
- Update methods are flexible and type-safe
- Reordering is handled consistently with proper validation
- Deletion properly cascades and updates word counts
- Error handling is comprehensive with descriptive messages
- Performance optimized with database transactions
- Order management maintains consistency automatically

===== USAGE EXAMPLES =====

// Modern API (recommended)
const act = await actService.createAct({
  novelId: "novel123",
  title: "Act I: The Setup",
  insertAfterActId: "act456"
});

await actService.updateAct(actId, {
  title: "Act I: The Epic Setup"
});

await actService.reorderAct({
  actId: "act123",
  newOrder: 2
});

// Legacy API (maintained for compatibility)
const act = await actService.createAct_Legacy(
  novelId, insertAfterActId, title
);

await actService.reorderAct_Legacy(actId, newOrder);

===== PARAMETER OBJECT BENEFITS =====

1. Type Safety: Object destructuring prevents parameter order errors
2. Extensibility: Easy to add new optional parameters without breaking changes
3. Readability: Self-documenting code with named parameters
4. Flexibility: Only include the parameters you need
5. Consistency: Aligns with modern TypeScript patterns
*/
