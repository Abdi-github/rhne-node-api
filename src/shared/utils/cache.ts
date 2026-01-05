import { getRedisClient } from "@config/redis";
import { logger } from "@shared/utils/logger";

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get a cached value from Redis.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    logger.warn(`Cache get error for key "${key}":`, error);
    return null;
  }
};

/**
 * Set a value in Redis cache.
 */
export const setCache = async (key: string, data: unknown, ttl: number = DEFAULT_TTL): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.warn(`Cache set error for key "${key}":`, error);
  }
};

/**
 * Delete a cache entry or pattern.
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.warn(`Cache delete error for key "${key}":`, error);
  }
};

/**
 * Delete all cache entries matching a pattern.
 * E.g., "sites:*" to clear all site caches.
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    let cursor = 0;
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await client.del(result.keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    logger.warn(`Cache pattern delete error for "${pattern}":`, error);
  }
};

/**
 * Generate a cache key from request path + query params.
 */
export const buildCacheKey = (prefix: string, req: { originalUrl: string }): string => {
  return `${prefix}:${req.originalUrl}`;
};
