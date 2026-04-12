import { Router } from "express";
import { container } from "../di/container";
import { protect } from "../middleware/authMiddleware";

const router = Router();
const aiController = container.aiController;

router.post("/chat", aiController.chat);

export default router;
