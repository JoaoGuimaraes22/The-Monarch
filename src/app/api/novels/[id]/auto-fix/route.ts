// src/app/api/novels/[id]/auto-fix/route.ts
// Auto-fix with full middleware stack

import { NextRequest } from "next/server";
import {
  AutoFixService,
  StructureAnalyzer,
  ParsedStructure,
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
  z,
} from "@/lib/api";

// Define schema for auto-fix request
const AutoFixSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  fixAction: z.object({
    type: z.string().min(1, "Fix action type is required"),
    description: z.string().optional(),
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
  issuesDetected: number;
  fixedStructureData: ParsedStructure;
  fixApplied: string;
}

// ===== POST /api/novels/[id]/auto-fix - Apply auto-fix to document =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withFileUpload({
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required: true,
  }),
  withValidation(undefined, NovelParamsSchema) // Body validation handled manually due to FormData
)(async function (req: NextRequest, context) {
  try {
    const params = await context.params;
    const { id: novelId } = params as { id: string };
    const file = context.file!; // Guaranteed by withFileUpload
    const formData = context.formData!;

    console.log(`🔧 Auto-fix request for novel: ${novelId}`);

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      throw new Error("Novel not found");
    }

    // Extract and validate fix parameters
    const issueType = formData.get("issueType") as string;
    const fixActionJson = formData.get("fixAction") as string;

    if (!issueType || !fixActionJson) {
      throw new Error("Missing issue type or fix action");
    }

    let fixAction: { type: string; description?: string };
    try {
      fixAction = JSON.parse(fixActionJson);
    } catch {
      throw new Error("Invalid fix action format");
    }

    // Validate with schema
    const validationResult = AutoFixSchema.safeParse({
      issueType,
      fixAction,
    });

    if (!validationResult.success) {
      throw new Error(
        `Invalid request: ${validationResult.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log(`🎯 Applying fix: ${issueType} (${fixAction.type})`);

    // Parse the document
    const buffer = await file.arrayBuffer();
    const originalStructure: ParsedStructure =
      await EnhancedDocxParser.parseFromBuffer(buffer);

    // Create a properly typed structure issue for the auto-fix service
    const mockIssue = {
      type: issueType,
      severity: "warning" as const,
      message: `Auto-fixing ${issueType}`,
      autoFixable: true,
      fixAction,
    };

    // Apply the auto-fix
    const fixResult = await AutoFixService.applyAutoFix(
      originalStructure,
      mockIssue
    );

    if (!fixResult.success || !fixResult.fixedStructure) {
      throw new Error(fixResult.error || "Auto-fix failed");
    }

    // Analyze the fixed structure
    const newValidation = StructureAnalyzer.analyzeStructure(
      fixResult.fixedStructure
    );

    // Calculate structure statistics
    const structure = {
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
    };

    console.log("✅ Auto-fix applied successfully");

    const responseData: AutoFixResponseData = {
      structure,
      validation: {
        isValid: newValidation.isValid,
        errors: newValidation.errors,
        warnings: newValidation.warnings,
      },
      issuesDetected: newValidation.warnings.length,
      fixedStructureData: fixResult.fixedStructure,
      fixApplied: issueType,
    };

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
