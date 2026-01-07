import express from "express";
import { container } from "../di/container";
import { verifyAccessToken as authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
const messageController = container.messageController;

router.get("/", authMiddleware, messageController.getMessages.bind(messageController));
router.get("/sent", authMiddleware, messageController.getSentMessages.bind(messageController));
router.put("/:id/read", authMiddleware, messageController.markAsRead.bind(messageController));
router.delete("/:id", authMiddleware, messageController.deleteMessage.bind(messageController));

export default router;
