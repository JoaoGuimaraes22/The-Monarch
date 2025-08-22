// app/api/novels/[id]/characters/[characterId]/states/[stateId]/route.ts
// Individual character state CRUD operations following established patterns

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
const UpdateCharacterStateSchema = z.object({
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

const CharacterStateParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
  stateId: z.string().min(1, "Invalid state ID"),
});

// Helper function to convert null to undefined for service layer
const sanitizeUpdateData = (
  data: z.infer<typeof UpdateCharacterStateSchema>
) => {
  const sanitized: Record<string, unknown> = {};

  // Handle all fields, converting null to undefined
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) {
      sanitized[key] = value;
    }
    // If value is null, we simply don't include it (undefined)
  });

  return sanitized;
};

// ===== GET /api/novels/[id]/characters/[characterId]/states/[stateId] - Get specific state =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterStateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const {
      id: novelId,
      characterId,
      stateId,
    } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    // Verify character exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Get specific character state
    const state = await characterService.getCharacterStateById(stateId);
    if (!state) {
      throw new Error("Character state not found");
    }
    if (state.characterId !== characterId) {
      throw new Error("Character state not found for this character");
    }

    return createSuccessResponse(
      state,
      "Character state retrieved successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/characters/[characterId]/states/[stateId] - Update state =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateCharacterStateSchema, CharacterStateParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const {
      id: novelId,
      characterId,
      stateId,
    } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };
    const updateData = validatedData as z.infer<
      typeof UpdateCharacterStateSchema
    >;

    // Verify character exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Verify state exists and belongs to character
    const existingState = await characterService.getCharacterStateById(stateId);
    if (!existingState) {
      throw new Error("Character state not found");
    }
    if (existingState.characterId !== characterId) {
      throw new Error("Character state not found for this character");
    }

    // Sanitize data and handle changes transformation
    const sanitizedData = sanitizeUpdateData(updateData);
    const serviceData = {
      ...sanitizedData,
      changes: updateData.changes
        ? { description: updateData.changes }
        : undefined,
    };

    // Update character state
    const updatedState = await characterService.updateCharacterState(
      stateId,
      serviceData
    );

    return createSuccessResponse(
      updatedState,
      "Character state updated successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/characters/[characterId]/states/[stateId] - Delete state =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterStateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const {
      id: novelId,
      characterId,
      stateId,
    } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    // Verify character exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Verify state exists and belongs to character
    const existingState = await characterService.getCharacterStateById(stateId);
    if (!existingState) {
      throw new Error("Character state not found");
    }
    if (existingState.characterId !== characterId) {
      throw new Error("Character state not found for this character");
    }

    // Delete character state
    await characterService.deleteCharacterState(stateId);

    return createSuccessResponse(
      null,
      "Character state deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
