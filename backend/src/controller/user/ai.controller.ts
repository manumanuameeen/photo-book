import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IAiService } from "../../interfaces/services/IAiService";
import { ChatMessage } from "../../services/external/chatbot.service";

export class AiController {
  private readonly aiService: IAiService;

  constructor(aiService: IAiService) {
    this.aiService = aiService;
  }

  public searchPhotos = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const result = await this.aiService.searchPhotos(query);

      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("[AiController] searchPhotos Error:", error);
      const message = error instanceof Error ? error.message : "AI search failed";
      return res.status(500).json({ message });
    }
  };

  public suggestAlbumName = async (req: Request, res: Response) => {
    try {
      const { albumId } = req.params;

      const result = await this.aiService.suggestAlbumName(albumId);

      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("[AiController] suggestAlbumName Error:", error);
      const message = error instanceof Error ? error.message : "Album name suggestion failed";
      const statusCode = message === "Album not found" ? 404 : 400;
      return res.status(statusCode).json({ message });
    }
  };

  public getChatbotHistory = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query as { sessionId?: string };
      const userId = (req as AuthRequest).userId;

      const result = await this.aiService.getChatbotHistory(userId as string, sessionId);

      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("[AiController] getChatbotHistory Error:", error);
      return res.status(500).json({ message: "Failed to load chat history" });
    }
  };

  public handleChatbotMessage = async (req: Request, res: Response) => {
    try {
      const { messages, sessionId } = req.body as { messages: ChatMessage[]; sessionId?: string };
      const userId = (req as AuthRequest).userId;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Chat history is required" });
      }

      const result = await this.aiService.handleChatbotMessage(
        messages,
        userId as string,
        sessionId || "default",
      );

      return res.status(200).json({
        success: result.success,
        message: result.message,
        structuredData: result.structuredData,
        conversationPhase: result.conversationPhase,
        stack: result.stack,
        error: result.error,
      });
    } catch (error: unknown) {
      console.error("[AiController] handleChatbotMessage Error:", error);

      // Extract detailed error information
      let statusCode = 500;
      let errorMessage = "Chatbot interaction failed";
      let errorDetails: Record<string, unknown> = {};

      interface ExtendedError extends Error {
        response?: {
          status?: number;
          data?: {
            error?: {
              message?: string;
            };
          };
        };
        code?: string;
      }

      const err = error as ExtendedError;

      // Handle Groq rate limit errors (429)
      if (err?.response?.status === 429) {
        statusCode = 429;
        const groqError = err.response.data?.error || {};
        errorMessage = "Rate limit reached. Please wait before trying again.";
        errorDetails = {
          type: "RATE_LIMIT",
          provider: "Groq",
          message: groqError.message || "Too many requests",
          code: "rate_limit_exceeded",
        };
      }
      // Handle network/connection errors
      else if (err?.code === "ECONNREFUSED" || err?.code === "ENOTFOUND") {
        statusCode = 503;
        errorMessage = "Unable to connect to AI service. Please try again later.";
        errorDetails = {
          type: "CONNECTION_ERROR",
          provider: "Groq",
          message: "Service temporarily unavailable",
        };
      }
      // Handle timeout errors
      else if (err?.code === "ETIMEDOUT" || err?.message?.includes("timeout")) {
        statusCode = 504;
        errorMessage = "Request timed out. The AI service is taking too long to respond.";
        errorDetails = {
          type: "TIMEOUT",
          provider: "Groq",
          message: "Request timeout",
        };
      }
      // Handle authentication errors
      else if (err?.response?.status === 401 || err?.message?.includes("Unauthorized")) {
        statusCode = 401;
        errorMessage = "Authentication failed. Please check API credentials.";
        errorDetails = {
          type: "AUTH_ERROR",
          provider: "Groq",
          message: "Invalid or expired credentials",
        };
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorDetails,
      });
    }
  };
}
