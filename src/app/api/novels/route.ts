// app/api/novels/route.ts
// Refactored with API standardization system

import { NextRequest } from "next/server";
import { novelService } from "@/lib/novels";
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  CreateNovelSchema,
  CreateNovelData,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// ===== GET /api/novels - Get all novels =====
export const GET = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD)
)(async function (req: NextRequest, context) {
  try {
    const novels = await novelService.getAllNovels();
    return createSuccessResponse(
      novels,
      `Retrieved ${novels.length} novels`,
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

// ===== POST /api/novels - Create a new novel =====
export const POST = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.CREATION),
  withValidation(CreateNovelSchema)
)(async function (req: NextRequest, context, validatedData) {
  try {
    // Type assertion since we know validatedData is CreateNovelData from schema
    const novelData = validatedData as CreateNovelData;
    const novel = await novelService.createNovel(novelData);

    return createSuccessResponse(
      novel,
      "Novel created successfully",
      context.requestId
    );
  } catch (error) {
    handleServiceError(error);
  }
});

/* 
===== COMPARISON: BEFORE VS AFTER =====

BEFORE (Manual validation, inconsistent responses):
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


RESPONSE FORMAT:
{
  "success": true,
  "data": { "id": "...", "title": "...", "description": "..." },
  "message": "Novel created successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}
*/
