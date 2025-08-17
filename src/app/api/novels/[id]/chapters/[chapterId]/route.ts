import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// DELETE /api/novels/[id]/chapters/[chapterId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: novelId, chapterId } = await params;

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Delete the chapter
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
