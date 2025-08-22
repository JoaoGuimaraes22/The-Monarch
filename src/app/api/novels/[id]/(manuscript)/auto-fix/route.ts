// src/app/api/novels/[id]/auto-fix/route.ts
// COMPLETE AUTO-FIX ROUTE: Standardized with proper middleware

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  EnhancedDocxParser,
  AutoFixService,
  StructureAnalyzer,
  ParsedStructure,
  StructureIssue,
} from "@/lib/doc-parse";
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

// ===== VALIDATION SCHEMAS =====
const AutoFixSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  fixAction: z.object({
    type: z.string(),
    description: z.string().optional(),
    parameters: z.record(z.string(), z.any()).optional(),
  }),
});

interface AutoFixResponseData {
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
  issuesDetected: number;
  fixedStructureData: ParsedStructure;
  fixApplied: string;
}

// ===== HELPER: Extract FormData fields =====
async function extractAutoFixData(formData: FormData) {
  const issueType = formData.get("issueType") as string;
  const fixActionJson = formData.get("fixAction") as string;

  if (!issueType) {
    throw new Error("Issue type is required");
  }

  if (!fixActionJson) {
    throw new Error("Fix action is required");
  }

  let fixAction;
  try {
    fixAction = JSON.parse(fixActionJson);
  } catch {
    throw new Error("Invalid fix action format");
  }

  // Validate the extracted data
  const validationResult = AutoFixSchema.safeParse({
    issueType,
    fixAction,
  });

  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  return { issueType, fixAction };
}

// ===== POST /api/novels/[id]/auto-fix - Apply auto-fix to document =====
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

    console.log(`🔧 Auto-fix request for novel: ${novelId}`);

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

    // Extract and validate auto-fix data from FormData
    const { issueType, fixAction } = await extractAutoFixData(
      context.formData!
    );

    console.log(`📄 File: ${file.name} (${file.size} bytes)`);
    console.log(`🔧 Fix requested: ${issueType} - ${fixAction.type}`);
    console.log(`🎯 Fix action details:`, fixAction);

    // Parse the document
    console.log("🔍 Parsing document structure...");
    const buffer = await file.arrayBuffer();
    const parsedStructure: ParsedStructure =
      await EnhancedDocxParser.parseFromBuffer(buffer);

    console.log("📊 Original structure:", {
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

    // Create the issue object for the fix
    const mockIssue: StructureIssue = {
      type: issueType,
      severity: "warning",
      message: `Applying fix: ${fixAction.description || fixAction.type}`,
      autoFixable: true,
      fixAction: fixAction,
    };

    console.log("🔧 Created issue for auto-fix:", mockIssue);

    // Apply the auto-fix
    console.log("🛠️ Applying auto-fix...");
    const fixResult = await AutoFixService.applyAutoFix(
      parsedStructure,
      mockIssue
    );

    if (!fixResult.success || !fixResult.fixedStructure) {
      console.error("❌ Auto-fix failed:", fixResult.error);
      throw new Error(fixResult.error || "Auto-fix failed");
    }

    console.log("✅ Auto-fix applied successfully");
    console.log("📝 Fix result message:", fixResult.message);

    // Log the fixed structure
    console.log("📊 Fixed structure:", {
      acts: fixResult.fixedStructure.acts.length,
      chapters: fixResult.fixedStructure.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      scenes: fixResult.fixedStructure.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount: fixResult.fixedStructure.wordCount,
    });

    // Re-validate the fixed structure
    console.log("🔍 Re-validating fixed structure...");
    const newValidation = StructureAnalyzer.validateStructure(
      fixResult.fixedStructure
    );

    console.log("📋 Validation results:", {
      isValid: newValidation.isValid,
      errors: newValidation.errors.length,
      warnings: newValidation.warnings.length,
    });

    if (newValidation.errors.length > 0) {
      console.log("❌ Validation errors:", newValidation.errors);
    }

    if (newValidation.warnings.length > 0) {
      console.log("⚠️ Validation warnings:");
      newValidation.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.type}: ${warning.message}`);
      });
    }

    // Prepare response data
    const responseData: AutoFixResponseData = {
      structure: {
        acts: fixResult.fixedStructure.acts.length,
        chapters: fixResult.fixedStructure.acts.reduce(
          (sum, act) => sum + act.chapters.length,
          0
        ),
        scenes: fixResult.fixedStructure.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ),
        wordCount: fixResult.fixedStructure.wordCount,
      },
      validation: {
        isValid: newValidation.isValid,
        errors: newValidation.errors,
        warnings: newValidation.warnings,
      },
      issuesDetected: newValidation.warnings.length,
      fixedStructureData: fixResult.fixedStructure,
      fixApplied: issueType,
    };

    console.log("🎉 Auto-fix process completed successfully!");

    return createSuccessResponse(
      responseData,
      `Auto-fix applied successfully: ${fixResult.message}`,
      context.requestId
    );
  } catch (error) {
    console.error("❌ Auto-fix failed:", error);
    handleServiceError(error);
  }
});

/*
===== COMPLETE AUTO-FIX ROUTE FEATURES =====

✅ STANDARDIZED: Uses new middleware composition system
✅ FILE UPLOAD: Proper file handling with middleware
✅ VALIDATION: Zod schema validation for fix data
✅ TYPE SAFE: Complete TypeScript coverage
✅ ERROR HANDLING: Comprehensive error handling and logging
✅ RATE LIMITED: Upload rate limiting protection
✅ RESPONSE FORMAT: New standardized API response format

===== MIDDLEWARE STACK =====
1. withFileUpload: Handles .docx file upload and validation
2. withRateLimit: Protects against abuse with upload limits
3. withValidation: Validates URL parameters (novel ID)

===== AUTO-FIX PROCESS =====
1. Extract and validate file and fix parameters
2. Parse document with EnhancedDocxParser
3. Create issue object for AutoFixService
4. Apply auto-fix using AutoFixService.applyAutoFix()
5. Re-validate the fixed structure
6. Return standardized response with fixed structure

===== RESPONSE FORMAT =====
{
  "success": true,
  "data": {
    "structure": { acts: 2, chapters: 8, scenes: 24, wordCount: 12000 },
    "validation": { isValid: true, errors: [], warnings: [] },
    "issuesDetected": 0,
    "fixedStructureData": { full ParsedStructure  },
    "fixApplied": "duplicate_chapter_numbers"
  },
  "message": "Auto-fix applied successfully: Sequential numbering applied",
  "meta": { "timestamp": "...", "requestId": "...", "version": "1.0" }
}

This route should resolve the 500 Internal Server Error and provide proper
auto-fix functionality with the new standardized API format.
*/
