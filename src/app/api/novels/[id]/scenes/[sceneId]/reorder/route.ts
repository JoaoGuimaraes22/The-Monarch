// app/api/novels/[id]/scenes/[sceneId]/reorder/route.ts
// FIXED: Modernized to use standardized API system and parameter objects

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  ReorderSceneSchema,
  ReorderSceneData,
  SceneParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== PUT /api/novels/[id]/scenes/[sceneId]/reorder - Reorder a scene =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(ReorderSceneSchema, SceneParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, sceneId } = params as { id: string; sceneId: string };
    const reorderData = validatedData as ReorderSceneData;

    // Verify the novel exists and get structure
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Find the scene to verify it exists
    let foundScene = null;
    for (const act of novel.acts) {
      for (const chapter of act.chapters) {
        const scene = chapter.scenes.find((s) => s.id === sceneId);
        if (scene) {
          foundScene = scene;
          break;
        }
      }
      if (foundScene) break;
    }

    if (!foundScene) {
      throw new Error("Scene not found");
    }

    // If moving to a different chapter, verify the target chapter exists
    if (reorderData.newChapterId) {
      let targetChapterExists = false;
      for (const act of novel.acts) {
        if (act.chapters.find((c) => c.id === reorderData.newChapterId)) {
          targetChapterExists = true;
          break;
        }
      }
      if (!targetChapterExists) {
        throw new Error("Target chapter not found");
      }
    }

    // ✅ FIXED: Use modern service method with parameter object
    const result = await novelService.reorderScene({
      sceneId,
      newOrder: reorderData.newOrder,
      targetChapterId: reorderData.newChapterId, // Optional for cross-chapter moves
    });

    return createSuccessResponse(
      result,
      reorderData.newChapterId
        ? "Scene moved to new chapter successfully"
        : "Scene reordered successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== CHANGES MADE =====

✅ MODERNIZED: Full API standardization with middleware composition
✅ FIXED: reorderScene() now uses parameter object:
   OLD: reorderScene(sceneId, targetChapterId, newOrder)
   NEW: reorderScene({ sceneId, newOrder, targetChapterId })

✅ ADDED: Proper Zod validation with ReorderSceneSchema
✅ ADDED: Rate limiting protection
✅ ADDED: Request tracking with unique IDs
✅ ADDED: Consistent error handling with handleServiceError
✅ ADDED: Standard API response format

===== API SCHEMA =====
ReorderSceneSchema validates:
{
  "newOrder": number (required, >= 1),
  "newChapterId": string (optional, for cross-chapter moves)
}

// ===== RESPONSE FORMAT =====
// {
//   "success": true,
//   "data": /* updated scene data */
//   "message": "Scene reordered successfully",
//   "meta": {
//     "timestamp": "2025-08-19T...",
//     "requestId": "req_1692...",
//     "version": "1.0"
//   }
// }
// */
