// app/api/novels/[id]/characters/[characterId]/mentions/route.ts
// Character mention detection API following established patterns

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
const MentionQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional(),
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

// ===== GET /api/novels/[id]/characters/[characterId]/mentions - Get character mentions =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterPOVParamsSchema, MentionQuerySchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };
    const query = context.query as {
      page?: number;
      limit?: number;
      search?: string;
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

    // Handle search vs pagination
    if (query.search) {
      // Search for specific mentions
      const searchResults =
        await characterManuscriptService.searchCharacterMentions(
          characterId,
          query.search,
          analysisOptions
        );

      return createSuccessResponse(
        {
          mentions: searchResults,
          search: query.search,
        },
        `Found ${searchResults.length} mentions matching "${query.search}"`,
        context.requestId
      );
    } else {
      // Paginated mentions
      const result =
        await characterManuscriptService.getCharacterMentionsPaginated(
          characterId,
          query.page || 1,
          query.limit || 20,
          analysisOptions
        );

      return createSuccessResponse(
        {
          mentions: result.mentions,
          pagination: result.pagination,
        },
        `Retrieved ${result.mentions.length} character mentions`,
        context.requestId
      );
    }
  } catch (error) {
    handleServiceError(error);
  }
});
