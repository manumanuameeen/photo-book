import { ChatGroq } from "@langchain/groq";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  BaseMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { IAiService } from "../../interfaces/services/IAiService";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { CategoryModel } from "../../models/category.model";
import { PhotographerModel } from "../../models/photographer.model";
import { RentalItemModel } from "../../models/rentalItem.model";
import { FilterQuery } from "mongoose";
import { IPhotographer } from "../../models/photographer.model";
import { IRentalItem } from "../../models/rentalItem.model";

export class AiService implements IAiService {
  private _model: ChatGroq;
  private _tools: DynamicStructuredTool[];

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined in environment variables");
    }

    this._model = new ChatGroq({
      apiKey: apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    // Define search tools
    const searchPhotographersSchema = z.object({
      query: z.string().optional().describe("Search keyword for name or business"),
      category: z.string().optional().describe("Photography specialty (Wedding, Portrait, etc.)"),
      location: z.string().optional().describe("City or region"),
    });

    const searchPhotographers = new DynamicStructuredTool({
      name: "search_photographers",
      description: "Search for professional photographers on the platform.",
      schema: searchPhotographersSchema,
      func: async (input: z.infer<typeof searchPhotographersSchema>): Promise<string> => {
        const { query, category, location } = input;
        const filter: FilterQuery<IPhotographer> = { status: "APPROVED" };
        if (category)
          filter["professionalDetails.specialties"] = { $regex: category, $options: "i" };
        if (location) filter["personalInfo.location"] = { $regex: location, $options: "i" };
        if (query) {
          filter.$or = [
            { "personalInfo.name": { $regex: query, $options: "i" } },
            { "businessInfo.businessName": { $regex: query, $options: "i" } },
          ];
        }

        const results = await PhotographerModel.find(filter).limit(5).lean();
        return JSON.stringify(
          results.map((p) => ({
            name: p.personalInfo.name,
            business: p.businessInfo.businessName,
            location: p.personalInfo.location,
            specialties: p.professionalDetails.specialties,
            experience: p.professionalDetails.yearsExperience,
          })),
        );
      },
    });

    const listRentalsSchema = z.object({
      category: z.string().optional().describe("Gear category (Camera, Lens, etc.)"),
      query: z.string().optional().describe("Search keyword for item name"),
    });

    const listRentals = new DynamicStructuredTool({
      name: "search_rentals",
      description: "Search for photography gear available for rent.",
      schema: listRentalsSchema,
      func: async (input: z.infer<typeof listRentalsSchema>): Promise<string> => {
        const { category, query } = input;
        const filter: FilterQuery<IRentalItem> = { status: "AVAILABLE" };
        if (category) filter.category = { $regex: category, $options: "i" };
        if (query) filter.name = { $regex: query, $options: "i" };

        const results = await RentalItemModel.find(filter).limit(5).lean();
        return JSON.stringify(
          results.map((r) => ({
            name: r.name,
            pricePerDay: r.pricePerDay,
            category: r.category,
            condition: r.condition,
          })),
        );
      },
    });

    this._tools = [searchPhotographers, listRentals];
    this._model = this._model.bindTools(this._tools) as ChatGroq;
  }

  async getChatResponse(
    userMessage: string,
    history: { role: "user" | "model"; content: string }[] = [],
  ): Promise<string> {
    try {
      // Fetch platform summary for the system prompt
      const [activeCategories, photographerCount] = await Promise.all([
        CategoryModel.find({ isActive: true, suggestionStatus: "APPROVED" })
          .select("name")
          .limit(10)
          .lean(),
        PhotographerModel.countDocuments({ status: "APPROVED" }),
      ]);

      const categoriesList =
        activeCategories.length > 0
          ? activeCategories.map((c) => c.name).join(", ")
          : "Wedding, Portrait, Event, Product, Lifestyle";

      const systemInstruction = `You are Shutter, the official AI assistant for Photo-book. 
You help visitors find photographers and browse rental gear.

PLATFORM SUMMARY:
- Categories: ${categoriesList}
- Total Verified Photographers: ${photographerCount}

CAPABILITIES:
- You have tools to search for photographers and rentals. Use them whenever a user asks for specific recommendations or availability.
- Explain photography concepts like Exposure Triangle, Composition, and Lighting.
- Direct users to use the website's buttons for actual bookings.

TONE: Professional, knowledgeable, and inviting. End responses with a next step.`;

      const messages: BaseMessage[] = [
        new SystemMessage(systemInstruction),
        ...history.map((h) =>
          h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content),
        ),
        new HumanMessage(userMessage),
      ];

      // Execute with tool support
      let response = await this._model.invoke(messages);

      // If the LLM wants to call tools
      while (response.tool_calls && response.tool_calls.length > 0) {
        messages.push(response);

        for (const toolCall of response.tool_calls) {
          const selectedTool = this._tools.find((t) => t.name === toolCall.name);
          if (selectedTool) {
            const toolResponse = await selectedTool.invoke(toolCall.args);
            messages.push(
              new ToolMessage({
                content: toolResponse,
                tool_call_id: toolCall.id ?? "",
              }),
            );
          }
        }

        response = await this._model.invoke(messages);
      }

      const text = response.content as string;
      if (!text) throw new Error("AI returned an empty response.");
      return text;
    } catch (error: unknown) {
      console.error("❌ AI Service Execution Error:", error);
      let errorMessage = "AI Service Error";
      let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

      if (error instanceof Error) {
        errorMessage = error.message;
        const status = (error as any).status || (error as any).response?.status;

        if (status === 429) {
          errorMessage = "Rate limit exceeded on Groq. Please try again in a few seconds.";
          statusCode = 429;
        } else if (status === 401 || status === 403) {
          errorMessage = "Invalid Groq API Key";
          statusCode = 401;
        } else if (status === 400) {
          errorMessage =
            "I encountered an issue gathering that information. Could you please rephrase your request?";
          statusCode = 400;
        }
      }
      throw new AppError(errorMessage, statusCode);
    }
  }
}
