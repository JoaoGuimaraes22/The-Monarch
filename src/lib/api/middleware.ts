// lib/api/middleware.ts
// Middleware system for API route standardization

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { APIError, APIResponse } from "./types";
import {
  rateLimit,
  createRateLimitKey,
  RATE_LIMIT_CONFIGS,
} from "./rate-limit";
import { logger } from "./logger";

// ===== TYPES =====
type RouteHandler<T = unknown> = (
  req: NextRequest,
  context: RouteContext,
  validatedData?: T
) => Promise<NextResponse>;

interface RouteContext {
  params: Promise<Record<string, unknown>>;
  requestId: string;
  query?: Record<string, unknown>;
  file?: File;
  formData?: FormData;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
}

interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  required?: boolean;
}

// ===== UTILITY FUNCTIONS =====
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== RESPONSE HELPERS =====
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
      version: "1.0",
    },
  };

  return NextResponse.json(response);
}

export function createErrorResponse(
  error: APIError,
  requestId?: string
): NextResponse {
  const response: APIResponse = {
    success: false,
    error: error.message,
    details: error.details,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
      version: "1.0",
    },
  };

  const nextResponse = NextResponse.json(response, {
    status: error.statusCode,
  });

  // Add rate limiting headers if it's a rate limit error
  if (
    error.code === "RATE_LIMITED" &&
    error.details &&
    typeof error.details === "object"
  ) {
    const details = error.details as { resetTime?: number };
    if (details.resetTime) {
      nextResponse.headers.set(
        "Retry-After",
        Math.ceil((details.resetTime - Date.now()) / 1000).toString()
      );
      nextResponse.headers.set("X-RateLimit-Remaining", "0");
      nextResponse.headers.set(
        "X-RateLimit-Reset",
        details.resetTime.toString()
      );
    }
  }

  return nextResponse;
}

// ===== VALIDATION MIDDLEWARE =====
export function withValidation<T>(
  bodySchema?: ZodSchema<T>,
  paramsSchema?: ZodSchema,
  querySchema?: ZodSchema
) {
  return function middleware(handler: RouteHandler<T>) {
    return async function (
      req: NextRequest,
      context: { params: Promise<Record<string, unknown>> }
    ) {
      const requestId = generateRequestId();
      const startTime = Date.now();

      try {
        // Log incoming request
        logger.logRequest(
          requestId,
          req.method,
          req.url,
          req.headers.get("user-agent")
        );

        // Validate params if schema provided
        let validatedParams: unknown;
        if (paramsSchema) {
          const params = await context.params;
          const paramResult = paramsSchema.safeParse(params);
          if (!paramResult.success) {
            throw new APIError(
              "Invalid URL parameters",
              400,
              "VALIDATION_ERROR",
              paramResult.error.issues
            );
          }
          validatedParams = paramResult.data;
        }

        // Validate query parameters if schema provided
        let validatedQuery: unknown;
        if (querySchema) {
          const url = new URL(req.url);
          const query = Object.fromEntries(url.searchParams.entries());
          const queryResult = querySchema.safeParse(query);
          if (!queryResult.success) {
            throw new APIError(
              "Invalid query parameters",
              400,
              "VALIDATION_ERROR",
              queryResult.error.issues
            );
          }
          validatedQuery = queryResult.data;
        }

        // Validate body if schema provided and method allows body
        let validatedBody: T | undefined;
        if (bodySchema && ["POST", "PUT", "PATCH"].includes(req.method)) {
          try {
            const contentType = req.headers.get("content-type") || "";

            // Handle FormData separately (for file uploads)
            if (contentType.includes("multipart/form-data")) {
              // Body validation will be handled by file upload middleware
              validatedBody = undefined;
            } else {
              const body = await req.json();
              const bodyResult = bodySchema.safeParse(body);
              if (!bodyResult.success) {
                throw new APIError(
                  "Invalid request body",
                  400,
                  "VALIDATION_ERROR",
                  bodyResult.error.issues
                );
              }
              validatedBody = bodyResult.data;
            }
          } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError(
              "Invalid JSON in request body",
              400,
              "VALIDATION_ERROR"
            );
          }
        }

        // Create enriched context
        const enrichedContext: RouteContext = {
          params: validatedParams
            ? Promise.resolve(validatedParams)
            : context.params,
          requestId,
          query: validatedQuery,
        };

        // Call the actual handler
        const response = await handler(req, enrichedContext, validatedBody);

        // Log successful response
        const duration = Date.now() - startTime;
        logger.logResponse(requestId, response.status, duration);

        // Add standard headers
        response.headers.set("X-Request-ID", requestId);

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        if (error instanceof APIError) {
          logger.logError(requestId, error.message, {
            code: error.code,
            statusCode: error.statusCode,
            details: error.details,
            duration,
          });

          const errorResponse = createErrorResponse(error, requestId);
          errorResponse.headers.set("X-Request-ID", requestId);
          return errorResponse;
        }

        // Unexpected error
        logger.logError(
          requestId,
          error instanceof Error ? error : "Unknown error",
          {
            stack: error instanceof Error ? error.stack : undefined,
            duration,
          }
        );

        const errorResponse = createErrorResponse(
          new APIError("Internal server error", 500, "INTERNAL_ERROR"),
          requestId
        );
        errorResponse.headers.set("X-Request-ID", requestId);
        return errorResponse;
      }
    };
  };
}

// ===== RATE LIMITING MIDDLEWARE =====
export function withRateLimit(
  options: RateLimitOptions | keyof typeof RATE_LIMIT_CONFIGS
) {
  return function middleware(handler: RouteHandler) {
    return async function (req: NextRequest, context: RouteContext) {
      // Get rate limit configuration
      const config =
        typeof options === "string" ? RATE_LIMIT_CONFIGS[options] : options;

      // Generate rate limit key
      const key =
        "keyGenerator" in config && config.keyGenerator
          ? config.keyGenerator(req)
          : createRateLimitKey.byIP(req);

      // Check rate limit
      const result = await rateLimit.check(
        key,
        config.windowMs,
        config.maxRequests
      );

      if (!result.allowed) {
        throw new APIError("Rate limit exceeded", 429, "RATE_LIMITED", {
          resetTime: result.resetTime,
          totalRequests: result.totalRequests,
        });
      }

      // Call handler
      const response = await handler(req, context);

      // Add rate limit headers to successful responses
      response.headers.set(
        "X-RateLimit-Remaining",
        result.remaining.toString()
      );
      response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());

      return response;
    };
  };
}

// ===== FILE UPLOAD MIDDLEWARE =====
export function withFileUpload(options: FileUploadOptions = {}) {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required = false,
  } = options;

  return function middleware(handler: RouteHandler) {
    return async function (req: NextRequest, context: RouteContext) {
      const contentType = req.headers.get("content-type") || "";

      if (
        req.method === "POST" &&
        contentType.includes("multipart/form-data")
      ) {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File | null;

          if (!file && required) {
            throw new APIError("File is required", 400, "VALIDATION_ERROR");
          }

          if (file) {
            // Validate file size
            if (file.size > maxSizeBytes) {
              throw new APIError(
                `File too large. Maximum size is ${Math.round(
                  maxSizeBytes / 1024 / 1024
                )}MB`,
                400,
                "FILE_TOO_LARGE"
              );
            }

            // Validate file type
            if (!allowedTypes.includes(file.type)) {
              throw new APIError(
                `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
                400,
                "INVALID_FILE_TYPE"
              );
            }

            // Add file and formData to context
            context.file = file;
            context.formData = formData;
          }
        } catch (error) {
          if (error instanceof APIError) throw error;
          throw new APIError(
            "Failed to process uploaded file",
            400,
            "VALIDATION_ERROR"
          );
        }
      }

      return handler(req, context);
    };
  };
}

// ===== COMPOSE MIDDLEWARE =====
export function composeMiddleware(
  ...middlewares: Array<(handler: RouteHandler) => RouteHandler>
) {
  return function (handler: RouteHandler): RouteHandler {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

// ===== CONVENIENCE FUNCTIONS =====
export const withStandardValidation = withValidation;
export const withStandardRateLimit = () => withRateLimit("STANDARD");
export const withCreationRateLimit = () => withRateLimit("CREATION");
export const withUploadRateLimit = () => withRateLimit("UPLOAD");

export const withDocxUpload = () =>
  withFileUpload({
    maxSizeBytes: 10 * 1024 * 1024,
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    required: true,
  });

// ===== COMMON MIDDLEWARE COMBINATIONS =====
export const standardAPI = composeMiddleware(
  withStandardRateLimit(),
  withStandardValidation()
);

export const creationAPI = composeMiddleware(
  withCreationRateLimit(),
  withStandardValidation()
);

export const uploadAPI = composeMiddleware(
  withUploadRateLimit(),
  withDocxUpload(),
  withStandardValidation()
);

// ===== ERROR HANDLING UTILITIES =====
export function handleServiceError(error: unknown): never {
  if (error instanceof Error) {
    // Map specific service errors to API errors
    if (error.message.includes("not found")) {
      throw new APIError("Resource not found", 404, "NOT_FOUND");
    }

    if (
      error.message.includes("duplicate") ||
      error.message.includes("already exists")
    ) {
      throw new APIError("Resource already exists", 409, "CONFLICT");
    }

    if (error.message.includes("Failed to")) {
      throw new APIError(
        "Database operation failed",
        500,
        "DATABASE_ERROR",
        error.message
      );
    }
  }

  // Generic error
  throw new APIError(
    "Internal server error",
    500,
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Unknown error"
  );
}

// ===== TYPE EXPORTS =====
export type { RouteHandler, RouteContext, RateLimitOptions, FileUploadOptions };
