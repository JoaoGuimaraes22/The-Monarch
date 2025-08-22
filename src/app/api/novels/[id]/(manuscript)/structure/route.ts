// app/api/novels/[id]/structure/route.ts
// Standardized novel structure operations

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  NovelParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels/[id]/structure - Get novel with full structure =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(undefined, NovelParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id } = params as { id: string }; // Type assertion after validation
    const novel = await novelService.getNovelWithStructure(id);

    if (!novel) {
      throw new Error("Novel not found");
    }

    // Calculate structure statistics
    const stats = {
      acts: novel.acts.length,
      chapters: novel.acts.reduce(
        (total, act) => total + act.chapters.length,
        0
      ),
      scenes: novel.acts.reduce(
        (total, act) =>
          total +
          act.chapters.reduce(
            (chapterTotal, chapter) => chapterTotal + chapter.scenes.length,
            0
          ),
        0
      ),
      totalWords: novel.wordCount,
    };

    return createSuccessResponse(
      {
        novel,
        stats,
      },
      `Novel structure retrieved successfully (${stats.acts} acts, ${stats.chapters} chapters, ${stats.scenes} scenes)`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== DELETE /api/novels/[id]/structure - Clear novel structure =====
export const DELETE = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION), // Use creation limit for destructive operations
  withValidation(undefined, NovelParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id } = params as { id: string }; // Type assertion after validation

    // Clear the novel structure using dedicated method
    await novelService.clearNovelStructure(id);

    return createSuccessResponse(
      {
        novelId: id,
        cleared: {
          acts: true,
          chapters: true,
          scenes: true,
          wordCount: true,
        },
      },
      "Novel structure cleared successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== ENHANCED FEATURES =====

1. STRUCTURE STATISTICS
   - Automatically calculates and returns counts
   - Provides useful summary information
   - Helps with UI display and validation

2. INTELLIGENT RATE LIMITING  
   - Standard rate limit for GET (frequent operation)
   - Creation rate limit for DELETE (destructive operation)
   - Prevents abuse of expensive operations

3. ENHANCED MESSAGING
   - Descriptive success messages with statistics
   - Request tracking for debugging
   - Consistent error handling

4. TYPE SAFETY
   - URL parameter validation
   - Proper error mapping
   - TypeScript-safe throughout

RESPONSE FORMAT:
{
  "success": true,
  "data": {
    "novel": { ... },
    "stats": {
      "acts": 3,
      "chapters": 12,
      "scenes": 45,
      "totalWords": 50000
    }
  },
  "message": "Novel structure retrieved successfully (3 acts, 12 chapters, 45 scenes)",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_...",
    "version": "1.0"
  }
}
*/
