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
  messageController.deleteMessageForMe.bind(messageController),
);
router.delete(
  ROUTES.V1.MESSAGE.DELETE_FOR_EVERYONE,
  authMiddleware,
  messageController.deleteMessageForEveryone.bind(messageController),
);
router.delete(
  ROUTES.V1.MESSAGE.CLEAR_CHAT,
  authMiddleware,
  messageController.clearChat.bind(messageController),
);
router.post(
  ROUTES.V1.MESSAGE.SEND,
  authMiddleware,
  messageController.sendMessage.bind(messageController),
);


import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  messageController.uploadAttachment.bind(messageController)
);

router.put(
  "/:id",
  authMiddleware,
  messageController.editMessage.bind(messageController)
);

router.patch(
  "/:id/reaction",
  authMiddleware,
  messageController.toggleReaction.bind(messageController)
);

export default router;
