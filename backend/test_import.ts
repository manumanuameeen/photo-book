import dotenv from "dotenv";
dotenv.config();
// Testing the absolute import that ShutterAgent uses
import { PhotographerModel } from "models/photographer.model";
import mongoose from "mongoose";

async function testImport() {
  console.log("Testing absolute import: 'models/photographer.model'...");
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is MISSING");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    const count = await PhotographerModel.countDocuments();
    console.log(`✅ Absolute Import Success! Photographers: ${count}`);
    await mongoose.disconnect();
  } catch (err: any) {
    console.error("❌ Absolute Import Failed:", err.message);
  }
}

testImport();
