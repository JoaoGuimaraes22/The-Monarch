// app/api/novels/[id]/chapters/[chapterId]/reorder/route.ts
// FIXED: Modernized to use standardized API system and parameter objects

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  ReorderChapterSchema,
  ReorderChapterData,
  ChapterParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== PUT /api/novels/[id]/chapters/[chapterId]/reorder - Reorder a chapter =====
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(ReorderChapterSchema, ChapterParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId, chapterId } = params as {
      id: string;
      chapterId: string;
    };
    const reorderData = validatedData as ReorderChapterData;

    // Verify the novel exists
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Find the chapter to verify it exists
    let foundChapter = null;
    for (const act of novel.acts) {
      const chapter = act.chapters.find((c) => c.id === chapterId);
      if (chapter) {
        foundChapter = chapter;
        break;
      }
    }

    if (!foundChapter) {
      throw new Error("Chapter not found");
    }

    // If moving to a different act, verify the target act exists
    if (reorderData.newActId) {
      const targetAct = novel.acts.find(
        (act) => act.id === reorderData.newActId
      );
      if (!targetAct) {
        throw new Error("Target act not found");
      }
    }

    // ✅ FIXED: Use modern service method with parameter object
    const result = await novelService.reorderChapter({
      chapterId,
      newOrder: reorderData.newOrder,
      targetActId: reorderData.newActId, // Optional for cross-act moves
    });

    return createSuccessResponse(
      result,
      reorderData.newActId
        ? "Chapter moved to new act successfully"
        : "Chapter reordered successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/*
===== CHANGES MADE =====

✅ MODERNIZED: Full API standardization with middleware composition
✅ FIXED: reorderChapter() now uses parameter object:
   OLD: reorderChapter(chapterId, newOrder)
   NEW: reorderChapter({ chapterId, newOrder, targetActId })

✅ ADDED: Proper Zod validation with ReorderChapterSchema
✅ ADDED: Cross-act move support with targetActId validation
✅ ADDED: Rate limiting protection
✅ ADDED: Request tracking with unique IDs
✅ ADDED: Consistent error handling with handleServiceError
✅ ADDED: Standard API response format

===== BEFORE vs AFTER =====

❌ BEFORE:
- Manual validation: if (!newOrder || typeof newOrder !== "number")
- Limited functionality: Same-act reordering only
- Basic response: { success: true, message: "...", chapter: {...} }
- No rate limiting or request tracking

✅ AFTER:
- Zod schema validation: ReorderChapterSchema
- Enhanced functionality: Cross-act moves supported
- Standard response format: createSuccessResponse()
- Professional middleware stack

===== API SCHEMA =====
ReorderChapterSchema validates:
{
  "newOrder": number (required, >= 1),
  "newActId": string (optional, for cross-act moves)
}

===== RESPONSE FORMAT =====
{
  "success": true,
  "data": { /* updated chapter with full structure 
  "message": "Chapter reordered successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}
*/
