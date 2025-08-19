// app/api/novels/[id]/acts/[actId]/reorder/route.ts
// Standardized act reordering operations

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  ReorderActSchema,
  ReorderActData,
  ActParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== PUT /api/novels/[id]/acts/[actId]/reorder - Reorder an act =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(ReorderActSchema, ActParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, actId } = params as { id: string; actId: string };
    const reorderData = validatedData as ReorderActData;

    // Verify the novel exists
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Find the act to verify it exists and belongs to this novel
    const foundAct = novel.acts.find((act) => act.id === actId);
    if (!foundAct) {
      throw new Error("Act not found in this novel");
    }

    // Validate the new order is within bounds
    const totalActs = novel.acts.length;
    if (reorderData.newOrder > totalActs) {
      throw new Error(
        `New order ${reorderData.newOrder} exceeds total acts (${totalActs})`
      );
    }

    // Perform the reordering
    const result = await novelService.reorderAct(actId, reorderData.newOrder);

    return createSuccessResponse(
      result,
      "Act reordered successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== USAGE EXAMPLES =====

PUT /api/novels/cm123/acts/act456/reorder
Body: { "newOrder": 3 }
Response:
{
  "success": true,
  "data": {
    "id": "act456",
    "title": "Act II: Rising Action",
    "order": 3,
    "novelId": "cm123",
    "chapters": [
      {
        "id": "ch789",
        "title": "Chapter Four",
        "order": 1,
        "actId": "act456",
        "scenes": [
          {
            "id": "sc123",
            "title": "The Confrontation",
            "order": 1,
            "wordCount": 1250,
            "chapterId": "ch789"
          }
        ],
        "createdAt": "2025-08-19T...",
        "updatedAt": "2025-08-19T..."
      }
    ],
    "createdAt": "2025-08-19T...",
    "updatedAt": "2025-08-19T..."
  },
  "message": "Act reordered successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

===== FEATURES =====
✅ Type-safe validation with Zod schemas
✅ Rate limiting protection
✅ Consistent error handling
✅ Request tracking with unique IDs
✅ Validates novel and act existence
✅ Validates new order is within bounds
✅ Standard API response format
✅ Returns full act structure with all chapters and scenes
✅ Security check: ensures act belongs to specified novel
✅ Boundary validation: prevents invalid order values

===== VALIDATION =====
Request body must include:
- newOrder: Integer >= 1 and <= total acts in novel

URL params validated:
- id: Valid CUID format (novel ID)
- actId: Valid CUID format (act ID)

Business logic validation:
- Novel must exist
- Act must exist within the novel
- New order must be within valid range (1 to total acts)

===== REORDERING LOGIC =====
When an act is moved:
1. Other acts with orders between old and new positions are shifted
2. All affected acts get updated timestamps
3. Database transaction ensures consistency
4. Full structure returned to client for immediate UI update
*/
