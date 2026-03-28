import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { tool, StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { CategoryModel } from "../../models/category.model";
import { PhotographerModel } from "../../models/photographer.model";
import { BookingPackageModel } from "../../models/bookingPackage.model";
import { BookingModel } from "../../models/booking.model";
import { ChatHistoryModel } from "../../models/chatHistory.model";
import mongoose from "mongoose";

/**
 * Chatbot Service (LangChain + Groq)
 * Implements "Shutter" - the Photo-book AI booking assistant with Tool Calling
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface PhotographerQuery {
  status: string;
  "professionalDetails.specialties"?: { $regex: string; $options: string };
  "personalInfo.location"?: { $regex: string; $options: string };
}

/**
 * Tool to fetch photographers based on category and location
 */
const fetchPhotographers = tool(
  async ({ category, location }) => {
    try {
      const query: PhotographerQuery = { status: "APPROVED" };
      if (category) query["professionalDetails.specialties"] = { $regex: category, $options: "i" };
      if (location) query["personalInfo.location"] = { $regex: location, $options: "i" };

      const photographers = await PhotographerModel.find(query)
        .select("personalInfo businessInfo professionalDetails portfolio.portfolioImages")
        .limit(5)
        .lean();

      return JSON.stringify(photographers);
    } catch {
      return "Error fetching photographers.";
    }
  },
  {
    name: "fetch_photographers",
    description: "Search for photographers based on category (e.g., Wedding, Portrait) and location.",
    schema: z.object({
      category: z.string().optional().describe("The type of photography (e.g., Wedding, Event)"),
      location: z.string().optional().describe("The city or region"),
    }),
  }
);

/**
 * Tool to fetch packages for a specific photographer
 */
const fetchPackages = tool(
  async ({ photographerId }) => {
    try {
      const packages = await BookingPackageModel.find({
        photographer: new mongoose.Types.ObjectId(photographerId),
        status: "ACTIVE",
      }).lean();

      return JSON.stringify(packages);
    } catch {
      return "Error fetching packages for this photographer.";
    }
  },
  {
    name: "fetch_packages",
    description: "Get the pricing packages and services offered by a specific photographer.",
    schema: z.object({
      photographerId: z.string().describe("The MongoDB ID of the photographer"),
    }),
  }
);

/**
 * Tool to create a booking (simulated/initiated by AI)
 */
const createBooking = tool(
  async ({ photographerId, packageId, eventDate, startTime, location, eventType, contactDetails, userId }) => {
    try {
      // Fetch package details to populate the booking
      const pkg = await BookingPackageModel.findById(packageId);
      if (!pkg) return "Selected package not found.";

      const booking = new BookingModel({
        userId: new mongoose.Types.ObjectId(userId),
        photographerId: new mongoose.Types.ObjectId(photographerId),
        packageId: new mongoose.Types.ObjectId(packageId),
        packageDetails: pkg,
        eventDate: new Date(eventDate),
        startTime,
        depositeRequired: (pkg.price || pkg.baseprice) * 0.2, // Default 20% deposit
        totalAmount: pkg.price || pkg.baseprice,
        location,
        eventType,
        contactDetails,
        status: "pending",
        paymentStatus: "pending",
      });

      await booking.save();
      return `Booking successfully initiated! Booking ID: ${booking.bookingId}. You can view it in your dashboard.`;
    } catch (error) {
      console.error("Create Booking Error:", error);
      return "Error creating booking. Please try booking manually through the profile.";
    }
  },
  {
    name: "create_booking",
    description: "Create a new booking for a user with a photographer and selected package.",
    schema: z.object({
      photographerId: z.string(),
      packageId: z.string(),
      eventDate: z.string().describe("Date of the event (YYYY-MM-DD)"),
      startTime: z.string().describe("Starting time (e.g., 10:00 AM)"),
      location: z.string(),
      eventType: z.string(),
      contactDetails: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
      userId: z.string(),
    }),
  }
);

const tools = [fetchPhotographers, fetchPackages, createBooking];

/**
 * Processes a chat request using LangChain with Groq and Tool Calling
 */
export const getChatbotResponse = async (
  messages: ChatMessage[],
  userId: string,
  sessionId: string = "default"
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 85_000);

  try {
    // 1. Fetch data for persona
    const activeCategories = await CategoryModel.find({
      isActive: true,
      suggestionStatus: "APPROVED",
    }).select("name").lean();

    const categoriesList = activeCategories.length > 0
      ? activeCategories.map((c: { name: string }) => c.name).join(", ")
      : "Wedding, Portrait, Event, Nikah Ceremony, General";

    const shutterPersona = `=== SHUTTER: PHOTO-BOOK BOOKING ASSISTANT ===

## IDENTITY
You are Shutter, the official AI booking assistant for Photo-book. You help clients find photographers and book sessions.

## CAPABILITIES
You can actually search our database and create bookings. If you need to show photographers or packages, use your tools. 
When tools return data, describe it warmly and mention that the user can see interactive cards appearing in the chat.

Available categories: ${categoriesList}.

## GUIDELINES
- Use 'fetch_photographers' when the user asks for recommendations.
- Use 'fetch_packages' when the user is interested in a specific photographer.
- Use 'create_booking' ONLY when the user has provided all details (photographer, package, date, location).
- Always return a friendly text response. If you provide structured data for the UI, refer to it in your text.

## RESPONSE FORMAT
If you want the frontend to render special UI components (lists, cards), you should output a separate JSON object strictly in a markdown code block labeled 'structured-data' at the END of your message. 
Format:
\`\`\`structured-data
{{ "type": "photographer_list", "data": [...] }}
\`\`\`
Supported types: 'photographer_list', 'package_list', 'booking_confirmation'.`;

    if (!process.env.GROQ_API_KEY) {
      return { success: false, message: "AI Assistant not configured." };
    }

    // 2. Initialize Model with Tools
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.2, // Lower temperature for tool stability
    }).bindTools(tools);

    // 3. Setup Prompt & History
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", shutterPersona],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 4. Load persistent history from DB
    let chatHistory = await ChatHistoryModel.findOne({ userId, sessionId });
    if (!chatHistory) {
      chatHistory = new ChatHistoryModel({ userId, sessionId, messages: [] });
    }

    const lastMessage = messages[messages.length - 1].content;

    // Convert DB messages to LangChain format
    const langChainHistory = chatHistory.messages.map(m => {
      if (m.role === "user") return ["human", m.content];
      return ["ai", m.content];
    });

    // 5. Invoke Chain
    const chain = prompt.pipe(model);
    let response = await chain.invoke(
      {
        input: lastMessage,
        history: langChainHistory,
      },
      { signal: controller.signal }
    );

    // 6. Handle Tool Calls
    let finalContent = "";
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const toolMap: Record<string, StructuredTool> = {
          fetch_photographers: fetchPhotographers,
          fetch_packages: fetchPackages,
          create_booking: createBooking,
        };
        const selectedTool = toolMap[toolCall.name];
        if (selectedTool) {
          // Provide userId to create_booking tool if needed
          const args = { ...toolCall.args, userId: userId.toString() };
          // Cast invoke to a compatible signature to avoid union mismatch
          const toolResult = await (selectedTool.invoke as (args: Record<string, unknown>) => Promise<string>)(args);
          
          // Call model again with tool result
          const followUp = await model.invoke(
            [
              ["system", shutterPersona],
              ...langChainHistory.map(([r, c]) => [r, c]),
              ["human", lastMessage],
              response,
              { role: "tool", content: toolResult, tool_call_id: toolCall.id },
            ] as any,
            { signal: controller.signal }
          );
          response = followUp;
        }
      }
    }

    finalContent = response.content.toString();

    // 7. Save to persistent history
    chatHistory.messages.push({
      role: "user",
      content: lastMessage,
      timestamp: new Date()
    } as any);
    
    chatHistory.messages.push({
      role: "assistant",
      content: finalContent,
      timestamp: new Date()
    } as any);
    
    chatHistory.lastMessageAt = new Date();
    await chatHistory.save();

    clearTimeout(timeoutId);
    return {
      success: true,
      message: finalContent,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[Chatbot Service] Error:", error);
    return {
      success: false,
      message: "I'm having trouble connecting to my database. Please try again later.",
    };
  }
};
