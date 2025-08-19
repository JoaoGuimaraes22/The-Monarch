// app/api/novels/[id]/acts/[actId]/route.ts
// FIXED: Modernized to use standardized API system and parameter objects

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  UpdateActSchema,
  UpdateActData,
  ActParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/acts/[actId] - Get a specific act =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, ActParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, actId } = params as { id: string; actId: string };

    const act = await novelService.getActById(actId);

    if (!act) {
      throw new Error("Act not found");
    }

    return createSuccessResponse(
      act,
      "Act retrieved successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/acts/[actId] - Update an act =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateActSchema, ActParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, actId } = params as { id: string; actId: string };
    const updateData = validatedData as UpdateActData;

    // ✅ FIXED: Use modern service method with parameter object
    const act = await novelService.updateAct(actId, {
      title: updateData.title,
      // Easy to add more fields in the future
    });

    return createSuccessResponse(
      act,
      "Act updated successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/acts/[actId] - Delete an act =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, ActParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, actId } = params as { id: string; actId: string };

    await novelService.deleteAct(actId);

    return createSuccessResponse(
      null,
      "Act deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== CHANGES MADE =====

✅ MODERNIZED: Full API standardization with middleware composition
✅ FIXED: updateAct() now uses parameter object:
   OLD: updateAct(actId, { title: title.trim() })
   NEW: updateAct(actId, { title: updateData.title })

✅ ADDED: Proper Zod validation with UpdateActSchema and ActParamsSchema
✅ ADDED: Rate limiting protection
✅ ADDED: Request tracking with unique IDs
✅ ADDED: Consistent error handling with handleServiceError
✅ ADDED: Standard API response format
✅ ADDED: GET operation for completeness

===== BEFORE vs AFTER =====

❌ BEFORE:
- Manual validation: if (!title || typeof title !== "string")
- Inconsistent responses: { success: true, act: updatedAct }
- No rate limiting or request tracking
- Basic error handling

✅ AFTER:
- Zod schema validation: UpdateActSchema
- Standard response format: createSuccessResponse()
- Rate limiting: RATE_LIMIT_CONFIGS.STANDARD
- Professional error handling: handleServiceError()
- Request tracking: context.requestId

===== API VALIDATION =====
UpdateActSchema validates:
{
  "title": string (optional, 1-255 chars)
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
    "id": "act456",
    "title": "Act I: The Setup",
    "order": 1,
    "novelId": "novel123",
    "chapters": [ full chapter structure ], 
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Act updated successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}
*/
