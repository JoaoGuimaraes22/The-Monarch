// app/api/novels/[id]/pov-assignments/[assignmentId]/route.ts
// Individual POV assignment CRUD operations following established patterns

import { NextRequest } from "next/server";
import { povService } from "@/lib/characters/pov-service";
import {
  UpdatePOVAssignmentSchema,
  POVAssignmentParamsSchema,
  UpdatePOVAssignmentData,
} from "@/lib/characters/pov-types";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/pov-assignments/[assignmentId] - Get assignment details =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, POVAssignmentParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { assignmentId } = params as { assignmentId: string };

    // For individual assignment, we need to fetch it directly from Prisma
    // since our service methods are optimized for bulk operations
    const assignment = await povService
      .getPOVAssignments("")
      .then((assignments) => assignments.find((a) => a.id === assignmentId));

    if (!assignment) {
      return createSuccessResponse(
        null,
        "POV assignment not found",
        context.requestId
      );
    }

    return createSuccessResponse(
      { assignment },
      "POV assignment retrieved successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/pov-assignments/[assignmentId] - Update assignment =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdatePOVAssignmentSchema, POVAssignmentParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { assignmentId } = params as { assignmentId: string };
    const body = validatedData as UpdatePOVAssignmentData;

    const updatedAssignment = await povService.updatePOVAssignment(
      assignmentId,
      body
    );

    return createSuccessResponse(
      { assignment: updatedAssignment },
      "POV assignment updated successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/pov-assignments/[assignmentId] - Delete assignment =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, POVAssignmentParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { assignmentId } = params as { assignmentId: string };

    const deleted = await povService.deletePOVAssignment(assignmentId);

    if (!deleted) {
      return createSuccessResponse(
        { deleted: false },
        "POV assignment not found or could not be deleted",
        context.requestId
      );
    }

    return createSuccessResponse(
      { deleted: true },
      "POV assignment deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
