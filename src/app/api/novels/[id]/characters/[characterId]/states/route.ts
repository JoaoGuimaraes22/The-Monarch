// app/api/novels/[id]/characters/[characterId]/states/route.ts
// Character states management API - following established patterns

import { NextRequest } from "next/server";
import { characterService } from "@/lib/characters/character-service";
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
const CreateCharacterStateSchema = z.object({
  age: z.number().int().min(0).max(10000).optional(),
  title: z.string().max(255, "Title too long").optional(),
  occupation: z.string().max(255, "Occupation too long").optional(),
  location: z.string().max(255, "Location too long").optional(),
  socialStatus: z.string().max(255, "Social status too long").optional(),
  faction: z.string().max(255, "Faction too long").optional(),
  currentTraits: z.array(z.string().max(100)).optional(),
  activeFears: z.array(z.string().max(100)).optional(),
  currentGoals: z.array(z.string().max(200)).optional(),
  motivations: z.array(z.string().max(200)).optional(),
  skills: z.array(z.string().max(100)).optional(),
  knowledge: z.array(z.string().max(200)).optional(),
  secrets: z.array(z.string().max(500)).optional(),
  mentalState: z.string().max(500, "Mental state too long").optional(),
  scopeType: z.enum(["novel", "act", "chapter", "scene"]),
  startActId: z.string().optional(),
  startChapterId: z.string().optional(),
  startSceneId: z.string().optional(),
  endActId: z.string().optional(),
  endChapterId: z.string().optional(),
  endSceneId: z.string().optional(),
  changes: z.string().max(2000, "Changes description too long").optional(),
  triggerSceneId: z.string().optional(),
});

const CharacterStateParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/states - List states =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterStateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };

    // Verify character exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Get character states
    const states = await characterService.getCharacterStates(characterId);

    return createSuccessResponse(
      { states },
      `Retrieved ${states.length} character states`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/states - Create state =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION), // Use CREATION rate limit like other creation endpoints
  withValidation(CreateCharacterStateSchema, CharacterStateParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };
    const stateData = validatedData as z.infer<
      typeof CreateCharacterStateSchema
    >;

    // Verify character exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Transform changes from string to object for service layer
    const serviceData = {
      characterId,
      ...stateData,
      changes: stateData.changes
        ? { description: stateData.changes }
        : undefined,
    };

    // Create character state
    const newState = await characterService.createCharacterState(serviceData);

    return createSuccessResponse(
      newState,
      "Character state created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
