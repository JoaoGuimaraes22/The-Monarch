// src/app/api/novels/[id]/import/route.ts
// FIXED: Correct method names and proper typing

import { NextRequest } from "next/server";
import {
  EnhancedDocxParser,
  StructureAnalyzer,
  ParsedStructure,
  StructureIssue,
} from "@/lib/doc-parse";
import { novelService } from "@/lib/novels";
import {
  withRateLimit,
  withFileUpload,
  withValidation,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  NovelParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

interface ImportResponseData {
  structure: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: StructureIssue[];
  };
  novel?: {
    id: string;
    title: string;
    description: string;
  };
  autoImported?: boolean;
  parsedStructure?: ParsedStructure;
}

// ===== POST /api/novels/[id]/import - Import document =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.UPLOAD),
  withFileUpload({
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required: true,
  }),
  withValidation(undefined, NovelParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const file = context.file!; // Guaranteed by withFileUpload

    console.log(`📄 Document import request for novel: ${novelId}`);
    console.log(`📁 File: ${file.name} (${file.size} bytes)`);

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Parse the document
    console.log("🔍 Parsing document structure...");
    const buffer = await file.arrayBuffer();
    const parsedStructure: ParsedStructure =
      await EnhancedDocxParser.parseFromBuffer(buffer);

    console.log("📊 Parsed structure:", {
      acts: parsedStructure.acts.length,
      chapters: parsedStructure.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      scenes: parsedStructure.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount: parsedStructure.wordCount,
    });

    // ✅ FIXED: Use correct method name and handle the structure
    console.log("🔍 Analyzing structure for issues...");
    const validation = StructureAnalyzer.validateStructure(parsedStructure);

    // Get additional issues from the parsed structure (if any)
    const additionalIssues = parsedStructure.issues || [];
    const allWarnings = [...validation.warnings, ...additionalIssues];

    // Create final validation object with proper typing
    const finalValidation = {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: allWarnings,
    };

    console.log("📋 Structure validation:", {
      isValid: finalValidation.isValid,
      errors: finalValidation.errors.length,
      warnings: finalValidation.warnings.length,
    });

    // Calculate structure statistics
    const structure = {
      acts: parsedStructure.acts.length,
      chapters: parsedStructure.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      scenes: parsedStructure.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount: parsedStructure.wordCount,
    };

    // ✅ FIXED: Check for fixable issues with proper typing
    const hasFixableIssues = finalValidation.warnings.some(
      (issue: StructureIssue) => issue.autoFixable
    );

    if (finalValidation.isValid && !hasFixableIssues) {
      console.log("✅ Document structure is perfect - auto-importing...");

      // Import directly to database
      const updatedNovel = await novelService.importStructure(novelId, {
        acts: parsedStructure.acts,
      });

      const responseData: ImportResponseData = {
        structure,
        validation: finalValidation,
        novel: {
          id: updatedNovel.id,
          title: updatedNovel.title,
          description: updatedNovel.description,
        },
        autoImported: true,
      };

      return createSuccessResponse(
        responseData,
        `Document imported successfully - ${structure.acts} acts, ${structure.chapters} chapters, ${structure.scenes} scenes`,
        context.requestId
      );
    }

    // Return structure for review (with potential issues)
    const responseData: ImportResponseData = {
      structure,
      validation: finalValidation,
      parsedStructure, // Include for potential auto-fix
    };

    return createSuccessResponse(
      responseData,
      hasFixableIssues
        ? `Document parsed with ${finalValidation.warnings.length} fixable issues`
        : "Document parsed successfully - ready for import",
      context.requestId
    );
  } catch (error) {
    console.error("❌ Document import failed:", error);
    handleServiceError(error);
  }
});

/*
===== FIXES APPLIED =====

✅ FIXED METHOD NAME: 
   - Changed `StructureAnalyzer.analyzeStructure()` 
   - To `StructureAnalyzer.validateStructure()`

✅ FIXED TYPE ISSUES:
   - Added proper import for `StructureIssue` type
   - Typed the `issue` parameter in the `.some()` callback
   - Combined validation warnings with parsed structure issues

✅ ENHANCED VALIDATION:
   - Merge validation warnings with any issues from parsed structure
   - Properly handle both validation errors and structural issues
   - Maintain type safety throughout the validation process

===== STRUCTURE ANALYSIS FLOW =====

1. Parse document with EnhancedDocxParser.parseFromBuffer()
2. Get basic validation with StructureAnalyzer.validateStructure()
3. Combine with any additional issues from parsedStructure.issues
4. Check for auto-fixable issues with proper typing
5. Auto-import if perfect, or return for user review

===== RESPONSE DATA =====

The response now includes:
- structure: Statistics (acts, chapters, scenes, word count)
- validation: Combined validation results with proper typing
- autoImported: Boolean flag for perfect documents
- parsedStructure: Full structure for potential auto-fix operations
*/
