import { prisma } from "./prisma";

// TypeScript interfaces for our data
export interface CreateNovelData {
  title: string;
  description: string;
  coverImage?: string;
}

export interface Novel {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NovelWithStructure extends Novel {
  acts: Act[];
}

export interface Act {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  content: string;
  wordCount: number;
  order: number;
  povCharacter: string | null;
  sceneType: string;
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportStructureData {
  acts: {
    title: string;
    order: number;
    chapters: {
      title: string;
      order: number;
      scenes: {
        content: string;
        order: number;
        wordCount: number;
      }[];
    }[];
  }[];
}

// Database operations for novels
export const novelService = {
  // Get all novels (basic info only)
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
  },

  // Get a single novel by ID (basic info only)
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
  },

  // Get novel with full structure (acts, chapters, scenes)
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
  },

  // Create a new novel
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
  },

  // Import structure into existing novel
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
                  content: sceneData.content,
                  wordCount: sceneData.wordCount,
                  order: sceneData.order,
                  chapterId: chapter.id,
                  status: "draft",
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
  },

  // Update an existing novel
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
  },

  // Delete a novel (cascades to all acts, chapters, scenes)
  async deleteNovel(id: string): Promise<void> {
    try {
      await prisma.novel.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting novel:", error);
      throw new Error("Failed to delete novel");
    }
  },

  // Update a scene's content
  async updateScene(sceneId: string, content: string): Promise<Scene> {
    try {
      // Calculate word count
      const wordCount = content
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      const scene = await prisma.scene.update({
        where: { id: sceneId },
        data: {
          content,
          wordCount,
          updatedAt: new Date(),
        },
      });

      // Update novel's total word count
      await this.recalculateNovelWordCount(sceneId);

      return scene;
    } catch (error) {
      console.error("Error updating scene:", error);
      throw new Error("Failed to update scene");
    }
  },

  // Recalculate total word count for a novel
  async recalculateNovelWordCount(sceneId: string): Promise<void> {
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

      if (!sceneWithRelations) return;

      const novelId = sceneWithRelations.chapter.act.novelId;

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
    }
  },

  // Delete a specific scene
  async deleteScene(sceneId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get the scene to find the chapter, act, and novel IDs
        const scene = await tx.scene.findUnique({
          where: { id: sceneId },
          include: {
            chapter: {
              include: {
                act: true,
              },
            },
          },
        });

        if (!scene) {
          throw new Error("Scene not found");
        }

        // Delete the scene
        await tx.scene.delete({
          where: { id: sceneId },
        });

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
          where: {
            chapter: {
              act: {
                novelId: scene.chapter.act.novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: scene.chapter.act.novelId },
          data: { wordCount: totalWordCount },
        });

        // Reorder remaining scenes in the chapter
        const remainingScenes = await tx.scene.findMany({
          where: { chapterId: scene.chapterId },
          orderBy: { order: "asc" },
        });

        // Reorder scenes sequentially starting from 1
        for (let i = 0; i < remainingScenes.length; i++) {
          await tx.scene.update({
            where: { id: remainingScenes[i].id },
            data: { order: i + 1 },
          });
        }
      });
    } catch (error) {
      console.error("Error deleting scene:", error);
      throw new Error("Failed to delete scene");
    }
  },

  // Delete a specific chapter and all its scenes
  async deleteChapter(chapterId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get the chapter to find the act and novel IDs
        const chapter = await tx.chapter.findUnique({
          where: { id: chapterId },
          include: {
            act: true,
            scenes: true,
          },
        });

        if (!chapter) {
          throw new Error("Chapter not found");
        }

        // Delete all scenes in this chapter
        await tx.scene.deleteMany({
          where: { chapterId: chapterId },
        });

        // Delete the chapter
        await tx.chapter.delete({
          where: { id: chapterId },
        });

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
          where: {
            chapter: {
              act: {
                novelId: chapter.act.novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: chapter.act.novelId },
          data: { wordCount: totalWordCount },
        });

        // Reorder remaining chapters in the act
        const remainingChapters = await tx.chapter.findMany({
          where: { actId: chapter.actId },
          orderBy: { order: "asc" },
        });

        // Reorder chapters sequentially starting from 1
        for (let i = 0; i < remainingChapters.length; i++) {
          await tx.chapter.update({
            where: { id: remainingChapters[i].id },
            data: { order: i + 1 },
          });
        }
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      throw new Error("Failed to delete chapter");
    }
  },

  // Delete a specific act and all its chapters/scenes
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

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
          where: {
            chapter: {
              act: {
                novelId: act.novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: act.novelId },
          data: { wordCount: totalWordCount },
        });

        // Reorder remaining acts
        const remainingActs = await tx.act.findMany({
          where: { novelId: act.novelId },
          orderBy: { order: "asc" },
        });

        // Reorder acts sequentially starting from 1
        for (let i = 0; i < remainingActs.length; i++) {
          await tx.act.update({
            where: { id: remainingActs[i].id },
            data: { order: i + 1 },
          });
        }
      });
    } catch (error) {
      console.error("Error deleting act:", error);
      throw new Error("Failed to delete act");
    }
  },

  // Delete entire manuscript structure (all acts, chapters, scenes)
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
  },

  // Add these methods to your existing novelService object in src/lib/novels.ts

  // Create a new scene in a chapter
  async createScene(
    chapterId: string,
    insertAfterSceneId?: string
  ): Promise<Scene> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify chapter exists
        const chapter = await tx.chapter.findUnique({
          where: { id: chapterId },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
            act: true, // Need this for word count recalculation
          },
        });

        if (!chapter) {
          throw new Error("Chapter not found");
        }

        // Determine the order for the new scene
        let newOrder = 1;

        if (insertAfterSceneId) {
          // Insert after specific scene
          const afterScene = chapter.scenes.find(
            (s) => s.id === insertAfterSceneId
          );
          if (afterScene) {
            newOrder = afterScene.order + 1;

            // Shift all scenes after this position
            await tx.scene.updateMany({
              where: {
                chapterId: chapterId,
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
          newOrder = chapter.scenes.length + 1;
        }

        // Create the new scene
        const newScene = await tx.scene.create({
          data: {
            content: "", // Empty content initially
            wordCount: 0,
            order: newOrder,
            chapterId: chapterId,
            status: "draft",
            povCharacter: null,
            sceneType: "",
            notes: "",
          },
        });

        return newScene;
      });
    } catch (error) {
      console.error("Error creating scene:", error);
      throw new Error("Failed to create scene");
    }
  },

  // Create a new chapter in an act
  async createChapter(
    actId: string,
    insertAfterChapterId?: string,
    title?: string
  ): Promise<Chapter> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify act exists
        const act = await tx.act.findUnique({
          where: { id: actId },
          include: {
            chapters: {
              orderBy: { order: "asc" },
            },
          },
        });

        if (!act) {
          throw new Error("Act not found");
        }

        // Determine the order for the new chapter
        let newOrder = 1;

        if (insertAfterChapterId) {
          // Insert after specific chapter
          const afterChapter = act.chapters.find(
            (c) => c.id === insertAfterChapterId
          );
          if (afterChapter) {
            newOrder = afterChapter.order + 1;

            // Shift all chapters after this position
            await tx.chapter.updateMany({
              where: {
                actId: actId,
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
          newOrder = act.chapters.length + 1;
        }

        // Generate default title if not provided
        const chapterTitle = title || `Chapter ${newOrder}`;

        // Create the new chapter with scenes included
        const newChapter = await tx.chapter.create({
          data: {
            title: chapterTitle,
            order: newOrder,
            actId: actId,
          },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        // ✨ NEW: Automatically create Scene 1 for the new chapter
        await tx.scene.create({
          data: {
            content: "", // Empty content initially
            wordCount: 0,
            order: 1, // First scene
            chapterId: newChapter.id,
            status: "draft",
            povCharacter: null,
            sceneType: "",
            notes: "",
          },
        });

        // Return the chapter with the newly created scene
        const chapterWithScene = await tx.chapter.findUnique({
          where: { id: newChapter.id },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        return chapterWithScene!;
      });
    } catch (error) {
      console.error("Error creating chapter:", error);
      throw new Error("Failed to create chapter");
    }
  },
};
