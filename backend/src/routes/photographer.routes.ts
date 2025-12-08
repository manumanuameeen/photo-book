import { Router } from "express";
const router = Router();
import { container } from "../di/container.ts";
import { ROUTES } from "../constants/routes.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { uploadMiddleware } from "../middleware/uploadMiddleware.ts";

const photographerController = container.photogrpherController;
router.post(
  ROUTES.V1.PHOTOGRAPHER.APPLY,
  verifyAccessToken,
  uploadMiddleware.array("portfolioImages", 15),
  photographerController.apply,
);
export default router;
