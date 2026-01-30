import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Global setup: Connect to test database before all test suites.
 * Uses the same MONGODB_URI but appends "-test" to avoid touching production data.
 */
export default async function globalSetup(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017/rhne?authSource=admin";
  // Use a separate test database
  const testUri = mongoUri.replace(/\/rhne/, "/rhne_test");

  process.env.MONGODB_URI = testUri;
  process.env.NODE_ENV = "test";

  // Connect and ensure test DB is clean
  await mongoose.connect(testUri);
  await mongoose.connection.db!.dropDatabase();
  await mongoose.disconnect();
}
