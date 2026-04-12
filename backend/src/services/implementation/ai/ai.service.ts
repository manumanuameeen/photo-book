import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAiService } from "../../../interfaces/services/IAiService";
import { AppError } from "../../../utils/AppError";
import { HttpStatus } from "../../../constants/httpStatus";

export class AiService implements IAiService {
  private _genAI: GoogleGenerativeAI;
  private _model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this._genAI = new GoogleGenerativeAI(apiKey);
    this._model = this._genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are the Photo-book Assistant. Your job is to help users understand our platform and provide basic knowledge about photography and videography.

About Photo-book:
- It's a comprehensive platform for photographers and videographers to showcase portfolios.
* Users can book professional photographers for events (wedding, product, etc.).
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
  }

  async getChatResponse(userMessage: string, history: { role: "user" | "model"; content: string }[] = []): Promise<string> {
    try {
      const chat = this._model.startChat({
        history: history.map(h => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        })),
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new AppError("Failed to get AI response", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
