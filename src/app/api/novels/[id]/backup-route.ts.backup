import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// GET /api/novels/[id] - Get a specific novel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const novel = await novelService.getNovelById(id);

    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Error fetching novel:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel" },
      { status: 500 }
    );
  }
}

// PUT /api/novels/[id] - Update a novel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, coverImage } = body;

    const novel = await novelService.updateNovel(id, {
      title,
      description,
      coverImage,
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Error updating novel:", error);
    return NextResponse.json(
      { error: "Failed to update novel" },
      { status: 500 }
    );
  }
}

// DELETE /api/novels/[id] - Delete a novel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await novelService.deleteNovel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting novel:", error);
    return NextResponse.json(
      { error: "Failed to delete novel" },
      { status: 500 }
    );
  }
}
