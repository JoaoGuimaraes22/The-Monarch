// app/api/novels/[id]/characters/[characterId]/pov-assignments/route.ts
// Character-specific POV assignments following established patterns

import { NextRequest } from "next/server";
import { povService } from "@/lib/characters/pov-service";
import { CharacterPOVParamsSchema } from "@/lib/characters/pov-types";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/characters/[characterId]/pov-assignments =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterPOVParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };

    // Get POV assignments for this character
    const assignments = await povService.getCharacterPOVAssignments(
      characterId
    );

    // Check if character has any POV assignments
    const hasPOV = await povService.hasCharacterPOVAssignments(characterId);

    return createSuccessResponse(
      {
        assignments,
        hasPOV,
        count: assignments.length,
      },
      `Retrieved ${assignments.length} POV assignments for character`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
