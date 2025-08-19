// src/app/api/novels/[id]/import/route.ts
// COMPLETE FIX: Corrected middleware order and context handling

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

// ✅ CORRECTED: Put file upload middleware FIRST to ensure file is processed
// before other middleware tries to access the context
export const POST = composeMiddleware(
  withFileUpload({
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required: true,
  }),
  withRateLimit(RATE_LIMIT_CONFIGS.UPLOAD),
  withValidation(undefined, NovelParamsSchema)
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };

    console.log(`📄 Document import request for novel: ${novelId}`);

    // ✅ ENHANCED DEBUG: More detailed context logging
    console.log("🔍 Context debug:", {
      hasFile: !!context.file,
      hasFormData: !!context.formData,
      requestId: context.requestId,
      contextKeys: Object.keys(context),
      fileInfo: context.file
        ? {
            name: context.file.name,
            size: context.file.size,
            type: context.file.type,
          }
        : null,
    });

    // ✅ ENHANCED: Better error handling with fallback to FormData
    let file = context.file;

    if (!file && context.formData) {
      console.log("⚠️ File not in context, trying FormData fallback...");
      file = context.formData.get("file") as File;
    }

    if (!file) {
      console.error("❌ No file found in context or FormData");
      throw new Error("File upload failed - no file received");
    }

    // ✅ SAFE file property access
    const fileName = file.name || "unknown";
    const fileSize = file.size || 0;
    const fileType = file.type || "unknown";

    console.log(`📁 File: ${fileName} (${fileSize} bytes, type: ${fileType})`);

    // Additional file validation
    if (fileSize === 0) {
      throw new Error("File is empty");
    }

    if (!fileName.endsWith(".docx")) {
      throw new Error("Invalid file type - only .docx files are supported");
    }

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
    const validation = StructureAnalyzer.validateStructure(parsedStructure);

    // ✅ ENHANCED: Combine validation warnings with any issues from parsed structure
    const allIssues: StructureIssue[] = [
      ...validation.warnings,
      ...(parsedStructure.issues || []),
    ];

    // Remove duplicates based on issue type
    const uniqueIssues = allIssues.filter(
      (issue, index, array) =>
        array.findIndex((i) => i.type === issue.type) === index
    );

    const finalValidation = {
      ...validation,
      warnings: uniqueIssues,
    };

    console.log("✅ Structure validation:", {
      isValid: finalValidation.isValid,
      errorCount: finalValidation.errors.length,
      warningCount: finalValidation.warnings.length,
    });

    // Prepare response data
    const responseData: ImportResponseData = {
      structure: {
        acts: parsedStructure.acts.length,
        chapters: parsedStructure.acts.reduce(
          (sum, act) => sum + act.chapters.length,
          0
        ),
        scenes: parsedStructure.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ),
        wordCount: parsedStructure.wordCount,
      },
      validation: {
        isValid: finalValidation.isValid,
        errors: finalValidation.errors,
        warnings: finalValidation.warnings,
      },
      novel: {
        id: novel.id,
        title: novel.title,
        description: novel.description,
      },
    };

    // ✅ ENHANCED: Auto-import logic for perfect documents
    if (finalValidation.isValid && finalValidation.errors.length === 0) {
      console.log("🚀 Document is perfect - performing auto-import...");

      try {
        // Clear existing structure first
        await novelService.clearNovelStructure(novelId);

        // Import the parsed structure
        const importStats = await novelService.importStructure(
          novelId,
          parsedStructure
        );

        console.log("✅ Auto-import successful:", importStats);

        responseData.autoImported = true;
        responseData.novel = {
          id: novel.id,
          title: novel.title,
          description: novel.description,
        };

        return createSuccessResponse(
          responseData,
          "Document imported successfully! Your manuscript is ready for editing.",
          context.requestId
        );
      } catch (importError) {
        console.error("❌ Auto-import failed:", importError);

        // Fall back to returning structure for manual import
        responseData.parsedStructure = parsedStructure;

        return createSuccessResponse(
          responseData,
          "Document parsed successfully, but auto-import failed. You can manually import or use auto-fix.",
          context.requestId
        );
      }
    } else {
      console.log("⚠️ Document has issues - providing structure for fixes");

      // Include parsed structure for auto-fix functionality
      responseData.parsedStructure = parsedStructure;

      // Check if there are auto-fixable issues
      const hasAutoFixableIssues = finalValidation.warnings.some(
        (issue: StructureIssue) => issue.autoFixable
      );

      return createSuccessResponse(
        responseData,
        hasAutoFixableIssues
          ? "Document has fixable structural issues. Use auto-fix to resolve them."
          : finalValidation.errors.length > 0
          ? "Document has structural issues that need to be fixed before import."
          : `Document parsed with ${finalValidation.warnings.length} fixable issues`,
        context.requestId
      );
    }
  } catch (error) {
    console.error("❌ Document import failed:", error);
    handleServiceError(error);
  }
});

/*
===== COMPREHENSIVE FIXES APPLIED =====

✅ FIXED: Middleware composition order
   - withFileUpload() FIRST to process the file
   - withRateLimit() SECOND for protection
   - withValidation() LAST to validate parameters

✅ FIXED: Context handling
   - Enhanced debugging with detailed context logging
   - Fallback to FormData if context.file is not available
   - Safe property access with proper error handling

✅ ENHANCED: File validation
   - Check for file existence in multiple ways
   - Validate file size and type
   - Proper error messages for all validation failures

✅ IMPROVED: Structure analysis
   - Combine validation warnings with parsed structure issues
   - Remove duplicate issues by type
   - Enhanced auto-import logic with better error handling

✅ STANDARDIZED: Response format
   - Uses new standardized API response format
   - Proper error handling with handleServiceError()
   - Consistent success responses with createSuccessResponse()

✅ ENHANCED: Auto-import workflow
   - Checks for perfect documents and auto-imports
   - Falls back gracefully if auto-import fails
   - Provides parsed structure for auto-fix functionality

✅ IMPROVED: Error handling
   - Comprehensive try-catch with detailed logging
   - Proper error propagation through handleServiceError()
   - User-friendly error messages

This route now properly handles the file upload middleware chain and should
resolve the "Cannot read properties of undefined (reading 'name')" error.
*/
