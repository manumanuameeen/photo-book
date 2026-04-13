import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { IAiService } from "../../interfaces/services/IAiService";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { CategoryModel } from "../../models/category.model";
import { PhotographerModel } from "../../models/photographer.model";
import { RentalItemModel } from "../../models/rentalItem.model";

export class AiService implements IAiService {
  private _model: ChatGroq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("🛠️ AI Service: Initializing Groq...");
    if (!apiKey) {
      console.error("❌ AI Service: GROQ_API_KEY is missing!");
      throw new Error("GROQ_API_KEY is not defined in environment variables");
    }
    
    this._model = new ChatGroq({
      apiKey: apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });
    console.log("✅ AI Service: Groq Model initialized (llama-3.3-70b-versatile)");
  }

  async getChatResponse(
    userMessage: string,
    history: { role: "user" | "model"; content: string }[] = [],
  ): Promise<string> {
    try {
      console.log(`🤖 AI Request: "${userMessage.substring(0, 50)}..." | History items: ${history.length}`);

      // 1. Fetch real platform context
      const [activeCategories, photographerCount, availableRentals] = await Promise.all([
        CategoryModel.find({ isActive: true, suggestionStatus: "APPROVED" }).select("name").limit(10).lean(),
        PhotographerModel.countDocuments({ status: "APPROVED" }),
        RentalItemModel.find({ status: "AVAILABLE" }).select("name pricePerDay").limit(5).lean()
      ]);

      const categoriesList = activeCategories.length > 0 
        ? activeCategories.map(c => c.name).join(", ") 
        : "Wedding, Portrait, Event, Product, Lifestyle";

      const rentalsList = availableRentals.length > 0
        ? availableRentals.map(r => `${r.name} (PKR ${r.pricePerDay}/day)`).join(", ")
        : "Professional Cameras, Lenses, Lighting Kits";

      const systemInstruction = `You are Shutter, the official AI assistant for Photo-book. You are a curated marketplace connecting clients with professional photographers and high-end rental gear.

REAL-TIME PLATFORM DATA:
- Currently Available Photographer Categories: ${categoriesList}
- Total Verified Photographers: ${photographerCount}
- Featured Rental Gear: ${rentalsList}

About Photo-book:
- We are a premium platform for photographers to showcase portfolios and for clients to book them.
* Clients browse photographer profiles, view portfolios, check availability, and book directly.
- Our Marketplace also allows users to rent professional cameras, lenses, and gear.
- We offer secure payments, a comprehensive messaging system, and verified professional reviews.

Photography & Videography Knowledge:
- You are an expert in photography. Explain concepts like Exposure Triangle (ISO, Aperture, Shutter Speed).
- Provide tips on composition (Rule of Thirds, Leading Lines), and lighting (natural vs studio).
- Advise on gear selection based on the featured rentals or general professional standards.

Guidelines:
- Be warm, professional, and knowledgeable.
- Use real data provided above to talk about what's available CURRENTLY.
- If a user asks for something outside of photography or the website, politely redirect them.
- Do not perform actual bookings—direct users to use the website's buttons for that.
- End every response with a helpful next step or an open question.`;

      const messages = [
        new SystemMessage(systemInstruction),
        ...history.map((h) => 
          h.role === "user" 
            ? new HumanMessage(h.content) 
            : new AIMessage(h.content)
        ),
        new HumanMessage(userMessage),
      ];

      const response = await this._model.invoke(messages);
      const text = response.content as string;

      if (!text) {
        throw new Error("Groq returned an empty response.");
      }

      return text;
    } catch (error: unknown) {
      console.error("❌ AI Service Execution Error:", error);
      
      let errorMessage = "AI Service Error";
      let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Safely check for status code/response on the error object
        const status = (error as any).status || (error as any).response?.status;
        
        if (status === 429) {
          errorMessage = "Rate limit exceeded on Groq. Please try again in a few seconds.";
          statusCode = 429;
        } else if (status === 401 || status === 403) {
          errorMessage = "Invalid Groq API Key or Permissions";
          statusCode = 401;
        }
      }
      
      throw new AppError(errorMessage, statusCode);
    }
  }
}

