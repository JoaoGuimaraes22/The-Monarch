// src/app/api/novels/[id]/acts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// POST /api/novels/[id]/acts - Create new act
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params;

    // Verify novel exists
    const novel = await novelService.getNovelById(novelId);
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    // Get request body (optional positioning and title)
    const body = await request.json().catch(() => ({}));
    const { insertAfterActId, title } = body;

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title must be a non-empty string" },
          { status: 400 }
        );
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: "Title must be 200 characters or less" },
          { status: 400 }
        );
      }
    }

    // Create the new act
    const newAct = await novelService.createAct(
      novelId,
      insertAfterActId,
      title?.trim()
    );

    return NextResponse.json({
      success: true,
      message: "Act created successfully",
      act: newAct,
    });
  } catch (error) {
    console.error("Error creating act:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message === "Novel not found") {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create act" },
      { status: 500 }
    );
  }
}
