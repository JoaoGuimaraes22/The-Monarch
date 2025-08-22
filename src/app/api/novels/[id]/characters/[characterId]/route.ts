// app/api/novels/[id]/characters/[characterId]/route.ts
// Individual character CRUD operations following established patterns

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
const UpdateCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "Character name is required")
    .max(255, "Name too long")
    .optional(),
  species: z.string().max(100, "Species name too long").optional(),
  gender: z.string().max(50, "Gender too long").optional(),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  birthplace: z.string().max(255, "Birthplace too long").nullable().optional(),
  family: z.record(z.string(), z.unknown()).nullable().optional(),
  baseAppearance: z.record(z.string(), z.unknown()).nullable().optional(),
  coreNature: z.record(z.string(), z.unknown()).nullable().optional(),
  inspirations: z.array(z.string()).optional(),
  writerNotes: z.string().max(2000, "Notes too long").nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const CharacterParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
});

// ===== GET /api/novels/[id]/characters/[characterId] - Get character details =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };

    // Get character
    const character = await characterService.getCharacterById(characterId);

    if (!character) {
      throw new Error("Character not found");
    }

    // Verify character belongs to this novel
    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Get character states
    const states = await characterService.getCharacterStates(characterId);

    return createSuccessResponse(
      {
        character,
        states,
      },
      `Character "${character.name}" retrieved successfully`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== PUT /api/novels/[id]/characters/[characterId] - Update character =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateCharacterSchema, CharacterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };
    const updateData = validatedData as z.infer<typeof UpdateCharacterSchema>;

    // Get existing character to verify it exists and belongs to novel
    const existingCharacter = await characterService.getCharacterById(
      characterId
    );

    if (!existingCharacter) {
      throw new Error("Character not found");
    }

    if (existingCharacter.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Check if name is unique (if name is being updated)
    if (updateData.name && updateData.name !== existingCharacter.name) {
      const isNameUnique = await characterService.isCharacterNameUnique(
        novelId,
        updateData.name,
        characterId
      );
      if (!isNameUnique) {
        throw new Error("Character name already exists in this novel");
      }
    }

    // Update character
    const updatedCharacter = await characterService.updateCharacter(
      characterId,
      updateData
    );

    return createSuccessResponse(
      updatedCharacter,
      `Character "${updatedCharacter.name}" updated successfully`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/characters/[characterId] - Delete character =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };

    // Get character to verify it exists and belongs to novel
    const character = await characterService.getCharacterById(characterId);

    if (!character) {
      throw new Error("Character not found");
    }

    if (character.novelId !== novelId) {
      throw new Error("Character not found in this novel");
    }

    // Delete character (cascades to states, relationships, arcs)
    await characterService.deleteCharacter(characterId);

    return createSuccessResponse(
      null,
      `Character "${character.name}" deleted successfully`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
