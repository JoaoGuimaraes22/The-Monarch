// ==========================================
// FILE: src/app/api/novels/[id]/acts/[actId]/route.ts
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

interface RouteParams {
  params: Promise<{
    id: string;
    actId: string;
  }>;
}

// PUT /api/novels/[id]/acts/[actId] - Update act
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: novelId, actId } = await params;
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

    const updatedAct = await novelService.updateAct(actId, {
      title: title.trim(),
    });

    return NextResponse.json({
      success: true,
      act: updatedAct,
    });
  } catch (error) {
    console.error("Error updating act:", error);
    return NextResponse.json(
      { error: "Failed to update act" },
      { status: 500 }
    );
  }
}

// DELETE /api/novels/[id]/acts/[actId] - Delete act (existing)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { actId } = await params;
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
