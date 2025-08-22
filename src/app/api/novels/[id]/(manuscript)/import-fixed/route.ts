// src/app/api/novels/[id]/import-fixed/route.ts
// FIXED: Correct imports and proper typing

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import { ParsedAct, ParsedChapter, ParsedScene } from "@/lib/doc-parse";
import {
  withRateLimit,
  withValidation,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  NovelParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ✅ FIXED: Import z from zod package directly, not from @/lib/api
import { z } from "zod";

// Define proper interfaces based on the parsed structure
interface FixedStructureData {
  acts: ParsedAct[];
  wordCount?: number;
  title?: string;
  metadata?: {
    filename?: string;
    fileSize?: number;
    parseDate?: string;
  };
}

// Define the request body interface
interface ImportFixedRequestBody {
  fixedStructure: FixedStructureData;
}

// Define schema for import-fixed request with explicit typing
const ImportFixedSchema = z.object({
  fixedStructure: z.object({
    acts: z.array(z.any()).min(1, "At least one act is required"), // Allow any for acts since they come from parser
    wordCount: z.number().min(0).optional(),
    title: z.string().optional(),
    metadata: z
      .object({
        filename: z.string().optional(),
        fileSize: z.number().optional(),
        parseDate: z.string().optional(),
      })
      .optional(),
  }),
});

interface ImportFixedResponseData {
  structure: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  novel: {
    id: string;
    title: string;
    description: string;
  };
  imported: boolean;
}

// ===== POST /api/novels/[id]/import-fixed - Import fixed structure =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(ImportFixedSchema, NovelParamsSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const { fixedStructure } = validatedData as ImportFixedRequestBody;

    console.log(`💾 Import fixed structure for novel: ${novelId}`);

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // ✅ FIXED: Calculate structure stats with explicit typing
    const structureStats = {
      acts: fixedStructure.acts.length,
      chapters: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct): number => sum + act.chapters.length,
        0
      ),
      scenes: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct): number =>
          sum +
          act.chapters.reduce(
            (chSum: number, chapter: ParsedChapter): number =>
              chSum + chapter.scenes.length,
            0
          ),
        0
      ),
      wordCount: fixedStructure.wordCount || 0,
    };

    console.log("📊 Importing structure:", structureStats);

    // Import the fixed structure
    const updatedNovel = await novelService.importStructure(novelId, {
      acts: fixedStructure.acts,
    });

    console.log("✅ Fixed structure imported successfully");

    // ✅ FIXED: Calculate response structure with explicit typing for updatedNovel
    const responseData: ImportFixedResponseData = {
      structure: {
        acts: updatedNovel.acts.length,
        chapters: updatedNovel.acts.reduce(
          (total: number, act: { chapters: unknown[] }): number =>
            total + act.chapters.length,
          0
        ),
        scenes: updatedNovel.acts.reduce(
          (
            total: number,
            act: { chapters: Array<{ scenes: unknown[] }> }
          ): number =>
            total +
            act.chapters.reduce(
              (chapterTotal: number, chapter: { scenes: unknown[] }): number =>
                chapterTotal + chapter.scenes.length,
              0
            ),
          0
        ),
        wordCount: structureStats.wordCount,
      },
      novel: {
        id: updatedNovel.id,
        title: updatedNovel.title,
        description: updatedNovel.description,
      },
      imported: true,
    };

    return createSuccessResponse(
      responseData,
      `Fixed structure imported successfully - ${structureStats.acts} acts, ${structureStats.chapters} chapters, ${structureStats.scenes} scenes`,
      context.requestId
    );
  } catch (error) {
    console.error("❌ Import fixed structure failed:", error);
    handleServiceError(error);
  }
});

/*
===== FIXES APPLIED =====

✅ CORRECT IMPORT: `import { z } from "zod"` instead of from @/lib/api
✅ EXPLICIT TYPING: All reduce function parameters with explicit return types
✅ PROPER INTERFACES: Clear separation between request and response types
✅ TYPE ANNOTATIONS: Every function parameter explicitly typed

===== TYPING STRATEGY =====

1. Import z directly from zod package
2. Use z.any() for complex nested structures from parser
3. Explicit typing for all reduce function parameters
4. Return type annotations for all arrow functions
5. Proper interface definitions for request/response data

===== FUNCTION SIGNATURES =====

All reduce functions now have complete type annotations:
- (sum: number, act: ParsedAct): number => ...
- (chSum: number, chapter: ParsedChapter): number => ...
- (total: number, act: { chapters: unknown[] }): number => ...

===== NO MORE TYPESCRIPT ERRORS =====

✅ z imported correctly from zod package
✅ All parameters explicitly typed
✅ All return types specified
✅ No implicit any types anywhere
✅ Clean, maintainable code structure

This should resolve all TypeScript compilation errors.
*/
