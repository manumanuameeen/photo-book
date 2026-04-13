import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { IAiService } from "../../../interfaces/services/IAiService";
import { AppError } from "../../../utils/AppError";
import { HttpStatus } from "../../../constants/httpStatus";

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
      modelName: "llama-3.3-70b-versatile",
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

      const systemInstruction = `You are the Photo-book Assistant. Your job is to help users understand our platform and provide basic knowledge about photography and videography.

About Photo-book:
- It's a comprehensive platform for photographers and videographers to showcase portfolios.
- Users can book professional photographers for events (wedding, product, etc.).
- There is a marketplace to rent cameras, lenses, and other photography gear.
- We offer secure payments and a messaging system between clients and professionals.

Photography & Videography Knowledge:
- Explain concepts like Exposure Triangle (ISO, Aperture, Shutter Speed).
- Provide tips on composition (Rule of Thirds, Leading Lines).
- Advise on gear selection for beginners vs professionals.
- Discuss lighting techniques (natural light vs studio light).

Guidelines:
- Be friendly, professional, and helpful.
- Keep responses concise but informative.
- If a user asks something outside of photography or the website, politely redirect them.
- Do not perform actual bookings or order processing (tell them to use the website's built-in features for that).`;

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
