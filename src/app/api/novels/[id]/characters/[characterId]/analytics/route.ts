// app/api/novels/[id]/characters/[characterId]/analytics/route.ts
// Character manuscript analytics API following established patterns

import { NextRequest } from "next/server";
import { characterManuscriptService } from "@/lib/characters/character-manuscript-service";
import { CharacterPOVParamsSchema } from "@/lib/characters/pov-types";
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
  contextLength: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50)),
  fullContextLength: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 200)),
  minConfidence: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 0.7)),
  includePronounMatches: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  caseSensitive: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// ===== GET /api/novels/[id]/characters/[characterId]/analytics - Get character analytics =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterPOVParamsSchema, AnalyticsQuerySchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };
    const query = context.query as {
      contextLength?: number;
      fullContextLength?: number;
      minConfidence?: number;
      includePronounMatches?: boolean;
      caseSensitive?: boolean;
    };

    // Build text analysis options
    const analysisOptions = {
      contextLength: query.contextLength,
      fullContextLength: query.fullContextLength,
      minConfidence: query.minConfidence,
      includePronounMatches: query.includePronounMatches,
      caseSensitive: query.caseSensitive,
    };

    // Get comprehensive analytics
    const analytics =
      await characterManuscriptService.getCharacterManuscriptAnalytics(
        characterId,
        analysisOptions
      );

    return createSuccessResponse(
      {
        analytics,
      },
      `Character analytics generated for ${analytics.characterName}`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
