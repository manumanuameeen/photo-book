import { IRentalPaymentService } from "../../interfaces/services/rental/IRentalPaymentService.ts";
import { IRentalOrder, RentalStatus } from "../../model/rentalOrderModel.ts";
import { IPopulatedUser } from "../../model/bookingModel.ts";
import { IRentalOrderRepository } from "../../interfaces/repositories/rental/IRentalOrderRepository.ts";
import { IPaymentService } from "../../interfaces/services/IPaymentService.ts";
import { IWalletService } from "../../interfaces/services/IWalletService.ts";
import { StripeService } from "../implementaion/StripeService.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { IEmailService } from "../../interfaces/services/IEmailService.ts";

import { IPdfService } from "../../interfaces/services/IPdfService.ts";

export class RentalPaymentService implements IRentalPaymentService {
  private readonly _orderRepo: IRentalOrderRepository;
  private readonly _paymentService: IPaymentService;
  private readonly _walletService: IWalletService;
  private readonly _stripeService: StripeService;
  private readonly _emailService: IEmailService;
  private readonly _pdfService: IPdfService;

  constructor(
    orderRepo: IRentalOrderRepository,
    paymentService: IPaymentService,
    walletService: IWalletService,
    stripeService: StripeService,
    emailService: IEmailService,
    pdfService: IPdfService,
  ) {
    this._orderRepo = orderRepo;
    this._paymentService = paymentService;
    this._walletService = walletService;
    this._stripeService = stripeService;
    this._emailService = emailService;
    this._pdfService = pdfService;
  }

  async createDepositPaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    const amount = order.depositeRequired || Math.round(order.totalAmount * 0.25);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}&paymentType=deposit`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=cancel`;

    const renterEmail = (order.renterId as unknown as IPopulatedUser)?.email || "";

    const session = await this._stripeService.createCheckoutSession(
      amount,
      "usd",
      { orderId: orderId.toString(), type: "rental_initial_payment" },
      successUrl,
      cancelUrl,
      renterEmail,
    );
    await this._orderRepo.updateOrder(orderId, { paymentId: session.id });
    return { url: session.url!, sessionId: session.id };
  }

  async payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    return this.confirmRentalPayment(orderId, paymentIntentId);
  }

  async confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (order.paymentId === paymentIntentId && order.status === RentalStatus.CONFIRMED)
      return order;

    const amount = order.depositeRequired || 0;
    await this._paymentService.processDepositPayment(orderId, "rental", paymentIntentId, amount);

    const updated = await this._orderRepo.updateOrder(orderId, {
      status: RentalStatus.CONFIRMED,
      paymentId: paymentIntentId,
      amountPaid: amount,
    });

    return updated!;
  }

  async createBalancePaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    const remaining = order.totalAmount - (order.amountPaid || 0);
    if (remaining <= 0) throw new AppError("Zero balance", HttpStatus.BAD_REQUEST);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}&paymentType=balance`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=cancel`;

    const renterEmail = (order.renterId as unknown as IPopulatedUser)?.email || "";

    const session = await this._stripeService.createCheckoutSession(
      remaining,
      "usd",
      { orderId: orderId.toString(), type: "rental_balance" },
      successUrl,
      cancelUrl,
      renterEmail,
    );
    return { url: session.url!, sessionId: session.id };
  }

  async payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    const remaining = order.totalAmount - (order.amountPaid || 0);
    await this._paymentService.processBalancePayment(orderId, "rental", paymentIntentId, remaining);

    const updated = await this._orderRepo.updateOrder(orderId, {
      amountPaid: order.totalAmount,
      finalPaymentId: paymentIntentId,
    });

    if (["ONGOING", "RETURNED"].includes(updated!.status)) {
      await this.completeRentalOrder(orderId);
    }

    return updated!;
  }

  async completeRentalOrder(orderId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    await this._paymentService.releaseFunds(orderId, "rental");
    return (await this._orderRepo.updateOrder(orderId, { status: RentalStatus.COMPLETED }))!;
  }
}
