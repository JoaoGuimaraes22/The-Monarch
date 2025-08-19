// app/api/novels/[id]/chapters/[chapterId]/route.ts
// FIXED: Modernized to use standardized API system and parameter objects

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  UpdateChapterSchema,
  UpdateChapterData,
  ChapterParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/chapters/[chapterId] - Get a specific chapter =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, ChapterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };

    const chapter = await novelService.getChapterById(chapterId);

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    return createSuccessResponse(
      chapter,
      "Chapter retrieved successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/chapters/[chapterId] - Update a chapter =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateChapterSchema, ChapterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };
    const updateData = validatedData as UpdateChapterData;

    // ✅ FIXED: Use modern service method with parameter object
    const chapter = await novelService.updateChapter(chapterId, {
      title: updateData.title,
      // Easy to add more fields in the future
    });

    return createSuccessResponse(
      chapter,
      "Chapter updated successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/chapters/[chapterId] - Delete a chapter =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, ChapterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };

    await novelService.deleteChapter(chapterId);

    return createSuccessResponse(
      null,
      "Chapter deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== CHANGES MADE =====

✅ MODERNIZED: Full API standardization with middleware composition
✅ FIXED: updateChapter() now uses parameter object:
   OLD: updateChapter(chapterId, { title: title.trim() })
   NEW: updateChapter(chapterId, { title: updateData.title })

✅ ADDED: Proper Zod validation with UpdateChapterSchema and ChapterParamsSchema
✅ ADDED: Rate limiting protection
✅ ADDED: Request tracking with unique IDs  
✅ ADDED: Consistent error handling with handleServiceError
✅ ADDED: Standard API response format
✅ ADDED: GET and DELETE operations for completeness

===== BEFORE vs AFTER =====

❌ BEFORE:
- Manual validation: if (!title || typeof title !== "string")
- Inconsistent responses: { success: true, chapter: updatedChapter }
- No rate limiting or request tracking
- Basic error handling

✅ AFTER:
- Zod schema validation: UpdateChapterSchema
- Standard response format: createSuccessResponse()
- Rate limiting: RATE_LIMIT_CONFIGS.STANDARD
- Professional error handling: handleServiceError()
- Request tracking: context.requestId

===== API VALIDATION =====
UpdateChapterSchema validates:
{
  "title": string (optional, 1-255 chars)
}

ChapterParamsSchema validates URL params:
{
  "id": string (valid CUID novel ID),
  "chapterId": string (valid CUID chapter ID)
}
*/
