import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI as string;
    if (!uri) throw new Error("MONGO_URI not found in .env file");
    const conn = await mongoose.connect(uri);
    console.log(`mongoode Connected:${conn.connection.host}`);
  } catch (error) {
    console.error("mongoDB Connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;
