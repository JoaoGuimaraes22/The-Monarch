// src/app/api/novels/[id]/import-fixed/route.ts
// FIXED: Proper imports and explicit typing for all parameters

import { NextRequest } from "next/server";
import { z } from "zod"; // ✅ FIXED: Import zod directly
import { novelService } from "@/lib/novels";
import { ParsedAct, ParsedChapter } from "@/lib/doc-parse";
import {
  withRateLimit,
  withValidation,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  NovelParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// Define schema for import-fixed request with proper typing
const ImportFixedSchema = z.object({
  fixedStructure: z.object({
    acts: z
      .array(
        z.object({
          title: z.string(),
          order: z.number(),
          chapters: z.array(
            z.object({
              title: z.string(),
              order: z.number(),
              scenes: z.array(
                z.object({
                  title: z.string(),
                  content: z.string(),
                  order: z.number(),
                  wordCount: z.number(),
                  notes: z.string().optional(),
                  status: z.string().optional(),
                  povCharacter: z.string().optional(),
                  sceneType: z.string().optional(),
                })
              ),
            })
          ),
        })
      )
      .min(1, "At least one act is required"),
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

type ImportFixedData = z.infer<typeof ImportFixedSchema>;

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
    const { fixedStructure } = validatedData as ImportFixedData;

    console.log(`💾 Import fixed structure for novel: ${novelId}`);

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // ✅ FIXED: Explicitly type all reduce function parameters
    const structureStats = {
      acts: fixedStructure.acts.length,
      chapters: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct) => sum + act.chapters.length,
        0
      ),
      scenes: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct) =>
          sum +
          act.chapters.reduce(
            (chSum: number, chapter: ParsedChapter) =>
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

    // ✅ FIXED: Explicitly type all reduce function parameters for response calculation
    const responseData: ImportFixedResponseData = {
      structure: {
        acts: updatedNovel.acts.length,
        chapters: updatedNovel.acts.reduce(
          (total: number, act: { chapters: unknown[] }) =>
            total + act.chapters.length,
          0
        ),
        scenes: updatedNovel.acts.reduce(
          (total: number, act: { chapters: Array<{ scenes: unknown[] }> }) =>
            total +
            act.chapters.reduce(
              (chapterTotal: number, chapter: { scenes: unknown[] }) =>
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

✅ FIXED IMPORT: Added direct `import { z } from "zod"`
✅ FIXED TYPING: All reduce function parameters explicitly typed
✅ ADDED IMPORTS: Imported ParsedAct and ParsedChapter types
✅ PROPER STRUCTURE: Used correct types for all calculations

===== TYPE ANNOTATIONS =====

All reduce functions now have explicit types:
- (sum: number, act: ParsedAct) => ...
- (chSum: number, chapter: ParsedChapter) => ...
- (total: number, act: { chapters: unknown[] }) => ...

===== ZODE SCHEMA =====

Complete validation for the fixed structure:
- Acts array with all required properties
- Chapters array with nested scenes
- Optional metadata and word count
- Type-safe throughout the entire validation chain

===== NO MORE TYPESCRIPT ERRORS =====

All previous errors resolved:
- ✅ z import available
- ✅ sum parameter typed as number
- ✅ act parameter typed as ParsedAct
- ✅ chSum parameter typed as number
- ✅ chapter parameter typed as ParsedChapter
- ✅ No unused variables

===== RESPONSE STRUCTURE =====

{
  "success": true,
  "data": {
    "structure": { acts: 3, chapters: 12, scenes: 48, wordCount: 25000 },
    "novel": { id: "...", title: "...", description: "..." },
    "imported": true
  },
  "message": "Fixed structure imported successfully - 3 acts, 12 chapters, 48 scenes",
  "meta": { "timestamp": "...", "requestId": "...", "version": "1.0" }
}
*/
