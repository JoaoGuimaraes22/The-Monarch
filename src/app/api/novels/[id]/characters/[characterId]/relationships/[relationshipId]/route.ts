// app/api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/route.ts
// Individual relationship CRUD operations following established patterns

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
const UpdateRelationshipSchema = z.object({
  baseType: z
    .enum([
      "family",
      "romantic",
      "professional",
      "antagonistic",
      "mentor_student",
      "friendship",
    ])
    .optional(),
  origin: z.string().max(500, "Origin too long").optional(),
  history: z.string().max(2000, "History too long").optional(),
  fundamentalDynamic: z
    .string()
    .max(1000, "Fundamental dynamic too long")
    .optional(),
  writerNotes: z.string().max(2000, "Writer notes too long").optional(),
});

const RelationshipParamsSchema = z.object({
  id: z.string().min(1, "Novel ID is required"),
  characterId: z.string().min(1, "Character ID is required"),
  relationshipId: z.string().min(1, "Relationship ID is required"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/relationships/[relationshipId] =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, RelationshipParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { relationshipId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
    };

    const relationship = await relationshipService.getRelationship(
      relationshipId
    );

    if (!relationship) {
      throw new APIError("Relationship not found", 404, "NOT_FOUND");
    }

    return createSuccessResponse(
      { relationship },
      "Relationship retrieved successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/characters/[characterId]/relationships/[relationshipId] =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateRelationshipSchema, RelationshipParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { characterId, relationshipId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
    };

    // Verify relationship exists and belongs to character
    const existingRelationship = await prisma.characterRelationship.findFirst({
      where: {
        id: relationshipId,
        fromCharacterId: characterId,
      },
    });

    if (!existingRelationship) {
      throw new APIError("Relationship not found", 404, "NOT_FOUND");
    }

    // Update relationship
    const updatedRelationship = await relationshipService.updateRelationship(
      relationshipId,
      validatedData as z.infer<typeof UpdateRelationshipSchema>
    );

    return createSuccessResponse(
      { relationship: updatedRelationship },
      "Relationship updated successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/characters/[characterId]/relationships/[relationshipId] =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, RelationshipParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId, relationshipId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
    };

    // Verify relationship exists and belongs to character
    const existingRelationship = await prisma.characterRelationship.findFirst({
      where: {
        id: relationshipId,
        fromCharacterId: characterId,
      },
    });

    if (!existingRelationship) {
      throw new APIError("Relationship not found", 404, "NOT_FOUND");
    }

    // Delete relationship (including reciprocal)
    await relationshipService.deleteRelationship(relationshipId, true);

    return createSuccessResponse(
      null,
      "Relationship deleted successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});
