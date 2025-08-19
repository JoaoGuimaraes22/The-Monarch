// src/lib/novels/novel-service.ts
// Core novel CRUD operations

import { prisma } from "@/lib/prisma";
import {
  Novel,
  NovelWithStructure,
  CreateNovelData,
  ImportStructureData,
} from "./types";
import { calculateWordCount } from "./utils/word-count";

export class NovelService {
  /**
   * Get all novels (basic info only)
   */
  async getAllNovels(): Promise<Novel[]> {
    try {
      const novels = await prisma.novel.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      });
      return novels;
    } catch (error) {
      console.error("Error fetching novels:", error);
      throw new Error("Failed to fetch novels");
    }
  }

  /**
   * Get a single novel by ID (basic info only)
   */
  async getNovelById(id: string): Promise<Novel | null> {
    try {
      const novel = await prisma.novel.findUnique({
        where: { id },
      });
      return novel;
    } catch (error) {
      console.error("Error fetching novel:", error);
      throw new Error("Failed to fetch novel");
    }
  }

  /**
   * Get novel with full structure (acts, chapters, scenes)
   */
  async getNovelWithStructure(id: string): Promise<NovelWithStructure | null> {
    try {
      const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
          acts: {
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
          },
        },
      });
      return novel;
    } catch (error) {
      console.error("Error fetching novel with structure:", error);
      throw new Error("Failed to fetch novel structure");
    }
  }

  /**
   * Create a new novel
   */
  async createNovel(data: CreateNovelData): Promise<Novel> {
    try {
      const novel = await prisma.novel.create({
        data: {
          title: data.title,
          description: data.description,
          coverImage: data.coverImage || null,
          wordCount: 0,
        },
      });
      return novel;
    } catch (error) {
      console.error("Error creating novel:", error);
      throw new Error("Failed to create novel");
    }
  }

  /**
   * Update an existing novel
   */
  async updateNovel(
    id: string,
    data: Partial<CreateNovelData>
  ): Promise<Novel> {
    try {
      const novel = await prisma.novel.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return novel;
    } catch (error) {
      console.error("Error updating novel:", error);
      throw new Error("Failed to update novel");
    }
  }

  /**
   * Delete a novel (cascades to all acts, chapters, scenes)
   */
  async deleteNovel(id: string): Promise<void> {
    try {
      await prisma.novel.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting novel:", error);
      throw new Error("Failed to delete novel");
    }
  }

  /**
   * Import structure into existing novel
   */
  async importStructure(
    novelId: string,
    structure: ImportStructureData
  ): Promise<NovelWithStructure> {
    try {
      // Start a transaction to ensure all data is created atomically
      const result = await prisma.$transaction(async (tx) => {
        // First, delete existing structure if any
        await tx.scene.deleteMany({
          where: {
            chapter: {
              act: {
                novelId: novelId,
              },
            },
          },
        });

        await tx.chapter.deleteMany({
          where: {
            act: {
              novelId: novelId,
            },
          },
        });

        await tx.act.deleteMany({
          where: { novelId: novelId },
        });

        // Create new structure
        let totalWordCount = 0;

        for (const actData of structure.acts) {
          const act = await tx.act.create({
            data: {
              title: actData.title,
              order: actData.order,
              novelId: novelId,
            },
          });

          for (const chapterData of actData.chapters) {
            const chapter = await tx.chapter.create({
              data: {
                title: chapterData.title,
                order: chapterData.order,
                actId: act.id,
              },
            });

            for (const sceneData of chapterData.scenes) {
              await tx.scene.create({
                data: {
                  title: `Scene ${sceneData.order}`,
                  content: sceneData.content,
                  wordCount: sceneData.wordCount,
                  order: sceneData.order,
                  chapterId: chapter.id,
                  status: "draft",
                  povCharacter: null,
                  sceneType: "",
                  notes: "",
                },
              });

              totalWordCount += sceneData.wordCount;
            }
          }
        }

        // Update novel word count
        await tx.novel.update({
          where: { id: novelId },
          data: { wordCount: totalWordCount },
        });

        // Return the complete novel with structure
        return await tx.novel.findUnique({
          where: { id: novelId },
          include: {
            acts: {
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
            },
          },
        });
      });

      if (!result) {
        throw new Error("Failed to import structure");
      }

      return result;
    } catch (error) {
      console.error("Error importing structure:", error);
      throw new Error("Failed to import manuscript structure");
    }
  }

  /**
   * Clear all structure (acts, chapters, scenes) from a novel
   * This is a destructive operation that removes all content while keeping the novel itself
   */
  async clearNovelStructure(novelId: string): Promise<void> {
    try {
      console.log(`🗑️ Clearing structure for novel: ${novelId}`);

      // Verify novel exists first
      const novel = await prisma.novel.findUnique({
        where: { id: novelId },
      });

      if (!novel) {
        throw new Error("Novel not found");
      }

      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        console.log("🔄 Starting structure clearing transaction...");

        // Delete all scenes first (due to foreign key constraints)
        const deletedScenes = await tx.scene.deleteMany({
          where: {
            chapter: {
              act: {
                novelId: novelId,
              },
            },
          },
        });
        console.log(`📝 Deleted ${deletedScenes.count} scenes`);

        // Delete all chapters
        const deletedChapters = await tx.chapter.deleteMany({
          where: {
            act: {
              novelId: novelId,
            },
          },
        });
        console.log(`📚 Deleted ${deletedChapters.count} chapters`);

        // Delete all acts
        const deletedActs = await tx.act.deleteMany({
          where: { novelId: novelId },
        });
        console.log(`🎭 Deleted ${deletedActs.count} acts`);

        // Reset novel word count to 0
        await tx.novel.update({
          where: { id: novelId },
          data: {
            wordCount: 0,
            updatedAt: new Date(),
          },
        });
        console.log("📊 Reset novel word count to 0");

        console.log("✅ Structure clearing transaction completed successfully");
      });

      console.log(
        `🎉 Novel structure cleared successfully for: ${novel.title}`
      );
    } catch (error) {
      console.error("❌ Failed to clear novel structure:", error);
      throw new Error(
        `Failed to clear novel structure: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete entire manuscript structure (all acts, chapters, scenes)
   */
  async deleteManuscriptStructure(novelId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete all scenes in the novel
        await tx.scene.deleteMany({
          where: {
            chapter: {
              act: {
                novelId: novelId,
              },
            },
          },
        });

        // Delete all chapters in the novel
        await tx.chapter.deleteMany({
          where: {
            act: {
              novelId: novelId,
            },
          },
        });

        // Delete all acts in the novel
        await tx.act.deleteMany({
          where: { novelId: novelId },
        });

        // Reset novel word count
        await tx.novel.update({
          where: { id: novelId },
          data: { wordCount: 0 },
        });
      });
    } catch (error) {
      console.error("Error deleting manuscript structure:", error);
      throw new Error("Failed to delete manuscript structure");
    }
  }

  /**
   * Recalculate total word count for a novel
   */
  async recalculateNovelWordCount(novelId: string): Promise<void> {
    try {
      // Calculate total word count for the novel
      const result = await prisma.scene.aggregate({
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

      // Update the novel's word count
      await prisma.novel.update({
        where: { id: novelId },
        data: { wordCount: totalWordCount },
      });
    } catch (error) {
      console.error("Error recalculating word count:", error);
      throw new Error("Failed to recalculate novel word count");
    }
  }

  /**
   * Recalculate word count from a scene ID (finds novel through relations)
   */
  async recalculateNovelWordCountFromScene(sceneId: string): Promise<void> {
    try {
      // Get the novel ID through the scene's chapter and act
      const sceneWithRelations = await prisma.scene.findUnique({
        where: { id: sceneId },
        include: {
          chapter: {
            include: {
              act: true,
            },
          },
        },
      });

      if (!sceneWithRelations) {
        throw new Error("Scene not found");
      }

      const novelId = sceneWithRelations.chapter.act.novelId;
      await this.recalculateNovelWordCount(novelId);
    } catch (error) {
      console.error("Error recalculating word count from scene:", error);
      throw new Error("Failed to recalculate novel word count");
    }
  }
}
