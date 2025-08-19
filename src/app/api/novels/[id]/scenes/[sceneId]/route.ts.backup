// ==========================================
// FILE: src/app/api/novels/[id]/scenes/[sceneId]/route.ts (ENHANCED)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

interface RouteParams {
  params: Promise<{
    id: string;
    sceneId: string;
  }>;
}

// PUT /api/novels/[id]/scenes/[sceneId] - Update scene (ENHANCED)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: novelId, sceneId } = await params;
    const body = await request.json();

    // ✨ ENHANCED: Support updating scene metadata in addition to content
    const {
      content,
      title, // NEW: Scene title/name
      povCharacter, // POV character
      sceneType, // Scene type
      notes, // Scene notes
      status, // Scene status
    } = body;

    // Build update object with only provided fields
    const updates: {
      title?: string;
      povCharacter?: string | null;
      sceneType?: string;
      notes?: string;
      status?: string;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string") {
        return NextResponse.json(
          { error: "Title must be a string" },
          { status: 400 }
        );
      }
      if (title.length > 100) {
        return NextResponse.json(
          { error: "Title must be 100 characters or less" },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (povCharacter !== undefined) {
      updates.povCharacter = povCharacter?.trim() || null;
    }

    if (sceneType !== undefined) {
      updates.sceneType = sceneType?.trim() || "";
    }

    if (notes !== undefined) {
      updates.notes = notes?.trim() || "";
    }

    if (status !== undefined) {
      const validStatuses = ["draft", "review", "complete"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Status must be one of: draft, review, complete" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    let updatedScene;

    if (content !== undefined) {
      // Update content (and optionally metadata)
      updatedScene = await novelService.updateScene(
        sceneId,
        content,
        Object.keys(updates).length > 0 ? updates : undefined
      );
    } else if (Object.keys(updates).length > 0) {
      // Just updating metadata
      updatedScene = await novelService.updateSceneMetadata(sceneId, updates);
    } else {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
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

// DELETE /api/novels/[id]/scenes/[sceneId] - Delete scene (existing)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { sceneId } = await params;
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
