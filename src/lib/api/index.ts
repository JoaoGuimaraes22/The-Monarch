// lib/api/index.ts
// Barrel exports for the API standardization system

// ===== RE-EXPORT TYPES & SCHEMAS =====
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
