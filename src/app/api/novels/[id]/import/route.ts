import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";
import { DocxParser } from "@/lib/docx-parser";

// POST /api/novels/[id]/import - Import .docx file into novel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params;

    // Check if novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("File received:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".docx")) {
      return NextResponse.json(
        { error: "Only .docx files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    console.log("Starting document parsing...");

    // Parse the document structure
    const parsedStructure = await DocxParser.parseDocx(file);

    console.log("Parsing completed:", {
      acts: parsedStructure.acts.length,
      totalChapters: parsedStructure.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      totalScenes: parsedStructure.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount: parsedStructure.wordCount,
    });

    // Validate the parsed structure
    const validation = DocxParser.validateStructure(parsedStructure);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid document structure",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Import the structure into the database
    const updatedNovel = await novelService.importStructure(novelId, {
      acts: parsedStructure.acts,
    });

    return NextResponse.json({
      success: true,
      message: "Document imported successfully",
      structure: {
        acts: updatedNovel.acts.length,
        chapters: updatedNovel.acts.reduce(
          (total, act) => total + act.chapters.length,
          0
        ),
        scenes: updatedNovel.acts.reduce(
          (total, act) =>
            total +
            act.chapters.reduce(
              (chapterTotal, chapter) => chapterTotal + chapter.scenes.length,
              0
            ),
          0
        ),
        wordCount: parsedStructure.wordCount,
      },
    });
  } catch (error) {
    console.error("Error importing document:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Failed to parse document")) {
        return NextResponse.json(
          {
            error:
              "Could not parse the document. Please ensure it's a valid .docx file.",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Failed to import")) {
        return NextResponse.json(
          { error: "Failed to save the document structure. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to import document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
