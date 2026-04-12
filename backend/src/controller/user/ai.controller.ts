import { Request, Response } from "express";
import { IAiService } from "../../interfaces/services/IAiService";
import { ApiResponse } from "../../utils/response";
import { handleError } from "../../utils/errorHandler";
import { AppError } from "../../utils/AppError";

export class AiController {
  constructor(private readonly _aiService: IAiService) {}

  chat = async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body as { 
        message: string; 
        history?: { role: "user" | "model"; content: string }[] 
      };
      if (!message) {
        return ApiResponse.error(res, "Message is required", 400);
      }
      const response = await this._aiService.getChatResponse(message, history);
      ApiResponse.success(res, { response }, "AI response generated");
    } catch (error: unknown) {
      console.error("AiController Error:", error);
      let statusCode = 500;
      let message = "An unexpected error occurred in AI chat";

      if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message: message,
      });
    }
  };
}
