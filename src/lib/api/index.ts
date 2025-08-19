// lib/api/index.ts
// Barrel exports for the API standardization system

// ===== CORE TYPES & SCHEMAS =====
export type {
  APIResponse,
  APIErrorCode,
  CreateNovelData,
  UpdateNovelData,
  UpdateSceneData,
  CreateChapterData,
  UpdateChapterData,
  CreateActData,
  UpdateActData,
  ReorderData,
  PaginationData,
  SortData,
} from "./types";

export {
  APIError,
  CreateNovelSchema,
  UpdateNovelSchema,
  NovelParamsSchema,
  UpdateSceneSchema,
  SceneParamsSchema,
  CreateChapterSchema,
  UpdateChapterSchema,
  ChapterParamsSchema,
  CreateActSchema,
  UpdateActSchema,
  ActParamsSchema,
  ReorderSchema,
  FileUploadConfigSchema,
  PaginationSchema,
  SortSchema,
} from "./types";

// ===== MIDDLEWARE SYSTEM =====
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

// ===== RATE LIMITING =====
export {
  rateLimit,
  RATE_LIMIT_CONFIGS,
  createRateLimitKey,
} from "./rate-limit";

// ===== LOGGING =====
export { logger } from "./logger";

// ===== CONVENIENCE EXPORTS =====
// Common patterns for immediate use
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

// ===== USAGE EXAMPLES IN COMMENTS =====
/*
// Example 1: Simple API route with validation
export const POST = API.compose(
  API.rateLimit('CREATION'),
  API.validate(CreateNovelSchema)
)(async (req, context, data) => {
  const novel = await novelService.createNovel(data);
  return API.success(novel, 'Novel created successfully');
});

// Example 2: File upload route
export const POST = API.upload(async (req, context) => {
  const { file } = context;
  const result = await processFile(file);
  return API.success(result, 'File processed successfully');
});

// Example 3: Custom middleware combination
export const PUT = API.compose(
  API.rateLimit({ windowMs: 60000, maxRequests: 10 }),
  API.validate(UpdateNovelSchema, NovelParamsSchema)
)(async (req, context, data) => {
  const { id } = await context.params;
  const novel = await novelService.updateNovel(id, data);
  return API.success(novel, 'Novel updated successfully');
});
*/
