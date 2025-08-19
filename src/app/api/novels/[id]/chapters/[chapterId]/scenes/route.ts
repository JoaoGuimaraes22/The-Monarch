// app/api/novels/[id]/chapters/[chapterId]/scenes/route.ts
// Standardized scene creation within chapters

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  CreateSceneInChapterSchema,
  CreateSceneInChapterData,
  ChapterParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== POST /api/novels/[id]/chapters/[chapterId]/scenes - Create a new scene in a chapter =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateSceneInChapterSchema, ChapterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };
    const sceneData = validatedData as CreateSceneInChapterData;

    // Verify the chapter exists and belongs to the novel
    const chapter = await novelService.getChapterById(chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    // Get the act to verify novel ownership
    const act = await novelService.getActById(chapter.actId);
    if (!act || act.novelId !== novelId) {
      throw new Error("Chapter does not belong to the specified novel");
    }

    // Create the scene with the chapter ID from the URL
    const scene = await novelService.createScene({
      title: sceneData.title,
      chapterId: chapterId, // Use chapterId from URL params
    });

    return createSuccessResponse(
      scene,
      "Scene created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== USAGE EXAMPLES =====

POST /api/novels/cm123/chapters/ch456/scenes
Body: { "title": "The Mysterious Stranger", "chapterId": "ch456" }
Response:
{
  "success": true,
  "data": {
    "id": "sc789",
    "title": "The Mysterious Stranger",
    "content": "",
    "order": 1,
    "wordCount": 0,
    "chapterId": "ch456",
    "povCharacter": null,
    "sceneType": "",
    "notes": "",
    "status": "draft",
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Scene created successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

===== FEATURES =====
✅ Type-safe validation with Zod schemas
✅ Rate limiting protection (CREATION config)
✅ Consistent error handling
✅ Request tracking with unique IDs
✅ Validates chapter existence and novel ownership through act
✅ Auto-assigns proper order for new scenes within chapter
✅ Standard API response format
✅ Returns full scene structure with default values
✅ Security check: ensures chapter belongs to specified novel
✅ Initializes scene with sensible defaults (empty content, draft status)

===== VALIDATION =====
Request body must include:
- title: Non-empty string (1-255 chars)
- chapterId: Valid CUID format

URL params validated:
- id: Valid CUID format (novel ID)
- chapterId: Valid CUID format (chapter ID)

Security validation:
- Chapter must exist
- Chapter's parent act must belong to the specified novel
- The chapterId in the body must match the chapterId in the URL

Default values for new scenes:
- content: "" (empty)
- wordCount: 0
- povCharacter: null
- sceneType: ""
- notes: ""
- status: "draft"
*/
