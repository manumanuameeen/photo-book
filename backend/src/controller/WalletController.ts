import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { IWalletService } from "../services/interfaces/IWalletService";
import { AppError } from "../utils/AppError";
import { Messages } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatus";
import { ApiResponse } from "../utils/response";

export class WalletController {
    constructor(private walletService: IWalletService) { }

    getWalletDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            // Ensure wallet exists or create it if missing (lazy creation)
            // Assumption: Wallet is keyed by userId (role logic handled in service if needed, usually 'user')
            const wallet = await this.walletService.ensureWalletExists(userId, req.user?.role || 'user');

            ApiResponse.success(res, wallet, "Wallet details fetched");
        } catch (error) {
            next(error);
        }
    };
}
