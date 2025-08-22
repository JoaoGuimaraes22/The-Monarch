// app/api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/[stateId]/route.ts
// Individual relationship state CRUD operations following established patterns

import { NextRequest } from "next/server";
import { relationshipService } from "@/lib/characters/relationship-service";
import { prisma } from "@/lib/prisma";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
  APIError,
} from "@/lib/api";
import { z } from "zod";

// ===== VALIDATION SCHEMAS =====
const UpdateRelationshipStateSchema = z.object({
  currentType: z.string().max(100, "Current type too long").optional(),
  subtype: z.string().max(200, "Subtype too long").optional(),
  strength: z.number().int().min(1).max(10).optional(),
  publicStatus: z.string().max(500, "Public status too long").optional(),
  privateStatus: z.string().max(500, "Private status too long").optional(),
  trustLevel: z.number().int().min(1).max(10).optional(),
  conflictLevel: z.number().int().min(1).max(10).optional(),
  powerBalance: z
    .enum(["equal", "a_dominant", "b_dominant", "shifting"])
    .optional(),
  scopeType: z.enum(["novel", "act", "chapter", "scene"]).optional(),
  startActId: z.string().nullable().optional(),
  startChapterId: z.string().nullable().optional(),
  startSceneId: z.string().nullable().optional(),
  endActId: z.string().nullable().optional(),
  endChapterId: z.string().nullable().optional(),
  endSceneId: z.string().nullable().optional(),
  changes: z.string().max(2000, "Changes description too long").optional(),
  triggerSceneId: z.string().nullable().optional(),
});

const RelationshipStateDetailParamsSchema = z.object({
  id: z.string().min(1, "Novel ID is required"),
  characterId: z.string().min(1, "Character ID is required"),
  relationshipId: z.string().min(1, "Relationship ID is required"),
  stateId: z.string().min(1, "State ID is required"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/[stateId] =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, RelationshipStateDetailParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId, relationshipId, stateId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
      stateId: string;
    };

    const state = await prisma.relationshipState.findUnique({
      where: { id: stateId },
      include: {
        relationship: {
          include: {
            fromCharacter: true,
            toCharacter: true,
          },
        },
      },
    });

    if (!state) {
      throw new APIError("Relationship state not found", 404, "NOT_FOUND");
    }

    // Verify the state belongs to the correct relationship and character
    if (
      state.relationshipId !== relationshipId ||
      state.relationship.fromCharacterId !== characterId
    ) {
      throw new APIError("Relationship state not found", 404, "NOT_FOUND");
    }

    return createSuccessResponse(
      { state },
      "Relationship state retrieved successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/[stateId] =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(
    UpdateRelationshipStateSchema,
    RelationshipStateDetailParamsSchema
  )
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { characterId, relationshipId, stateId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
      stateId: string;
    };

    // Verify state exists and belongs to the correct relationship/character
    const existingState = await prisma.relationshipState.findFirst({
      where: {
        id: stateId,
        relationshipId: relationshipId,
        relationship: {
          fromCharacterId: characterId,
        },
      },
    });

    if (!existingState) {
      throw new APIError("Relationship state not found", 404, "NOT_FOUND");
    }

    // Update relationship state
    const updatedState = await relationshipService.updateRelationshipState(
      stateId,
      validatedData as z.infer<typeof UpdateRelationshipStateSchema>
    );

    return createSuccessResponse(
      { state: updatedState },
      "Relationship state updated successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/[stateId] =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, RelationshipStateDetailParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId, relationshipId, stateId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
      stateId: string;
    };

    // Verify state exists and belongs to the correct relationship/character
    const existingState = await prisma.relationshipState.findFirst({
      where: {
        id: stateId,
        relationshipId: relationshipId,
        relationship: {
          fromCharacterId: characterId,
        },
      },
    });

    if (!existingState) {
      throw new APIError("Relationship state not found", 404, "NOT_FOUND");
    }

    // Delete relationship state
    await relationshipService.deleteRelationshipState(stateId);

    return createSuccessResponse(
      null,
      "Relationship state deleted successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});
