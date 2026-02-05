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

// Import multer middleware (assuming it's available or we create inline)
import { storage } from "../config/cloudinary.ts";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() }); // using memory storage for CloudinaryService which expects buffer

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

export default router;
