import mongoose from "mongoose";

/**
 * Global teardown: Drop test database and disconnect.
 */
export default async function globalTeardown(): Promise<void> {
  const testUri = process.env.MONGODB_URI || "";

  if (testUri.includes("rhne_test")) {
    await mongoose.connect(testUri);
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
  }
}
