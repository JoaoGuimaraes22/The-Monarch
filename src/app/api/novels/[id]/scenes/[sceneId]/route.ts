// app/api/novels/[id]/scenes/[sceneId]/route.ts
// Standardized scene CRUD operations

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  UpdateSceneSchema,
  UpdateSceneData,
  SceneParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/scenes/[sceneId] - Get a specific scene =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, SceneParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, sceneId } = params as { id: string; sceneId: string };

    const scene = await novelService.getSceneById(sceneId);

    if (!scene) {
      throw new Error("Scene not found");
    }

    return createSuccessResponse(
      scene,
      "Scene retrieved successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/scenes/[sceneId] - Update a scene =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateSceneSchema, SceneParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, sceneId } = params as { id: string; sceneId: string };
    const updateData = validatedData as UpdateSceneData;

    // Handle content vs metadata updates differently
    if ("content" in updateData && updateData.content !== undefined) {
      // Content update (triggers word count recalculation)
      const scene = await novelService.updateSceneContent(
        sceneId,
        updateData.content,
        {
          title: updateData.title,
          povCharacter: updateData.povCharacter,
          sceneType: updateData.sceneType,
          notes: updateData.notes,
          status: updateData.status,
        }
      );

      return createSuccessResponse(
        scene,
        "Scene content updated successfully",
        context.requestId
      );
    } else {
      // Metadata-only update
      const scene = await novelService.updateSceneMetadata(sceneId, updateData);

      return createSuccessResponse(
        scene,
        "Scene metadata updated successfully",
        context.requestId
      );
    }
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/scenes/[sceneId] - Delete a scene =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, SceneParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, sceneId } = params as { id: string; sceneId: string };

    await novelService.deleteScene(sceneId);

    return createSuccessResponse(
      {
        sceneId,
        deleted: true,
      },
      "Scene deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// /*
// ===== ENHANCED FEATURES =====

// 1. INTELLIGENT UPDATE HANDLING
//    - Separates content updates (expensive) from metadata updates (cheap)
//    - Content updates trigger word count recalculation
//    - Metadata updates are fast and lightweight

// 2. COMPREHENSIVE VALIDATION
//    - Scene ID format validation (CUID)
//    - Novel ID format validation
//    - Update data validation with Zod schemas

// 3. CONSISTENT RESPONSES
//    - All operations return standardized format
//    - Clear success/error messages
//    - Request tracking for debugging

// 4. RATE LIMITING
//    - Standard limits for most operations
//    - Could be customized per operation type if needed

// EXAMPLE RESPONSES:

// GET /api/novels/[id]/scenes/[sceneId]:
// {
//   "success": true,
//   "data": {
//     "id": "scene123",
//     "title": "The Dragon Awakens",
//     "content": "The mighty dragon...",
//     "wordCount": 1250,
//     "order": 3,
//     "povCharacter": "Aria",
//     "sceneType": "action",
//     "status": "draft",
//     ...
//   },
//   "message": "Scene retrieved successfully"
// }

// PUT /api/novels/[id]/scenes/[sceneId] (content update):
// {
//   "success": true,
//   "data": { /* updated scene with new word count */ },
//   "message": "Scene content updated successfully"
// }

// DELETE /api/novels/[id]/scenes/[sceneId]:
// {
//   "success": true,
//   "data": { "sceneId": "scene123", "deleted": true },
//   "message": "Scene deleted successfully"
// }
// */
