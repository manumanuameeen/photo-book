import { Request, Response } from "express";
import { IAiService } from "../../interfaces/services/IAiService";
import { ApiResponse } from "../../utils/response";
import { handleError } from "../../utils/errorHandler";

export class AiController {
  constructor(private readonly _aiService: IAiService) {}

  chat = async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return ApiResponse.error(res, "Message is required", 400);
      }
      const response = await this._aiService.getChatResponse(message, history);
      ApiResponse.success(res, { response }, "AI response generated");
    } catch (error: any) {
      console.error("AiController Error:", error);
      const statusCode = error.statusCode || 500;
      const message = error.message || "An unexpected error occurred in AI chat";
      res.status(statusCode).json({
        success: false,
        message: message,
      });
    }
  };
}
