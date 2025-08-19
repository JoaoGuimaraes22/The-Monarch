// app/api/novels/[id]/chapters/[chapterId]/scenes/route.ts
// FIXED: Updated to use modernized service methods with parameter objects

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

    // ✅ FIXED: Use modern service method with parameter object
    const scene = await novelService.createScene({
      chapterId,
      title: sceneData.title,
      // Can easily add more parameters in the future:
      // content: sceneData.content,
      // povCharacter: sceneData.povCharacter,
      // sceneType: sceneData.sceneType,
      // status: sceneData.status
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
===== CHANGES MADE =====

✅ FIXED: createScene() now uses parameter object:
   OLD: createScene(chapterId, insertAfterSceneId, title)
   NEW: createScene({ chapterId, title })

✅ MAINTAINED: All existing validation and security checks
✅ MAINTAINED: Professional API standardization
✅ MAINTAINED: Standard response format

===== SERVICE METHOD SIGNATURE =====
The modernized service method expects:
createScene(options: CreateSceneOptions)

Where CreateSceneOptions includes:
{
  chapterId: string;
  title?: string;
  content?: string;
  insertAfterSceneId?: string;
  order?: number;
  povCharacter?: string;
  sceneType?: string;
  notes?: string;
  status?: string;
}

===== RESPONSE FORMAT =====
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
*/
