// app/api/novels/[id]/characters/[characterId]/mentions/route.ts
// Fixed character mentions API using actual service methods

import { NextRequest } from "next/server";
import { characterManuscriptService } from "@/lib/characters/character-manuscript-service";
import { characterService } from "@/lib/characters/character-service";
import { CharacterTextAnalyzer } from "@/lib/characters/character-text-analyzer";
import { prisma } from "@/lib/prisma";
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
const MentionsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional(),
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

// ===== GET /api/novels/[id]/characters/[characterId]/mentions - Get character mentions =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, CharacterParamsSchema, MentionsQuerySchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId, characterId } = params as {
      id: string;
      characterId: string;
    };
    const query = context.query as {
      page?: number;
      limit?: number;
      search?: string;
      minConfidence?: number;
      includePronouns?: boolean;
      sceneIds?: string[];
    };

    // Get character
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      return createSuccessResponse(
        { mentions: [], pagination: null },
        "Character not found",
        context.requestId
      );
    }

    // Handle search vs pagination
    if (query.search && query.search.trim()) {
      // ✅ IMPLEMENT SEARCH: Search through character appearances for specific text
      const manuscriptData =
        await characterManuscriptService.getCharacterManuscriptData(
          characterId,
          {
            minConfidence: query.minConfidence,
            includePronouns: query.includePronouns,
            sceneIds: query.sceneIds,
          }
        );

      if (!manuscriptData) {
        return createSuccessResponse(
          { mentions: [], search: query.search },
          "No character data found",
          context.requestId
        );
      }

      // Filter appearances based on search term
      const searchTerm = query.search.toLowerCase();
      const searchResults = manuscriptData.appearances.filter((appearance) => {
        return (
          appearance.sceneName.toLowerCase().includes(searchTerm) ||
          appearance.chapterName.toLowerCase().includes(searchTerm) ||
          appearance.actName.toLowerCase().includes(searchTerm) ||
          appearance.mentions.some(
            (mention) =>
              mention.fullContext.toLowerCase().includes(searchTerm) ||
              mention.mentionText.toLowerCase().includes(searchTerm)
          )
        );
      });

      return createSuccessResponse(
        {
          mentions: searchResults,
          search: query.search,
        },
        `Found ${searchResults.length} mentions matching "${query.search}"`,
        context.requestId
      );
    } else {
      // ✅ IMPLEMENT PAGINATION: Use manuscript data with pagination
      const manuscriptData =
        await characterManuscriptService.getCharacterManuscriptData(
          characterId,
          {
            minConfidence: query.minConfidence,
            includePronouns: query.includePronouns,
            sceneIds: query.sceneIds,
          }
        );

      if (!manuscriptData) {
        return createSuccessResponse(
          { mentions: [], pagination: null },
          "No character data found",
          context.requestId
        );
      }

      // Implement pagination on appearances
      const page = query.page || 1;
      const limit = query.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedAppearances = manuscriptData.appearances.slice(
        startIndex,
        endIndex
      );
      const totalAppearances = manuscriptData.appearances.length;
      const totalPages = Math.ceil(totalAppearances / limit);

      const pagination = {
        page,
        limit,
        total: totalAppearances,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      return createSuccessResponse(
        {
          mentions: paginatedAppearances,
          pagination,
        },
        `Retrieved ${paginatedAppearances.length} character appearances`,
        context.requestId
      );
    }
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels/[id]/characters/[characterId]/mentions - Find mentions in specific content =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(
    z.object({
      content: z.string().min(1, "Content is required"),
      sceneId: z.string().optional(),
      options: z
        .object({
          contextLength: z.number().optional(),
          fullContextLength: z.number().optional(),
          minConfidence: z.number().optional(),
          includePronounMatches: z.boolean().optional(),
          caseSensitive: z.boolean().optional(),
        })
        .optional(),
    }),
    CharacterParamsSchema
  )
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { characterId } = params as { characterId: string };
    const { content, sceneId, options } = validatedData as {
      content: string;
      sceneId?: string;
      options?: {
        contextLength?: number;
        fullContextLength?: number;
        minConfidence?: number;
        includePronounMatches?: boolean;
        caseSensitive?: boolean;
      };
    };

    // Get character
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      return createSuccessResponse(
        { mentions: [] },
        "Character not found",
        context.requestId
      );
    }

    // ✅ USE TEXT ANALYZER DIRECTLY: Analyze provided content
    const mentions = CharacterTextAnalyzer.findCharacterMentions(
      content,
      character,
      sceneId || "custom-content",
      options || {}
    );

    return createSuccessResponse(
      {
        mentions,
        characterId,
        characterName: character.name,
      },
      `Found ${mentions.length} mentions in provided content`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});
