import type { Request, Response, NextFunction } from "express";
import { getCache, setCache, buildCacheKey } from "@shared/utils/cache";

/**
 * Express middleware that caches JSON responses in Redis.
 * Use on GET endpoints that return JSON data.
 *
 * @param prefix - Cache key prefix (e.g., "sites", "services")
 * @param ttl - Time to live in seconds (default: 300 = 5 min)
 */
export const cacheMiddleware = (prefix: string, ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== "GET") {
      next();
      return;
    }

    const key = buildCacheKey(prefix, req);

    try {
      const cached = await getCache<object>(key);
      if (cached) {
        res.json(cached);
        return;
      }
    } catch {
      // Cache miss or error — proceed normally
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to intercept the response
    res.json = ((data: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(key, data, ttl).catch(() => {});
      }
      return originalJson(data);
    }) as Response["json"];

    next();
  };
};
