import { createClient, type RedisClientType } from "redis";
import { env } from "@config/env";
import { logger } from "@shared/utils/logger";

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  redisClient = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
    password: env.REDIS_PASSWORD || undefined,
  });

  redisClient.on("error", (err) => {
    logger.error("Redis error:", err);
  });

  redisClient.on("connect", () => {
    logger.info(`Redis connected: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
  });

  redisClient.on("reconnecting", () => {
    logger.warn("Redis reconnecting...");
  });

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};
