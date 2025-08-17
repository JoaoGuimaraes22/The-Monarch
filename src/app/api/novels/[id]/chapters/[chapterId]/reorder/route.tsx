// src/app/api/novels/[id]/chapters/[chapterId]/reorder/route.ts
// API endpoint for reordering chapters within acts

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// PUT /api/novels/[id]/chapters/[chapterId]/reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: novelId, chapterId } = await params;

    console.log("🔄 Chapter reorder request:", { novelId, chapterId });

    // Get the reorder data from request body
    const { newOrder } = await request.json();

    if (!newOrder || typeof newOrder !== "number") {
      return NextResponse.json(
        { error: "New order position is required and must be a number" },
        { status: 400 }
      );
    }

    console.log("📊 Reorder details:", { chapterId, newOrder });

    // Get current novel structure to validate
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Find the chapter to verify it exists
    let foundChapter = null;
    for (const act of novel.acts) {
      const chapter = act.chapters.find((c) => c.id === chapterId);
      if (chapter) {
        foundChapter = chapter;
        break;
      }
    }

    if (!foundChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    console.log("🎯 Moving chapter:", {
      title: foundChapter.title,
      from: foundChapter.order,
      to: newOrder,
    });

    // Perform the reordering
    const result = await novelService.reorderChapter(chapterId, newOrder);

    console.log("✅ Chapter reordered successfully");

    // Return the updated chapter
    return NextResponse.json({
      success: true,
      message: "Chapter reordered successfully",
      chapter: {
        id: result.id,
        title: result.title,
        order: result.order,
        // Note: actId is not exposed in the Chapter interface, so we don't return it
      },
    });
  } catch (error) {
    console.error("❌ Chapter reorder failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reorder chapter",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
