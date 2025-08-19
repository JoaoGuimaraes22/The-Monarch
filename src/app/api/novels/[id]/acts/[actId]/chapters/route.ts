// app/api/novels/[id]/acts/[actId]/chapters/route.ts
// NEW: Standardized chapter creation within acts

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  CreateChapterInActSchema,
  CreateChapterInActData,
  ActParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== POST /api/novels/[id]/acts/[actId]/chapters - Create a new chapter in an act =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateChapterInActSchema, ActParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, actId } = params as { id: string; actId: string };
    const chapterData = validatedData as CreateChapterInActData;

    // Verify the act exists and belongs to the novel
    const act = await novelService.getActById(actId);
    if (!act) {
      throw new Error("Act not found");
    }

    if (act.novelId !== novelId) {
      throw new Error("Act does not belong to the specified novel");
    }

    // ✅ MODERN: Use new service method with parameter object
    const chapter = await novelService.createChapter({
      actId,
      title: chapterData.title,
      // Can easily add more parameters in the future:
      // insertAfterChapterId: chapterData.insertAfterChapterId,
      // order: chapterData.order
    });

    return createSuccessResponse(
      chapter,
      "Chapter created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== NEW ROUTE FEATURES =====

✅ MODERN: Uses parameter object service method:
   createChapter({ actId, title })

✅ STANDARDIZED: Full API middleware stack
✅ VALIDATED: Zod schema validation for request body and URL params
✅ SECURED: Verifies act belongs to specified novel
✅ RATE LIMITED: Creation rate limits to prevent abuse
✅ TRACKED: Request IDs for debugging and monitoring
✅ CONSISTENT: Standard API response format

===== API SCHEMA =====
CreateChapterInActSchema validates:
{
  "title": string (required, 1-255 chars),
  "actId": string (required, valid CUID)
}

ActParamsSchema validates URL params:
{
  "id": string (valid CUID novel ID),
  "actId": string (valid CUID act ID)
}

===== RESPONSE FORMAT =====
{
  "success": true,
  "data": {
    "id": "ch789",
    "title": "Chapter 1: The Hero's Call",
    "order": 1,
    "actId": "act456",
    "scenes": [],
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Chapter created successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

===== SECURITY VALIDATION =====
- Novel must exist (implied by act validation)
- Act must exist
- Act must belong to the specified novel
- Request body validated against schema
- URL parameters validated against schema
*/
