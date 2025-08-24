// app/api/novels/[id]/characters/[characterId]/analytics/route.ts
// Fixed character manuscript analytics API using actual service methods

import { NextRequest } from "next/server";
import { characterManuscriptService } from "@/lib/characters/character-manuscript-service";
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
const AnalyticsQuerySchema = z.object({
  includeMinorMentions: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  minConfidence: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 0.8)),
  includePronouns: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  sceneIds: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
});

const CharacterParamsSchema = z.object({
  id: z.string().min(1, "Invalid novel ID"),
  characterId: z.string().min(1, "Invalid character ID"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/analytics - Get character analytics =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema, AnalyticsQuerySchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };
    const query = context.query as {
      includeMinorMentions?: boolean;
      minConfidence?: number;
      includePronouns?: boolean;
      sceneIds?: string[];
    };

    // Build analysis options using actual service interface
    const analysisOptions = {
      includeMinorMentions: query.includeMinorMentions,
      minConfidence: query.minConfidence,
      includePronouns: query.includePronouns,
      sceneIds: query.sceneIds,
    };

    // ✅ USE ACTUAL SERVICE METHOD: getCharacterManuscriptData
    const manuscriptData =
      await characterManuscriptService.getCharacterManuscriptData(
        characterId,
        analysisOptions
      );

    if (!manuscriptData) {
      return createSuccessResponse(
        { analytics: null },
        "Character not found",
        context.requestId
      );
    }

    // ✅ ALSO GET CHARACTER TIMELINE for comprehensive analytics
    const timeline = await characterManuscriptService.getCharacterTimeline(
      characterId,
      analysisOptions
    );

    // Build comprehensive analytics response
    const analytics = {
      ...manuscriptData,
      timeline,
      // Add computed fields for UI convenience
      averageMentionsPerScene:
        manuscriptData.totalScenes > 0
          ? manuscriptData.totalMentions / manuscriptData.totalScenes
          : 0,
      isPrimaryCharacter:
        manuscriptData.povScenes > 0 || manuscriptData.totalMentions > 10,
      appearances: manuscriptData.appearances,
    };

    return createSuccessResponse(
      { analytics },
      `Character analytics generated for ${manuscriptData.characterName}`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
