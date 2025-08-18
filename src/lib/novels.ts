// import { prisma } from "./prisma";

// // TypeScript interfaces for our data
// export interface CreateNovelData {
//   title: string;
//   description: string;
//   coverImage?: string;
// }

// export interface Novel {
//   id: string;
//   title: string;
//   description: string;
//   coverImage: string | null;
//   wordCount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface NovelWithStructure extends Novel {
//   acts: Act[];
// }

// export interface Act {
//   id: string;
//   title: string;
//   order: number;
//   chapters: Chapter[];
// }

// export interface Chapter {
//   id: string;
//   title: string;
//   order: number;
//   scenes: Scene[];
// }

// export interface Scene {
//   id: string;
//   title: string; // ✨ NEW: Scene title field
//   content: string;
//   wordCount: number;
//   order: number;
//   povCharacter: string | null;
//   sceneType: string;
//   notes: string;
//   status: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // ✨ NEW: Update interfaces
// export interface UpdateActData {
//   title?: string;
// }

// export interface UpdateChapterData {
//   title?: string;
// }

// export interface UpdateSceneMetadata {
//   title?: string;
//   povCharacter?: string | null;
//   sceneType?: string;
//   notes?: string;
//   status?: string;
// }

// export interface ImportStructureData {
//   acts: {
//     title: string;
//     order: number;
//     chapters: {
//       title: string;
//       order: number;
//       scenes: {
//         content: string;
//         order: number;
//         wordCount: number;
//       }[];
//     }[];
//   }[];
// }

// // Database operations for novels
// export const novelService = {
//   // Get all novels (basic info only)
//   async getAllNovels(): Promise<Novel[]> {
//     try {
//       const novels = await prisma.novel.findMany({
//         orderBy: {
//           updatedAt: "desc",
//         },
//       });
//       return novels;
//     } catch (error) {
//       console.error("Error fetching novels:", error);
//       throw new Error("Failed to fetch novels");
//     }
//   },

//   // Get a single novel by ID (basic info only)
//   async getNovelById(id: string): Promise<Novel | null> {
//     try {
//       const novel = await prisma.novel.findUnique({
//         where: { id },
//       });
//       return novel;
//     } catch (error) {
//       console.error("Error fetching novel:", error);
//       throw new Error("Failed to fetch novel");
//     }
//   },

//   // Get novel with full structure (acts, chapters, scenes)
//   async getNovelWithStructure(id: string): Promise<NovelWithStructure | null> {
//     try {
//       const novel = await prisma.novel.findUnique({
//         where: { id },
//         include: {
//           acts: {
//             orderBy: { order: "asc" },
//             include: {
//               chapters: {
//                 orderBy: { order: "asc" },
//                 include: {
//                   scenes: {
//                     orderBy: { order: "asc" },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//       return novel;
//     } catch (error) {
//       console.error("Error fetching novel with structure:", error);
//       throw new Error("Failed to fetch novel structure");
//     }
//   },

//   // Create a new novel
//   async createNovel(data: CreateNovelData): Promise<Novel> {
//     try {
//       const novel = await prisma.novel.create({
//         data: {
//           title: data.title,
//           description: data.description,
//           coverImage: data.coverImage || null,
//           wordCount: 0,
//         },
//       });
//       return novel;
//     } catch (error) {
//       console.error("Error creating novel:", error);
//       throw new Error("Failed to create novel");
//     }
//   },

//   // Import structure into existing novel
//   async importStructure(
//     novelId: string,
//     structure: ImportStructureData
//   ): Promise<NovelWithStructure> {
//     try {
//       // Start a transaction to ensure all data is created atomically
//       const result = await prisma.$transaction(async (tx) => {
//         // First, delete existing structure if any
//         await tx.scene.deleteMany({
//           where: {
//             chapter: {
//               act: {
//                 novelId: novelId,
//               },
//             },
//           },
//         });

//         await tx.chapter.deleteMany({
//           where: {
//             act: {
//               novelId: novelId,
//             },
//           },
//         });

//         await tx.act.deleteMany({
//           where: { novelId: novelId },
//         });

//         // Create new structure
//         let totalWordCount = 0;

//         for (const actData of structure.acts) {
//           const act = await tx.act.create({
//             data: {
//               title: actData.title,
//               order: actData.order,
//               novelId: novelId,
//             },
//           });

//           for (const chapterData of actData.chapters) {
//             const chapter = await tx.chapter.create({
//               data: {
//                 title: chapterData.title,
//                 order: chapterData.order,
//                 actId: act.id,
//               },
//             });

//             for (const sceneData of chapterData.scenes) {
//               await tx.scene.create({
//                 data: {
//                   title: `Scene ${sceneData.order}`, // ✨ NEW: Default scene title
//                   content: sceneData.content,
//                   wordCount: sceneData.wordCount,
//                   order: sceneData.order,
//                   chapterId: chapter.id,
//                   status: "draft",
//                 },
//               });

//               totalWordCount += sceneData.wordCount;
//             }
//           }
//         }

//         // Update novel word count
//         await tx.novel.update({
//           where: { id: novelId },
//           data: { wordCount: totalWordCount },
//         });

//         // Return the complete novel with structure
//         return await tx.novel.findUnique({
//           where: { id: novelId },
//           include: {
//             acts: {
//               orderBy: { order: "asc" },
//               include: {
//                 chapters: {
//                   orderBy: { order: "asc" },
//                   include: {
//                     scenes: {
//                       orderBy: { order: "asc" },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         });
//       });

//       if (!result) {
//         throw new Error("Failed to import structure");
//       }

//       return result;
//     } catch (error) {
//       console.error("Error importing structure:", error);
//       throw new Error("Failed to import manuscript structure");
//     }
//   },

//   // Update an existing novel
//   async updateNovel(
//     id: string,
//     data: Partial<CreateNovelData>
//   ): Promise<Novel> {
//     try {
//       const novel = await prisma.novel.update({
//         where: { id },
//         data: {
//           ...data,
//           updatedAt: new Date(),
//         },
//       });
//       return novel;
//     } catch (error) {
//       console.error("Error updating novel:", error);
//       throw new Error("Failed to update novel");
//     }
//   },

//   // Delete a novel (cascades to all acts, chapters, scenes)
//   async deleteNovel(id: string): Promise<void> {
//     try {
//       await prisma.novel.delete({
//         where: { id },
//       });
//     } catch (error) {
//       console.error("Error deleting novel:", error);
//       throw new Error("Failed to delete novel");
//     }
//   },

//   // ✨ ENHANCED: Update scene content and/or metadata
//   async updateScene(
//     sceneId: string,
//     content: string,
//     metadata?: UpdateSceneMetadata
//   ): Promise<Scene> {
//     try {
//       // Calculate word count
//       const wordCount = content
//         .replace(/<[^>]*>/g, " ")
//         .trim()
//         .split(/\s+/)
//         .filter((word) => word.length > 0).length;

//       // Build update data
//       const updateData: {
//         content: string;
//         wordCount: number;
//         updatedAt: Date;
//         title?: string;
//         povCharacter?: string | null;
//         sceneType?: string;
//         notes?: string;
//         status?: string;
//       } = {
//         content,
//         wordCount,
//         updatedAt: new Date(),
//       };

//       // Add metadata if provided
//       if (metadata) {
//         Object.assign(updateData, metadata);
//       }

//       const scene = await prisma.scene.update({
//         where: { id: sceneId },
//         data: updateData,
//       });

//       // Update novel's total word count
//       await this.recalculateNovelWordCount(sceneId);

//       return scene;
//     } catch (error) {
//       console.error("Error updating scene:", error);
//       throw new Error("Failed to update scene");
//     }
//   },

//   // ✨ NEW: Update scene metadata only (without content/word count changes)
//   async updateSceneMetadata(
//     sceneId: string,
//     data: UpdateSceneMetadata
//   ): Promise<Scene> {
//     try {
//       const updatedScene = await prisma.scene.update({
//         where: { id: sceneId },
//         data: {
//           ...data,
//           updatedAt: new Date(),
//         },
//       });

//       return updatedScene;
//     } catch (error) {
//       console.error("Error updating scene metadata:", error);
//       throw new Error("Failed to update scene metadata");
//     }
//   },

//   // ✨ NEW: Update act metadata
//   async updateAct(actId: string, data: UpdateActData): Promise<Act> {
//     try {
//       const updatedAct = await prisma.act.update({
//         where: { id: actId },
//         data: {
//           ...data,
//           updatedAt: new Date(),
//         },
//         include: {
//           chapters: {
//             orderBy: { order: "asc" },
//             include: {
//               scenes: {
//                 orderBy: { order: "asc" },
//               },
//             },
//           },
//         },
//       });

//       return updatedAct;
//     } catch (error) {
//       console.error("Error updating act:", error);
//       throw new Error("Failed to update act");
//     }
//   },

//   // ✨ NEW: Update chapter metadata
//   async updateChapter(
//     chapterId: string,
//     data: UpdateChapterData
//   ): Promise<Chapter> {
//     try {
//       const updatedChapter = await prisma.chapter.update({
//         where: { id: chapterId },
//         data: {
//           ...data,
//           updatedAt: new Date(),
//         },
//         include: {
//           scenes: {
//             orderBy: { order: "asc" },
//           },
//         },
//       });

//       return updatedChapter;
//     } catch (error) {
//       console.error("Error updating chapter:", error);
//       throw new Error("Failed to update chapter");
//     }
//   },

//   // Recalculate total word count for a novel
//   async recalculateNovelWordCount(sceneId: string): Promise<void> {
//     try {
//       // Get the novel ID through the scene's chapter and act
//       const sceneWithRelations = await prisma.scene.findUnique({
//         where: { id: sceneId },
//         include: {
//           chapter: {
//             include: {
//               act: true,
//             },
//           },
//         },
//       });

//       if (!sceneWithRelations) return;

//       const novelId = sceneWithRelations.chapter.act.novelId;

//       // Calculate total word count for the novel
//       const result = await prisma.scene.aggregate({
//         where: {
//           chapter: {
//             act: {
//               novelId: novelId,
//             },
//           },
//         },
//         _sum: {
//           wordCount: true,
//         },
//       });

//       const totalWordCount = result._sum.wordCount || 0;

//       // Update the novel's word count
//       await prisma.novel.update({
//         where: { id: novelId },
//         data: { wordCount: totalWordCount },
//       });
//     } catch (error) {
//       console.error("Error recalculating word count:", error);
//     }
//   },

//   // Delete a specific scene
//   async deleteScene(sceneId: string): Promise<void> {
//     try {
//       await prisma.$transaction(async (tx) => {
//         // Get the scene to find the chapter, act, and novel IDs
//         const scene = await tx.scene.findUnique({
//           where: { id: sceneId },
//           include: {
//             chapter: {
//               include: {
//                 act: true,
//               },
//             },
//           },
//         });

//         if (!scene) {
//           throw new Error("Scene not found");
//         }

//         // Delete the scene
//         await tx.scene.delete({
//           where: { id: sceneId },
//         });

//         // Recalculate novel word count
//         const result = await tx.scene.aggregate({
//           where: {
//             chapter: {
//               act: {
//                 novelId: scene.chapter.act.novelId,
//               },
//             },
//           },
//           _sum: {
//             wordCount: true,
//           },
//         });

//         const totalWordCount = result._sum.wordCount || 0;

//         await tx.novel.update({
//           where: { id: scene.chapter.act.novelId },
//           data: { wordCount: totalWordCount },
//         });

//         // Reorder remaining scenes in the chapter
//         const remainingScenes = await tx.scene.findMany({
//           where: { chapterId: scene.chapterId },
//           orderBy: { order: "asc" },
//         });

//         // Reorder scenes sequentially starting from 1
//         for (let i = 0; i < remainingScenes.length; i++) {
//           await tx.scene.update({
//             where: { id: remainingScenes[i].id },
//             data: { order: i + 1 },
//           });
//         }
//       });
//     } catch (error) {
//       console.error("Error deleting scene:", error);
//       throw new Error("Failed to delete scene");
//     }
//   },

//   // Delete a specific chapter and all its scenes
//   async deleteChapter(chapterId: string): Promise<void> {
//     try {
//       await prisma.$transaction(async (tx) => {
//         // Get the chapter to find the act and novel IDs
//         const chapter = await tx.chapter.findUnique({
//           where: { id: chapterId },
//           include: {
//             act: true,
//             scenes: true,
//           },
//         });

//         if (!chapter) {
//           throw new Error("Chapter not found");
//         }

//         // Delete all scenes in this chapter
//         await tx.scene.deleteMany({
//           where: { chapterId: chapterId },
//         });

//         // Delete the chapter
//         await tx.chapter.delete({
//           where: { id: chapterId },
//         });

//         // Recalculate novel word count
//         const result = await tx.scene.aggregate({
//           where: {
//             chapter: {
//               act: {
//                 novelId: chapter.act.novelId,
//               },
//             },
//           },
//           _sum: {
//             wordCount: true,
//           },
//         });

//         const totalWordCount = result._sum.wordCount || 0;

//         await tx.novel.update({
//           where: { id: chapter.act.novelId },
//           data: { wordCount: totalWordCount },
//         });

//         // Reorder remaining chapters in the act
//         const remainingChapters = await tx.chapter.findMany({
//           where: { actId: chapter.actId },
//           orderBy: { order: "asc" },
//         });

//         // Reorder chapters sequentially starting from 1
//         for (let i = 0; i < remainingChapters.length; i++) {
//           await tx.chapter.update({
//             where: { id: remainingChapters[i].id },
//             data: { order: i + 1 },
//           });
//         }
//       });
//     } catch (error) {
//       console.error("Error deleting chapter:", error);
//       throw new Error("Failed to delete chapter");
//     }
//   },

//   // Delete a specific act and all its chapters/scenes
//   async deleteAct(actId: string): Promise<void> {
//     try {
//       await prisma.$transaction(async (tx) => {
//         // Get the act to find the novel ID for word count update
//         const act = await tx.act.findUnique({
//           where: { id: actId },
//           include: {
//             chapters: {
//               include: {
//                 scenes: true,
//               },
//             },
//           },
//         });

//         if (!act) {
//           throw new Error("Act not found");
//         }

//         // Delete all scenes in this act
//         await tx.scene.deleteMany({
//           where: {
//             chapter: {
//               actId: actId,
//             },
//           },
//         });

//         // Delete all chapters in this act
//         await tx.chapter.deleteMany({
//           where: { actId: actId },
//         });

//         // Delete the act
//         await tx.act.delete({
//           where: { id: actId },
//         });

//         // Recalculate novel word count
//         const result = await tx.scene.aggregate({
//           where: {
//             chapter: {
//               act: {
//                 novelId: act.novelId,
//               },
//             },
//           },
//           _sum: {
//             wordCount: true,
//           },
//         });

//         const totalWordCount = result._sum.wordCount || 0;

//         await tx.novel.update({
//           where: { id: act.novelId },
//           data: { wordCount: totalWordCount },
//         });

//         // Reorder remaining acts
//         const remainingActs = await tx.act.findMany({
//           where: { novelId: act.novelId },
//           orderBy: { order: "asc" },
//         });

//         // Reorder acts sequentially starting from 1
//         for (let i = 0; i < remainingActs.length; i++) {
//           await tx.act.update({
//             where: { id: remainingActs[i].id },
//             data: { order: i + 1 },
//           });
//         }
//       });
//     } catch (error) {
//       console.error("Error deleting act:", error);
//       throw new Error("Failed to delete act");
//     }
//   },

//   // Delete entire manuscript structure (all acts, chapters, scenes)
//   async deleteManuscriptStructure(novelId: string): Promise<void> {
//     try {
//       await prisma.$transaction(async (tx) => {
//         // Delete all scenes in the novel
//         await tx.scene.deleteMany({
//           where: {
//             chapter: {
//               act: {
//                 novelId: novelId,
//               },
//             },
//           },
//         });

//         // Delete all chapters in the novel
//         await tx.chapter.deleteMany({
//           where: {
//             act: {
//               novelId: novelId,
//             },
//           },
//         });

//         // Delete all acts in the novel
//         await tx.act.deleteMany({
//           where: { novelId: novelId },
//         });

//         // Reset novel word count
//         await tx.novel.update({
//           where: { id: novelId },
//           data: { wordCount: 0 },
//         });
//       });
//     } catch (error) {
//       console.error("Error deleting manuscript structure:", error);
//       throw new Error("Failed to delete manuscript structure");
//     }
//   },

//   // Create a new scene in a chapter
//   async createScene(
//     chapterId: string,
//     insertAfterSceneId?: string
//   ): Promise<Scene> {
//     try {
//       return await prisma.$transaction(async (tx) => {
//         // Verify chapter exists
//         const chapter = await tx.chapter.findUnique({
//           where: { id: chapterId },
//           include: {
//             scenes: {
//               orderBy: { order: "asc" },
//             },
//             act: true, // Need this for word count recalculation
//           },
//         });

//         if (!chapter) {
//           throw new Error("Chapter not found");
//         }

//         // Determine the order for the new scene
//         let newOrder = 1;

//         if (insertAfterSceneId) {
//           // Insert after specific scene
//           const afterScene = chapter.scenes.find(
//             (s) => s.id === insertAfterSceneId
//           );
//           if (afterScene) {
//             newOrder = afterScene.order + 1;

//             // Shift all scenes after this position
//             await tx.scene.updateMany({
//               where: {
//                 chapterId: chapterId,
//                 order: {
//                   gte: newOrder,
//                 },
//               },
//               data: {
//                 order: {
//                   increment: 1,
//                 },
//               },
//             });
//           }
//         } else {
//           // Add at the end
//           newOrder = chapter.scenes.length + 1;
//         }

//         // Create the new scene
//         const newScene = await tx.scene.create({
//           data: {
//             title: `Scene ${newOrder}`, // ✨ NEW: Default scene title
//             content: "", // Empty content initially
//             wordCount: 0,
//             order: newOrder,
//             chapterId: chapterId,
//             status: "draft",
//             povCharacter: null,
//             sceneType: "",
//             notes: "",
//           },
//         });

//         return newScene;
//       });
//     } catch (error) {
//       console.error("Error creating scene:", error);
//       throw new Error("Failed to create scene");
//     }
//   },

//   // Create a new chapter in an act
//   async createChapter(
//     actId: string,
//     insertAfterChapterId?: string,
//     title?: string
//   ): Promise<Chapter> {
//     try {
//       return await prisma.$transaction(async (tx) => {
//         // Verify act exists
//         const act = await tx.act.findUnique({
//           where: { id: actId },
//           include: {
//             chapters: {
//               orderBy: { order: "asc" },
//             },
//           },
//         });

//         if (!act) {
//           throw new Error("Act not found");
//         }

//         // Determine the order for the new chapter
//         let newOrder = 1;

//         if (insertAfterChapterId) {
//           // Insert after specific chapter
//           const afterChapter = act.chapters.find(
//             (c) => c.id === insertAfterChapterId
//           );
//           if (afterChapter) {
//             newOrder = afterChapter.order + 1;

//             // Shift all chapters after this position
//             await tx.chapter.updateMany({
//               where: {
//                 actId: actId,
//                 order: {
//                   gte: newOrder,
//                 },
//               },
//               data: {
//                 order: {
//                   increment: 1,
//                 },
//               },
//             });
//           }
//         } else {
//           // Add at the end
//           newOrder = act.chapters.length + 1;
//         }

//         // Generate default title if not provided
//         const chapterTitle = title || `Chapter ${newOrder}`;

//         // Create the new chapter with scenes included
//         const newChapter = await tx.chapter.create({
//           data: {
//             title: chapterTitle,
//             order: newOrder,
//             actId: actId,
//           },
//           include: {
//             scenes: {
//               orderBy: { order: "asc" },
//             },
//           },
//         });

//         // ✨ NEW: Automatically create Scene 1 for the new chapter
//         await tx.scene.create({
//           data: {
//             title: "Scene 1", // ✨ NEW: Default scene title
//             content: "", // Empty content initially
//             wordCount: 0,
//             order: 1, // First scene
//             chapterId: newChapter.id,
//             status: "draft",
//             povCharacter: null,
//             sceneType: "",
//             notes: "",
//           },
//         });

//         // Return the chapter with the newly created scene
//         const chapterWithScene = await tx.chapter.findUnique({
//           where: { id: newChapter.id },
//           include: {
//             scenes: {
//               orderBy: { order: "asc" },
//             },
//           },
//         });

//         return chapterWithScene!;
//       });
//     } catch (error) {
//       console.error("Error creating chapter:", error);
//       throw new Error("Failed to create chapter");
//     }
//   },

//   // Add this method to your src/lib/novels.ts file in the novelService object

//   // Create a new act in a novel
//   async createAct(
//     novelId: string,
//     insertAfterActId?: string,
//     title?: string
//   ): Promise<Act> {
//     try {
//       return await prisma.$transaction(async (tx) => {
//         // Verify novel exists
//         const novel = await tx.novel.findUnique({
//           where: { id: novelId },
//           include: {
//             acts: {
//               orderBy: { order: "asc" },
//             },
//           },
//         });

//         if (!novel) {
//           throw new Error("Novel not found");
//         }

//         // Determine the order for the new act
//         let newOrder = 1;

//         if (insertAfterActId) {
//           // Insert after specific act
//           const afterAct = novel.acts.find((a) => a.id === insertAfterActId);
//           if (afterAct) {
//             newOrder = afterAct.order + 1;

//             // Shift all acts after this position
//             await tx.act.updateMany({
//               where: {
//                 novelId: novelId,
//                 order: {
//                   gte: newOrder,
//                 },
//               },
//               data: {
//                 order: {
//                   increment: 1,
//                 },
//               },
//             });
//           }
//         } else {
//           // Add at the end
//           newOrder = novel.acts.length + 1;
//         }

//         // Generate default title if not provided
//         const actTitle = title || `Act ${newOrder}`;

//         // Create the new act with initial chapter and scene
//         const newAct = await tx.act.create({
//           data: {
//             title: actTitle,
//             order: newOrder,
//             novelId: novelId,
//           },
//           include: {
//             chapters: {
//               orderBy: { order: "asc" },
//               include: {
//                 scenes: {
//                   orderBy: { order: "asc" },
//                 },
//               },
//             },
//           },
//         });

//         // ✨ Automatically create Chapter 1 with Scene 1 for the new act
//         await tx.chapter.create({
//           data: {
//             title: "Chapter 1",
//             order: 1,
//             actId: newAct.id,
//             scenes: {
//               create: {
//                 title: "Scene 1",
//                 content: "", // Empty content initially
//                 wordCount: 0,
//                 order: 1, // First scene
//                 status: "draft",
//                 povCharacter: null,
//                 sceneType: "",
//                 notes: "",
//               },
//             },
//           },
//         });

//         // Return the act with the newly created chapter and scene
//         const actWithStructure = await tx.act.findUnique({
//           where: { id: newAct.id },
//           include: {
//             chapters: {
//               orderBy: { order: "asc" },
//               include: {
//                 scenes: {
//                   orderBy: { order: "asc" },
//                 },
//               },
//             },
//           },
//         });

//         return actWithStructure!;
//       });
//     } catch (error) {
//       console.error("Error creating act:", error);
//       throw new Error("Failed to create act");
//     }
//   },

//   // Add these methods to your src/lib/novels.ts file
//   // Novel service reordering methods

//   /**
//    * Reorder a scene within or between chapters
//    */
//   async reorderScene(
//     sceneId: string,
//     targetChapterId: string,
//     newOrder: number
//   ): Promise<Scene> {
//     try {
//       console.log("🔄 Starting scene reorder transaction:", {
//         sceneId,
//         targetChapterId,
//         newOrder,
//       });

//       return await prisma.$transaction(async (tx) => {
//         // Get the scene to move with its current chapter relationship
//         const sceneToMove = await tx.scene.findUnique({
//           where: { id: sceneId },
//         });

//         if (!sceneToMove) {
//           throw new Error("Scene not found");
//         }

//         const sourceChapterId = sceneToMove.chapterId;
//         const oldOrder = sceneToMove.order;

//         console.log("📊 Scene move details:", {
//           sourceChapter: sourceChapterId,
//           targetChapter: targetChapterId,
//           oldOrder,
//           newOrder,
//           crossChapter: sourceChapterId !== targetChapterId,
//         });

//         // Case 1: Moving to a different chapter
//         if (sourceChapterId !== targetChapterId) {
//           console.log("🔀 Cross-chapter move");

//           // Step 1: Remove from source chapter (close gap)
//           await tx.scene.updateMany({
//             where: {
//               chapterId: sourceChapterId,
//               order: { gt: oldOrder },
//             },
//             data: {
//               order: { decrement: 1 },
//             },
//           });

//           // Step 2: Make space in target chapter
//           await tx.scene.updateMany({
//             where: {
//               chapterId: targetChapterId,
//               order: { gte: newOrder },
//             },
//             data: {
//               order: { increment: 1 },
//             },
//           });

//           // Step 3: Move the scene (return basic scene, not with relations)
//           const updatedScene = await tx.scene.update({
//             where: { id: sceneId },
//             data: {
//               chapterId: targetChapterId,
//               order: newOrder,
//             },
//           });

//           console.log("✅ Cross-chapter move completed");
//           return updatedScene;
//         }

//         // Case 2: Reordering within the same chapter
//         console.log("🔄 Same-chapter reorder");

//         if (oldOrder === newOrder) {
//           console.log("⚡ No change needed - same position");
//           return sceneToMove;
//         }

//         if (oldOrder < newOrder) {
//           // Moving down: shift scenes between oldOrder+1 and newOrder down by 1
//           await tx.scene.updateMany({
//             where: {
//               chapterId: sourceChapterId,
//               order: {
//                 gt: oldOrder,
//                 lte: newOrder,
//               },
//             },
//             data: {
//               order: { decrement: 1 },
//             },
//           });
//         } else {
//           // Moving up: shift scenes between newOrder and oldOrder-1 up by 1
//           await tx.scene.updateMany({
//             where: {
//               chapterId: sourceChapterId,
//               order: {
//                 gte: newOrder,
//                 lt: oldOrder,
//               },
//             },
//             data: {
//               order: { increment: 1 },
//             },
//           });
//         }

//         // Update the moved scene
//         const updatedScene = await tx.scene.update({
//           where: { id: sceneId },
//           data: { order: newOrder },
//         });

//         console.log("✅ Same-chapter reorder completed");
//         return updatedScene;
//       });
//     } catch (error) {
//       console.error("❌ Scene reorder failed:", error);
//       throw new Error(
//         `Failed to reorder scene: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//     }
//   },

//   /**
//    * Reorder a chapter within the same act
//    */
//   async reorderChapter(chapterId: string, newOrder: number): Promise<Chapter> {
//     try {
//       console.log("🔄 Starting chapter reorder transaction:", {
//         chapterId,
//         newOrder,
//       });

//       const result = await prisma.$transaction(async (tx) => {
//         // Get the chapter to move with its current act relationship
//         const chapterToMove = await tx.chapter.findUnique({
//           where: { id: chapterId },
//         });

//         if (!chapterToMove) {
//           throw new Error("Chapter not found");
//         }

//         const actId = chapterToMove.actId;
//         const oldOrder = chapterToMove.order;

//         console.log("📊 Chapter move details:", {
//           actId,
//           oldOrder,
//           newOrder,
//         });

//         if (oldOrder === newOrder) {
//           console.log("⚡ No change needed - same position");
//           // Still need to return with scenes included
//           return await tx.chapter.findUnique({
//             where: { id: chapterId },
//             include: {
//               scenes: {
//                 orderBy: { order: "asc" },
//               },
//             },
//           });
//         }

//         if (oldOrder < newOrder) {
//           // Moving down: shift chapters between oldOrder+1 and newOrder down by 1
//           await tx.chapter.updateMany({
//             where: {
//               actId: actId,
//               order: {
//                 gt: oldOrder,
//                 lte: newOrder,
//               },
//             },
//             data: {
//               order: { decrement: 1 },
//             },
//           });
//         } else {
//           // Moving up: shift chapters between newOrder and oldOrder-1 up by 1
//           await tx.chapter.updateMany({
//             where: {
//               actId: actId,
//               order: {
//                 gte: newOrder,
//                 lt: oldOrder,
//               },
//             },
//             data: {
//               order: { increment: 1 },
//             },
//           });
//         }

//         // Update the moved chapter and include scenes to match interface
//         return await tx.chapter.update({
//           where: { id: chapterId },
//           data: { order: newOrder },
//           include: {
//             scenes: {
//               orderBy: { order: "asc" },
//             },
//           },
//         });
//       });

//       if (!result) {
//         throw new Error("Failed to reorder chapter");
//       }

//       console.log("✅ Chapter reorder completed");
//       return result;
//     } catch (error) {
//       console.error("❌ Chapter reorder failed:", error);
//       throw new Error(
//         `Failed to reorder chapter: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//     }
//   },
// };
