// app/api/novels/[id]/characters/[characterId]/relationships/route.ts
// Character relationships list and creation following established patterns

import { NextRequest } from "next/server";
import { relationshipService } from "@/lib/characters/relationship-service";
import { prisma } from "@/lib/prisma";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  createErrorResponse,
  handleServiceError,
  RATE_LIMIT_CONFIGS,
  APIError,
} from "@/lib/api";
import { z } from "zod";

// ===== VALIDATION SCHEMAS =====
const CreateRelationshipSchema = z.object({
  toCharacterId: z.string().min(1, "Target character ID is required"),
  baseType: z.enum([
    "family",
    "romantic",
    "professional",
    "antagonistic",
    "mentor_student",
    "friendship",
  ]),
  origin: z.string().max(500, "Origin too long").optional(),
  history: z.string().max(2000, "History too long").optional(),
  fundamentalDynamic: z
    .string()
    .max(1000, "Fundamental dynamic too long")
    .optional(),
  writerNotes: z.string().max(2000, "Writer notes too long").optional(),
  reciprocalOrigin: z
    .string()
    .max(500, "Reciprocal origin too long")
    .optional(),
  initialState: z
    .object({
      currentType: z.string().max(100).optional(),
      strength: z.number().int().min(1).max(10).optional(),
      trustLevel: z.number().int().min(1).max(10).optional(),
      conflictLevel: z.number().int().min(1).max(10).optional(),
      powerBalance: z
        .enum(["equal", "a_dominant", "b_dominant", "shifting"])
        .optional(),
      scopeType: z.enum(["novel", "act", "chapter", "scene"]).optional(),
    })
    .optional(),
});

const CharacterParamsSchema = z.object({
  id: z.string().min(1, "Novel ID is required"),
  characterId: z.string().min(1, "Character ID is required"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/relationships =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { id: string; characterId: string };

    const relationships = await relationshipService.getCharacterRelationships(
      characterId
    );

    return createSuccessResponse(
      { relationships },
      "Character relationships retrieved successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/relationships =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateRelationshipSchema, CharacterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };
    const {
      toCharacterId,
      baseType,
      origin,
      history,
      fundamentalDynamic,
      writerNotes,
      reciprocalOrigin,
      initialState,
    } = validatedData as z.infer<typeof CreateRelationshipSchema>;

    // Validate that characters exist and belong to the novel
    const fromCharacter = await prisma.character.findFirst({
      where: {
        id: characterId,
        novelId: novelId,
      },
    });

    if (!fromCharacter) {
      throw new APIError("Character not found", 404, "NOT_FOUND");
    }

    const toCharacter = await prisma.character.findFirst({
      where: {
        id: toCharacterId,
        novelId: novelId,
      },
    });

    if (!toCharacter) {
      throw new APIError("Target character not found", 404, "NOT_FOUND");
    }

    // Check if relationship already exists
    const existingRelationship = await prisma.characterRelationship.findFirst({
      where: {
        fromCharacterId: characterId,
        toCharacterId: toCharacterId,
      },
    });

    if (existingRelationship) {
      throw new APIError("Relationship already exists", 409, "CONFLICT");
    }

    // Create bidirectional relationship pair
    const result = await relationshipService.createRelationshipPair({
      characterAId: characterId,
      characterBId: toCharacterId,
      baseType,
      originFromA: origin,
      originFromB: reciprocalOrigin,
      history,
      fundamentalDynamic,
      writerNotes,
      initialState,
    });

    // Return the relationship from the current character's perspective
    const relationshipWithDetails = await relationshipService.getRelationship(
      result.relationshipAB.id
    );

    return createSuccessResponse(
      { relationship: relationshipWithDetails },
      "Relationship created successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});
