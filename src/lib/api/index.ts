// lib/api/index.ts
// Updated barrel exports for the complete API standardization system

// ===== RE-EXPORT TYPES & SCHEMAS =====
export type {
  APIResponse,
  APIErrorCode,
  CreateNovelData,
  UpdateNovelData,
  UpdateSceneData,
  CreateSceneData,
  CreateChapterData,
  UpdateChapterData,
  CreateActData,
  UpdateActData,
  ReorderData,
  ReorderChapterData,
  ReorderSceneData,
  ReorderActData,
  CreateChapterInActData,
  CreateSceneInChapterData,
  CreateActInNovelData,
  PaginationData,
  SortData,
} from "./types";

export {
  APIError,
  // Novel schemas
  CreateNovelSchema,
  UpdateNovelSchema,
  NovelParamsSchema,
  // Scene schemas
  UpdateSceneSchema,
  SceneParamsSchema,
  CreateSceneSchema,
  ReorderSceneSchema,
  CreateSceneInChapterSchema,
  // Chapter schemas
  CreateChapterSchema,
  UpdateChapterSchema,
  ChapterParamsSchema,
  ReorderChapterSchema,
  CreateChapterInActSchema,
  // Act schemas
  CreateActSchema,
  UpdateActSchema,
  ActParamsSchema,
  ReorderActSchema,
  CreateActInNovelSchema,
  // Generic schemas
  ReorderSchema,
  FileUploadConfigSchema,
  PaginationSchema,
  SortSchema,
} from "./types";

// ===== RE-EXPORT MIDDLEWARE SYSTEM =====
export type {
  RouteHandler,
  RouteContext,
  RateLimitOptions,
  FileUploadOptions,
} from "./middleware";

export {
  withValidation,
  withRateLimit,
  withFileUpload,
  composeMiddleware,
  createSuccessResponse,
  createErrorResponse,
  withStandardValidation,
  withStandardRateLimit,
  withCreationRateLimit,
  withUploadRateLimit,
  withDocxUpload,
  standardAPI,
  creationAPI,
  uploadAPI,
  handleServiceError,
} from "./middleware";

// ===== RE-EXPORT RATE LIMITING =====
export {
  rateLimit,
  RATE_LIMIT_CONFIGS,
  createRateLimitKey,
} from "./rate-limit";

// ===== RE-EXPORT LOGGING =====
export { logger } from "./logger";

// ===== CONVENIENCE API OBJECT =====
// Import for internal use in the API object
import {
  withValidation,
  withRateLimit,
  withFileUpload,
  composeMiddleware,
  createSuccessResponse,
  createErrorResponse,
  standardAPI,
  creationAPI,
  uploadAPI,
  handleServiceError,
} from "./middleware";

import { RATE_LIMIT_CONFIGS } from "./rate-limit";

import { logger } from "./logger";

// Create convenience API object
export const API = {
  // Response helpers
  success: createSuccessResponse,
  error: createErrorResponse,

  // Common middleware combinations
  standard: standardAPI,
  creation: creationAPI,
  upload: uploadAPI,

  // Individual middleware
  validate: withValidation,
  rateLimit: withRateLimit,
  fileUpload: withFileUpload,
  compose: composeMiddleware,

  // Error handling
  handleError: handleServiceError,

  // Rate limit configs
  rateLimits: RATE_LIMIT_CONFIGS,

  // Logger
  log: logger,
} as const;

/*
===== COMPLETE API STANDARDIZATION SYSTEM =====

This barrel export provides a complete, standardized API system with:

✅ Type-safe validation schemas for all CRUD operations
✅ Consistent error handling with proper HTTP status codes
✅ Rate limiting protection against abuse
✅ Request tracking with unique IDs
✅ Professional logging system
✅ Composable middleware architecture
✅ Standard response format across all endpoints

===== AVAILABLE SCHEMAS =====

NOVEL OPERATIONS:
- CreateNovelSchema: Create new novels
- UpdateNovelSchema: Update existing novels
- NovelParamsSchema: Validate novel ID in URLs

SCENE OPERATIONS:
- CreateSceneSchema: Create scenes (generic)
- UpdateSceneSchema: Update scene content/metadata
- CreateSceneInChapterSchema: Create scenes within specific chapters
- ReorderSceneSchema: Reorder scenes within/between chapters
- SceneParamsSchema: Validate scene URLs

CHAPTER OPERATIONS:
- CreateChapterSchema: Create chapters (generic)
- UpdateChapterSchema: Update chapter properties
- CreateChapterInActSchema: Create chapters within specific acts
- ReorderChapterSchema: Reorder chapters within/between acts
- ChapterParamsSchema: Validate chapter URLs

ACT OPERATIONS:
- CreateActSchema: Create acts (generic)
- UpdateActSchema: Update act properties
- CreateActInNovelSchema: Create acts within specific novels
- ReorderActSchema: Reorder acts within novels
- ActParamsSchema: Validate act URLs

REORDERING:
- ReorderSchema: Generic reordering (simple)
- ReorderSceneSchema: Scene reordering with cross-chapter moves
- ReorderChapterSchema: Chapter reordering with cross-act moves
- ReorderActSchema: Act reordering within novels

UTILITIES:
- FileUploadConfigSchema: File upload validation
- PaginationSchema: Query pagination
- SortSchema: Query sorting

===== USAGE EXAMPLES =====

// Import everything you need
import {
  withValidation,
  withRateLimit,
  composeMiddleware,
  createSuccessResponse,
  handleServiceError,
  UpdateSceneSchema,
  SceneParamsSchema,
  RATE_LIMIT_CONFIGS,
} from "@/lib/api";

// Create standardized route
export const PUT = composeMiddleware(
  withRateLimit(RATE_LIMIT_CONFIGS.STANDARD),
  withValidation(UpdateSceneSchema, SceneParamsSchema)
)(async function (req, context, validatedData) {
  try {
    const result = await someService.update(validatedData);
    return createSuccessResponse(result, "Updated successfully", context.requestId);
  } catch (error) {
    handleServiceError(error);
  }
});

// Or use the convenience API object
import { API } from "@/lib/api";

export const GET = API.compose(
  API.rateLimit(API.rateLimits.STANDARD)
)(async function (req, context) {
  try {
    const data = await someService.getAll();
    return API.success(data, "Retrieved successfully", context.requestId);
  } catch (error) {
    API.handleError(error);
  }
});
*/
