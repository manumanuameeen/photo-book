import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";

// Models - Using Absolute Paths (Relative to src baseUrl)
import { PhotographerModel } from "models/photographer.model";
import { BookingPackageModel } from "models/bookingPackage.model";
import { BookingModel } from "models/booking.model";
import { ReviewModel } from "models/review.model";
import { AvailabilityModel } from "models/availability.model";

import { ChatbotPhase, ChatbotResult, ChatbotStructuredData } from "./shutter.types";

/**
 * ============================================================================
 * IMPROVED SYSTEM PROMPT - The most critical fix
 * ============================================================================
 */
const SYSTEM_PROMPT = `You are Shutter, the Photo-book photography booking assistant.

IDENTITY & RULES:
- You help with: finding photographers, viewing packages, and booking sessions.
- You MUST use the available tools to show data for photographers and packages.
- NEVER include photographer names, prices, or ratings in your final message to the user.
- Keep your messages very short (under 15 words) when you are showing data from a tool.
- Do NOT show any internal code tags or JSON to the user.

Current Progress:
Phase: {phase}
Context: {context}`;

/**
 * ============================================================================
 * CONTEXT EXTRACTOR - Reduces token usage and tracks state
 * ============================================================================
 */
interface ConversationContext {
  phase: ChatbotPhase;
  photographerId?: string;
  photographerName?: string;
  packageId?: string;
  packageName?: string;
  eventType?: string;
  eventDate?: string;
  partialBookingData?: Record<string, string>;
}

function extractContext(history: any[]): ConversationContext {
  console.log(`[ShutterAgent:extractContext] Scanning history (${history.length} messages)...`);
  const ctx: ConversationContext = { 
    phase: "GREETING",
    partialBookingData: {}
  };

  for (const msg of history) {
    if (msg.structuredData) {
      if (msg.structuredData.type === "photographer_list") ctx.phase = "BROWSING";
      if (msg.structuredData.type === "package_list") {
        ctx.phase = "COMPARING";
        ctx.photographerId = msg.structuredData.photographerId || ctx.photographerId;
      }
      if (msg.structuredData.type === "booking_confirmation") {
        ctx.phase = "BOOKING_CONFIRMED";
        ctx.packageId = msg.structuredData.packageId || ctx.packageId;
      }
    }

    if (msg.role === "user") {
      const content = msg.content || "";
      const photoMatch = content.match(/photographer.*?ID:\s*([a-f0-9]{24})/i);
      if (photoMatch) { ctx.photographerId = photoMatch[1]; ctx.phase = "COMPARING"; }

      const pkgMatch = content.match(/package.*?ID:\s*([a-f0-9]{24})/i);
      if (pkgMatch) { ctx.packageId = pkgMatch[1]; ctx.phase = "BOOKING_INITIATED"; }

      const eventTypes = ["wedding", "portrait", "event", "corporate", "maternity", "newborn"];
      for (const evt of eventTypes) {
        if (content.toLowerCase().includes(evt)) {
          ctx.eventType = evt.charAt(0).toUpperCase() + evt.slice(1);
          break;
        }
      }
    }
  }

  console.log(`[ShutterAgent:extractContext] State: ${ctx.phase}, PhotogId: ${ctx.photographerId}`);
  return ctx;
}

/**
 * ============================================================================
 * SHUTTER AGENT - Final Stabilization version
 * ============================================================================
 */
export class ShutterAgent {
  private readonly model: ChatGroq;
  private readonly tools: any[];

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    this.model = new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.1,
      maxRetries: 2,
      maxTokens: 512, 
    });

    this.tools = this.initializeTools();
  }

  private initializeTools() {
    const search_photographers = tool(
      async ({ category, location, limit = 3 }) => {
        console.log(`[ShutterAgent:Tool] search_photographers [${category}, ${location}]`);
        try {
          const query: any = { status: "APPROVED", isBlock: false };
          if (category) {
            const normalizedCategory = category.toLowerCase();
            const categoryMap: Record<string, string> = {
              wedding: "Wedding Photography",
              portrait: "Portrait Photography",
              event: "Event Photography",
              corporate: "Corporate Photography",
              maternity: "Maternity Photography",
            };
            const searchTerm = categoryMap[normalizedCategory] || category;
            query["professionalDetails.specialties"] = { $regex: searchTerm, $options: "i" };
          }
          if (location) query["personalInfo.location"] = { $regex: location, $options: "i" };

          const photographers = await PhotographerModel.find(query).limit(Math.min(limit, 5)).lean();
          
          if (photographers.length === 0) {
            return JSON.stringify({ success: false, message: "No photographers found." });
          }

          const enriched = await Promise.all(
            photographers.map(async (p: any) => {
              const reviews = await ReviewModel.find({ targetId: p._id });
              const avg = reviews.length > 0
                ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                : 0;

              return {
                _id: p._id,
                personalInfo: { name: p.personalInfo.name, location: p.personalInfo.location },
                businessInfo: { businessName: p.businessInfo?.businessName || p.personalInfo.name },
                professionalDetails: {
                  priceRange: p.professionalDetails.priceRange,
                  specialties: p.professionalDetails.specialties.slice(0, 3),
                },
                portfolio: { portfolioImages: p.portfolio?.portfolioImages?.slice(0, 1) || [] },
                rating: Number(avg.toFixed(1)),
                reviews: reviews.length,
              };
            })
          );

          return JSON.stringify({ success: true, photographers: enriched, _event: "PHASE_CHANGE", _nextPhase: "BROWSING" });
        } catch (error: any) {
          return JSON.stringify({ success: false, message: "Search failed." });
        }
      },
      {
        name: "search_photographers",
        description: "Search for approved photographers by category and location.",
        schema: z.object({
          category: z.string().optional(),
          location: z.string().optional(),
          limit: z.number().optional().default(3),
        }),
      }
    );

    const get_photographer_packages = tool(
      async ({ photographerId }) => {
        console.log(`[ShutterAgent:Tool] get_photographer_packages [${photographerId}]`);
        try {
          if (!mongoose.Types.ObjectId.isValid(photographerId)) 
            return JSON.stringify({ success: false, message: "Invalid ID." });

          const packages = await BookingPackageModel.find({
            photographer: new mongoose.Types.ObjectId(photographerId),
            isActive: true,
            status: { $in: ["APPROVED", "ACTIVE"] },
          }).limit(10).lean();

          if (packages.length === 0) 
            return JSON.stringify({ success: false, message: "No packages found." });

          return JSON.stringify({
            success: true,
            photographerId,
            packages: packages.map((pkg: any) => ({
              _id: pkg._id,
              name: pkg.name,
              description: pkg.description?.substring(0, 150) || "",
              price: pkg.price || pkg.baseprice,
              features: pkg.features?.slice(0, 5) || [],
              deliveryTime: pkg.deliveryTime,
            })),
            _event: "PHASE_CHANGE",
            _nextPhase: "COMPARING",
          });
        } catch (error: any) {
          return JSON.stringify({ success: false, message: "Package fetch failed." });
        }
      },
      {
        name: "get_photographer_packages",
        description: "Get booking packages for a特定 photographer.",
        schema: z.object({ photographerId: z.string() }),
      }
    );

    const get_photographer_availability = tool(
      async ({ photographerId, days = 30 }) => {
        console.log(`[ShutterAgent:Tool] get_photographer_availability [${photographerId}, ${days}]`);
        try {
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (days || 30));

          const availability = await AvailabilityModel.find({
            photographer: new mongoose.Types.ObjectId(photographerId),
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          if (availability.length === 0) 
            return JSON.stringify({ success: false, message: "No specific availability set." });

          const formatted = availability.map((a: any) => ({
            date: a.date.toISOString().split("T")[0],
            isFullDay: a.isFullDayAvailable,
            slots: a.slots?.filter((s: any) => s.status === "AVAILABLE").map((s: any) => s.startTime) || [],
          }));

          return JSON.stringify({ success: true, photographerId, availableSlots: formatted });
        } catch (error: any) {
          return JSON.stringify({ success: false, message: "Availability check failed." });
        }
      },
      {
        name: "get_photographer_availability",
        description: "Check if a photographer is free. Returns a list of available slots.",
        schema: z.object({
          photographerId: z.string(),
          days: z.number().optional().default(30),
        }),
      }
    );

    const create_booking = tool(
      async (args: any) => {
        console.log(`[ShutterAgent:Tool] create_booking [${args.photographerId}]`);
        try {
          const photographer = await PhotographerModel.findById(args.photographerId);
          if (!photographer) return JSON.stringify({ success: false, message: "Photographer not found." });

          const pkg = await BookingPackageModel.findById(args.packageId);
          if (!pkg) return JSON.stringify({ success: false, message: "Package not found." });

          const totalAmount = pkg.price || pkg.baseprice;
          const depositRequired = totalAmount * 0.2;

          const booking = new BookingModel({
            userId: new mongoose.Types.ObjectId(args.userId),
            photographerId: photographer.userId,
            packageId: new mongoose.Types.ObjectId(args.packageId),
            packageDetails: pkg,
            eventDate: new Date(args.eventDate),
            startTime: args.startTime,
            depositeRequired: depositRequired,
            totalAmount,
            location: args.location,
            eventType: args.eventType,
            contactDetails: {
              name: args.contactName,
              email: args.contactEmail,
              phone: args.contactPhone,
            },
          });

          await booking.save();
          console.log(`[ShutterAgent:Tool] Finalized Booking: ${booking.bookingId}`);

          return JSON.stringify({ success: true, bookingId: booking.bookingId, _event: "PHASE_CHANGE", _nextPhase: "BOOKING_CONFIRMED" });
        } catch (error: any) {
          return JSON.stringify({ success: false, message: "Booking creation failed." });
        }
      },
      {
        name: "create_booking",
        description: "ONLY call when ALL 9 fields are collected.",
        schema: z.object({
          photographerId: z.string(),
          packageId: z.string(),
          eventDate: z.string(),
          startTime: z.string(),
          location: z.string(),
          eventType: z.string(),
          contactName: z.string(),
          contactEmail: z.string().email(),
          contactPhone: z.string(),
          userId: z.string(),
        }),
      }
    );

    return [search_photographers, get_photographer_packages, get_photographer_availability, create_booking];
  }

  public async run(
    userInput: string,
    chatHistory: any[],
    currentPhase: ChatbotPhase,
    userId: string,
  ): Promise<ChatbotResult> {
    console.log(`[ShutterAgent:run] Starting execution flow...`);
    
    // 1. Context & Setup
    const context = extractContext(chatHistory);
    const contextString = JSON.stringify(context, null, 2);

    const recentMessages = chatHistory.slice(-4);
    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(),
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
      returnMessages: true,
    });

    for (const msg of recentMessages) {
      if (msg.role === "user") await memory.chatHistory.addMessage(new HumanMessage(msg.content) as any);
      else if (msg.role === "assistant") await memory.chatHistory.addMessage(new AIMessage(msg.content) as any);
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createToolCallingAgent({
      llm: this.model as any,
      tools: this.tools,
      prompt: prompt as any,
    });

    const executor = new AgentExecutor({ 
      agent, 
      tools: this.tools, 
      memory, 
      maxIterations: 3,
      handleParsingErrors: true,
      verbose: true
    });

    try {
      const inputWithContext = `${userInput} [userId: ${userId}]`;
      console.log(`[ShutterAgent:run] Invoking executor...`);
      
      const response = await executor.invoke({ 
        input: inputWithContext,
        phase: currentPhase,
        context: contextString,
      });
      
      console.log(`[ShutterAgent:run] Invoke complete.`);

      let structuredData: ChatbotStructuredData | undefined = undefined;
      let nextPhase = currentPhase;

      if (response.intermediateSteps) {
        console.log(`[ShutterAgent:run] Parsing ${response.intermediateSteps.length} steps...`);
        for (const step of response.intermediateSteps) {
          // IMPORTANT: Convert observation back to JSON object
          const observation = step.observation;
          const res = typeof observation === "string" ? JSON.parse(observation) : observation;
          
          if (typeof res !== "object" || !res.success) continue;

          if (res._event === "PHASE_CHANGE") nextPhase = res._nextPhase;

          if (step.action.tool === "search_photographers") {
            structuredData = { type: "photographer_list", data: res.photographers };
          } else if (step.action.tool === "get_photographer_packages") {
            structuredData = { type: "package_list", photographerId: res.photographerId, data: res.packages };
          } else if (step.action.tool === "get_photographer_availability") {
             structuredData = { type: "availability_picker", photographerId: res.photographerId, data: { availableSlots: res.availableSlots, bookedDates: [] } };
          } else if (step.action.tool === "create_booking") {
            structuredData = { type: "booking_confirmation", bookingId: res.bookingId };
          }
        }
      }

      return { success: true, message: response.output, structuredData, nextPhase };
    } catch (error: any) {
      console.error(`[ShutterAgent:run] CRITICAL AGENT ERROR:`, error);
      throw error;
    }
  }
}
