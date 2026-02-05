import { Router } from "express";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";

const router = Router();
const paymentController = container.paymentController;

router.post(ROUTES.V1.PAYMENT.CREATE_INTENT, verifyAccessToken, (req, res, next) =>
  paymentController.createPaymentIntent(req, res, next),
);
router.post(ROUTES.V1.PAYMENT.CONFIRM, verifyAccessToken, (req, res, next) =>
  paymentController.confirmPayment(req, res, next),
);

export default router;
