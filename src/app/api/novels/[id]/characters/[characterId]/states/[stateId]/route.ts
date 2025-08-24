// app/api/novels/[id]/characters/[characterId]/states/[stateId]/route.ts
// Updated individual character state CRUD operations using separated service with proper types

import { NextRequest } from "next/server";
import { characterStateService } from "@/lib/characters/character-state-service";
import type {
  UpdateCharacterStateOptions,
  CreateCharacterStateOptions,
} from "@/lib/characters/character-state-service";
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
  currentAppearance: z.record(z.string(), z.unknown()).nullable().optional(),
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

const DuplicateOverridesSchema = z.object({
  scopeType: z.enum(["novel", "act", "chapter", "scene"]).optional(),
  startActId: z.string().nullable().optional(),
  startChapterId: z.string().nullable().optional(),
  startSceneId: z.string().nullable().optional(),
  endActId: z.string().nullable().optional(),
  endChapterId: z.string().nullable().optional(),
  endSceneId: z.string().nullable().optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
  triggerSceneId: z.string().nullable().optional(),
});

const StateParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
  stateId: z.string().min(1, "Invalid state ID"),
});

// ===== TYPE DEFINITIONS =====
type ValidatedUpdateStateData = z.infer<typeof UpdateCharacterStateSchema>;
type ValidatedDuplicateOverrides = z.infer<typeof DuplicateOverridesSchema>;

// ===== GET /api/novels/[id]/characters/[characterId]/states/[stateId] - Get specific state =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, StateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { stateId } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    // ✅ USE SEPARATED SERVICE: characterStateService
    const state = await characterStateService.getCharacterStateById(stateId);

    if (!state) {
      return createSuccessResponse(
        { state: null },
        "Character state not found",
        context.requestId
      );
    }

    return createSuccessResponse(
      { state },
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
  withValidation(UpdateCharacterStateSchema, StateParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { stateId } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    // ✅ PROPERLY TYPED: Cast to validated schema type
    const updateData = validatedData as ValidatedUpdateStateData;

    // ✅ TYPE-SAFE CONVERSION: Transform validated data to service interface
    const serviceUpdateData: UpdateCharacterStateOptions = {
      age: updateData.age,
      title: updateData.title,
      occupation: updateData.occupation,
      location: updateData.location,
      socialStatus: updateData.socialStatus,
      faction: updateData.faction,
      currentTraits: updateData.currentTraits,
      activeFears: updateData.activeFears,
      currentGoals: updateData.currentGoals,
      motivations: updateData.motivations,
      skills: updateData.skills,
      knowledge: updateData.knowledge,
      secrets: updateData.secrets,
      currentAppearance: updateData.currentAppearance,
      mentalState: updateData.mentalState,
      scopeType: updateData.scopeType,
      startActId: updateData.startActId,
      startChapterId: updateData.startChapterId,
      startSceneId: updateData.startSceneId,
      endActId: updateData.endActId,
      endChapterId: updateData.endChapterId,
      endSceneId: updateData.endSceneId,
      changes: updateData.changes,
      triggerSceneId: updateData.triggerSceneId,
    };

    // ✅ USE SEPARATED SERVICE: characterStateService
    const state = await characterStateService.updateCharacterState(
      stateId,
      serviceUpdateData
    );

    return createSuccessResponse(
      { state },
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
  withValidation(undefined, StateParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { stateId } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    // ✅ USE SEPARATED SERVICE: characterStateService
    await characterStateService.deleteCharacterState(stateId);

    return createSuccessResponse(
      { success: true },
      "Character state deleted successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/states/[stateId]/duplicate - Duplicate state =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(
    z.object({
      overrides: DuplicateOverridesSchema.optional(),
    }),
    StateParamsSchema
  )
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { stateId } = params as {
      id: string;
      characterId: string;
      stateId: string;
    };

    const { overrides } = validatedData as {
      overrides?: ValidatedDuplicateOverrides;
    };

    // ✅ TYPE-SAFE CONVERSION: Transform validated overrides to service interface
    const serviceOverrides: Partial<CreateCharacterStateOptions> = overrides
      ? {
          scopeType: overrides.scopeType,
          startActId: overrides.startActId,
          startChapterId: overrides.startChapterId,
          startSceneId: overrides.startSceneId,
          endActId: overrides.endActId,
          endChapterId: overrides.endChapterId,
          endSceneId: overrides.endSceneId,
          changes: overrides.changes,
          triggerSceneId: overrides.triggerSceneId,
        }
      : {};

    // ✅ USE SEPARATED SERVICE: characterStateService
    const duplicatedState = await characterStateService.duplicateCharacterState(
      stateId,
      serviceOverrides
    );

    return createSuccessResponse(
      { state: duplicatedState },
      "Character state duplicated successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
