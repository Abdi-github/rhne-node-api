import app from "./app";
import { env } from "@config/env";
import { connectDB } from "@config/db";
import { connectRedis } from "@config/redis";
import { logger } from "@shared/utils/logger";
import { startNotificationWorker } from "@shared/notifications/notification.service";

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Start notification queue worker
    startNotificationWorker();

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📡 API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`❤️  Health: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`\n${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();
