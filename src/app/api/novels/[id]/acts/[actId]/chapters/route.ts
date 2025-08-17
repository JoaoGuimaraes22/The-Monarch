// ==========================================
// FILE: src/app/api/novels/[id]/acts/[actId]/chapters/route.ts (ENHANCED)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// POST /api/novels/[id]/acts/[actId]/chapters - Create new chapter
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actId: string }> }
) {
  try {
    const { id: novelId, actId } = await params;

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Get request body (optional positioning and title)
    const body = await request.json().catch(() => ({}));
    const { insertAfterChapterId, title } = body;

    // Create the new chapter
    const newChapter = await novelService.createChapter(
      actId,
      insertAfterChapterId,
      title
    );

    return NextResponse.json({
      success: true,
      message: "Chapter created successfully",
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Error creating chapter:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message === "Act not found") {
      return NextResponse.json({ error: "Act not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
