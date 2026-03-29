import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { retryWithBackoff } from "../../utils/retryWithBackoff";
import { CategoryModel } from "../../models/category.model";
import { PhotographerModel } from "../../models/photographer.model";
import { BookingPackageModel } from "../../models/bookingPackage.model";
import { BookingModel } from "../../models/booking.model";
import { ChatHistoryModel } from "../../models/chatHistory.model";
import { ReviewModel } from "../../models/review.model";
import { AvailabilityModel } from "../../models/availability.model";
import mongoose from "mongoose";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

/**
 * ============================================================================
 * LANGCHAIN-POWERED CHATBOT WITH AUTOMATIC MEMORY MANAGEMENT
 * ============================================================================
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ConversationState {
  phase: "GREETING" | "BROWSING" | "COMPARING" | "BOOKING_INITIATED" | "BOOKING_PENDING" | "BOOKING_CONFIRMED";
  selectedPhotographer?: string;
  selectedPackage?: string;
  bookingDetails?: {
    eventDate?: string;
    startTime?: string;
    location?: string;
    eventType?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}

// In-memory cache for conversation memories
const memoryCache = new Map<string, ConversationSummaryBufferMemory>();

// Ultra-minimal system prompt
const SYSTEM_PROMPT = `You are Shutter, Photo-book's AI booking agent.

WORKFLOW (strict order):
GREETING → search_photographers → get_photographer_packages → [optional] get_photographer_availability → create_booking

RULES:
- Use tools for ALL data. Never invent results.
- Ask ONE question at a time.
- Only call create_booking when you have ALL 9 fields: photographerId, packageId, eventDate (YYYY-MM-DD), startTime, location, eventType, contactName, contactEmail, contactPhone.
- Map user input: "wedding"→"Wedding Photography", "portrait"→"Portrait Photography", "event"→"Event Photography"

Current conversation phase: {phase}`;

// ============================================================================
// TOOL DEFINITIONS (With any casts to bypass Zod/LangChain type mismatches)
// ============================================================================

const searchPhotographers: any = tool(
  async ({ category, location, limit = 3 }) => {
    try {
      const query: any = { status: "APPROVED", isBlock: false };
      
      if (category) {
        query["professionalDetails.specialties"] = { 
          $regex: category, 
          $options: "i" 
        };
      }
      
      if (location) {
        query["personalInfo.location"] = { 
          $regex: location, 
          $options: "i" 
        };
      }

      let photographers = await PhotographerModel.find(query)
        .select("personalInfo businessInfo professionalDetails portfolio status userId")
        .limit(limit || 3)
        .lean();

      let fallbackUsed = false;
      
      if (photographers.length === 0) {
        photographers = await PhotographerModel.find({ status: "APPROVED", isBlock: false })
          .select("personalInfo businessInfo professionalDetails portfolio status userId")
          .limit(limit || 3)
          .lean();
        fallbackUsed = true;
      }

      const enriched = await Promise.all(
        photographers.map(async (p) => {
          const packages = await BookingPackageModel.find({
            photographer: { $in: [p._id, p.userId] },
            status: { $in: ["APPROVED", "ACTIVE"] },
            isActive: true,
          })
            .select("name price baseprice features deliveryTime editedPhoto")
            .limit(5)
            .lean();

          const reviewAgg = await ReviewModel.aggregate([
            { $match: { targetId: p._id } },
            { 
              $group: { 
                _id: null, 
                avgRating: { $avg: "$rating" }, 
                totalReviews: { $sum: 1 } 
              } 
            }
          ]);
          
          const rating = reviewAgg.length > 0 ? Number(reviewAgg[0].avgRating.toFixed(1)) : 0;
          const reviewsCount = reviewAgg.length > 0 ? reviewAgg[0].totalReviews : 0;

          return {
            ...p,
            rating,
            reviews: reviewsCount,
            packages: packages.map(pkg => ({
              id: pkg._id,
              name: pkg.name,
              price: pkg.price || pkg.baseprice,
              features: pkg.features,
              deliveryTime: pkg.deliveryTime,
              editedPhoto: pkg.editedPhoto,
            })),
          };
        })
      );

      return JSON.stringify({
        success: true,
        fallbackUsed,
        searchCriteria: { category, location },
        count: enriched.length,
        photographers: enriched,
      });
    } catch (error) {
      console.error("Search photographers error:", error);
      return JSON.stringify({
        success: false,
        error: "Database error occurred while searching photographers",
      });
    }
  },
  {
    name: "search_photographers",
    description: `Search for approved photographers on the platform. Returns structured JSON with photographer profiles including personal info, business info, rating, review count, and available packages.`,
    schema: z.object({
      category: z.string().optional().describe("Photography category (e.g., 'Wedding Photography', 'Portrait Photography')"),
      location: z.string().optional().describe("City or region to filter by"),
      limit: z.number().optional().describe("Max results to return (default 3, max 5)"),
    }),
  } as any
);

const getPhotographerPackages: any = tool(
  async ({ photographerId }) => {
    try {
      const photographer = await PhotographerModel.findById(photographerId)
        .select("businessInfo.businessName personalInfo.name userId")
        .lean();

      if (!photographer) {
        return JSON.stringify({
          success: false,
          error: "Photographer not found",
        });
      }

      const packages = await BookingPackageModel.find({
        photographer: { $in: [new mongoose.Types.ObjectId(photographerId), photographer.userId] },
        status: { $in: ["APPROVED", "ACTIVE"] },
        isActive: true,
      })
        .select("name description price baseprice features deliveryTime editedPhoto")
        .lean();

      if (packages.length === 0) {
        return JSON.stringify({
          success: false,
          error: "No packages available for this photographer",
        });
      }

      return JSON.stringify({
        success: true,
        photographerId,
        photographerName: photographer.businessInfo?.businessName || photographer.personalInfo?.name,
        packages: packages.map(pkg => ({
          _id: pkg._id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price || pkg.baseprice,
          baseprice: pkg.baseprice,
          features: pkg.features,
          deliveryTime: pkg.deliveryTime,
          editedPhoto: pkg.editedPhoto,
        })),
      });
    } catch (error) {
      console.error("Get packages error:", error);
      return JSON.stringify({
        success: false,
        error: "Error fetching packages",
      });
    }
  },
  {
    name: "get_photographer_packages",
    description: `Fetch all available packages for a specific photographer. Returns structured JSON with package details including pricing, features, and delivery timeline.`,
    schema: z.object({
      photographerId: z.string().describe("MongoDB ObjectId of the photographer"),
    }),
  } as any
);

const getPhotographerAvailability: any = tool(
  async ({ photographerId, days = 30 }) => {
    try {
      const photographer = await PhotographerModel.findById(photographerId).select("userId").lean();
      if (!photographer) return JSON.stringify({ success: false, error: "Photographer not found" });

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const availability = await AvailabilityModel.find({
        photographer: new mongoose.Types.ObjectId(photographerId),
        date: { $gte: startDate, $lte: endDate }
      }).lean();

      const bookings = await BookingModel.find({
        photographerId: photographer.userId,
        eventDate: { $gte: startDate, $lte: endDate },
        status: { $in: ["pending", "accepted", "waiting_for_deposit", "work_started"] }
      }).select("eventDate startTime").lean();

      const formattedAvailability = availability.map((a) => ({
        date: a.date.toISOString().split("T")[0],
        isFullDay: a.isFullDayAvailable,
        slots: a.slots
          .filter((s) => s.status === "AVAILABLE")
          .map((s) => s.startTime),
      }));

      const bookedDates = bookings.map((b) =>
        b.eventDate.toISOString().split("T")[0],
      );

      return JSON.stringify({
        success: true,
        photographerId,
        availableSlots: formattedAvailability,
        bookedDates: [...new Set(bookedDates)],
      });
    } catch (error) {
      console.error("Get availability error:", error);
      return JSON.stringify({
        success: false,
        error: "Error fetching availability",
      });
    }
  },
  {
    name: "get_photographer_availability",
    description: "Get available dates and time slots for a photographer for the next 30 days.",
    schema: z.object({
      photographerId: z.string().describe("MongoDB ObjectId of the photographer"),
      days: z.number().optional().describe("Number of days to check (default 30)"),
    }),
  } as any
);

const createBooking: any = tool(
  async ({ 
    photographerId, 
    packageId, 
    eventDate, 
    startTime, 
    location, 
    eventType, 
    contactName,
    contactEmail,
    contactPhone,
    userId 
  }) => {
    try {
      const pkg = await BookingPackageModel.findById(packageId);
      if (!pkg) {
        return JSON.stringify({
          success: false,
          error: "Package not found or no longer available",
        });
      }

      const photographer = await PhotographerModel.findById(photographerId);
      if (!photographer || photographer.status !== "APPROVED") {
        return JSON.stringify({
          success: false,
          error: "Photographer not available for booking",
        });
      }

      const checkDate = new Date(eventDate);
      checkDate.setHours(0, 0, 0, 0);
      
      const existingBooking = await BookingModel.findOne({
        photographerId: photographer.userId,
        eventDate: checkDate,
        startTime,
        status: { $in: ["pending", "accepted", "waiting_for_deposit"] }
      });

      if (existingBooking) {
        return JSON.stringify({
          success: false,
          error: `The slot ${eventDate} at ${startTime} is already booked. Please choose another time.`
        });
      }

      const totalAmount = pkg.price || pkg.baseprice;
      const depositRequired = totalAmount * 0.2;

      const booking = new BookingModel({
        userId: new mongoose.Types.ObjectId(userId),
        photographerId: photographer.userId,
        packageId: new mongoose.Types.ObjectId(packageId),
        packageDetails: pkg,
        eventDate: new Date(eventDate),
        startTime,
        depositeRequired: depositRequired,
        totalAmount,
        location,
        eventType,
        contactDetails: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
        status: "pending",
        paymentStatus: "pending",
      });

      await booking.save();

      return JSON.stringify({
        success: true,
        bookingId: booking.bookingId,
        totalAmount,
        depositRequired,
        photographerName: photographer.businessInfo?.businessName || photographer.personalInfo?.name,
        packageName: pkg.name,
        eventDate,
        startTime,
      });
    } catch (error) {
      console.error("Create booking error:", error);
      return JSON.stringify({
        success: false,
        error: "Failed to create booking. Please try again or book manually.",
      });
    }
  },
  {
    name: "create_booking",
    description: `Create a new booking. ONLY call this when ALL 9 required fields are collected: photographerId, packageId, eventDate (YYYY-MM-DD), startTime, location, eventType, contactName, contactEmail, contactPhone.`,
    schema: z.object({
      photographerId: z.string().describe("MongoDB ObjectId of photographer"),
      packageId: z.string().describe("MongoDB ObjectId of selected package"),
      eventDate: z.string().describe("Event date in YYYY-MM-DD format"),
      startTime: z.string().describe("Event start time (e.g., '10:00 AM')"),
      location: z.string().describe("Event location/venue address"),
      eventType: z.string().describe("Type of event (e.g., Wedding, Birthday)"),
      contactName: z.string().describe("User's full name"),
      contactEmail: z.string().describe("User's email address"),
      contactPhone: z.string().describe("User's phone number"),
      userId: z.string().describe("MongoDB ObjectId of the user"),
    }),
  } as any
);

const tools = [
  searchPhotographers, 
  getPhotographerPackages, 
  getPhotographerAvailability, 
  createBooking
] as any[];

// ============================================================================
// MAIN CHATBOT HANDLER WITH LANGCHAIN MEMORY
// ============================================================================

export const getChatbotResponse = async (
  messages: ChatMessage[],
  userId: string,
  sessionId: string = "default"
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 85_000);

  try {
    // 1. Load conversation state from database
    let chatHistory = await ChatHistoryModel.findOne({ userId, sessionId });
    if (!chatHistory) {
      chatHistory = new ChatHistoryModel({ 
        userId, 
        sessionId, 
        messages: [],
        metadata: { state: { phase: "GREETING" } }
      });
    }

    const conversationState: ConversationState = 
      (chatHistory.metadata?.state as ConversationState) || { phase: "GREETING" };

    // 2. Get or create LangChain memory for this session
    const memoryKey = `${userId}_${sessionId}`;
    let memory = memoryCache.get(memoryKey);

    if (!memory) {
      // Initialize memory from database history
      const messageHistory = new ChatMessageHistory();
      
      // Load last 6 messages from DB into memory
      const recentMessages = chatHistory.messages.slice(-6);
      for (const msg of recentMessages) {
        if (msg.role === "user") {
          await (messageHistory as any).addMessage(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          await (messageHistory as any).addMessage(new AIMessage(msg.content));
        }
      }

      // Create memory with auto-summarization
      const summarizerModel = new ChatGroq({
        model: "llama-3.1-8b-instant",
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0,
        maxTokens: 256,
      });

      memory = new ConversationSummaryBufferMemory({
        llm: summarizerModel as any,
        chatHistory: messageHistory,
        memoryKey: "chat_history",
        maxTokenLimit: 800,
        returnMessages: true,
      });

      memoryCache.set(memoryKey, memory);
    }

    // 3. Initialize main LLM
    if (!process.env.GROQ_API_KEY) {
      return { success: false, message: "AI Assistant not configured." };
    }

    const model = new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.1,
      maxRetries: 0,
      maxTokens: 1024,
    });

    // 4. Create prompt template with memory placeholder
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT.replace("{phase}", conversationState.phase)],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // 5. Create agent with tools
    const agent = await createToolCallingAgent({
      llm: model as any,
      tools: tools as any,
      prompt: prompt as any,
    } as any);

    const agentExecutor = new AgentExecutor({
      agent: agent as any,
      tools: tools as any[],
      memory,
      verbose: false,
      maxIterations: 3,
    });

    // 6. Get last user message
    const lastMessage = messages[messages.length - 1].content;

    // 7. Invoke agent with retry logic
    const response = (await retryWithBackoff(
      () => agentExecutor.invoke(
        { input: lastMessage },
        { signal: controller.signal }
      ),
      {
        maxRetries: 3,
        initialDelayMs: 2000,
        shouldRetry: (error: any) => {
          return (
            error?.response?.status === 429 ||
            error?.response?.data?.error?.code === "rate_limit_exceeded" ||
            error?.code === "ETIMEDOUT" ||
            error?.response?.status === 503
          );
        }
      }
    )) as any;

    const finalContent = response.output;

    // 8. Extract structured data from agent's intermediate steps
    let structuredResponse = null;
    const intermediateSteps = response.intermediateSteps || [];

    for (const step of intermediateSteps) {
      const toolName = step.action?.tool;
      const toolOutput = step.observation;

      if (!toolOutput) continue;

      try {
        const parsed = JSON.parse(toolOutput);

        if (toolName === "search_photographers" && parsed.success) {
          conversationState.phase = "BROWSING";
          structuredResponse = {
            type: "photographer_list",
            data: parsed.photographers,
          };
        } else if (toolName === "get_photographer_packages" && parsed.success) {
          conversationState.phase = "COMPARING";
          structuredResponse = {
            type: "package_list",
            photographerId: parsed.photographerId,
            data: parsed.packages,
          };
        } else if (toolName === "get_photographer_availability" && parsed.success) {
          structuredResponse = {
            type: "availability_picker",
            photographerId: parsed.photographerId,
            data: {
              availableSlots: parsed.availableSlots,
              bookedDates: parsed.bookedDates
            },
          };
        } else if (toolName === "create_booking" && parsed.success) {
          conversationState.phase = "BOOKING_CONFIRMED";
          structuredResponse = {
            type: "booking_confirmation",
            bookingId: parsed.bookingId,
          };
        }
      } catch (e) {
        console.error("Failed to parse tool output:", e);
      }
    }

    // 9. Save to database
    chatHistory.messages.push(
      { role: "user", content: lastMessage, timestamp: new Date() } as any,
      { role: "assistant", content: finalContent, timestamp: new Date() } as any
    );

    if (chatHistory.messages.length > 10) {
      chatHistory.messages = chatHistory.messages.slice(-10);
    }

    chatHistory.lastMessageAt = new Date();
    chatHistory.metadata = { state: conversationState };
    
    chatHistory.save().catch(err => 
      console.error("Failed to save chat history:", err)
    );

    clearTimeout(timeoutId);
    
    return {
      success: true,
      message: finalContent,
      structuredData: structuredResponse,
      conversationPhase: conversationState.phase,
    };

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[Chatbot Service] Error:", error);

    if ((error as any).name === "AbortError") {
      return {
        success: false,
        message: "Request timed out. Please try again in a few seconds.",
      };
    }

    if ((error as any)?.response?.status === 429 || 
        (error as any)?.response?.data?.error?.code === "rate_limit_exceeded") {
      return {
        success: false,
        message: "I'm receiving too many requests right now. Please wait 10 seconds and try again.",
        error: { type: "RATE_LIMIT", retryAfter: 10 }
      };
    }

    return {
      success: false,
      message: `Service temporarily unavailable. Please try again.`,
    };
  }
};

// Memory cleanup
export const clearInactiveMemories = () => {
  const cacheSize = memoryCache.size;
  if (cacheSize > 100) {
    console.log(`[Memory Cleanup] Clearing ${cacheSize} cached memories`);
    memoryCache.clear();
  }
};

setInterval(clearInactiveMemories, 30 * 60 * 1000);
