/**
 * AI Routes
 * Endpoints for AI-powered features: search and album name suggestion
 */

import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";

const router = Router();
const aiController = container.aiController;

/**
 * GET /api/ai/search?q=your+query
 * Semantic AI photo search — returns photos ranked by similarity to query
 */
router.get("/search", verifyAccessToken, (req, res) => aiController.searchPhotos(req, res));

/**
 * POST /api/ai/album/:albumId/suggest-name
 * Suggests a creative album name based on photo captions in the album
 */
router.post("/album/:albumId/suggest-name", verifyAccessToken, (req, res) =>
  aiController.suggestAlbumName(req, res),
);

/**
 * GET /api/ai/chatbot/history
 * Retrieves chat history for a session
 */
router.get("/chatbot/history", verifyAccessToken, (req, res) =>
  aiController.getChatbotHistory(req, res),
);

/**
 * POST /api/ai/chatbot
 * Handles AI chatbot messages
 */
router.post(ROUTES.V1.AI.CHATBOT, verifyAccessToken, (req, res) =>
  aiController.handleChatbotMessage(req, res),
);

export default router;
