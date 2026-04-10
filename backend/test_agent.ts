import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { ShutterAgent } from "./src/services/external/shutter/shutter.agent";

async function testAgent() {
  console.log("--- STARTING AGENT TEST ---");

  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected.");

    const agent = new ShutterAgent();
    const userId = "69180f89fdc39bea5a8ca698";

    console.log("\nTEST 1: GREETING");
    const res1 = await agent.run("hi", [], "GREETING", userId);
    console.log("Assistant Response:", res1.message);
    if (res1.message.includes("<function") || res1.message.includes("{")) {
      console.error("❌ FAIL: Raw tags detected in response!");
    } else {
      console.log("✅ PASS: Clean response.");
    }

    console.log("\nTEST 2: SEARCH (Perinthalmanna)");
    const history = [{ role: "assistant", content: res1.message }];
    const res2 = await agent.run(
      "wedding photography in Perinthalmanna",
      history,
      "GREETING",
      userId,
    );
    console.log("Assistant Response:", res2.message);
    console.log("Structured Data Type:", res2.structuredData?.type);

    if (res2.message.includes("<function") || res2.message.includes("{")) {
      console.error("❌ FAIL: Raw tags detected in response!");
    } else if (res2.structuredData?.type === "photographer_list") {
      console.log("✅ PASS: Tool called and structuredData returned.");
    } else {
      console.warn("⚠️ Tool was not called or failed. Response:", res2.message);
    }
  } catch (err: any) {
    console.error("❌ Critical Test Failure:", err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    console.log("\n--- TEST COMPLETE ---");
  }
}

testAgent();
