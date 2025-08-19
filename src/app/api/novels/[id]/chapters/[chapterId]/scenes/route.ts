// app/api/novels/[id]/chapters/[chapterId]/scenes/route.ts
// Standardized scene creation

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import { z } from "zod";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== SCHEMAS =====
const CreateSceneParamsSchema = z.object({
  id: z.string().cuid2("Invalid novel ID format"),
  chapterId: z.string().cuid2("Invalid chapter ID format"),
});

const CreateSceneBodySchema = z
  .object({
    insertAfterSceneId: z.string().cuid2().optional(),
    title: z.string().max(255).optional(),
  })
  .optional()
  .default({});

// ===== POST /api/novels/[id]/chapters/[chapterId]/scenes - Create new scene =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateSceneBodySchema, CreateSceneParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };
    const createData = validatedData as {
      insertAfterSceneId?: string;
      title?: string;
    };

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Create the new scene using the updated service method
    const newScene = await novelService.createScene(
      chapterId,
      createData.insertAfterSceneId,
      createData.title
    );

    return createSuccessResponse(
      newScene,
      "Scene created successfully",
      context.requestId
    );
  } catch (error) {
    // Handle specific error cases with better messages
    if (error instanceof Error) {
      if (error.message.includes("Chapter not found")) {
        throw new Error("Chapter not found");
      }
    }
    handleServiceError(error);
  }
});

/*
===== REQUEST/RESPONSE EXAMPLES =====

POST /api/novels/[novelId]/chapters/[chapterId]/scenes

REQUEST BODY (all optional):
{
  "insertAfterSceneId": "scene123", // Optional: Insert after specific scene
  "title": "The Dragon's Lair"      // Optional: Custom title
}

SUCCESSFUL RESPONSE:
{
  "success": true,
  "data": {
    "id": "newScene456",
    "title": "The Dragon's Lair",
    "content": "",
    "wordCount": 0,
    "order": 4,
    "povCharacter": null,
    "sceneType": "",
    "notes": "",
    "status": "draft",
    "chapterId": "chapter123",
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Scene created successfully",
  "meta": {
    "requestId": "req_...",
    "timestamp": "2025-08-19T...",
    "version": "1.0"
  }
}

ERROR RESPONSES:
- 400: Invalid chapter ID format
- 404: Novel not found
- 404: Chapter not found  
- 429: Rate limit exceeded (20 creations per 15 minutes)
- 500: Database error

FEATURES:
✅ Optional positioning (insertAfterSceneId)
✅ Optional custom title
✅ Validates novel and chapter exist
✅ Rate limited for creation operations
✅ Comprehensive error handling
✅ Consistent response format
*/
