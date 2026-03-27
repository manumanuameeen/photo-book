import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IWalletService } from "../../interfaces/services/IWalletService";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { HttpStatus } from "../../constants/httpStatus";
import { ApiResponse } from "../../utils/response";
import { IWalletController } from "../../interfaces/controllers/IWalletController";
import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository";
import { IRentalRepository } from "../../interfaces/repositories/IRentalRepository";
import { handleError } from "../../utils/errorHandler";

export class WalletController implements IWalletController {
  private readonly _walletService: IWalletService;
  private readonly _bookingRepository: IBookingRepository;
  private readonly _rentalRepository: IRentalRepository;

  constructor(
    walletService: IWalletService,
    bookingRepository: IBookingRepository,
    rentalRepository: IRentalRepository,
  ) {
    this._walletService = walletService;
    this._bookingRepository = bookingRepository;
    this._rentalRepository = rentalRepository;
  }

  getWalletDetails = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }
      const wallet = await this._walletService.ensureWalletExists(userId, req.user?.role || "user");
      const walletObj = wallet.toObject();
      const pendingBalance = wallet.transaction
        .filter((t) => t.status === "PENDING" && t.type === "CREDIT")
        .reduce((sum, t) => sum + t.amount, 0);
      ApiResponse.success(res, { ...walletObj, pendingBalance }, Messages.WALLET_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getWalletTransactions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const status = req.query.status as string;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const result = await this._walletService.getWalletTransactions(
        userId,
        page,
        limit,
        type,
        status,
      );
      console.log(
        `[WalletController] getTransactions for ${userId}: Balance=${result.balance}, Total=${result.total}`,
      );
      ApiResponse.success(res, result, Messages.WALLET_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getEscrowStats = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId || req.user?.role !== "admin") {
        throw new AppError(Messages.UNAUTHORIZED_ESCROW, HttpStatus.FORBIDDEN);
      }

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const [bookingStats, rentalStats] = await Promise.all([
        this._bookingRepository.findEscrowHoldings(page, limit, search),
        this._rentalRepository.findEscrowHoldings(page, limit, search),
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
      handleError(res, error);
    }
  };

  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId || req.user?.role !== "admin") {
        throw new AppError(Messages.UNAUTHORIZED_DASHBOARD, HttpStatus.FORBIDDEN);
      }

      const [bookingStats, rentalStats] = await Promise.all([
        this._bookingRepository.getAdminStats(),
        this._rentalRepository.getAdminStats(),
      ]);

      const totalStats = {
        volume: bookingStats.volume + rentalStats.volume,
        revenue: bookingStats.revenue + rentalStats.revenue,
        escrow: bookingStats.escrow + rentalStats.escrow,
        payouts: bookingStats.payouts + rentalStats.payouts,
      };

      ApiResponse.success(res, totalStats, Messages.WALLET_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };
}
