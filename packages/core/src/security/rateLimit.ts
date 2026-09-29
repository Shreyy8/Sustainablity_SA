/**
 * Pluribus API Rate Limiting Utility
 * Provides sliding-window rate limiting for Next.js API route handlers.
 * Supports Upstash Redis REST when configured; falls back to an in-memory sliding window.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);

  // Check Upstash Redis configuration
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${identifier}:${Math.floor(now / config.windowSeconds)}`;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, config.windowSeconds]
        ])
      });

      if (res.ok) {
        const [incrRes] = await res.json();
        const currentCount = incrRes?.result ?? 1;
        const resetAt = (Math.floor(now / config.windowSeconds) + 1) * config.windowSeconds;

        return {
          success: currentCount <= config.maxRequests,
          limit: config.maxRequests,
          remaining: Math.max(0, config.maxRequests - currentCount),
          resetAt
        };
      }
    } catch (err: any) {
      console.warn("Upstash rate limit query failed, falling back to memory:", err.message);
    }
  }

  // In-memory sliding window fallback
  const record = memoryStore.get(identifier);

  if (!record || record.resetAt <= now) {
    const resetAt = now + config.windowSeconds;
    memoryStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAt
    };
  }

  record.count += 1;
  const success = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return {
    success,
    limit: config.maxRequests,
    remaining,
    resetAt: record.resetAt
  };
}
