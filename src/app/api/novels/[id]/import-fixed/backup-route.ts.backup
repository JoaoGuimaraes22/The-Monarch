// src/app/api/novels/[id]/import-fixed/route.ts
// Import fixed structure to database

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";
import { ParsedAct, ParsedChapter } from "@/lib/doc-parse";

// POST /api/novels/[id]/import-fixed - Import fixed structure to database
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params;

    console.log("💾 Import fixed structure request for novel:", novelId);

    // Check if novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Get the fixed structure from request body
    const { fixedStructure } = await request.json();

    if (!fixedStructure || !fixedStructure.acts) {
      return NextResponse.json(
        { error: "No fixed structure data provided" },
        { status: 400 }
      );
    }

    console.log("📊 Fixed structure to import:", {
      acts: fixedStructure.acts.length,
      chapters: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct) => sum + act.chapters.length,
        0
      ),
      scenes: fixedStructure.acts.reduce(
        (sum: number, act: ParsedAct) =>
          sum +
          act.chapters.reduce(
            (chSum: number, ch: ParsedChapter) => chSum + ch.scenes.length,
            0
          ),
        0
      ),
      wordCount: fixedStructure.wordCount,
    });

    // Import the fixed structure into the database
    console.log("🗄️ Importing to database...");
    const updatedNovel = await novelService.importStructure(novelId, {
      acts: fixedStructure.acts,
    });

    console.log("✅ Fixed structure imported to database successfully");

    // Return success with updated novel data
    return NextResponse.json({
      success: true,
      message: "Fixed structure imported successfully",
      structure: {
        acts: updatedNovel.acts.length,
        chapters: updatedNovel.acts.reduce(
          (total: number, act) => total + act.chapters.length,
          0
        ),
        scenes: updatedNovel.acts.reduce(
          (total: number, act) =>
            total +
            act.chapters.reduce(
              (chapterTotal: number, chapter) =>
                chapterTotal + chapter.scenes.length,
              0
            ),
          0
        ),
        wordCount: fixedStructure.wordCount,
      },
      novel: {
        id: updatedNovel.id,
        title: updatedNovel.title,
        description: updatedNovel.description,
      },
    });
  } catch (error) {
    console.error("❌ Failed to import fixed structure:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to import fixed structure",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
