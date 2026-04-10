import dotenv from "dotenv";
dotenv.config();
import { ChatGroq } from "@langchain/groq";
import mongoose from "mongoose";
import { PhotographerModel } from "./src/models/photographer.model";

async function diagnose() {
  console.log("--- CHATBOT DIAGNOSTICS ---");

  // 1. Check ENV
  console.log("1. Checking Environment...");
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY is MISSING in .env");
  } else {
    console.log("✅ GROQ_API_KEY is present.");
  }

  // 2. Test Groq
  console.log("\n2. Testing Groq Connection...");
  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
    });
    const res = await model.invoke("Hello, are you active?");
    console.log("✅ Groq Response:", res.content);
  } catch (err: any) {
    console.error("❌ Groq Error:", err.message);
  }

  // 3. Test Database
  console.log("\n3. Testing Database Connectivity...");
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is MISSING");
    } else {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected.");
      const count = await PhotographerModel.countDocuments();
      console.log(`✅ Photographers in DB: ${count}`);
      await mongoose.disconnect();
    }
  } catch (err: any) {
    console.error("❌ Database Error:", err.message);
  }

  console.log("\n--- DIAGNOSTICS COMPLETE ---");
}

diagnose();
