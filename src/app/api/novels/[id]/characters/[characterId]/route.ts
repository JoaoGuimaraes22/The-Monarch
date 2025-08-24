// app/api/novels/[id]/characters/[characterId]/route.ts
// Updated individual character CRUD operations with titles support

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
  titles: z.array(z.string().max(100, "Title too long")).optional(), // ✨ NEW: Titles support
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
    const { characterId } = params as { id: string; characterId: string };

    const character = await characterService.getCharacterById(characterId);

    if (!character) {
      return createSuccessResponse(
        { character: null },
        "Character not found",
        context.requestId
      );
    }

    return createSuccessResponse(
      { character },
      "Character retrieved successfully",
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

    // Update character with all provided fields including titles
    const character = await characterService.updateCharacter(characterId, {
      ...updateData,
      // Ensure titles are passed through properly
      titles: updateData.titles, // ✨ NEW: Include titles in update
    });

    return createSuccessResponse(
      { character },
      "Character updated successfully",
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
    const { characterId } = params as { id: string; characterId: string };

    await characterService.deleteCharacter(characterId);

    return createSuccessResponse(
      { success: true },
      "Character deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
