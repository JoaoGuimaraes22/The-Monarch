// src/app/api/novels/[id]/contextual-import/route.ts
// ✅ FIXED: Proper FormData handling for contextual document imports

import { NextRequest } from "next/server";
import {
  withFileUpload,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";
import { z } from "zod";
import { EnhancedDocxParser, ParsedStructure } from "@/lib/doc-parse";
import { novelService, NovelWithStructure } from "@/lib/novels";

// ===== VALIDATION SCHEMAS =====

const TargetSchema = z.object({
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
  specificPosition: z.number().min(1).optional(),
});

// ===== TYPESCRIPT INTERFACES =====

interface ImportTarget {
  mode:
    | "new-act"
    | "new-chapter"
    | "new-scene"
    | "replace-act"
    | "replace-chapter"
    | "replace-scene";
  targetActId?: string;
  targetChapterId?: string;
  targetSceneId?: string;
  position: "beginning" | "end" | "specific" | "replace";
  specificPosition?: number;
}

interface ContextualImportRequest {
  target: ImportTarget;
  autoFix?: boolean;
}

interface ImportResult {
  imported: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  created: {
    actIds: string[];
    chapterIds: string[];
    sceneIds: string[];
  };
  structure: {
    totalActs: number;
    totalChapters: number;
    totalScenes: number;
    totalWordCount: number;
  };
}

// ===== MAIN ROUTE HANDLER =====

export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.UPLOAD),
  withFileUpload({
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required: true,
  })
  // ✅ REMOVED: withValidation - we'll manually parse FormData
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const novelId = params.id as string;
    const file = context.file!; // Required by middleware

    // ✅ FIXED: Manually parse FormData instead of using validation middleware
    const formData = context.formData;
    if (!formData) {
      throw new Error("No form data provided");
    }

    // Parse target from FormData
    const targetString = formData.get("target") as string;
    if (!targetString) {
      throw new Error("Target configuration is required");
    }

    let target: ImportTarget;
    try {
      const parsedTarget = JSON.parse(targetString);
      target = TargetSchema.parse(parsedTarget);
    } catch (err) {
      throw new Error("Invalid target configuration");
    }

    // Parse autoFix from FormData
    const autoFixString = formData.get("autoFix") as string;
    const autoFix = autoFixString ? JSON.parse(autoFixString) : false;

    console.log(`🎯 Contextual import request for novel ${novelId}:`, {
      mode: target.mode,
      position: target.position,
      fileName: file.name,
      requestId: context.requestId,
    });

    // Verify novel exists and get full structure
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Parse the document
    console.log("📄 Parsing document structure...");
    const buffer = await file.arrayBuffer();
    const parsedStructure = await EnhancedDocxParser.parseFromBuffer(buffer);

    console.log("📊 Parsed structure:", {
      acts: parsedStructure.acts.length,
      chapters: parsedStructure.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      scenes: parsedStructure.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount: parsedStructure.wordCount,
    });

    // Validate target exists
    await validateImportTarget(target, novel);

    // Process the import based on mode
    const result = await processContextualImport(
      novelId,
      parsedStructure,
      target,
      novel
    );

    return createSuccessResponse(
      result,
      `Document imported successfully (${result.imported.acts} acts, ${result.imported.chapters} chapters, ${result.imported.scenes} scenes)`,
      context.requestId
    );
  } catch (error) {
    console.error("❌ Contextual import failed:", error);
    handleServiceError(error);
  }
});

// ===== VALIDATION FUNCTIONS =====

async function validateImportTarget(
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<void> {
  switch (target.mode) {
    case "new-act":
      // No specific validation needed for novel-level import
      break;

    case "new-chapter":
      if (!target.targetActId) {
        throw new Error("Target act ID is required for new chapter mode");
      }
      const targetAct = novel.acts.find((act) => act.id === target.targetActId);
      if (!targetAct) {
        throw new Error("Target act not found");
      }
      break;

    case "new-scene":
      if (!target.targetActId || !target.targetChapterId) {
        throw new Error(
          "Both target act ID and chapter ID are required for new scene mode"
        );
      }
      const actForScene = novel.acts.find(
        (act) => act.id === target.targetActId
      );
      if (!actForScene) {
        throw new Error("Target act not found");
      }
      const targetChapter = actForScene.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      if (!targetChapter) {
        throw new Error("Target chapter not found");
      }
      break;

    case "replace-act":
      if (!target.targetActId) {
        throw new Error("Target act ID is required for replace act mode");
      }
      const replaceAct = novel.acts.find(
        (act) => act.id === target.targetActId
      );
      if (!replaceAct) {
        throw new Error("Target act not found for replacement");
      }
      break;

    case "replace-chapter":
      if (!target.targetActId || !target.targetChapterId) {
        throw new Error(
          "Both target act ID and chapter ID are required for replace chapter mode"
        );
      }
      const actForReplaceChapter = novel.acts.find(
        (act) => act.id === target.targetActId
      );
      if (!actForReplaceChapter) {
        throw new Error("Target act not found");
      }
      const replaceChapter = actForReplaceChapter.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      if (!replaceChapter) {
        throw new Error("Target chapter not found for replacement");
      }
      break;

    case "replace-scene":
      if (
        !target.targetActId ||
        !target.targetChapterId ||
        !target.targetSceneId
      ) {
        throw new Error(
          "Target act ID, chapter ID, and scene ID are required for replace scene mode"
        );
      }
      const actForReplaceScene = novel.acts.find(
        (act) => act.id === target.targetActId
      );
      if (!actForReplaceScene) {
        throw new Error("Target act not found");
      }
      const chapterForReplaceScene = actForReplaceScene.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      if (!chapterForReplaceScene) {
        throw new Error("Target chapter not found");
      }
      const replaceScene = chapterForReplaceScene.scenes.find(
        (sc) => sc.id === target.targetSceneId
      );
      if (!replaceScene) {
        throw new Error("Target scene not found for replacement");
      }
      break;

    default:
      throw new Error(`Unsupported import mode: ${target.mode}`);
  }

  // Validate position (only for new modes)
  if (
    target.mode.startsWith("new-") &&
    target.position === "specific" &&
    !target.specificPosition
  ) {
    throw new Error(
      "Specific position number is required when using specific position mode"
    );
  }
}

// ===== IMPORT PROCESSING =====

async function processContextualImport(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
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

// ===== NEW ACT IMPORT =====

async function processNewAct(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("🎭 Creating new act...");

  // Determine the order for the new act
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing acts up by 1 (in reverse order to avoid conflicts)
    const actsToReorder = novel.acts
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((act) => act.order >= 1);

    for (const act of actsToReorder) {
      await novelService.reorderAct({
        actId: act.id,
        newOrder: act.order + 1,
      });
    }
  } else if (target.position === "end") {
    newOrder = novel.acts.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing acts at this position and after up by 1 (in reverse order)
    const actsToReorder = novel.acts
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((act) => act.order >= newOrder);

    for (const act of actsToReorder) {
      await novelService.reorderAct({
        actId: act.id,
        newOrder: act.order + 1,
      });
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
  const createdSceneIds: string[] = [];

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
        const newScene = await novelService.createScene({
          chapterId: newChapter.id,
          title: parsedScene.title || `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
        createdSceneIds.push(newScene.id);
      }
    }
  }

  // Calculate total scenes
  const totalScenes = parsedStructure.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );

  return {
    imported: {
      acts: 1,
      chapters: createdChapterIds.length,
      scenes: totalScenes,
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [newAct.id],
      chapterIds: createdChapterIds,
      sceneIds: createdSceneIds,
    },
    structure: {
      totalActs: novel.acts.length + 1,
      totalChapters:
        novel.acts.reduce((sum, act) => sum + act.chapters.length, 0) +
        createdChapterIds.length,
      totalScenes:
        novel.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ) + totalScenes,
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}

// ===== NEW CHAPTER IMPORT =====

async function processNewChapter(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("📖 Creating new chapter...");

  const targetAct = novel.acts.find((act) => act.id === target.targetActId);
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  // Determine the order for the new chapter
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing chapters up by 1 (in reverse order to avoid conflicts)
    const chaptersToReorder = targetAct.chapters
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((chapter) => chapter.order >= 1);

    for (const chapter of chaptersToReorder) {
      await novelService.reorderChapter({
        chapterId: chapter.id,
        newOrder: chapter.order + 1,
      });
    }
  } else if (target.position === "end") {
    newOrder = targetAct.chapters.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing chapters at this position and after up by 1 (in reverse order)
    const chaptersToReorder = targetAct.chapters
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((chapter) => chapter.order >= newOrder);

    for (const chapter of chaptersToReorder) {
      await novelService.reorderChapter({
        chapterId: chapter.id,
        newOrder: chapter.order + 1,
      });
    }
  } else {
    newOrder = targetAct.chapters.length + 1;
  }

  // Create the new chapter
  const chapterTitle =
    parsedStructure.acts[0]?.chapters[0]?.title || "Imported Chapter";
  const newChapter = await novelService.createChapter({
    actId: target.targetActId!,
    title: chapterTitle,
    order: newOrder,
  });

  // Import all scenes from all chapters in the document
  let sceneOrder = 1;
  let totalScenes = 0;
  const createdSceneIds: string[] = [];

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        const newScene = await novelService.createScene({
          chapterId: newChapter.id,
          title: parsedScene.title || `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
        createdSceneIds.push(newScene.id);
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
      sceneIds: createdSceneIds,
    },
    structure: {
      totalActs: novel.acts.length,
      totalChapters:
        novel.acts.reduce((sum, act) => sum + act.chapters.length, 0) + 1,
      totalScenes:
        novel.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ) + totalScenes,
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}

// ===== NEW SCENE IMPORT =====

async function processNewScene(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("🎬 Creating new scenes...");

  const targetAct = novel.acts.find((act) => act.id === target.targetActId);
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  const targetChapter = targetAct.chapters.find(
    (ch) => ch.id === target.targetChapterId
  );
  if (!targetChapter) {
    throw new Error("Target chapter not found");
  }

  // Count total scenes to import
  const totalScenesToImport = parsedStructure.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );

  // Get starting order for new scenes
  let newOrder: number;

  if (target.position === "beginning") {
    newOrder = 1;
    // Bump existing scenes up (in reverse order to avoid conflicts)
    const scenesToReorder = targetChapter.scenes
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((scene) => scene.order >= 1);

    for (const scene of scenesToReorder) {
      await novelService.reorderScene({
        sceneId: scene.id,
        newOrder: scene.order + totalScenesToImport,
      });
    }
  } else if (target.position === "end") {
    newOrder = targetChapter.scenes.length + 1;
  } else if (target.position === "specific" && target.specificPosition) {
    newOrder = target.specificPosition;
    // Bump existing scenes at this position and after (in reverse order)
    const scenesToReorder = targetChapter.scenes
      .sort((a, b) => b.order - a.order) // Sort descending
      .filter((scene) => scene.order >= newOrder);

    for (const scene of scenesToReorder) {
      await novelService.reorderScene({
        sceneId: scene.id,
        newOrder: scene.order + totalScenesToImport,
      });
    }
  } else {
    newOrder = targetChapter.scenes.length + 1;
  }

  // Import all scenes from the document
  let sceneCount = 0;
  let currentOrder = newOrder;
  const createdSceneIds: string[] = [];

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        const newScene = await novelService.createScene({
          chapterId: target.targetChapterId!,
          title: parsedScene.title || `Scene ${currentOrder}`,
          content: parsedScene.content,
          order: currentOrder++,
        });
        createdSceneIds.push(newScene.id);
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
      sceneIds: createdSceneIds,
    },
    structure: {
      totalActs: novel.acts.length,
      totalChapters: novel.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      totalScenes:
        novel.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ) + sceneCount,
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}

// ===== REPLACE ACT IMPORT =====

async function processReplaceAct(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("🔄 Replacing act...");

  const targetAct = novel.acts.find((act) => act.id === target.targetActId);
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  // Keep the existing order and title for reference
  const existingOrder = targetAct.order;
  const existingTitle = targetAct.title;

  // Delete the existing act (this will cascade delete all chapters and scenes)
  await novelService.deleteAct(target.targetActId!);

  // Create new act with the same order
  const newActTitle = parsedStructure.acts[0]?.title || existingTitle;
  const newAct = await novelService.createAct({
    novelId,
    title: newActTitle,
    order: existingOrder,
  });

  // Import all chapters from the document into this new act
  let chapterOrder = 1;
  const createdChapterIds: string[] = [];
  const createdSceneIds: string[] = [];

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
        const newScene = await novelService.createScene({
          chapterId: newChapter.id,
          title: parsedScene.title || `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
        createdSceneIds.push(newScene.id);
      }
    }
  }

  // Calculate total scenes
  const totalScenes = parsedStructure.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );

  return {
    imported: {
      acts: 1,
      chapters: createdChapterIds.length,
      scenes: totalScenes,
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [newAct.id],
      chapterIds: createdChapterIds,
      sceneIds: createdSceneIds,
    },
    structure: {
      totalActs: novel.acts.length, // Same number of acts
      totalChapters:
        novel.acts.reduce((sum, act) => sum + act.chapters.length, 0) -
        targetAct.chapters.length +
        createdChapterIds.length,
      totalScenes:
        novel.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ) -
        targetAct.chapters.reduce((sum, ch) => sum + ch.scenes.length, 0) +
        totalScenes,
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}

// ===== REPLACE CHAPTER IMPORT =====

async function processReplaceChapter(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("🔄 Replacing chapter...");

  const targetAct = novel.acts.find((act) => act.id === target.targetActId);
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  const targetChapter = targetAct.chapters.find(
    (ch) => ch.id === target.targetChapterId
  );
  if (!targetChapter) {
    throw new Error("Target chapter not found");
  }

  // Keep the existing order and title for reference
  const existingOrder = targetChapter.order;
  const existingTitle = targetChapter.title;
  const existingSceneCount = targetChapter.scenes.length;

  // Delete the existing chapter (this will cascade delete all scenes)
  await novelService.deleteChapter(target.targetChapterId!);

  // Create new chapter with the same order
  const newChapterTitle =
    parsedStructure.acts[0]?.chapters[0]?.title || existingTitle;
  const newChapter = await novelService.createChapter({
    actId: target.targetActId!,
    title: newChapterTitle,
    order: existingOrder,
  });

  // Import all scenes from all chapters in the document
  let sceneOrder = 1;
  let totalScenes = 0;
  const createdSceneIds: string[] = [];

  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        const newScene = await novelService.createScene({
          chapterId: newChapter.id,
          title: parsedScene.title || `Scene ${sceneOrder}`,
          content: parsedScene.content,
          order: sceneOrder++,
        });
        createdSceneIds.push(newScene.id);
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
      sceneIds: createdSceneIds,
    },
    structure: {
      totalActs: novel.acts.length,
      totalChapters: novel.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ), // Same number of chapters
      totalScenes:
        novel.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ) -
        existingSceneCount +
        totalScenes,
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}

// ===== REPLACE SCENE IMPORT =====

async function processReplaceScene(
  novelId: string,
  parsedStructure: ParsedStructure,
  target: ImportTarget,
  novel: NovelWithStructure
): Promise<ImportResult> {
  console.log("🔄 Replacing scene...");

  const targetAct = novel.acts.find((act) => act.id === target.targetActId);
  if (!targetAct) {
    throw new Error("Target act not found");
  }

  const targetChapter = targetAct.chapters.find(
    (ch) => ch.id === target.targetChapterId
  );
  if (!targetChapter) {
    throw new Error("Target chapter not found");
  }

  const targetScene = targetChapter.scenes.find(
    (sc) => sc.id === target.targetSceneId
  );
  if (!targetScene) {
    throw new Error("Target scene not found");
  }

  // For scene replacement, we'll take the first scene from the document
  // and combine all content if there are multiple scenes
  let combinedContent = "";
  let combinedTitle = targetScene.title; // Keep existing title as fallback

  // Collect all content from the parsed document
  for (const parsedAct of parsedStructure.acts) {
    for (const parsedChapter of parsedAct.chapters) {
      for (const parsedScene of parsedChapter.scenes) {
        if (parsedScene.title && !combinedTitle) {
          combinedTitle = parsedScene.title; // Use first scene title if available
        }
        if (combinedContent) {
          combinedContent += "\n\n---\n\n"; // Separator between scenes
        }
        combinedContent += parsedScene.content;
      }
    }
  }

  // Update the existing scene with the new content
  const updatedScene = await novelService.updateScene(target.targetSceneId!, {
    title: combinedTitle,
    content: combinedContent,
  });

  // Calculate total scenes in imported document (for reporting)
  const totalImportedScenes = parsedStructure.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );

  return {
    imported: {
      acts: 0,
      chapters: 0,
      scenes: totalImportedScenes,
      wordCount: parsedStructure.wordCount,
    },
    created: {
      actIds: [],
      chapterIds: [],
      sceneIds: [], // No new scenes created, existing scene updated
    },
    structure: {
      totalActs: novel.acts.length,
      totalChapters: novel.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      totalScenes: novel.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ), // Same number of scenes
      totalWordCount: novel.wordCount + parsedStructure.wordCount,
    },
  };
}
