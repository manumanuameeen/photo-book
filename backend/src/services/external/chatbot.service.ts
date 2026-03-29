import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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

/**
 * ============================================================================
 * REFACTORED CHATBOT SERVICE WITH PROPER AGENT ARCHITECTURE
 * ============================================================================
 * 
 * KEY IMPROVEMENTS:
 * 1. Structured conversation state tracking
 * 2. Domain-aware tools with validation
 * 3. Deterministic error handling
 * 4. Proper JSON escaping via tool returns (not embedded in strings)
 * 5. Multi-stage booking flow with data collection
 * 
 * CONVERSATION STATES:
 * - GREETING: Initial interaction, determine user intent
 * - BROWSING: User is searching/filtering photographers
 * - COMPARING: User is looking at specific photographer packages
 * - BOOKING_INITIATED: User has selected package, collecting booking details
 * - BOOKING_PENDING: Waiting for date/location/contact info
 * - BOOKING_CONFIRMED: Booking created, providing confirmation
 * 
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

// ============================================================================
// DOMAIN KNOWLEDGE: This gets injected into the model's context
// ============================================================================

const getDomainKnowledge = async () => {
  const categories = await CategoryModel.find({
    isActive: true,
    suggestionStatus: "APPROVED",
  }).select("name description").lean();

  const categoryList = categories.map(c => `"${c.name}"`).join(", ");

  return `
=== PHOTO-BOOK PLATFORM DOMAIN KNOWLEDGE ===

## AVAILABLE PHOTOGRAPHY CATEGORIES (EXACT VALUES):
${categoryList}

**CRITICAL**: When searching photographers, you MUST use these exact category names.
Users may say things like:
- "wedding pics" → map to "Wedding Photography"
- "portraits" → map to "Portrait Photography"
- "nature shots" → map to "Nature Photography"

## DATABASE STRUCTURE:
- Photographer.professionalDetails.specialties: Array of categories (from above list)
- Photographer.personalInfo.location: Free text (city/region)
- BookingPackage.status: MUST be "APPROVED" or "ACTIVE" to show users
- BookingPackage.price OR baseprice: Package pricing (prefer price if available)

## BOOKING WORKFLOW:
1. User expresses interest in photography → Search photographers
2. User selects photographer → Show packages for that photographer
3. User selects package → Initiate booking data collection
4. Collect: eventDate (YYYY-MM-DD), startTime (HH:MM AM/PM), location, eventType, contact details
5. Create booking ONLY when ALL required data is present

## SEARCH STRATEGY:
- If user gives vague category → map to closest match from category list
- If user gives no location → search ALL locations (omit location filter)
- If NO EXACT matches found → fetch top 3 approved photographers as recommendations
- ALWAYS return structured data via tool outputs, never invent fake results

## ERROR HANDLING:
- Tool returns empty → Inform user politely, offer alternatives
- Missing booking info → Ask specific follow-up questions (one at a time)
- Tool fails → Apologize, suggest manual booking via profile page

=== END DOMAIN KNOWLEDGE ===
`;
};

// ============================================================================
// STRUCTURED TOOL DEFINITIONS WITH VALIDATION
// ============================================================================

/**
 * Tool 1: Search Photographers
 * Returns structured JSON that frontend can parse directly
 */
const searchPhotographers = tool(
  async ({ category, location, limit = 3 }) => {
    try {
      // Build query with validated category mapping
      const query: any = { status: "APPROVED" };
      
      if (category) {
        // Category should already be mapped by model from domain knowledge
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
      
      // Fallback: If no matches, get top rated photographers
      if (photographers.length === 0) {
        photographers = await PhotographerModel.find({ status: "APPROVED", isBlock: false })
          .select("personalInfo businessInfo professionalDetails portfolio status userId")
          .limit(limit || 3)
          .lean();
        fallbackUsed = true;
      }

      // Enrich with packages and ratings
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

      // Return structured response
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
    description: `Search for approved photographers on the platform. 
    
Returns structured JSON with photographer profiles including:
- Personal info (name, location, specialties)
- Business info (business name, bio)
- Rating and review count
- Available packages with pricing

**Usage Guidelines**:
- Map user's category input to exact category name from domain knowledge
- Omit location if user doesn't specify one (searches all locations)
- If no results, fallbackUsed=true and returns top photographers as recommendations`,
    schema: z.object({
      category: z.string().optional().describe("Exact photography category from domain knowledge list"),
      location: z.string().optional().describe("City or region to filter by"),
      limit: z.number().optional().describe("Max results to return (default 3, max 5)"),
    }),
  }
);

/**
 * Tool 2.5: Get Photographer Availability
 * Fetches available dates and times for a photographer
 */
const getPhotographerAvailability = tool(
  async ({ photographerId, days = 30 }) => {
    try {
      const photographer = await PhotographerModel.findById(photographerId).select("userId").lean();
      if (!photographer) return JSON.stringify({ success: false, error: "Photographer not found" });

      const startDate = new Date();
      startDate.setHours(0,0,0,0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      // Query availability entries
      const availability = await AvailabilityModel.find({
        photographer: new mongoose.Types.ObjectId(photographerId),
        date: { $gte: startDate, $lte: endDate }
      }).lean();

      // Query existing bookings to mark slots as booked
      const bookings = await BookingModel.find({
        photographerId: photographer.userId,
        eventDate: { $gte: startDate, $lte: endDate },
        status: { $in: ["pending", "accepted", "waiting_for_deposit", "work_started"] }
      }).select("eventDate startTime").lean();

      // Format for AI and Frontend
      const formattedAvailability = availability.map((a) => ({
        date: a.date.toISOString().split("T")[0],
        isFullDay: a.isFullDayAvailable,
        slots: a.slots
          .filter((s) => s.status === "AVAILABLE")
          .map((s) => s.startTime),
      }));

      // Add bookings as blocked dates if not already in availability
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
  }
);

/**
 * Tool 2: Get Photographer Packages
 * Fetches detailed package info for a specific photographer
 */
const getPhotographerPackages = tool(
  async ({ photographerId }) => {
    try {
      // Validate photographer exists
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
        photographerName: photographer.businessInfo?.businessName || photographer.personalInfo?.name,
        packages: packages.map(pkg => ({
          id: pkg._id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price || pkg.baseprice,
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
    description: `Fetch all available packages for a specific photographer.

Returns structured JSON with package details including:
- Name and description
- Pricing
- Features list
- Delivery timeline
- Number of edited photos included

Use this when user shows interest in a specific photographer from search results.`,
    schema: z.object({
      photographerId: z.string().describe("MongoDB ObjectId of the photographer"),
    }),
  }
);

/**
 * Tool 3: Create Booking
 * ONLY call this when ALL required fields are collected
 */
const createBooking = tool(
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
      // Validate package exists
      const pkg = await BookingPackageModel.findById(packageId);
      if (!pkg) {
        return JSON.stringify({
          success: false,
          error: "Package not found or no longer available",
        });
      }

      // Validate photographer exists and is approved
      const photographer = await PhotographerModel.findById(photographerId);
      if (!photographer || photographer.status !== "APPROVED") {
        return JSON.stringify({
          success: false,
          error: "Photographer not available for booking",
        });
      }

      // Check availability for the specific date/time
      const checkDate = new Date(eventDate);
      checkDate.setHours(0,0,0,0);
      
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

      // Create booking
      const totalAmount = pkg.price || pkg.baseprice;
      const depositRequired = totalAmount * 0.2; // 20% deposit

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
    description: `Create a new booking for a user.

**CRITICAL**: Only call this tool when ALL of these fields have been collected:
- photographerId (from search results)
- packageId (from package selection)
- eventDate (YYYY-MM-DD format)
- startTime (e.g., "10:00 AM")
- location (event venue/address)
- eventType (e.g., "Wedding", "Birthday", "Corporate Event")
- contactName (user's full name)
- contactEmail (valid email)
- contactPhone (phone number)

If ANY field is missing, ask the user for it before calling this tool.
Returns booking confirmation with booking ID and payment details.`,
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
  }
);

const tools = [searchPhotographers, getPhotographerPackages, getPhotographerAvailability, createBooking];

// ============================================================================
// SYSTEM PROMPTS FOR DIFFERENT CONVERSATION PHASES
// ============================================================================

const getSystemPromptForPhase = (phase: ConversationState["phase"], domainKnowledge: string) => {
  const basePrompt = `You are Shutter, Photo-book's AI assistant. 
${domainKnowledge}
## RULES:
- Use tools for real data; NEVER invent results.
- interactive cards appear automatically; don't embed JSON.
- Ask ONE question at a time.
- If tools fail, suggest manual booking on profile.`;

  const phaseInstructions: Record<ConversationState["phase"], string> = {
    GREETING: `
## CURRENT PHASE: GREETING
User just started conversation. Your goal:
- Understand what they're looking for (category, location, event type)
- If they give search criteria, call search_photographers tool
- If they're vague ("I need a photographer"), ask: "What type of photography are you looking for?"
- Keep tone warm and helpful`,

    BROWSING: `
## CURRENT PHASE: BROWSING
User is viewing photographer search results. Your goal:
- Help them compare photographers
- If they ask about a specific photographer, prepare to call get_photographer_packages
- If they want to refine search, call search_photographers again with new criteria`,

    COMPARING: `
## CURRENT PHASE: COMPARING
User is looking at packages for a specific photographer. Your goal:
- Explain package differences clearly
- If they select a package, transition to BOOKING_INITIATED phase
- Start collecting booking details: eventDate, startTime, location, eventType, contact info`,

    BOOKING_INITIATED: `
## CURRENT PHASE: BOOKING_INITIATED
User has selected a photographer and package. Your goal:
- Collect booking information systematically
- Ask for ONE piece of info at a time:
  1. Event date (YYYY-MM-DD)
  2. Start time (e.g., 10:00 AM)
  3. Event location/venue
  4. Event type (Wedding, Birthday, etc.)
  5. Contact details (name, email, phone)
- Transition to BOOKING_PENDING as you collect info`,

    BOOKING_PENDING: `
## CURRENT PHASE: BOOKING_PENDING
User is providing booking details. Your goal:
- Validate each input (dates should be future, emails should be valid)
- Keep track of what's collected and what's missing
- ONLY call create_booking when ALL required fields are present
- If user seems unsure, offer to save their progress`,

    BOOKING_CONFIRMED: `
## CURRENT PHASE: BOOKING_CONFIRMED
Booking was successfully created. Your goal:
- Congratulate user on successful booking
- Provide booking ID and key details
- Explain next steps (payment, confirmation email)
- Ask if they need anything else
- Offer to start a new search if they want more bookings`,
  };

  return basePrompt + "\n\n" + phaseInstructions[phase];
};

// ============================================================================
// MAIN CHATBOT HANDLER WITH STATE MANAGEMENT
// ============================================================================

export const getChatbotResponse = async (
  messages: ChatMessage[],
  userId: string,
  sessionId: string = "default"
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 85_000);

  try {
    // 1. Load domain knowledge and conversation state
    const domainKnowledge = await getDomainKnowledge();
    
    let chatHistory = await ChatHistoryModel.findOne({ userId, sessionId });
    if (!chatHistory) {
      chatHistory = new ChatHistoryModel({ 
        userId, 
        sessionId, 
        messages: [],
        // Store state in a custom field (you'll need to add this to schema)
        metadata: { 
          state: { 
            phase: "GREETING" as const 
          } 
        }
      });
    }

    // Extract current state (you'll need to persist this properly)
    const conversationState: ConversationState = 
      (chatHistory.metadata?.state as ConversationState) || { phase: "GREETING" };

    // 2. Initialize model
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, message: "AI Assistant not configured." };
    }

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.1,
      maxRetries: 2,
    }).bindTools(tools);

    // 3. Build prompt with current phase context
    const systemPrompt = getSystemPromptForPhase(conversationState.phase, domainKnowledge);
    
    const lastMessage = messages[messages.length - 1].content;

    // Convert history to LangChain format (limit to last 10 for TPM overhead)
    const recentMessages = chatHistory.messages.slice(-10);
    const langChainHistory = recentMessages.map(m => {
      if (m.role === "user") return new HumanMessage(m.content);
      return new AIMessage(m.content);
    });

    // 4. Invoke model with retry logic
    let response = await retryWithBackoff(() =>
      model.invoke(
        [
          new SystemMessage(systemPrompt),
          ...langChainHistory,
          new HumanMessage(lastMessage)
        ],
        { signal: controller.signal }
      )
    );

    // 5. Handle tool calls
    let finalContent = "";
    const toolResults: any[] = [];

    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const toolMap: Record<string, any> = {
          search_photographers: searchPhotographers,
          get_photographer_packages: getPhotographerPackages,
          get_photographer_availability: getPhotographerAvailability,
          create_booking: createBooking,
        };
        
        const selectedTool = toolMap[toolCall.name];
        if (selectedTool) {
          // Inject userId for booking tool
          const args = { ...toolCall.args, userId: userId.toString() };
          const toolResult = await selectedTool.invoke(args);
          toolResults.push({ name: toolCall.name, result: JSON.parse(toolResult) });
          
          // Call model again with tool result
          const followUp = await model.invoke(
            [
              new SystemMessage(systemPrompt),
              ...langChainHistory,
              new HumanMessage(lastMessage),
              response,
              {
                role: "tool",
                content: toolResult,
                tool_call_id: toolCall.id,
              } as any,
            ],
            { signal: controller.signal }
          );
          response = followUp;
        }
      }
    }

    finalContent = response.content.toString();

    // 6. Update conversation state based on tool results
    if (toolResults.length > 0) {
      for (const tr of toolResults) {
        if (tr.name === "search_photographers" && tr.result.success) {
          conversationState.phase = "BROWSING";
        } else if (tr.name === "get_photographer_packages" && tr.result.success) {
          conversationState.phase = "COMPARING";
        } else if (tr.name === "get_photographer_availability" && tr.result.success) {
          // Stay in current phase but tool is called
        } else if (tr.name === "create_booking" && tr.result.success) {
          conversationState.phase = "BOOKING_CONFIRMED";
        }
      }
    }

    // 7. Format structured data for frontend
    let structuredResponse = null;
    
    if (toolResults.length > 0) {
      const lastTool = toolResults[toolResults.length - 1];
      
      if (lastTool.name === "search_photographers" && lastTool.result.success) {
        structuredResponse = {
          type: "photographer_list",
          data: lastTool.result.photographers,
        };
      } else if (lastTool.name === "get_photographer_packages" && lastTool.result.success) {
        structuredResponse = {
          type: "package_list",
          photographerId: lastTool.result.photographerId,
          data: lastTool.result.packages,
        };
      } else if (lastTool.name === "get_photographer_availability" && lastTool.result.success) {
        structuredResponse = {
          type: "availability_picker",
          photographerId: lastTool.result.photographerId,
          data: {
            availableSlots: lastTool.result.availableSlots,
            bookedDates: lastTool.result.bookedDates
          },
        };
      } else if (lastTool.name === "create_booking" && lastTool.result.success) {
        structuredResponse = {
          type: "booking_confirmation",
          bookingId: lastTool.result.bookingId,
        };
      }
    }

    // 8. Save to history with updated state
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
    chatHistory.metadata = { state: conversationState };
    await chatHistory.save();

    clearTimeout(timeoutId);

    return {
      success: true,
      message: finalContent,
      structuredData: structuredResponse,
      conversationPhase: conversationState.phase, // For debugging
    };

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[Chatbot Service] Error:", error);
    
    // Better error messages
    if ((error as any).name === "AbortError") {
      return {
        success: false,
        message: "Request timed out. The system is under heavy load. Please try again.",
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return {
      success: false,
      message: `Database/System Error: ${errorMessage}`,
    };
  }
};
