// app/api/novels/[id]/characters/route.ts
// Character API routes following your established patterns

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
const CreateCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "Character name is required")
    .max(255, "Name too long"),
  species: z.string().max(100, "Species name too long").optional(),
  gender: z.string().max(50, "Gender too long").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  birthplace: z.string().max(255, "Birthplace too long").optional(),
  family: z.record(z.string(), z.unknown()).optional(),
  baseAppearance: z.record(z.string(), z.unknown()).optional(),
  coreNature: z.record(z.string(), z.unknown()).optional(),
  inspirations: z.array(z.string()).optional(),
  writerNotes: z.string().max(2000, "Notes too long").optional(),
  tags: z.array(z.string()).optional(),
});

const NovelParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
});

// ===== GET /api/novels/[id]/characters - Get all characters for a novel =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, NovelParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };

    // Get characters with current states and POV counts
    const characters = await characterService.getAllCharacters(novelId);

    // Get statistics
    const stats = await characterService.getCharacterStatistics(novelId);

    return createSuccessResponse(
      {
        characters,
        stats,
      },
      `Retrieved ${characters.length} characters`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters - Create a new character =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateCharacterSchema, NovelParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const characterData = validatedData as z.infer<
      typeof CreateCharacterSchema
    >;

    // Check if name is unique
    const isNameUnique = await characterService.isCharacterNameUnique(
      novelId,
      characterData.name
    );
    if (!isNameUnique) {
      throw new Error("Character name already exists in this novel");
    }

    // Create character
    const character = await characterService.createCharacter(
      novelId,
      characterData
    );

    return createSuccessResponse(
      character,
      `Character "${character.name}" created successfully`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
