import mongoose from "mongoose";
import "dotenv/config";

let isConnecting = null;
let fallbackMongod = null;

// Function to connect to the mongodb database
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) return isConnecting;

  const mongoUri = process.env.MONGO_URI;

  isConnecting = (async () => {
    try {
      if (mongoUri) {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 30000,
          connectTimeoutMS: 5000,
          retryWrites: true,
        });
        console.log("Database Connected to MongoDB Atlas");
        return;
      }
    } catch (error) {
      console.warn(
        "MongoDB Atlas connection timed out (often due to Atlas IP whitelist). Initiating local dev fallback..."
      );
    }

    // In-memory fallback for smooth local development
    if (process.env.NODE_ENV !== "production" && mongoose.connection.readyState !== 1) {
      try {
        if (!fallbackMongod) {
          const { MongoMemoryServer } = await import("mongodb-memory-server");
          fallbackMongod = await MongoMemoryServer.create();
        }
        const uri = fallbackMongod.getUri();
        await mongoose.connect(uri);
        console.log("Database Connected to Local Development Database");
      } catch (localErr) {
        console.error("Local fallback DB failed:", localErr.message);
        throw localErr;
      }
    }
  })()
    .finally(() => {
      isConnecting = null;
    });

  return isConnecting;
};
