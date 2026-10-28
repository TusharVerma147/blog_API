import mongoose from "mongoose";
import { config } from "../../constants/config";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri, {
    dbName: config.dbName,
  });

  console.log(`Connected to MongoDB (database: ${config.dbName})`);
}
