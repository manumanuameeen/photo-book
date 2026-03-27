import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { CategoryModel } from "../../models/category.model";
import { PhotographerModel } from "../../models/photographer.model";

/**
 * Chatbot Service (LangChain + Groq)
 * Implements "Shutter" - the Photo-book AI booking assistant
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Processes a chat request using LangChain with Groq
 * @param messages - Array of previous messages for context
 * @returns AI's response message
 */
export const getChatbotResponse = async (messages: ChatMessage[]) => {
  // Abort if Groq takes longer than 85 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 85_000);

  try {
    // 0. Fetch real platform context
    const activeCategories = await CategoryModel.find({
      isActive: true,
      suggestionStatus: "APPROVED",
    })
      .select("name")
      .lean();

    const categoriesList =
      activeCategories.length > 0
        ? activeCategories.map((c) => c.name).join(", ")
        : "Wedding, Portrait, Event, Product, Nikah Ceremony, Intimate Wedding, General";

    const photographerCount = await PhotographerModel.countDocuments({ status: "APPROVED" });

    // Define Shutter's persona with real platform data
    const shutterPersona = `=== SHUTTER: PHOTO-BOOK BOOKING ASSISTANT ===

## IDENTITY
You are Shutter, the official AI booking assistant for Photo-book — a curated marketplace connecting clients with professional photographers across all specialties. Your purpose is to help every visitor find the right photographer, understand the booking process, and feel confident before they commit.

## PLATFORM OVERVIEW
Photo-book is a photography booking platform. We currently have ${photographerCount} verified professional photographers across various categories.
Available photographer categories: ${categoriesList}.

## YOUR CORE RESPONSIBILITIES
1. Helping users identify the right type of photographer for their needs.
2. Guiding users through the discovery and booking journey step by step.
3. Answering questions about how the platform works.
4. Handling objections and concerns with empathy and clarity.

## CONVERSATION FLOW
Step 1 — Understand the occasion: Ask what type of photography they are looking for (Wedding, Nikah, Event, etc.).
Step 2 — Clarify location: Ask for their city/region.
Step 3 — Timeline: Ask when the event is planned.
Step 4 — Budget: Ask for their budget range in PKR. Normalize the conversation around investment.
Step 5 — Preferences: Explore visual styles like Candid, Editorial, or Traditional.

## STRICT GUIDELINES
- Never fabricate photographer names or availability.
- Never guarantee specific results; always point to the platform tools.
- Keep the tone warm, knowledgeable, and professional.

Always end responses with a clear next step or open question.`;

    if (!process.env.GROQ_API_KEY) {
      console.error("[Chatbot Service] CRITICAL: GROQ_API_KEY is missing from environment variables");
      return {
        success: false,
        message: "The AI assistant is not configured. Please contact support.",
      };
    }

    // 1. Initialize the Groq model
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // 2. Create the prompt template with a placeholder for history
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", shutterPersona],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 3. Setup conversation history from recent messages (limit to last 10)
    const recentHistory = messages.slice(0, -1).slice(-10);
    const history = recentHistory.map((m) => {
      // LangChain expectation for history
      if (m.role === "user") return ["human", m.content];
      return ["ai", m.content];
    }) as [string, string][];

    const lastMessage = messages[messages.length - 1].content;

    // 4. Create and run the chain
    const chain = prompt.pipe(model);

    // Use Promise.race to guarantee a timeout
    const response = (await Promise.race([
      chain.invoke(
        {
          input: lastMessage,
          history: history.map(([role, content]) => {
            if (role === "human") return { role: "user", content };
            return { role: "assistant", content };
          }),
        },
        { signal: controller.signal },
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          controller.abort();
          const err = new Error("AbortError");
          err.name = "AbortError";
          reject(err);
        }, 85_000),
      ),
    ])) as { content: string };

    clearTimeout(timeoutId);
    return {
      success: true,
      message: response.content.toString(),
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const isTimeout = error instanceof Error && error.name === "AbortError";
    console.error("[Chatbot Service] Error details:", error);
    
    return {
      success: false,
      message: isTimeout
        ? "I took too long to respond. Please try again in a moment."
        : "I'm sorry, I'm having trouble connecting right now. Please try again later.",
    };
  }
};
