// src/app/api/novels/[id]/auto-fix/route.ts
// Server-side auto-fix endpoint

import { NextRequest, NextResponse } from "next/server";
import { AutoFixService, StructureAnalyzer } from "@/lib/doc-parse";

// POST /api/novels/[id]/auto-fix - Apply auto-fix to document structure
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params;

    console.log("🔧 Server-side auto-fix request for novel:", novelId);

    // Parse the request body to get fix details and file
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const issueType = formData.get("issueType") as string;
    const fixActionJson = formData.get("fixAction") as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!issueType || !fixActionJson) {
      return NextResponse.json(
        { error: "Missing issue type or fix action" },
        { status: 400 }
      );
    }

    let fixAction;
    try {
      fixAction = JSON.parse(fixActionJson);
    } catch {
      return NextResponse.json(
        { error: "Invalid fix action format" },
        { status: 400 }
      );
    }

    console.log("📄 File received:", file.name, file.size, "bytes");
    console.log("🔧 Fix requested:", issueType, fixAction.type);

    // Step 1: Parse the document on server-side (where mammoth works properly)
    console.log("📖 Parsing document structure...");
    const parsedStructure = await AutoFixService.parseFromBuffer(
      await file.arrayBuffer()
    );

    console.log("✅ Document parsed successfully:", {
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

    // Step 2: Create the issue object for the fix
    const mockIssue = {
      type: issueType,
      severity: "warning" as const,
      message: `Applying fix: ${fixAction.description}`,
      autoFixable: true,
      fixAction: fixAction,
    };

    // Step 3: Apply the auto-fix
    console.log("🔧 Applying auto-fix:", fixAction.type);
    const fixResult = await AutoFixService.applyAutoFix(
      parsedStructure,
      mockIssue
    );

    if (!fixResult.success || !fixResult.fixedStructure) {
      console.error("❌ Auto-fix failed:", fixResult.error);
      return NextResponse.json(
        {
          success: false,
          error: fixResult.error || "Auto-fix failed",
          message: fixResult.message,
        },
        { status: 400 }
      );
    }

    console.log("✅ Auto-fix applied successfully");

    // Step 4: Re-validate the fixed structure
    const newValidation = StructureAnalyzer.validateStructure(
      fixResult.fixedStructure
    );

    // Step 5: Return the fixed structure data (don't import to DB yet)
    return NextResponse.json({
      success: true,
      message: `Auto-fix applied successfully: ${fixResult.message}`,
      structure: {
        acts: fixResult.fixedStructure.acts.length,
        chapters: fixResult.fixedStructure.acts.reduce(
          (total, act) => total + act.chapters.length,
          0
        ),
        scenes: fixResult.fixedStructure.acts.reduce(
          (total, act) =>
            total +
            act.chapters.reduce(
              (chapterTotal, chapter) => chapterTotal + chapter.scenes.length,
              0
            ),
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
      fixedStructureData: fixResult.fixedStructure, // Include full structure for potential re-import
    });
  } catch (error) {
    console.error("❌ Server-side auto-fix error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply auto-fix",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
