// ==========================================
// FILE: src/app/api/novels/[id]/chapters/[chapterId]/route.ts
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

interface RouteParams {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

// PUT /api/novels/[id]/chapters/[chapterId] - Update chapter
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: novelId, chapterId } = await params;
    const body = await request.json();

    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    const updatedChapter = await novelService.updateChapter(chapterId, {
      title: title.trim(),
    });

    return NextResponse.json({
      success: true,
      chapter: updatedChapter,
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

// DELETE /api/novels/[id]/chapters/[chapterId] - Delete chapter (existing)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { chapterId } = await params;
    await novelService.deleteChapter(chapterId);

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
