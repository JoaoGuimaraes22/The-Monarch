// lib/api/rate-limit.ts
// In-memory rate limiting system for API protection

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

// Common rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // General API calls
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },

  // Content creation (novels, chapters, etc.)
  CREATION: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
  },

  // File uploads
  UPLOAD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // Authentication attempts
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },

  // Data-heavy operations
  HEAVY: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },
} as const;

// Key generation helpers
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
