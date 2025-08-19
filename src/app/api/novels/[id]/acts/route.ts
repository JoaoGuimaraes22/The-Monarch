// app/api/novels/[id]/acts/route.ts
// NEW: Standardized act creation within novels

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  CreateActInNovelSchema,
  CreateActInNovelData,
  NovelParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== POST /api/novels/[id]/acts - Create a new act in a novel =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateActInNovelSchema, NovelParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const actData = validatedData as CreateActInNovelData;

    // Verify the novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // ✅ MODERN: Use new service method with parameter object
    const act = await novelService.createAct({
      novelId,
      title: actData.title,
      // Can easily add more parameters in the future:
      // insertAfterActId: actData.insertAfterActId,
      // order: actData.order
    });

    return createSuccessResponse(
      act,
      "Act created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== NEW ROUTE FEATURES =====

✅ MODERN: Uses parameter object service method:
   createAct({ novelId, title })

✅ STANDARDIZED: Full API middleware stack
✅ VALIDATED: Zod schema validation for request body and URL params
✅ SECURED: Verifies novel exists before creating act
✅ RATE LIMITED: Creation rate limits to prevent abuse
✅ TRACKED: Request IDs for debugging and monitoring
✅ CONSISTENT: Standard API response format

===== API SCHEMA =====
CreateActInNovelSchema validates:
{
  "title": string (required, 1-255 chars),
  "novelId": string (required, valid CUID)
}

NovelParamsSchema validates URL params:
{
  "id": string (valid CUID novel ID)
}

===== RESPONSE FORMAT =====
{
  "success": true,
  "data": {
    "id": "act456",
    "title": "Act I: The Setup",
    "order": 1,
    "novelId": "novel123",
    "chapters": [],
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Act created successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

===== SECURITY VALIDATION =====
- Novel must exist
- Request body validated against schema
- URL parameters validated against schema
- Auto-assigns proper order for new acts
- Returns full act structure with empty chapters array

===== EXTENSIBILITY =====
Future enhancements can easily add:
- insertAfterActId: Position the new act after a specific act
- order: Manual order specification
- Any other act properties without breaking existing API calls
*/
