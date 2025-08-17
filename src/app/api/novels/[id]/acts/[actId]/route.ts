import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// DELETE /api/novels/[id]/acts/[actId]
export async function DELETE(
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

    // Delete the act
    await novelService.deleteAct(actId);

    return NextResponse.json({
      success: true,
      message: "Act deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting act:", error);
    return NextResponse.json(
      { error: "Failed to delete act" },
      { status: 500 }
    );
  }
}
