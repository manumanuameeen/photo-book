import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || "";
    if (!uri) throw new Error("MongoDB URI missing in environment variables");

    await mongoose.connect(uri, {
      dbName: "photoBookDB",
    });
    console.log("✅ MongoDB connected successfully");
    console.log("📂 Database:", mongoose.connection.db?.databaseName);
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
