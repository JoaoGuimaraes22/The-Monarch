// lib/api/rate-limit.ts
// In-memory rate limiting system for API protection
// ✅ ENHANCED: Environment-based configuration for future-proof development

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

class InMemoryRateLimit {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup process only on server side
    if (typeof window === "undefined") {
      this.startCleanup();
    }
  }

  async check(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // No previous entry or window expired
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      };

      this.store.set(key, newEntry);

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime,
        totalRequests: 1,
      };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        totalRequests: entry.count,
      };
    }

    // Increment counter
    entry.count++;

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
      totalRequests: entry.count,
    };
  }

  // Get current status for a key without incrementing
  async getStatus(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return { ...entry }; // Return copy
  }

  // Reset rate limit for a specific key
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Get all active rate limit entries (for debugging)
  getActiveEntries(): Array<{ key: string; entry: RateLimitEntry }> {
    const now = Date.now();
    const active: Array<{ key: string; entry: RateLimitEntry }> = [];

    for (const [key, entry] of this.store.entries()) {
      if (now <= entry.resetTime) {
        active.push({ key, entry: { ...entry } });
      }
    }

    return active;
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  // Start periodic cleanup
  private startCleanup(): void {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const removed = this.cleanup();
      if (removed > 0) {
        console.log(`Rate limit cleanup: removed ${removed} expired entries`);
      }
    }, 5 * 60 * 1000);
  }

  // Stop cleanup (for testing or shutdown)
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get statistics
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
  } {
    const now = Date.now();
    let activeKeys = 0;
    let expiredKeys = 0;

    for (const entry of this.store.values()) {
      if (now <= entry.resetTime) {
        activeKeys++;
      } else {
        expiredKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys,
      expiredKeys,
    };
  }
}

// Export singleton instance
export const rateLimit = new InMemoryRateLimit();

// ===== ✅ ENHANCED: Environment-based configuration =====

// Environment detection
const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

// Helper to get environment variable overrides
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) || defaultValue : defaultValue;
};

// ✅ UPDATED: Future-proof rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // General API calls
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests:
      isDevelopment || isTest
        ? getEnvNumber("RATE_LIMIT_STANDARD_DEV", 1000)
        : getEnvNumber("RATE_LIMIT_STANDARD_PROD", 100),
  },

  // Content creation (novels, chapters, etc.)
  CREATION: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests:
      isDevelopment || isTest
        ? getEnvNumber("RATE_LIMIT_CREATION_DEV", 200)
        : getEnvNumber("RATE_LIMIT_CREATION_PROD", 20),
  },

  // ✅ FIXED: File uploads - much more generous in development
  UPLOAD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests:
      isDevelopment || isTest
        ? getEnvNumber("RATE_LIMIT_UPLOAD_DEV", 100) // 🎉 100 uploads per 15 min in dev
        : getEnvNumber("RATE_LIMIT_UPLOAD_PROD", 10), // 10 uploads per 15 min in prod
  },

  // Authentication attempts
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests:
      isDevelopment || isTest
        ? getEnvNumber("RATE_LIMIT_AUTH_DEV", 100)
        : getEnvNumber("RATE_LIMIT_AUTH_PROD", 10),
  },

  // Data-heavy operations
  HEAVY: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests:
      isDevelopment || isTest
        ? getEnvNumber("RATE_LIMIT_HEAVY_DEV", 50)
        : getEnvNumber("RATE_LIMIT_HEAVY_PROD", 10),
  },
} as const;

// ✅ NEW: Optional development bypass helper
export function getUploadRateLimit() {
  // Complete bypass if environment variable is set
  if (isDevelopment && process.env.DISABLE_UPLOAD_RATE_LIMIT === "true") {
    return {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 10000, // Essentially unlimited
    };
  }

  return RATE_LIMIT_CONFIGS.UPLOAD;
}

// ✅ DEVELOPMENT LOGGING
if (isDevelopment) {
  console.log("🔧 Rate Limiting Configuration (Development Mode):", {
    standard: RATE_LIMIT_CONFIGS.STANDARD.maxRequests,
    creation: RATE_LIMIT_CONFIGS.CREATION.maxRequests,
    upload: RATE_LIMIT_CONFIGS.UPLOAD.maxRequests,
    auth: RATE_LIMIT_CONFIGS.AUTH.maxRequests,
    heavy: RATE_LIMIT_CONFIGS.HEAVY.maxRequests,
    environment: process.env.NODE_ENV,
  });
}

// Key generation helpers (unchanged)
export const createRateLimitKey = {
  byIP: (request: Request): string => {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return `ip:${ip}`;
  },

  byUser: (userId: string): string => {
    return `user:${userId}`;
  },

  byEndpoint: (endpoint: string, identifier: string): string => {
    return `endpoint:${endpoint}:${identifier}`;
  },

  global: (endpoint: string): string => {
    return `global:${endpoint}`;
  },
};

// Export for testing
export { InMemoryRateLimit };

/*
===== WHAT CHANGED =====

✅ BEFORE: UPLOAD had only 5 requests per 15 minutes
✅ AFTER: UPLOAD has 100 requests per 15 minutes in development, 10 in production

✅ ADDED: Environment detection (development vs production)
✅ ADDED: Environment variable overrides for fine-tuning
✅ ADDED: Development logging to see current limits
✅ ADDED: Optional complete bypass for testing

===== OPTIONAL .env.local CUSTOMIZATION =====

Add these to your .env.local file if you want to customize further:

# Completely disable upload rate limiting (for testing)
DISABLE_UPLOAD_RATE_LIMIT=true

# Custom development limits (optional)
RATE_LIMIT_UPLOAD_DEV=200
RATE_LIMIT_CREATION_DEV=300

===== IMMEDIATE BENEFITS =====

🎉 You can now upload 100 files per 15 minutes in development
🛡️ Production still has reasonable limits for security  
🔧 Can be fine-tuned per environment without code changes
👥 Team-friendly for other developers
*/
