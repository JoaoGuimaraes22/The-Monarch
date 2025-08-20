// src/app/api/novels/[id]/contextual-import/route.ts
// API route for contextual document imports

import {
  withFileUpload,
  withRateLimit,
  withValidation,
} from "@/lib/api/middleware";
import { createSuccessResponse, handleServiceError } from "@/lib/api";
import { z } from "zod";
import { EnhancedDocxParser } from "@/lib/doc-parse";
import { novelService } from "@/lib/novels";

// Validation schema for contextual import
const ContextualImportSchema = z.object({
  target: z.object({
    mode: z.enum([
      "new-act",
      "new-chapter",
      "new-scene",
      "replace-act",
      "replace-chapter",
      "replace-scene",
    ]),
    targetActId: z.string().optional(),
    targetChapterId: z.string().optional(),
    targetSceneId: z.string().optional(),
    position: z.enum(["beginning", "end", "specific", "replace"]),
    specificPosition: z.number().optional(),
  }),
  autoFix: z.boolean().optional().default(false),
});

export const POST = withFileUpload(
  withRateLimit({ requests: 5, window: 60000 })(
    withValidation({
      body: ContextualImportSchema,
    })(async (request, { params, body, file, requestId }) => {
      try {
        const novelId = params.id;
        console.log(`🎯 Contextual import request for novel ${novelId}:`, {
          mode: body.target.mode,
          position: body.target.position,
          fileName: file?.name,
          requestId,
        });

        // Validate file exists
        if (!file) {
          throw new Error("No file uploaded");
        }

        // Validate file type and size
        if (!file.name.toLowerCase().endsWith(".docx")) {
          throw new Error("Only .docx files are supported");
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error("File size must be less than 10MB");
        }

        // Verify novel exists
        const novel = await novelService.getNovelById(novelId);
        if (!novel) {
          throw new Error("Novel not found");
        }

        // Parse the document
        console.log("📄 Parsing document structure...");
        const buffer = await file.arrayBuffer();
        const parsedStructure = await EnhancedDocxParser.parseFromBuffer(
          buffer
        );

        console.log("📊 Parsed structure:", {
          acts: parsedStructure.acts.length,
          chapters: parsedStructure.acts.reduce(
            (sum, act) => sum + act.chapters.length,
            0
          ),
          scenes: parsedStructure.acts.reduce(
            (sum, act) =>
              sum +
              act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
            0
          ),
          wordCount: parsedStructure.wordCount,
        });

        // Process the import based on mode
        const result = await processContextualImport(
          novelId,
          parsedStructure,
          body.target,
          novel
        );

        return createSuccessResponse(
          result,
          "Document imported successfully",
          requestId
        );
      } catch (error) {
        console.error("❌ Contextual import failed:", error);
        handleServiceError(error);
      }
    })
  )
);

// Core import processing logic
async function processContextualImport(
  novelId: string,
  parsedStructure: any,
  target: any,
  novel: any
) {
  console.log(`🔧 Processing ${target.mode} import...`);

  switch (target.mode) {
    case "new-act":
      return await processNewAct(novelId, parsedStructure, target, novel);

    case "new-chapter":
      return await processNewChapter(novelId, parsedStructure, target, novel);

    case "new-scene":
      return await processNewScene(novelId, parsedStructure, target, novel);

    case "replace-act":
      return await processReplaceAct(novelId, parsedStructure, target, novel);

    case "replace-chapter":
      return await processReplaceChapter(
        novelId,
        parsedStructure,
        target,
        novel
      );

    case "replace-scene":
      return await processReplaceScene(novelId, parsedStructure, target, novel);

    default:
      throw new Error(`Unsupported import mode: ${target.mode}`);
  }
}

// Process new act import
async function processNewAct(
  novelId: string,
  parsedStructure: any,
  target: any,
  novel: any
) {
  console.log("🎭 Creating new act...");

  // Determine the order for the new act
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing acts up by 1
    for (const act of novel.acts) {
      await novelService.updateAct(act.id, { order: act.order + 1 });
    }
  } else if (target.position === "end") {
    newOrder = novel.acts.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing acts at this position and after up by 1
    for (const act of novel.acts) {
      if (act.order >= newOrder) {
        await novelService.updateAct(act.id, { order: act.order + 1 });
      }
    }
  } else {
    newOrder = novel.acts.length + 1;
  }

  // Create the new act
  const actTitle = parsedStructure.acts[0]?.title || "Imported Act";
  const newAct = await novelService.createAct({
    novelId,
    title: actTitle,
    order: newOrder,
  });

  // Import all chapters from the document into this act
  let chapterOrder = 1;
  const createdChapterIds: string[] = [];

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      const newChapter = await novelService.createChapter({
        actId: newAct.id,
        title: parsedChapter.title,
        order: chapterOrder++,
      });
      createdChapterIds.push(newChapter.id);

      // Import all scenes from this chapter
      let sceneOrder = 1;
      for (const parsedScene of parsedChapter.scenes) {
        await novelService.createScene({
          chapterId: newChapter.id,
          title: `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
      }
    }
  }

  return {
    imported: {
      acts: 1,
      chapters: createdChapterIds.length,
      scenes: parsedStructure.acts.reduce(
        (sum: number, act: any) =>
          sum +
          act.chapters.reduce(
            (chSum: number, ch: any) => chSum + ch.scenes.length,
            0
          ),
        0
      ),
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [newAct.id],
      chapterIds: createdChapterIds,
      sceneIds: [], // We'd need to track these if needed
    },
  };
}

// Process new chapter import
async function processNewChapter(
  novelId: string,
  parsedStructure: any,
  target: any,
  novel: any
) {
  console.log("📖 Creating new chapter...");

  const targetAct = novel.acts.find(
    (act: any) => act.id === target.targetActId
  );
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  // Determine the order for the new chapter
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing chapters up by 1
    for (const chapter of targetAct.chapters) {
      await novelService.updateChapter(chapter.id, {
        order: chapter.order + 1,
      });
    }
  } else if (target.position === "end") {
    newOrder = targetAct.chapters.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing chapters at this position and after up by 1
    for (const chapter of targetAct.chapters) {
      if (chapter.order >= newOrder) {
        await novelService.updateChapter(chapter.id, {
          order: chapter.order + 1,
        });
      }
    }
  } else {
    newOrder = targetAct.chapters.length + 1;
  }

  // Create the new chapter
  const chapterTitle =
    parsedStructure.acts[0]?.chapters[0]?.title || "Imported Chapter";
  const newChapter = await novelService.createChapter({
    actId: target.targetActId,
    title: chapterTitle,
    order: newOrder,
  });

  // Import all scenes from all chapters in the document
  let sceneOrder = 1;
  let totalScenes = 0;

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        await novelService.createScene({
          chapterId: newChapter.id,
          title: `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
        totalScenes++;
      }
    }
  }

  return {
    imported: {
      acts: 0,
      chapters: 1,
      scenes: totalScenes,
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [],
      chapterIds: [newChapter.id],
      sceneIds: [], // We'd need to track these if needed
    },
  };
}

// Process new scene import
async function processNewScene(
  novelId: string,
  parsedStructure: any,
  target: any,
  novel: any
) {
  console.log("🎬 Creating new scenes...");

  const targetAct = novel.acts.find(
    (act: any) => act.id === target.targetActId
  );
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  const targetChapter = targetAct.chapters.find(
    (ch: any) => ch.id === target.targetChapterId
  );
  if (!targetChapter) {
    throw new Error("Target chapter not found");
  }

  // Get starting order for new scenes
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing scenes up
    for (const scene of targetChapter.scenes) {
      await novelService.updateScene(scene.id, {
        order: scene.order + parsedStructure.acts[0].chapters[0].scenes.length,
      });
    }
  } else if (target.position === "end") {
    newOrder = targetChapter.scenes.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing scenes at this position and after
    for (const scene of targetChapter.scenes) {
      if (scene.order >= newOrder) {
        await novelService.updateScene(scene.id, {
          order:
            scene.order + parsedStructure.acts[0].chapters[0].scenes.length,
        });
      }
    }
  } else {
    newOrder = targetChapter.scenes.length + 1;
  }

  // Import all scenes from the document
  let sceneCount = 0;
  let currentOrder = newOrder;

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        await novelService.createScene({
          chapterId: target.targetChapterId,
          title: `Scene ${currentOrder}`,
          content: parsedScene.content,
          order: currentOrder++,
        });
        sceneCount++;
      }
    }
  }

  return {
    imported: {
      acts: 0,
      chapters: 0,
      scenes: sceneCount,
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [],
      chapterIds: [],
      sceneIds: [], // We'd need to track these if needed
    },
  };
}

// // Placeholder implementations for replace modes
// async function processReplaceAct(
//   novelId: string,
//   parsedStructure: any,
//   target: any,
//   novel: any
// ) {
//   // TODO: Implement act replacement
//   throw new Error("Replace act not yet implemented");
// }

// async function processReplaceChapter(
//   novelId: string,
//   parsedStructure: any,
//   target: any,
//   novel: any
// ) {
//   // TODO: Implement chapter replacement
//   throw new Error("Replace chapter not yet implemented");
// }

// async function processReplaceScene(
//   novelId: string,
//   parsedStructure: any,
//   target: any,
//   novel: any
// ) {
//   // TODO: Implement scene replacement
//   throw new Error("Replace scene not yet implemented");
// }
