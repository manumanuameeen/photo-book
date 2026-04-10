import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { z } from "zod";
import { tool, StructuredTool } from "@langchain/core/tools";
import mongoose, { FilterQuery } from "mongoose";

// Models
import { PhotographerModel, IPhotographer } from "../../models/photographer.model";
import { BookingPackageModel } from "../../models/bookingPackage.model";
import { ReviewModel } from "../../models/review.model";
import { AvailabilityModel } from "../../models/availability.model";
import { BookingModel } from "../../models/booking.model";
import { IChatMessage } from "../../models/chatHistory.model";

const SYSTEM_PROMPT = `You are Shutter, Photo-book's AI booking agent.

WORKFLOW (strict order):
GREETING → search_photographers → get_photographer_packages → [optional] get_photographer_availability → create_booking

RULES:
- Use tools for ALL data. Never invent results.
- Ask ONE question at a time.
- Only call create_booking when you have ALL required fields: photographerId, packageId, eventDate (YYYY-MM-DD), startTime, location, eventType, contactName, contactEmail, contactPhone.
- Map user input: "wedding"→"Wedding Photography", "portrait"→"Portrait Photography", "event"→"Event Photography"

Current conversation phase: {phase}`;

export interface AgentResult {
  success: boolean;
  message: string;
  structuredData?: Record<string, unknown> | null; // Varies by tool
  conversationPhase: string;
}

export class ShutterAgent {
  private readonly model: ChatGroq;
  private readonly summarizer: ChatGroq;
  private readonly tools: StructuredTool[];
  private readonly userId: string;
  private readonly sessionId: string;

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    this.model = new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.1,
      maxRetries: 2,
    });

    this.summarizer = new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0,
      maxTokens: 256,
    });

    this.tools = this.initializeTools();
  }

  private initializeTools() {
    const search_photographers = tool(
      async (input: any) => {
        const {
          category,
          location,
          limit = 3,
        } = input;
        try {
          const query: FilterQuery<IPhotographer> = { status: "APPROVED", isBlock: false };
          if (category) {
            query["professionalDetails.specialties"] = { $regex: category, $options: "i" };
          }
          if (location) {
            query["personalInfo.location"] = { $regex: location, $options: "i" };
          }

          const photographers = await PhotographerModel.find(query).limit(limit).lean();

          // Mongoose .lean() returns plain objects, cast to interface for type checking
          const enriched = await Promise.all(
            photographers.map(async (p: any) => {
              const reviews = await ReviewModel.find({ targetId: p._id });
              const avg =
                reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

              return {
                _id: p._id,
                name: p.personalInfo.name,
                businessName: p.businessInfo?.businessName,
                specialties: p.professionalDetails.specialties,
                location: p.personalInfo.location,
                rating: Number(avg.toFixed(1)),
                reviews: reviews.length,
                profileImage: p.portfolio?.portfolioImages?.[0] || null,
              };
            }),
          );

          return JSON.stringify({ success: true, photographers: enriched });
        } catch (error) {
          console.error("Tool search_photographers error:", error);
          return JSON.stringify({ success: false, error: "Failed to search photographers" });
        }
      },
      {
        name: "search_photographers",
        description: "Search for approved photographers by category and location.",
        schema: z.object({
          category: z.string().optional(),
          location: z.string().optional(),
          limit: z.number().optional(),
        }),
      },
    );

    const get_packages = tool(
      async (input: any) => {
        const { photographerId } = input;
        try {
          const packages = await BookingPackageModel.find({
            photographer: new mongoose.Types.ObjectId(photographerId),
            isActive: true,
            status: { $in: ["APPROVED", "ACTIVE"] },
          }).lean();

          return JSON.stringify({
            success: true,
            photographerId,
            packages: packages.map((pkg) => ({
              _id: pkg._id,
              name: pkg.name,
              description: pkg.description,
              price: pkg.price || pkg.baseprice,
              features: pkg.features,
              deliveryTime: pkg.deliveryTime,
            })),
          });
        } catch (error) {
          console.error("Tool get_photographer_packages error:", error);
          return JSON.stringify({ success: false, error: "Failed to fetch packages" });
        }
      },
      {
        name: "get_photographer_packages",
        description: "Get all booking packages for a specific photographer.",
        schema: z.object({ photographerId: z.string() }),
      },
    );

    const get_availability = tool(
      async (input: any) => {
        const { photographerId, days = 30 } = input;
        try {
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + days);

          const availability = await AvailabilityModel.find({
            photographer: new mongoose.Types.ObjectId(photographerId),
            date: { $gte: startDate, $lte: endDate },
          }).lean();

          const formatted = availability.map((a: any) => ({
            date: a.date.toISOString().split("T")[0],
            slots: a.slots.filter((s: any) => s.status === "AVAILABLE").map((s: any) => s.startTime),
          }));

          return JSON.stringify({ success: true, photographerId, availableSlots: formatted });
        } catch (error) {
          console.error("Tool get_photographer_availability error:", error);
          return JSON.stringify({ success: false, error: "Failed to check availability" });
        }
      },
      {
        name: "get_photographer_availability",
        description: "Check a photographer's available dates and slots.",
        schema: z.object({
          photographerId: z.string(),
          days: z.number().optional(),
        }),
      },
    );

    const create_booking = tool(
      async (args: any) => {
        try {
          const photographer = await PhotographerModel.findById(args.photographerId);
          if (!photographer)
            return JSON.stringify({ success: false, error: "Photographer not found" });

          const pkg = await BookingPackageModel.findById(args.packageId);
          if (!pkg) return JSON.stringify({ success: false, error: "Package not found" });

          const totalAmount = pkg.price || pkg.baseprice;
          const depositRequired = totalAmount * 0.2;

          const booking = new BookingModel({
            userId: new mongoose.Types.ObjectId(this.userId),
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
            status: "pending",
            paymentStatus: "pending",
          });

          await booking.save();

          return JSON.stringify({
            success: true,
            bookingId: booking.bookingId,
            photographerName: photographer.personalInfo.name,
            packageName: pkg.name,
          });
        } catch (error) {
          console.error("Tool create_booking error:", error);
          return JSON.stringify({ success: false, error: "Failed to create booking" });
        }
      },
      {
        name: "create_booking",
        description:
          "Create a new booking. Requires ALL details including photographer, package, date, and contact info.",
        schema: z.object({
          photographerId: z.string(),
          packageId: z.string(),
          eventDate: z.string(),
          startTime: z.string(),
          location: z.string(),
          eventType: z.string(),
          contactName: z.string(),
          contactEmail: z.string(),
          contactPhone: z.string(),
        }),
      },
    );

    return [search_photographers, get_packages, get_availability, create_booking];
  }

  public async run(userInput: string, chatHistory: IChatMessage[], phase: string): Promise<AgentResult> {
    const memory = new ConversationSummaryBufferMemory({
      llm: this.summarizer,
      chatHistory: new ChatMessageHistory(),
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output", // FIX: Specify output key to resolve LangChain error
      maxTokenLimit: 800,
      returnMessages: true,
    });

    // Sync memory with history
    const recentHistory = chatHistory.slice(-8);
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        await memory.chatHistory.addMessage(new HumanMessage(msg.content));
      } else if (msg.role === "assistant") {
        await memory.chatHistory.addMessage(new AIMessage(msg.content));
      }
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT.replace("{phase}", phase)],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createToolCallingAgent({
      llm: this.model,
      tools: this.tools,
      prompt,
    });

    const executor = new AgentExecutor({
      agent,
      tools: this.tools,
      memory,
      maxIterations: 4,
      verbose: false,
    });

    try {
      const response = await executor.invoke({ input: userInput });

      let structuredData = null;
      let newPhase = phase;

      if (response.intermediateSteps) {
        for (const step of response.intermediateSteps) {
          try {
            const res = JSON.parse(step.observation);
            if (!res.success) continue;

            if (step.action.tool === "search_photographers") {
              structuredData = { type: "photographer_list", data: res.photographers };
              newPhase = "BROWSING";
            } else if (step.action.tool === "get_photographer_packages") {
              structuredData = {
                type: "package_list",
                photographerId: res.photographerId,
                data: res.packages,
              };
              newPhase = "COMPARING";
            } else if (step.action.tool === "get_photographer_availability") {
              structuredData = {
                type: "availability_picker",
                photographerId: res.photographerId,
                data: res.availableSlots,
              };
            } else if (step.action.tool === "create_booking") {
              structuredData = {
                type: "booking_confirmation",
                bookingId: res.bookingId,
              };
              newPhase = "BOOKING_CONFIRMED";
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }

      return {
        success: true,
        message: response.output,
        structuredData,
        conversationPhase: newPhase,
      };
    } catch (error) {
      console.error("[ShutterAgent] Invoke Error:", error);
      throw error;
    }
  }
}
