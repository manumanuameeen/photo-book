import { connectDB } from "./src/config/db";
import { getChatbotResponse } from "./src/services/external/chatbot.service";
import { PhotographerModel } from "./src/models/photographer.model";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await connectDB();
  const photog = await PhotographerModel.findOne({ status: "APPROVED" });
  if (!photog) {
    console.log("No photographer found");
    process.exit(1);
  }

  console.log("Testing fetch packages for:", photog.personalInfo?.name, photog._id);
  const res = await getChatbotResponse(
    [{ role: "user", content: `Show me the pricing packages for photographer ID: ${photog._id}` }],
    "69c24f818cfaf470d7cd8eea",
    "test_session_2",
  );

  console.log("\n--- CHATBOT RESPONSE ---");
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
run();
