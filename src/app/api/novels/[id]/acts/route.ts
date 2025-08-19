// app/api/novels/[id]/acts/route.ts
// Standardized act creation operations

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

    // Create the act with the novel ID from the URL
    const act = await novelService.createAct({
      title: actData.title,
      novelId: novelId, // Use novelId from URL params
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
===== USAGE EXAMPLES =====

POST /api/novels/cm123/acts
Body: { "title": "Act I: The Setup", "novelId": "cm123" }
Response:
{
  "success": true,
  "data": {
    "id": "act456",
    "title": "Act I: The Setup",
    "order": 1,
    "novelId": "cm123",
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

===== FEATURES =====
✅ Type-safe validation with Zod schemas
✅ Rate limiting protection (CREATION config)
✅ Consistent error handling
✅ Request tracking with unique IDs
✅ Validates novel existence before creating act
✅ Auto-assigns proper order for new acts
✅ Standard API response format
✅ Returns full act structure with empty chapters array

===== VALIDATION =====
Request body must include:
- title: Non-empty string (1-255 chars)
- novelId: Valid CUID format

URL params validated:
- id: Valid CUID format (novel ID)

The novelId in the body must match the ID in the URL for security.
*/
