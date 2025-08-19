// app/api/novels/[id]/acts/[actId]/reorder/route.ts
// FIXED: Updated to use modernized service methods with parameter objects

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

    // ✅ FIXED: Use modern service method with parameter object
    const result = await novelService.reorderAct({
      actId,
      newOrder: reorderData.newOrder,
    });

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
===== CHANGES MADE =====

✅ FIXED: reorderAct() now uses parameter object:
   OLD: reorderAct(actId, reorderData.newOrder)
   NEW: reorderAct({ actId, newOrder: reorderData.newOrder })

✅ MAINTAINED: All existing validation and error handling
✅ MAINTAINED: Professional API standardization
✅ MAINTAINED: Standard response format

===== SERVICE METHOD SIGNATURE =====
The modernized service method expects:
reorderAct(options: ReorderActOptions)

Where ReorderActOptions is:
{
  actId: string;
  newOrder: number;
}

===== RESPONSE FORMAT =====
{
  "success": true,
  "data": {
    "id": "act456",
    "title": "Act II: Rising Action",
    "order": 3,
    "novelId": "novel123",
    "chapters": [ full chapter and scene structure  ],
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
*/
