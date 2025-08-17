// src/app/api/novels/[id]/scenes/[sceneId]/reorder/route.ts
// API endpoint for reordering scenes within chapters

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// PUT /api/novels/[id]/scenes/[sceneId]/reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id: novelId, sceneId } = await params;

    console.log("🔄 Scene reorder request:", { novelId, sceneId });

    // Get the reorder data from request body
    const { newChapterId, newOrder } = await request.json();

    if (!newOrder || typeof newOrder !== "number") {
      return NextResponse.json(
        { error: "New order position is required and must be a number" },
        { status: 400 }
      );
    }

    console.log("📊 Reorder details:", {
      sceneId,
      newChapterId: newChapterId || "same chapter",
      newOrder,
    });

    // Get current novel structure
    const novel = await novelService.getNovelWithStructure(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Find the scene to move
    let sourceScene = null;
    let sourceChapter = null;

    for (const act of novel.acts) {
      for (const chapter of act.chapters) {
        const scene = chapter.scenes.find((s) => s.id === sceneId);
        if (scene) {
          sourceScene = scene;
          sourceChapter = chapter;
          break;
        }
      }
      if (sourceScene) break;
    }

    if (!sourceScene || !sourceChapter) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    // Determine target chapter (same chapter if not specified)
    const targetChapterId = newChapterId || sourceChapter.id;
    let targetChapter = sourceChapter;

    if (newChapterId && newChapterId !== sourceChapter.id) {
      // Moving to different chapter
      for (const act of novel.acts) {
        const chapter = act.chapters.find((c) => c.id === newChapterId);
        if (chapter) {
          targetChapter = chapter;
          break;
        }
      }

      if (!targetChapter || targetChapter.id === sourceChapter.id) {
        return NextResponse.json(
          { error: "Target chapter not found" },
          { status: 404 }
        );
      }
    }

    console.log("🎯 Moving scene:", {
      from: `${sourceChapter.title} (order ${sourceScene.order})`,
      to: `${targetChapter.title} (order ${newOrder})`,
      crossChapter: newChapterId ? true : false,
    });

    // Perform the reordering using Prisma transactions
    const result = await novelService.reorderScene(
      sceneId,
      targetChapterId,
      newOrder
    );

    console.log("✅ Scene reordered successfully");

    // Return the updated structure
    return NextResponse.json({
      success: true,
      message: "Scene reordered successfully",
      scene: {
        id: result.id,
        title: result.title,
        order: result.order,
        // Note: chapterId is not exposed in the Scene interface, so we don't return it
      },
    });
  } catch (error) {
    console.error("❌ Scene reorder failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reorder scene",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
