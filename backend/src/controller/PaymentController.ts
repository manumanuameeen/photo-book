import { Request, Response, NextFunction } from "express";
import { StripeService } from "../services/implementaion/StripeService.ts";
import { WalletService } from "../services/implementaion/WalletService.ts";
import { WalletRepository } from "../repositories/implementaion/wallet/WalletRepository.ts";
import { WalletModel } from "../model/walletModel.ts";

const stripeService = new StripeService();
const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);

export class PaymentController {

    async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount, currency } = req.body;
            const clientSecret = await stripeService.createPaymentIntent(amount, currency);
            res.status(200).json({ clientSecret });
        } catch (error) {
            next(error);
        }
    }

    async confirmPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { paymentIntentId, userId, amount, description } = req.body;

            const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                await walletService.creditWallet(userId, amount, description || "Wallet Top-up", paymentIntentId);
                res.status(200).json({ success: true, message: "Payment confirmed and wallet credited" });
            } else {
                res.status(400).json({ success: false, message: "Payment not successful" });
            }
        } catch (error) {
            next(error);
        }
    }
}
