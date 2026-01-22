import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { IWalletService } from "../interfaces/services/IWalletService.ts";
import { AppError } from "../utils/AppError.ts";
import { Messages } from "../constants/messages.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { ApiResponse } from "../utils/response.ts";

import { IWalletController } from "../interfaces/controllers/IWalletController.ts";

import { IBookingRepository } from "../interfaces/repositories/IBookingRepository.ts";
import { IRentalRepository } from "../interfaces/repositories/IRentalRepository.ts";

export class WalletController implements IWalletController {
  private readonly walletService: IWalletService;
  private readonly bookingRepository: IBookingRepository; // Injected
  private readonly rentalRepository: IRentalRepository;   // Injected

  constructor(
    walletService: IWalletService,
    bookingRepository: IBookingRepository,
    rentalRepository: IRentalRepository
  ) {
    this.walletService = walletService;
    this.bookingRepository = bookingRepository;
    this.rentalRepository = rentalRepository;
  }

  getWalletDetails = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }
      const wallet = await this.walletService.ensureWalletExists(userId, req.user?.role || "user");
      const walletObj = wallet.toObject();
      const pendingBalance = wallet.transaction
        .filter((t) => t.status === "PENDING" && t.type === "CREDIT")
        .reduce((sum, t) => sum + t.amount, 0);
      ApiResponse.success(res, { ...walletObj, pendingBalance }, Messages.WALLET_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getWalletTransactions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.walletService.getWalletTransactions(userId, page, limit, type);
      console.log(`[WalletController] getTransactions for ${userId}: Balance=${result.balance}, Total=${result.total}`);
      ApiResponse.success(res, result, Messages.WALLET_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getEscrowStats = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId || req.user?.role !== "admin") {
        throw new AppError("Unauthorized access to Escrow Stats", HttpStatus.FORBIDDEN);
      }

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const [bookingStats, rentalStats] = await Promise.all([
        this.bookingRepository.findEscrowHoldings(page, limit, search),
        this.rentalRepository.findEscrowHoldings(page, limit, search),
      ]);

      ApiResponse.success(
        res,
        {
          bookings: bookingStats.bookings,
          rentals: rentalStats.orders,
          totalBookings: bookingStats.total,
          totalRentals: rentalStats.total,
        },
        Messages.WALLET_FETCHED,
      );
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId || req.user?.role !== "admin") {
        throw new AppError("Unauthorized access to Dashboard Stats", HttpStatus.FORBIDDEN);
      }

      const [bookingStats, rentalStats] = await Promise.all([
        this.bookingRepository.getAdminStats(),
        this.rentalRepository.getAdminStats(),
      ]);

      const totalStats = {
        volume: bookingStats.volume + rentalStats.volume,
        revenue: bookingStats.revenue + rentalStats.revenue,
        escrow: bookingStats.escrow + rentalStats.escrow,
        payouts: bookingStats.payouts + rentalStats.payouts,
      };

      ApiResponse.success(res, totalStats, Messages.WALLET_FETCHED);
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
