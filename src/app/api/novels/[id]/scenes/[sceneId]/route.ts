// app/api/novels/[id]/scenes/[sceneId]/route.ts
// FIXED: Updated to use modernized service methods

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

    // ✅ FIXED: Use modern service method with parameter object
    if ("content" in updateData && updateData.content !== undefined) {
      // Content update (triggers word count recalculation)
      const scene = await novelService.updateSceneContent(sceneId, {
        content: updateData.content,
        metadata: {
          title: updateData.title,
          povCharacter: updateData.povCharacter,
          sceneType: updateData.sceneType,
          notes: updateData.notes,
          status: updateData.status,
        },
      });

      return createSuccessResponse(
        scene,
        "Scene content updated successfully",
        context.requestId
      );
    } else {
      // Metadata-only update (no word count recalculation)
      const scene = await novelService.updateScene(sceneId, {
        title: updateData.title,
        povCharacter: updateData.povCharacter,
        sceneType: updateData.sceneType,
        notes: updateData.notes,
        status: updateData.status,
      });

      return createSuccessResponse(
        scene,
        "Scene updated successfully",
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
      null,
      "Scene deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== CHANGES MADE =====

✅ FIXED: updateSceneContent() now uses parameter object:
   OLD: updateSceneContent(sceneId, content, metadata)
   NEW: updateSceneContent(sceneId, { content, metadata })

✅ FIXED: updateScene() now uses parameter object:
   OLD: updateScene(sceneId, content, metadata)  
   NEW: updateScene(sceneId, { title, povCharacter, ... })

✅ MAINTAINED: Smart content vs metadata handling
✅ MAINTAINED: All validation and error handling
✅ MAINTAINED: Standard API response format
*/
