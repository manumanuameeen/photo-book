import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IAiService } from "../../../interfaces/services/IAiService";
import { AppError } from "../../../utils/AppError";
import { HttpStatus } from "../../../constants/httpStatus";

export class AiService implements IAiService {
  private _genAI: GoogleGenerativeAI;
  private _model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🛠️ AI Service: Initializing...");
    if (!apiKey) {
      console.error("❌ AI Service: GEMINI_API_KEY is missing!");
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    console.log(`🔑 AI Service: API Key found (ends with ...${apiKey.slice(-4)})`);

    this._genAI = new GoogleGenerativeAI(apiKey);
    this._model = this._genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are the Photo-book Assistant. Your job is to help users understand our platform and provide basic knowledge about photography and videography.

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
- Do not perform actual bookings or order processing (tell them to use the website's built-in features for that).`,
    });
    console.log("✅ AI Service: Model initialized (gemini-1.5-flash-latest)");
  }

  async getChatResponse(
    userMessage: string,
    history: { role: "user" | "model"; content: string }[] = [],
  ): Promise<string> {
    try {
      console.log(
        `🤖 AI Request: "${userMessage.substring(0, 50)}..." | History items: ${history.length}`,
      );

      const chat = this._model.startChat({
        history: history.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content || "" }],
        })),
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Gemini returned an empty response string.");
      }

      return text;
    } catch (error: unknown) {
      console.error("❌ AI Service Execution Error:", error);
      
      let errorMessage = "AI Service Error";
      let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Safely check for status code on the error object
        const status = typeof error === 'object' && error !== null && 'status' in error 
          ? (error as { status: number }).status 
          : undefined;
        if (status === 429) {
          errorMessage = "Rate limit exceeded (Too many requests)";
          statusCode = 429;
        } else if (status === 401 || status === 403) {
          errorMessage = "Invalid API Key or Permissions";
          statusCode = 401;
        } else if (status === 404) {
          errorMessage = `Model Not Found (404). Please verify your Google AI API key has access to 'gemini-1.5-flash-latest'.`;
          statusCode = 404;
        }
      }
      
      throw new AppError(errorMessage, statusCode);
    }
  }
}
