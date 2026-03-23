import { Request, Response } from "express";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { StripeService } from "../../services/implementation/booking/StripeService";
import { handleError } from "../../utils/errorHandler";
import { IWalletService } from "../../interfaces/services/IWalletService";
import { IPaymentController } from "../../interfaces/controllers/IPaymentController";
import { CreatePaymentIntentDTO, ConfirmPaymentDTO } from "../../dto/payment.dto";

export class PaymentController implements IPaymentController {
  constructor(
    private readonly _stripeService: StripeService,
    private readonly _walletService: IWalletService,
  ) {}

  createPaymentIntent = async (req: Request, res: Response) => {
    try {
      const { amount, currency } = req.body as CreatePaymentIntentDTO;
      const clientSecret = await this._stripeService.createPaymentIntent(amount, currency);
      ApiResponse.success(res, { clientSecret }, Messages.PAYMENT_INTENT_CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  confirmPayment = async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, userId, amount, description } = req.body as ConfirmPaymentDTO;

      const paymentIntent = await this._stripeService.retrievePaymentIntent(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        await this._walletService.creditWallet(
          userId,
          amount,
          description || Messages.WALLET_TOP_UP,
          paymentIntentId,
        );
        ApiResponse.success(res, { success: true }, Messages.PAYMENT_CONFIRMED);
      } else {
        ApiResponse.error(res, Messages.PAYMENT_FAILED, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      handleError(res, error);
    }
  };
}
