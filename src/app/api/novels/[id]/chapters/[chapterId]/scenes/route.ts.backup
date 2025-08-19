// src/app/api/novels/[id]/chapters/[chapterId]/scenes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// POST /api/novels/[id]/chapters/[chapterId]/scenes - Create new scene
export async function POST(
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

    // Get request body (optional positioning)
    const body = await request.json().catch(() => ({}));
    const { insertAfterSceneId } = body;

    // Create the new scene
    const newScene = await novelService.createScene(
      chapterId,
      insertAfterSceneId
    );

    return NextResponse.json({
      success: true,
      message: "Scene created successfully",
      scene: newScene,
    });
  } catch (error) {
    console.error("Error creating scene:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message === "Chapter not found") {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create scene" },
      { status: 500 }
    );
  }
}
