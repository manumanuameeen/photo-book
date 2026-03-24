import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";

/**
 * Chatbot Service (LangChain Version)
 * Uses LangChain for better prompt management and conversation memory.
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// System prompt defining the AI's personality and role
const SYSTEM_PROMPT = `You are the PhotoBook AI Assistant. You help users with:
1. Booking photographers for events.
2. Renting photography equipment.
3. Answering questions about the PhotoBook platform.
4. General photography advice.

Be professional, helpful, and concise. If you don't know the answer, suggest contacting support.
The platform allows users to browse photographers, view their portfolios, and book sessions.
It also has a rental section for cameras, lenses, and other gear.
Users can manage their bookings and rentals from their dashboard.`;

/**
 * Processes a chat request using LangChain
 * @param messages - Array of previous messages for context
 * @returns AI's response message
 */
export const getChatbotResponse = async (messages: ChatMessage[]) => {
  try {
    // 1. Initialize the LLM (using GPT-4o-mini for low cost/free tier)
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 2. Create the prompt template with a placeholder for history
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 3. Setup Memory (Optional: In a real app, you'd store this in Redis/DB per user)
    // For this implementation, we pass the history manually from the frontend
    const history = messages.slice(0, -1).map(m => {
        if (m.role === "user") return ["human", m.content];
        return ["ai", m.content];
    }) as [string, string][];

    const lastMessage = messages[messages.length - 1].content;

    // 4. Create and run the chain
    const chain = prompt.pipe(model);
    
    const response = await chain.invoke({
      input: lastMessage,
      history: history.map(([role, content]) => {
        if (role === "human") return { role: "user", content };
        return { role: "assistant", content };
      }),
    });

    return {
      success: true,
      message: response.content.toString(),
    };
  } catch (error) {
    console.error("[Chatbot Service] LangChain Error:", error);
    return {
      success: false,
      message: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
    };
  }
};
