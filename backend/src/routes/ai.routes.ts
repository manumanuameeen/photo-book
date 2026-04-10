/**
 * AI Routes
 * Endpoints for AI-powered features: search and album name suggestion
 */

import { Router, Request, Response } from "express";
import { verifyAccessToken, AuthRequest } from "../middleware/authMiddleware";
import { rankPhotosByQuery } from "../services/external/aiSearch.service";
import { suggestAlbumName } from "../services/external/albumName.service";
import { PortfolioSectionModel } from "../models/portfolioSection.model";
import { getChatbotResponse, ChatMessage } from "../services/external/chatbot.service";
import { ChatHistoryModel } from "../models/chatHistory.model";
import { ROUTES } from "../constants/routes";

const router = Router();

/**
 * GET /api/ai/search?q=your+query
 * Semantic AI photo search — returns photos ranked by similarity to query
 *
 * NOTE: You need to pass photoEmbeddings from your database.
 * Replace the TODO section below with your actual DB query.
 */
router.get("/search", verifyAccessToken, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Get all portfolio images with embeddings from all photographers
    const portfolioSections = await PortfolioSectionModel.find({}, { images: 1 });
    const photoEmbeddings: { photoId: string; embedding: number[]; url: string }[] = [];

    portfolioSections.forEach((section) => {
      section.images.forEach((image, index) => {
        if (image.embedding && image.embedding.length > 0) {
          photoEmbeddings.push({
            photoId: `${section._id}_${index}`, // Unique ID combining section ID and image index
            embedding: image.embedding,
            url: image.url,
          });
        }
      });
    });

    const results = await rankPhotosByQuery(query, photoEmbeddings);

    // Map results to include photo URLs
    const resultsWithUrls = results.map((result) => {
      const photoData = photoEmbeddings.find((p) => p.photoId === result.photoId);
      return {
        ...result,
        url: photoData?.url || "",
      };
    });

    return res.status(200).json({
      success: true,
      query,
      results: resultsWithUrls,
      count: resultsWithUrls.length,
    });
  } catch (error) {
    console.error("[AI Search Route] Error:", error);
    return res.status(500).json({ message: "AI search failed" });
  }
});

/**
 * POST /api/ai/album/:albumId/suggest-name
 * Suggests a creative album name based on photo captions in the album
 *
 * NOTE: Replace the TODO section with your actual DB query.
 */
router.post(
  "/album/:albumId/suggest-name",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    try {
      const { albumId } = req.params;

      const section = await PortfolioSectionModel.findById(albumId).select("images.caption");
      if (!section) {
        return res.status(404).json({ message: "Album not found" });
      }

      const captions = section.images
        .map((img: { caption?: string }) => img.caption)
        .filter((caption): caption is string => Boolean(caption && caption.trim().length > 0));

      if (captions.length === 0) {
        return res.status(400).json({ message: "No photo captions found in this album" });
      }

      const result = await suggestAlbumName(captions);

      return res.status(200).json({
        success: result.success,
        albumId,
        suggestedName: result.name,
      });
    } catch (error) {
      console.error("[AI Album Name Route] Error:", error);
      return res.status(500).json({ message: "Album name suggestion failed" });
    }
  },
);

/**
 * GET /api/ai/chatbot/history
 * Retrieves chat history for a session
 */
router.get("/chatbot/history", verifyAccessToken, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query as { sessionId?: string };
    const userId = (req as AuthRequest).userId;

    const chatHistory = await ChatHistoryModel.findOne({
      userId,
      sessionId: sessionId || "default",
    });

    return res.status(200).json({
      success: true,
      messages: chatHistory ? chatHistory.messages : [],
    });
  } catch (error) {
    console.error("[AI Chatbot History Route] Error:", error);
    return res.status(500).json({ message: "Failed to load chat history" });
  }
});

/**
 * POST /api/ai/chatbot
 * Handles AI chatbot messages
 */
router.post(ROUTES.V1.AI.CHATBOT, verifyAccessToken, async (req: Request, res: Response) => {
  try {
    const { messages, sessionId } = req.body as { messages: ChatMessage[]; sessionId?: string };
    const userId = (req as AuthRequest).userId;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Chat history is required" });
    }

    const result = await getChatbotResponse(messages, userId, sessionId || "default");

    return res.status(200).json({
      success: result.success,
      message: result.message,
      structuredData: result.structuredData,
      conversationPhase: result.conversationPhase,
      stack: (result as { stack?: string }).stack, // Include stack if returned by service
      error: (result as { error?: string }).error,
    });
  } catch (error: unknown) {
    console.error("[AI Chatbot Route] Error:", error);

    // Extract detailed error information
    let statusCode = 500;
    let errorMessage = "Chatbot interaction failed";
    let errorDetails: Record<string, unknown> = {};

    // Handle Groq rate limit errors (429)
    if (error?.response?.status === 429) {
      statusCode = 429;
      const groqError = error.response.data?.error || {};
      errorMessage = "Rate limit reached. Please wait before trying again.";
      errorDetails = {
        type: "RATE_LIMIT",
        provider: "Groq",
        message: groqError.message || "Too many requests",
        code: "rate_limit_exceeded",
      };
    }
    // Handle network/connection errors
    else if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
      statusCode = 503;
      errorMessage = "Unable to connect to AI service. Please try again later.";
      errorDetails = {
        type: "CONNECTION_ERROR",
        provider: "Groq",
        message: "Service temporarily unavailable",
      };
    }
    // Handle timeout errors
    else if (error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
      statusCode = 504;
      errorMessage = "Request timed out. The AI service is taking too long to respond.";
      errorDetails = {
        type: "TIMEOUT",
        provider: "Groq",
        message: "Request timeout",
      };
    }
    // Handle authentication errors
    else if (error?.response?.status === 401 || error?.message?.includes("Unauthorized")) {
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
});

export default router;
