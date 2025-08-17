import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// GET /api/novels/[id]/structure - Get novel with full structure
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const novel = await novelService.getNovelWithStructure(id);

    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Error fetching novel structure:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel structure" },
      { status: 500 }
    );
  }
}

// DELETE /api/novels/[id]/structure - Delete entire manuscript structure
export async function DELETE(
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

    // Delete entire structure
    await novelService.deleteManuscriptStructure(novelId);

    return NextResponse.json({
      success: true,
      message: "Manuscript structure deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting manuscript structure:", error);
    return NextResponse.json(
      { error: "Failed to delete manuscript structure" },
      { status: 500 }
    );
  }
}
