import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { env } from "@config/env";
import { logger } from "@shared/utils/logger";

const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};

// ── Notification Queue ──
export const notificationQueue = new Queue("notifications", { connection });

// ── Create a typed worker ──
export const createWorker = (
  queueName: string,
  processor: Parameters<typeof Worker>[1],
  concurrency = 3
) => {
  const worker = new Worker(queueName, processor, {
    connection,
    concurrency,
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} (${job.name}) completed`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} (${job?.name}) failed:`, err.message);
  });

  return worker;
};

export { connection as queueConnection };
