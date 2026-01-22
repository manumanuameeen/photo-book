import express from "express";
import { container } from "../di/container.ts";
import { verifyAccessToken as authMiddleware } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";

const router = express.Router();
const messageController = container.messageController;

router.get(
    ROUTES.V1.MESSAGE.GET_ALL,
    authMiddleware,
    messageController.getMessages.bind(messageController),
);
router.get(
    ROUTES.V1.MESSAGE.GET_SENT,
    authMiddleware,
    messageController.getSentMessages.bind(messageController),
);
router.put(
    ROUTES.V1.MESSAGE.MARK_READ,
    authMiddleware,
    messageController.markAsRead.bind(messageController),
);
router.delete(
    ROUTES.V1.MESSAGE.DELETE,
    authMiddleware,
    messageController.deleteMessage.bind(messageController),
);
router.post(
    ROUTES.V1.MESSAGE.SEND,
    authMiddleware,
    messageController.sendMessage.bind(messageController),
);

export default router;
