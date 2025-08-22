// app/api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/route.ts
// Relationship states list and creation following established patterns

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
const CreateRelationshipStateSchema = z.object({
  currentType: z
    .string()
    .min(1, "Current type is required")
    .max(100, "Current type too long"),
  subtype: z.string().max(200, "Subtype too long").optional(),
  strength: z.number().int().min(1).max(10).default(5),
  publicStatus: z.string().max(500, "Public status too long").optional(),
  privateStatus: z.string().max(500, "Private status too long").optional(),
  trustLevel: z.number().int().min(1).max(10).default(5),
  conflictLevel: z.number().int().min(1).max(10).default(1),
  powerBalance: z
    .enum(["equal", "a_dominant", "b_dominant", "shifting"])
    .default("equal"),
  scopeType: z.enum(["novel", "act", "chapter", "scene"]),
  startActId: z.string().nullable().optional(),
  startChapterId: z.string().nullable().optional(),
  startSceneId: z.string().nullable().optional(),
  endActId: z.string().nullable().optional(),
  endChapterId: z.string().nullable().optional(),
  endSceneId: z.string().nullable().optional(),
  changes: z.string().max(2000, "Changes description too long").optional(),
  triggerSceneId: z.string().nullable().optional(),
});

const RelationshipStateParamsSchema = z.object({
  id: z.string().min(1, "Novel ID is required"),
  characterId: z.string().min(1, "Character ID is required"),
  relationshipId: z.string().min(1, "Relationship ID is required"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, RelationshipStateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { relationshipId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
    };

    const states = await relationshipService.getRelationshipStates(
      relationshipId
    );

    return createSuccessResponse(
      { states },
      "Relationship states retrieved successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateRelationshipStateSchema, RelationshipStateParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { characterId, relationshipId } = params as {
      id: string;
      characterId: string;
      relationshipId: string;
    };

    // Verify relationship exists and belongs to character
    const relationship = await prisma.characterRelationship.findFirst({
      where: {
        id: relationshipId,
        fromCharacterId: characterId,
      },
    });

    if (!relationship) {
      throw new APIError("Relationship not found", 404, "NOT_FOUND");
    }

    // Create relationship state
    const state = await relationshipService.createRelationshipState({
      relationshipId,
      ...(validatedData as z.infer<typeof CreateRelationshipStateSchema>),
    });

    return createSuccessResponse(
      { state },
      "Relationship state created successfully",
      context.requestId
    );
  } catch (error) {
    return handleServiceError(error);
  }
});
