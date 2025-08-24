// app/api/novels/[id]/characters/[characterId]/states/route.ts
// Updated to use separated character state service

import { NextRequest } from "next/server";
import { characterStateService } from "@/lib/characters/character-state-service";
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
  startActId: z.string().nullable().optional(),
  startChapterId: z.string().nullable().optional(),
  startSceneId: z.string().nullable().optional(),
  endActId: z.string().nullable().optional(),
  endChapterId: z.string().nullable().optional(),
  endSceneId: z.string().nullable().optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
  triggerSceneId: z.string().nullable().optional(),
});

const CharacterParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/states - Get character states =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { id: string; characterId: string };

    // ✅ USE SEPARATED SERVICE: characterStateService
    const states = await characterStateService.getCharacterStates(characterId);

    // Get statistics
    const statistics = await characterStateService.getCharacterStateStatistics(
      characterId
    );

    return createSuccessResponse(
      {
        states,
        statistics,
      },
      `Retrieved ${states.length} character states`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/states - Create character state =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateCharacterStateSchema, CharacterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { characterId } = params as { id: string; characterId: string };
    const stateData = validatedData as z.infer<
      typeof CreateCharacterStateSchema
    >;

    // ✅ USE SEPARATED SERVICE: characterStateService
    const state = await characterStateService.createCharacterState({
      characterId,
      ...stateData,
    });

    return createSuccessResponse(
      { state },
      "Character state created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== Additional utility endpoints =====

// GET most recent state
export async function getMostRecentState(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };

    const state = await characterStateService.getMostRecentCharacterState(
      characterId
    );

    return createSuccessResponse(
      { state },
      state ? "Most recent state retrieved" : "No states found",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
}
