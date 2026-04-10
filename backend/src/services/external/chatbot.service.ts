import { ChatHistoryModel, IChatMessage } from "../../models/chatHistory.model";
import { ShutterAgent } from "./shutter/shutter.agent";
import { ChatbotPhase } from "./shutter/shutter.types";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  structuredData?: Record<string, unknown>; // Dynamic based on context
}

/**
 * Cleanup function for inactive sessions if using in-memory stores.
 * In this implementation, we use MongoDB, so this is a no-op.
 */
export const clearInactiveMemories = () => {
  console.log("[ChatbotService] Memory cleanup is handled by DB persistence.");
};

/**
 * ============================================================================
 * CHATBOT SERVICE - DEBUG-ENABLED ORCHESTRATOR
 * ============================================================================
 */

export const getChatbotResponse = async (
  messages: IChatMessage[],
  userId: string,
  sessionId: string = "default",
) => {
  console.log(`[ChatbotService] Starting request - userId: ${userId}, sessionId: ${sessionId}`);

  try {
    // 1. Context Loading
    console.log("[ChatbotService:1] Loading chat history from DB...");
    let chatHistory = await ChatHistoryModel.findOne({ userId, sessionId });

    if (!chatHistory) {
      console.log("[ChatbotService:1.1] No history found. Creating new session.");
      chatHistory = new ChatHistoryModel({
        userId,
        sessionId,
        messages: [],
        metadata: { state: { phase: "GREETING" } },
      });
    } else {
      console.log(
        `[ChatbotService:1.2] Loaded history with ${chatHistory.messages.length} messages.`,
      );
    }

    const currentPhase = (chatHistory.metadata?.state?.phase as ChatbotPhase) || "GREETING";
    console.log(`[ChatbotService:1.3] Current Phase: ${currentPhase}`);

    // 2. Agent Execution
    console.log("[ChatbotService:2] Initializing ShutterAgent...");
    const agent = new ShutterAgent();

    const lastUserMessage = messages[messages.length - 1].content;
    console.log(`[ChatbotService:2.1] User Input: "${lastUserMessage}"`);

    console.log("[ChatbotService:2.2] Running ShutterAgent.run()...");
    const result = await agent.run(lastUserMessage, chatHistory.messages, currentPhase, userId);
    console.log(`[ChatbotService:2.3] Agent Success. Response length: ${result.message.length}`);

    // 3. Persistence
    console.log("[ChatbotService:3] Preserving interaction in DB...");
    chatHistory.messages.push({
      role: "user",
      content: lastUserMessage,
      timestamp: new Date(),
    });

    chatHistory.messages.push({
      role: "assistant",
      content: result.message,
      structuredData: result.structuredData,
      timestamp: new Date(),
    });

    if (chatHistory.messages.length > 20) {
      chatHistory.messages = chatHistory.messages.slice(-20);
    }

    chatHistory.lastMessageAt = new Date();
    chatHistory.metadata = {
      state: {
        ...chatHistory.metadata?.state,
        phase: result.nextPhase,
      },
    };

    await chatHistory.save();
    console.log(`[ChatbotService:3.1] Interaction saved. Next phase: ${result.nextPhase}`);

    return {
      success: true,
      message: result.message,
      structuredData: result.structuredData,
      conversationPhase: result.nextPhase,
    };
  } catch (error: unknown) {
    console.error("[ChatbotService] CRITICAL FAILURE:", error);

    // Log the error stack separately for visibility
    if (error.stack) {
      console.error("[ChatbotService] Stack Trace:", error.stack);
    }

    return {
      success: false,
      message: "An internal error occurred while processing your request.",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
};
