// src/app/api/novels/[id]/import/route.ts
// Document import with full middleware stack

import { NextRequest } from "next/server";
import {
  EnhancedDocxParser,
  StructureAnalyzer,
  ParsedStructure,
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
    warnings: Array<{
      type: string;
      severity: "error" | "warning";
      message: string;
      autoFixable: boolean;
      fixAction?: {
        type: string;
        description: string;
      };
    }>;
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

    // Analyze structure for issues
    console.log("🔍 Analyzing structure for issues...");
    const validation = StructureAnalyzer.analyzeStructure(parsedStructure);

    console.log("📋 Structure validation:", {
      isValid: validation.isValid,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
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

    // If document is valid and has no fixable issues, auto-import
    const hasFixableIssues = validation.warnings.some(
      (issue) => issue.autoFixable
    );

    if (validation.isValid && !hasFixableIssues) {
      console.log("✅ Document structure is perfect - auto-importing...");

      // Import directly to database
      const updatedNovel = await novelService.importStructure(novelId, {
        acts: parsedStructure.acts,
      });

      const responseData: ImportResponseData = {
        structure,
        validation,
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
      validation,
      parsedStructure, // Include for potential auto-fix
    };

    return createSuccessResponse(
      responseData,
      hasFixableIssues
        ? `Document parsed with ${validation.warnings.length} fixable issues`
        : "Document parsed successfully - ready for import",
      context.requestId
    );
  } catch (error) {
    console.error("❌ Document import failed:", error);
    handleServiceError(error);
  }
});
