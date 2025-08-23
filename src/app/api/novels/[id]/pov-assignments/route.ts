// app/api/novels/[id]/pov-assignments/route.ts
// POV assignments API routes following established patterns

import { NextRequest } from "next/server";
import { povService } from "@/lib/characters/pov-service";
import {
  CreatePOVAssignmentSchema,
  POVQuerySchema,
  CreatePOVAssignmentData,
} from "@/lib/characters/pov-types";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";
import { z } from "zod";

// ===== VALIDATION SCHEMAS =====
const NovelParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
});

// ===== GET /api/novels/[id]/pov-assignments - Get POV assignments for novel =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, NovelParamsSchema, POVQuerySchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const query = context.query as { scopeType?: string; characterId?: string };

    let assignments;

    if (query.characterId) {
      // Get assignments for specific character
      assignments = await povService.getCharacterPOVAssignments(
        query.characterId
      );
    } else if (query.scopeType) {
      // Get assignments by scope type
      assignments = await povService.getPOVAssignmentsByScope(
        novelId,
        query.scopeType as "novel" | "act" | "chapter" | "scene"
      );
    } else {
      // Get all assignments for novel
      assignments = await povService.getPOVAssignments(novelId);
    }

    // Get statistics
    const stats = await povService.getPOVStatistics(novelId);

    return createSuccessResponse(
      {
        assignments,
        stats,
      },
      `Retrieved ${assignments.length} POV assignments`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/pov-assignments - Create POV assignment =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreatePOVAssignmentSchema, NovelParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const body = validatedData as CreatePOVAssignmentData;

    const assignment = await povService.createPOVAssignment({
      novelId,
      ...body,
    });

    return createSuccessResponse(
      { assignment },
      "POV assignment created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
