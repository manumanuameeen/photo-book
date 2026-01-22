import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";
import { StripeService } from "../services/implementaion/StripeService.ts";
import { IWalletService } from "../interfaces/services/IWalletService.ts";
import { IPaymentController } from "../interfaces/controllers/IPaymentController.ts";

export class PaymentController implements IPaymentController {
  constructor(
    private stripeService: StripeService,
    private walletService: IWalletService,
  ) {}

  createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency } = req.body;
      const clientSecret = await this.stripeService.createPaymentIntent(amount, currency);
      ApiResponse.success(res, { clientSecret }, Messages.PAYMENT_INTENT_CREATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentIntentId, userId, amount, description } = req.body;

      const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        await this.walletService.creditWallet(
          userId,
          amount,
          description || "Wallet Top-up",
          paymentIntentId,
        );
        ApiResponse.success(res, { success: true }, Messages.PAYMENT_CONFIRMED);
      } else {
        ApiResponse.error(res, Messages.PAYMENT_FAILED, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this._handleError(res, error);
    }
  };

  private _handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
      return;
    }
    if (error instanceof Error) {
      ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
      return;
    }
    ApiResponse.error(res, Messages.INTERNAL_ERROR);
  }
}
