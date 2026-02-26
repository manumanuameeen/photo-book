import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IRentalController {
  getAllItems(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAdminItems(req: Request, res: Response, next: NextFunction): Promise<void>;
  getItemDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  rentItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  createItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getUserOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getUserItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  updateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  getOwnerOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
  acceptOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
  rejectOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
  payDeposit(req: Request, res: Response, next: NextFunction): Promise<void>;
  confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateItem(req: Request, res: Response, next: NextFunction): Promise<void>;
  createDepositPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void>;
  createBalancePaymentIntent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  payBalance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  completeOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnavailableDates(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockDates(req: Request, res: Response, next: NextFunction): Promise<void>;
  unblockDates(req: Request, res: Response, next: NextFunction): Promise<void>;
  getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleLike(req: Request, res: Response, next: NextFunction): Promise<void>;
  cancelRentalOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
