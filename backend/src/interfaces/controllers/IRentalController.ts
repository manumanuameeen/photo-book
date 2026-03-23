import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IRentalController {
  getAllItems(req: Request, res: Response): Promise<void>;
  getAdminItems(req: Request, res: Response): Promise<void>;
  getItemDetails(req: Request, res: Response): Promise<void>;
  rentItem(req: AuthRequest, res: Response): Promise<void>;
  createItem(req: AuthRequest, res: Response): Promise<void>;
  getUserOrders(req: AuthRequest, res: Response): Promise<void>;
  getUserItems(req: AuthRequest, res: Response): Promise<void>;
  updateItemStatus(req: Request, res: Response): Promise<void>;
  getOwnerOrders(req: Request, res: Response): Promise<void>;
  acceptOrder(req: Request, res: Response): Promise<void>;
  rejectOrder(req: Request, res: Response): Promise<void>;
  payDeposit(req: Request, res: Response): Promise<void>;
  confirmPayment(req: Request, res: Response): Promise<void>;
  updateItem(req: Request, res: Response): Promise<void>;
  createDepositPaymentIntent(req: Request, res: Response): Promise<void>;
  createBalancePaymentIntent: (req: Request, res: Response) => Promise<void>;
  payBalance: (req: Request, res: Response) => Promise<void>;
  completeOrder: (req: Request, res: Response) => Promise<void>;
  checkAvailability(req: Request, res: Response): Promise<void>;
  getUnavailableDates(req: Request, res: Response): Promise<void>;
  blockDates(req: Request, res: Response): Promise<void>;
  unblockDates(req: Request, res: Response): Promise<void>;
  getDashboardStats(req: Request, res: Response): Promise<void>;
  toggleLike(req: Request, res: Response): Promise<void>;
  cancelRentalOrder(req: AuthRequest, res: Response): Promise<void>;
}
