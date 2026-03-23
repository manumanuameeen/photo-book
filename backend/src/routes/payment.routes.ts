import { Router } from "express";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";
import { verifyAccessToken } from "../middleware/authMiddleware";

const router = Router();
const paymentController = container.paymentController;

router.post(ROUTES.V1.PAYMENT.CREATE_INTENT, verifyAccessToken, (req, res) =>
  paymentController.createPaymentIntent(req, res),
);
router.post(ROUTES.V1.PAYMENT.CONFIRM, verifyAccessToken, (req, res) =>
  paymentController.confirmPayment(req, res),
);

export default router;
