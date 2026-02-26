import { Router } from "express";
import { container } from "../di/container.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";

const router = Router();
const walletController = container.walletController;

router.get(ROUTES.V1.WALLET.DETAILS, verifyAccessToken, (req, res) =>
  walletController.getWalletDetails(req, res),
);

router.get(ROUTES.V1.WALLET.TRANSACTIONS, verifyAccessToken, (req, res) =>
  walletController.getWalletTransactions(req, res),
);

router.get(ROUTES.V1.WALLET.ESCROW_STATS, verifyAccessToken, (req, res) =>
  walletController.getEscrowStats(req, res),
);

router.get(ROUTES.V1.WALLET.DASHBOARD_STATS, verifyAccessToken, (req, res) =>
  walletController.getDashboardStats(req, res),
);

export default router;
