import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// PUT /api/novels/[id]/scenes/[sceneId] - Update scene content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id: novelId, sceneId } = await params;

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Get request body
    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 }
      );
    }

    // Update the scene content
    const updatedScene = await novelService.updateScene(sceneId, content);

    return NextResponse.json({
      success: true,
      message: "Scene updated successfully",
      scene: updatedScene,
    });
  } catch (error) {
    console.error("Error updating scene:", error);
    return NextResponse.json(
      { error: "Failed to update scene" },
      { status: 500 }
    );
  }
}

// DELETE /api/novels/[id]/scenes/[sceneId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id: novelId, sceneId } = await params;

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Delete the scene
    await novelService.deleteScene(sceneId);

    return NextResponse.json({
      success: true,
      message: "Scene deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scene:", error);
    return NextResponse.json(
      { error: "Failed to delete scene" },
      { status: 500 }
    );
  }
}
