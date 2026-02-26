import { Request, Response } from "express";
import { IRentalItemService } from "../../interfaces/services/rental/IRentalItemService.ts";
import { IRentalOrderService } from "../../interfaces/services/rental/IRentalOrderService.ts";
import { IRentalPaymentService } from "../../interfaces/services/rental/IRentalPaymentService.ts";
import { IFileService } from "../../interfaces/services/IFileService.ts";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { AppError } from "../../utils/AppError.ts";
import { ApiResponse } from "../../utils/response.ts";
import { Messages } from "../../constants/messages.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import jwt from "jsonwebtoken";
import { CreateRentalItemDTO, BlockDatesDTO, UpdateRentalItemDTO } from "../../dto/rental.dto.ts";

export class RentalController {
  constructor(
    private readonly _itemService: IRentalItemService,
    private readonly _orderService: IRentalOrderService,
    private readonly _paymentService: IRentalPaymentService,
    private readonly _fileService: IFileService,
  ) {}

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

  getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, page, limit } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;

      let userId: string | undefined = undefined;
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.accessToken;

      if (authHeader?.startsWith("Bearer ") || cookieToken) {
        try {
          const token = authHeader ? authHeader.split(" ")[1] : cookieToken;
          const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || (process.env.JWT_SECRET as string),
          ) as { userId?: string; id?: string };
          userId = decoded.userId || decoded.id;
        } catch (error: unknown) {
          console.warn("Failed to decode token in getAllItems:", error);
        }
      }

      const result = await this._itemService.getAllRentalItems(
        category as string,
        pageNum,
        limitNum,
        userId,
      );
      ApiResponse.success(res, result, Messages.RENTAL_ITEMS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getItemDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this._itemService.getRentalItemDetails(id);
      ApiResponse.success(res, item, Messages.ITEM_DETAILS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  rentItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { itemIds, startDate, endDate, paymentIntentId, paymentMethod } = req.body;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      let parsedItemIds: string[];
      if (typeof itemIds === "string") {
        try {
          if (itemIds.trim().startsWith("[")) {
            parsedItemIds = JSON.parse(itemIds);
          } else {
            parsedItemIds = [itemIds];
          }
        } catch {
          parsedItemIds = [itemIds];
        }
      } else if (Array.isArray(itemIds)) {
        parsedItemIds = itemIds;
      } else {
        parsedItemIds = [itemIds];
      }

      const result = await this._orderService.rentItem(
        userId,
        parsedItemIds,
        new Date(startDate),
        new Date(endDate),
        paymentIntentId,
        paymentMethod,
      );
      ApiResponse.success(res, result, Messages.ITEM_RENT_REQUEST_SUBMITTED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        throw new AppError(Messages.PAYMENT_INTENT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      await this._paymentService?.confirmRentalPayment(id, paymentIntentId);
      ApiResponse.success(res, { success: true }, Messages.PAYMENT_CONFIRMED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  createItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const files = req.files as Express.Multer.File[];
      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        const newUrls = await this._fileService.uploadMultipleFiles(files, "rental-items", userId);
        imageUrls.push(...newUrls);
      }

      const itemData: CreateRentalItemDTO = {
        ...req.body,
        pricePerDay: Number(req.body.pricePerDay),
        securityDeposit: Number(req.body.securityDeposit),
        minRentalPeriod: Number(req.body.minRentalPeriod),
        ownerId: userId,
        images: imageUrls,
      };

      const item = await this._itemService.createRentalItem(itemData);
      ApiResponse.success(res, item, Messages.RENTAL_ITEM_CREATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._orderService.getUserRentalOrders(
        userId,
        Number(req.query.page || 1),
        Number(req.query.limit || 10),
        req.query.search as string,
        req.query.status as string,
      );
      ApiResponse.success(res, result, Messages.USER_RENTAL_ORDERS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getUserItems = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._itemService.getUserRentalItems(
        userId,
        Number(req.query.page || 1),
        Number(req.query.limit || 10),
      );
      ApiResponse.success(res, result, Messages.USER_ITEMS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  updateItemStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      const item = await this._itemService.updateRentalItemStatus(id, status, userId, role);
      ApiResponse.success(res, item, Messages.ITEM_STATUS_UPDATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getOwnerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._orderService.getOwnerRentalOrders(
        userId,
        Number(req.query.page || 1),
        Number(req.query.limit || 10),
        req.query.search as string,
        req.query.status as string,
      );

      ApiResponse.success(res, result, Messages.OWNER_ORDERS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      await this._orderService.updateOrderStatus(id, status, userId, req.user?.role);
      ApiResponse.success(res, { success: true }, Messages.ORDER_STATUS_UPDATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._orderService.getOrderDetails(req.params.id);
      ApiResponse.success(res, result, Messages.ORDER_DETAILS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  acceptOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._orderService.acceptRentalOrder(req.params.id, userId);
      ApiResponse.success(res, result, Messages.ORDER_ACCEPTED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  rejectOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._orderService.rejectRentalOrder(req.params.id, userId);
      ApiResponse.success(res, result, Messages.ORDER_REJECTED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  payDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        throw new AppError(Messages.PAYMENT_INTENT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }
      const result = await this._paymentService.payRentalDeposit(req.params.id, paymentIntentId);
      ApiResponse.success(res, result, Messages.DEPOSIT_PAID);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  createDepositPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const session = await this._paymentService.createDepositPaymentIntent(req.params.id);
      ApiResponse.success(res, { url: session.url }, Messages.PAYMENT_SESSION_CREATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  createBalancePaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const session = await this._paymentService.createBalancePaymentIntent(req.params.id);
      ApiResponse.success(res, session, Messages.BALANCE_PAYMENT_INTENT_CREATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  payBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        throw new AppError(Messages.PAYMENT_INTENT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }
      const result = await this._paymentService.payRentalBalance(req.params.id, paymentIntentId);
      ApiResponse.success(res, result, Messages.BALANCE_PAID);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  completeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this._paymentService.completeRentalOrder(req.params.id);
      ApiResponse.success(res, result, Messages.ORDER_COMPLETED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const files = req.files as Express.Multer.File[];
      let imageUrls: string[] = [];
      if (req.body.existingImages) {
        const existing = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
        imageUrls = [...existing];
      }
      if (files && files.length > 0) {
        const newUrls = await this._fileService.uploadMultipleFiles(files, "rental-items", userId);
        imageUrls.push(...newUrls);
      }

      const updateData: UpdateRentalItemDTO = { ...req.body, images: imageUrls };
      if (req.body.pricePerDay) updateData.pricePerDay = Number(req.body.pricePerDay);
      if (req.body.securityDeposit) updateData.securityDeposit = Number(req.body.securityDeposit);
      if (req.body.minRentalPeriod) updateData.minRentalPeriod = Number(req.body.minRentalPeriod);

      const result = await this._itemService.updateRentalItem(id, updateData);
      ApiResponse.success(res, result, Messages.ITEM_UPDATED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new AppError("Start and end dates are required", HttpStatus.BAD_REQUEST);
      }
      const isAvailable = await this._itemService.checkItemAvailability(
        req.params.id,
        new Date(startDate as string),
        new Date(endDate as string),
      );
      ApiResponse.success(res, { isAvailable }, Messages.AVAILABILITY_CHECKED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getUnavailableDates = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._itemService.getUnavailableDates(req.params.id);
      ApiResponse.success(res, result, Messages.DATES_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  blockDates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, reason } = req.body as BlockDatesDTO;
      const result = await this._itemService.blockRentalDates(
        req.params.id,
        new Date(startDate),
        new Date(endDate),
        reason,
        req.user?.userId,
        req.user?.role,
      );
      ApiResponse.success(res, result, Messages.DATES_BLOCKED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  unblockDates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._itemService.unblockRentalDates(
        req.params.id,
        new Date(startDate),
        new Date(endDate),
        userId,
        req.user?.role,
      );
      ApiResponse.success(res, result, Messages.DATES_UNBLOCKED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const result = await this._orderService.getRentalDashboardStats(userId);
      ApiResponse.success(res, result, Messages.STATS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      const { id } = req.params;
      const item = await this._itemService.toggleLike(id, userId);
      ApiResponse.success(res, item, Messages.LIKE_TOGGLED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  requestReschedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate, reason } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._orderService.requestReschedule(
        id,
        new Date(startDate),
        new Date(endDate),
        reason,
      );
      ApiResponse.success(res, result, Messages.RESCHEDULE_REQUEST_SUBMITTED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  respondToReschedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { decision } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._orderService.respondToReschedule(id, decision);
      ApiResponse.success(res, result, `${Messages.RESCHEDULE_PROCESSED}: ${decision}`);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };
}
