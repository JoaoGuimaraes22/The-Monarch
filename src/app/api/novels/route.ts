import { NextRequest, NextResponse } from "next/server";
import { novelService } from "@/lib/novels";

// GET /api/novels - Get all novels
export async function GET() {
  try {
    const novels = await novelService.getAllNovels();
    return NextResponse.json(novels);
  } catch (error) {
    console.error("Error fetching novels:", error);
    return NextResponse.json(
      { error: "Failed to fetch novels" },
      { status: 500 }
    );
  }
}

// POST /api/novels - Create a new novel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, coverImage } = body;

    // Basic validation
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const novel = await novelService.createNovel({
      title,
      description,
      coverImage,
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    console.error("Error creating novel:", error);
    return NextResponse.json(
      { error: "Failed to create novel" },
      { status: 500 }
    );
  }
}
