// src/app/api/novels/[id]/auto-fix/route.ts
// Server-side auto-fix endpoint with enhanced debugging

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
    console.log("🎯 Fix action details:", fixAction);

    // Step 1: Parse the document on server-side (where mammoth works properly)
    console.log("📖 Parsing document structure...");
    const parsedStructure = await AutoFixService.parseFromBuffer(
      await file.arrayBuffer()
    );

    // Log the ORIGINAL structure in detail
    console.log("\n📊 ORIGINAL STRUCTURE PARSED:");
    console.log(
      `Acts: ${parsedStructure.acts.length}, Total Word Count: ${parsedStructure.wordCount}`
    );

    parsedStructure.acts.forEach((act, actIndex) => {
      console.log(
        `\n  🎭 Act ${actIndex + 1}: "${act.title}" (order: ${act.order})`
      );
      console.log(`     Chapters in this act: ${act.chapters.length}`);

      act.chapters.forEach((chapter, chapterIndex) => {
        console.log(
          `       📖 Chapter ${chapterIndex + 1}: order=${
            chapter.order
          }, title="${chapter.title}"`
        );
        console.log(`          Scenes: ${chapter.scenes.length}`);

        // Show first few scenes for context
        chapter.scenes.slice(0, 2).forEach((scene, sceneIndex) => {
          const preview = scene.content
            .replace(/<[^>]*>/g, "")
            .trim()
            .substring(0, 50);
          console.log(
            `            📝 Scene ${sceneIndex + 1}: order=${
              scene.order
            }, words=${scene.wordCount}, preview="${preview}..."`
          );
        });

        if (chapter.scenes.length > 2) {
          console.log(
            `            ... and ${chapter.scenes.length - 2} more scenes`
          );
        }
      });
    });

    console.log("\n" + "=".repeat(60));

    // Step 2: Create the issue object for the fix
    const mockIssue = {
      type: issueType,
      severity: "warning" as const,
      message: `Applying fix: ${fixAction.description}`,
      autoFixable: true,
      fixAction: fixAction,
    };

    console.log("🔧 Created mock issue:", mockIssue);

    // Step 3: Apply the auto-fix
    console.log("\n🛠️  APPLYING AUTO-FIX:", fixAction.type);
    console.log("📋 Fix description:", fixAction.description);

    const fixResult = await AutoFixService.applyAutoFix(
      parsedStructure,
      mockIssue
    );

    if (!fixResult.success || !fixResult.fixedStructure) {
      console.error("❌ Auto-fix failed:", fixResult.error);
      console.error("❌ Fix result:", fixResult);
      return NextResponse.json(
        {
          success: false,
          error: fixResult.error || "Auto-fix failed",
          message: fixResult.message,
        },
        { status: 400 }
      );
    }

    // Log the FIXED structure in detail
    console.log("\n📊 FIXED STRUCTURE:");
    console.log(
      `Acts: ${fixResult.fixedStructure.acts.length}, Total Word Count: ${fixResult.fixedStructure.wordCount}`
    );

    fixResult.fixedStructure.acts.forEach((act, actIndex) => {
      console.log(
        `\n  🎭 Act ${actIndex + 1}: "${act.title}" (order: ${act.order})`
      );
      console.log(`     Chapters in this act: ${act.chapters.length}`);

      act.chapters.forEach((chapter, chapterIndex) => {
        console.log(
          `       📖 Chapter ${chapterIndex + 1}: order=${
            chapter.order
          }, title="${chapter.title}"`
        );
        console.log(`          Scenes: ${chapter.scenes.length}`);

        // Show first few scenes for context
        chapter.scenes.slice(0, 2).forEach((scene, sceneIndex) => {
          const preview = scene.content
            .replace(/<[^>]*>/g, "")
            .trim()
            .substring(0, 50);
          console.log(
            `            📝 Scene ${sceneIndex + 1}: order=${
              scene.order
            }, words=${scene.wordCount}, preview="${preview}..."`
          );
        });

        if (chapter.scenes.length > 2) {
          console.log(
            `            ... and ${chapter.scenes.length - 2} more scenes`
          );
        }
      });
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Auto-fix applied successfully");
    console.log("📝 Fix result message:", fixResult.message);

    // Step 4: Re-validate the fixed structure
    console.log("\n🔍 Re-validating fixed structure...");
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
      console.log("⚠️  Validation warnings:");
      newValidation.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.type}: ${warning.message}`);
      });
    }

    // Step 5: Prepare response data
    const responseStructure = {
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
    };

    console.log("\n📤 Response structure summary:", responseStructure);
    console.log("🎉 Auto-fix process completed successfully!");

    // Step 6: Return the fixed structure data
    return NextResponse.json({
      success: true,
      message: `Auto-fix applied successfully: ${fixResult.message}`,
      structure: responseStructure,
      validation: {
        isValid: newValidation.isValid,
        errors: newValidation.errors,
        warnings: newValidation.warnings,
      },
      issuesDetected: newValidation.warnings.length,
      fixedStructureData: fixResult.fixedStructure, // Include full structure for potential re-import
    });
  } catch (error) {
    console.error("\n❌ SERVER-SIDE AUTO-FIX ERROR:");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

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
