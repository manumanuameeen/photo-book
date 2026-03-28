import { connectDB } from "./src/config/db";
import { getChatbotResponse } from "./src/services/external/chatbot.service";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await connectDB();
  console.log("Testing fetch photographers...");
  const res = await getChatbotResponse([
    { role: "user", content: "Show me some wedding photographers in my area" }
  ], "69c24f818cfaf470d7cd8eea", "test_session_1");
  console.log("\n--- CHATBOT RESPONSE ---");
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
run();
