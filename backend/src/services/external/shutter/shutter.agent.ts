import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";

// Models - Using Relative Paths for Docker build safety
import { PhotographerModel } from "../../../models/photographer.model";
import { BookingPackageModel } from "../../../models/bookingPackage.model";
import { BookingModel } from "../../../models/booking.model";
import { ReviewModel } from "../../../models/review.model";
import { AvailabilityModel } from "../../../models/availability.model";

import { ChatbotPhase, ChatbotResult, ChatbotStructuredData } from "./shutter.types";

/**
 * ============================================================================
 * IMPROVED SYSTEM PROMPT - The most critical fix
 * ============================================================================
 */
const SYSTEM_PROMPT = `You are Shutter, the Photo-book photography booking assistant.

CORE RULES:
- You help with: finding photographers, viewing packages, and booking sessions.
- To call a tool, your entire message MUST be a single Markdown JSON block:
\`\`\`json
{
  "action": "tool_name",
  "args": { ... }
}
\`\`\`
- ONLY use the 4 tools listed below. NEVER invent new tool names.
- After the tool result is provided, GIVE A CLEAN FINAL RESPONSE (under 15 words).
- NEVER list photographer names, prices, or ratings in your final text.
- Do NOT show any internal JSON or tags to the user.

Available Tools:
1. search_photographers: finding photographers by category/location
2. get_photographer_packages: listing packages for a specific photographer
3. get_photographer_availability: checking dates
4. create_booking: COMPLETE the booking when all 10 fields are clear

Current State:
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
      if (photoMatch) {
        ctx.photographerId = photoMatch[1]; ctx.phase = "COMPARING";
        console.log("[ShutterAgent:extractContext] Photographer ID found:", photoMatch[1]);
      }

      const pkgMatch = content.match(/package.*?ID:\s*([a-f0-9]{24})/i);
      if (pkgMatch) {
        ctx.packageId = pkgMatch[1]; ctx.phase = "BOOKING_INITIATED";

      }

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
  private readonly model: ChatOpenAI;
  private readonly tools: any[];

  constructor() {
    this.model = new ChatOpenAI({
      model: process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5:free",
      apiKey: process.env.OPENROUTER_API_KEY,
      temperature: 0,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://photo-book.app",
          "X-Title": "Photo-book",
        },
      },
    });

    this.tools = this.initializeTools();
  }

  private initializeTools() {
    const search_photographers = tool(
      async ({ category, location, limit = 3 }: { category?: string; location?: string; limit?: number }) => {
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
        } catch {
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
        }) as any,
      }
    );

    const get_photographer_packages = tool(
      async ({ photographerId }: { photographerId: string }) => {
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
        } catch {
          return JSON.stringify({ success: false, message: "Package fetch failed." });
        }
      },
      {
        name: "get_photographer_packages",
        description: "Get booking packages for a特定 photographer.",
        schema: z.object({ photographerId: z.string() }) as any,
      }
    );

    const get_photographer_availability = tool(
      async ({ photographerId, days = 30 }: { photographerId: string; days?: number }) => {
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
        } catch {
          return JSON.stringify({ success: false, message: "Availability check failed." });
        }
      },
      {
        name: "get_photographer_availability",
        description: "Check if a photographer is free. Returns a list of available slots.",
        schema: z.object({
          photographerId: z.string(),
          days: z.number().optional().default(30),
        }) as any,
      }
    );

    const create_booking = tool(
      async (args: {
        photographerId: string;
        packageId: string;
        eventDate: string;
        startTime: string;
        location: string;
        eventType: string;
        contactName: string;
        contactEmail: string;
        contactPhone: string;
        userId: string;
      }) => {
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
        } catch {
          return JSON.stringify({ success: false, message: "Booking creation failed." });
        }
      },
      {
        name: "create_booking",
        description: "ONLY call when ALL 10 fields are collected.",
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
        }) as any,
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
    console.log("[ShutterAgent:run] Starting JSON-Mode execution loop...");
    
    const context = extractContext(chatHistory);
    const contextString = JSON.stringify(context, null, 2);
    
    // Prepare System Message
    const systemMsg = SYSTEM_PROMPT
      .replace("{phase}", currentPhase)
      .replace("{context}", contextString);

    const messages: BaseMessage[] = [new SystemMessage(systemMsg)];

    // Add History (limited)
    const recentHistory = chatHistory.slice(-4);
    for (const msg of recentHistory) {
      if (msg.role === "user") messages.push(new HumanMessage(msg.content));
      else if (msg.role === "assistant") messages.push(new AIMessage(msg.content));
    }

    // Add current user input
    const inputWithContext = `${userInput} [userId: ${userId}]`;
    messages.push(new HumanMessage(inputWithContext));

    let structuredData: ChatbotStructuredData | undefined = undefined;
    let nextPhase = currentPhase;
    let finalMessage = "I've gathered some great options for you. Take a look below!";
    let iterations = 0;

    while (iterations < 5) {
      iterations++;
      console.log(`[ShutterAgent:run] Iteration ${iterations}...`);
      
      const response = await this.model.invoke(messages);
      const content = response.content as string;
      messages.push(new AIMessage(content));

      console.log(`[ShutterAgent:run] Raw AI Response snippet: "${content.substring(0, 100)}..."`);

      // Regex to find ```json (.*?) ```
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        try {
          // Clean the JSON string (remove potential double braces or stray text)
          let jsonStr = jsonMatch[1].trim();
          if (jsonStr.startsWith("{{")) jsonStr = jsonStr.substring(1);
          if (jsonStr.endsWith("}}")) jsonStr = jsonStr.substring(0, jsonStr.length - 1);
          
          const call = JSON.parse(jsonStr);
          const toolName = call.action;
          const toolArgs = call.args;
          console.log(`[ShutterAgent:run] Detected Tool: ${toolName}`);

          let toolResultStr = "";

          // Manual Tool Dispatcher
          if (toolName === "search_photographers") {
            const results = await (this.tools[0] as any).func(toolArgs);
            const res = JSON.parse(results);
            if (res.success) {
              structuredData = { type: "photographer_list", data: res.photographers };
              nextPhase = res._nextPhase || nextPhase;
            }
            toolResultStr = results;
          } else if (toolName === "get_photographer_packages") {
            const results = await (this.tools[1] as any).func(toolArgs);
            const res = JSON.parse(results);
            if (res.success) {
              structuredData = { type: "package_list", photographerId: res.photographerId, data: res.packages };
              nextPhase = res._nextPhase || nextPhase;
            }
            toolResultStr = results;
          } else if (toolName === "get_photographer_availability") {
            const results = await (this.tools[2] as any).func(toolArgs);
            const res = JSON.parse(results);
            if (res.success) {
              structuredData = { type: "availability_picker", photographerId: res.photographerId, data: { availableSlots: res.availableSlots, bookedDates: [] } };
            }
            toolResultStr = results;
          } else if (toolName === "create_booking") {
            const results = await (this.tools[3] as any).func(toolArgs);
            const res = JSON.parse(results);
            if (res.success) {
              structuredData = { type: "booking_confirmation", bookingId: res.bookingId };
              nextPhase = res._nextPhase || nextPhase;
            }
            toolResultStr = results;
          }

          messages.push(new HumanMessage(`JSON_TOOL_RESULT: ${toolResultStr}`));
          continue; // Loop again so AI can generate the final human-friendly response

        } catch (e) {
          console.error("[ShutterAgent:run] JSON Parsing or Tool Execution Error:", e);
          messages.push(new HumanMessage(`Error: Invalid JSON format. Try \`\`\`json { "action": "tool", "args": {...} } \`\`\``));
          continue;
        }
      }

      // If no JSON block found, this is the final finalMessage for the user
      const cleaned = content.replace(/```json[\s\S]*?```/g, "").trim();
      if (cleaned) {
        finalMessage = cleaned;
        break; // Exit loop with the model's actual message
      }
    }

    return { success: true, message: finalMessage, structuredData, nextPhase };
  }
}
