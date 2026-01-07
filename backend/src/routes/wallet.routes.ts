import { Router } from "express";
import { container } from "../di/container";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";

const router = Router();
const walletController = container.walletController;

router.get(ROUTES.V1.WALLET.DETAILS, verifyAccessToken, (req, res, next) => walletController.getWalletDetails(req, res, next));

export default router;
