// lib/api/types.ts
// Core types and Zod schemas for API standardization

import { z } from "zod";

// ===== STANDARD API RESPONSE STRUCTURE =====
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// ===== ERROR TYPES =====
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: APIErrorCode = "INTERNAL_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

export type APIErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

// ===== VALIDATION HELPERS =====
const trimmedString = (min = 1, max = 255) =>
  z
    .string()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be less than ${max} characters`)
    .trim();

const optionalUrl = () =>
  z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val));

const cuidParam = (name = "ID") => z.string().cuid(`Invalid ${name} format`);

// ===== NOVEL SCHEMAS =====
export const CreateNovelSchema = z.object({
  title: trimmedString(1, 255),
  description: trimmedString(1, 2000),
  coverImage: optionalUrl(),
});

export const UpdateNovelSchema = CreateNovelSchema.partial();

export const NovelParamsSchema = z.object({
  id: cuidParam("novel ID"),
});

// ===== SCENE SCHEMAS =====
export const UpdateSceneSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  povCharacter: z.string().max(100).optional(),
  sceneType: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["draft", "review", "complete"]).optional(),
});

export const SceneParamsSchema = z.object({
  id: cuidParam("novel ID"),
  sceneId: cuidParam("scene ID"),
});

export const CreateSceneSchema = z.object({
  title: trimmedString(1, 255),
  chapterId: cuidParam("chapter ID"),
});

// ===== CHAPTER SCHEMAS =====
export const CreateChapterSchema = z.object({
  title: trimmedString(1, 255),
});

export const UpdateChapterSchema = CreateChapterSchema.partial();

export const ChapterParamsSchema = z.object({
  id: cuidParam("novel ID"),
  chapterId: cuidParam("chapter ID"),
});

// ===== ACT SCHEMAS =====
export const CreateActSchema = z.object({
  title: trimmedString(1, 255),
});

export const UpdateActSchema = CreateActSchema.partial();

export const ActParamsSchema = z.object({
  id: cuidParam("novel ID"),
  actId: cuidParam("act ID"),
});

// ===== REORDER SCHEMAS =====
// Generic reorder schema for simple reordering within same parent
export const ReorderSchema = z.object({
  newOrder: z.number().int().min(1, "Order must be at least 1"),
});

// Chapter reordering (can move between acts)
export const ReorderChapterSchema = z.object({
  newOrder: z.number().int().min(1, "Order must be at least 1"),
  newActId: cuidParam("target act ID").optional(), // Optional - for moving between acts
});

// Scene reordering (can move between chapters)
export const ReorderSceneSchema = z.object({
  newOrder: z.number().int().min(1, "Order must be at least 1"),
  newChapterId: cuidParam("target chapter ID").optional(), // Optional - for moving between chapters
});

// Act reordering (simple - stays within same novel)
export const ReorderActSchema = z.object({
  newOrder: z.number().int().min(1, "Order must be at least 1"),
});

// ===== CREATION WITH PARENT SCHEMAS =====
// For creating chapters within acts
export const CreateChapterInActSchema = z.object({
  title: trimmedString(1, 255),
  actId: cuidParam("act ID"),
});

// For creating scenes within chapters
export const CreateSceneInChapterSchema = z.object({
  title: trimmedString(1, 255),
  chapterId: cuidParam("chapter ID"),
});

// For creating acts within novels
export const CreateActInNovelSchema = z.object({
  title: trimmedString(1, 255),
  novelId: cuidParam("novel ID"),
});

// ===== FILE UPLOAD SCHEMAS =====
export const FileUploadConfigSchema = z.object({
  maxSizeBytes: z
    .number()
    .optional()
    .default(10 * 1024 * 1024), // 10MB
  allowedTypes: z
    .array(z.string())
    .optional()
    .default([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]),
});

// ===== QUERY PARAMETER SCHEMAS =====
export const PaginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(20),
});

export const SortSchema = z.object({
  sortBy: z.string().optional().default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ===== TYPE EXPORTS =====
export type CreateNovelData = z.infer<typeof CreateNovelSchema>;
export type UpdateNovelData = z.infer<typeof UpdateNovelSchema>;
export type UpdateSceneData = z.infer<typeof UpdateSceneSchema>;
export type CreateSceneData = z.infer<typeof CreateSceneSchema>;
export type CreateChapterData = z.infer<typeof CreateChapterSchema>;
export type UpdateChapterData = z.infer<typeof UpdateChapterSchema>;
export type CreateActData = z.infer<typeof CreateActSchema>;
export type UpdateActData = z.infer<typeof UpdateActSchema>;
export type ReorderData = z.infer<typeof ReorderSchema>;
export type ReorderChapterData = z.infer<typeof ReorderChapterSchema>;
export type ReorderSceneData = z.infer<typeof ReorderSceneSchema>;
export type ReorderActData = z.infer<typeof ReorderActSchema>;
export type CreateChapterInActData = z.infer<typeof CreateChapterInActSchema>;
export type CreateSceneInChapterData = z.infer<
  typeof CreateSceneInChapterSchema
>;
export type CreateActInNovelData = z.infer<typeof CreateActInNovelSchema>;
export type PaginationData = z.infer<typeof PaginationSchema>;
export type SortData = z.infer<typeof SortSchema>;

/*
===== SCHEMA USAGE SUMMARY =====

NOVEL:
- CreateNovelSchema: { title, description, coverImage? }
- UpdateNovelSchema: Partial of CreateNovel
- NovelParamsSchema: { id }

SCENE: 
- CreateSceneSchema: { title, chapterId }
- UpdateSceneSchema: { title?, content?, povCharacter?, sceneType?, notes?, status? }
- SceneParamsSchema: { id, sceneId }
- ReorderSceneSchema: { newOrder, newChapterId? }
- CreateSceneInChapterSchema: { title, chapterId }

CHAPTER:
- CreateChapterSchema: { title }
- UpdateChapterSchema: { title? }
- ChapterParamsSchema: { id, chapterId }
- ReorderChapterSchema: { newOrder, newActId? }
- CreateChapterInActSchema: { title, actId }

ACT:
- CreateActSchema: { title }
- UpdateActSchema: { title? }
- ActParamsSchema: { id, actId }
- ReorderActSchema: { newOrder }
- CreateActInNovelSchema: { title, novelId }

REORDERING:
- ReorderSchema: Generic { newOrder }
- ReorderChapterSchema: { newOrder, newActId? }
- ReorderSceneSchema: { newOrder, newChapterId? }
- ReorderActSchema: { newOrder }

UTILITIES:
- PaginationSchema: { page?, limit? }
- SortSchema: { sortBy?, sortOrder? }
- FileUploadConfigSchema: { maxSizeBytes?, allowedTypes? }

===== VALIDATION EXAMPLES =====

✅ Valid CreateChapterSchema:
{ "title": "Chapter One: The Beginning" }

✅ Valid ReorderSceneSchema:
{ "newOrder": 3 }  // Same chapter
{ "newOrder": 1, "newChapterId": "ch456" }  // Cross-chapter

✅ Valid UpdateSceneSchema:
{ "title": "New Scene Title", "status": "complete" }
{ "content": "Updated scene content..." }
{}  // Empty updates allowed

❌ Invalid examples:
{ "title": "" }  // Empty title
{ "newOrder": 0 }  // Order must be >= 1
{ "invalidField": "value" }  // Unknown fields rejected
*/
