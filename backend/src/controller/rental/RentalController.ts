import { Request, Response } from "express";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";
import { IRentalController } from "../../interfaces/controllers/IRentalController.ts";
import { IFileService } from "../../interfaces/services/IFileService.ts";
import { IRentalService } from "../../interfaces/services/IRentalService.ts";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { AppError } from "../../utils/AppError.ts";
import { ApiResponse } from "../../utils/response.ts";
import { handleError } from "../../utils/errorHandler.ts";
import {
  CreateRentalItemDTO,
  UpdateRentalItemDTO,
  RentItemDTO,
  BlockDatesDTO,
} from "../../dto/rental.dto.ts";

export class RentalController implements IRentalController {
  constructor(
    private readonly _rentalService: IRentalService,
    private readonly _fileService: IFileService,
  ) {}

  getAllItems = async (req: AuthRequest, res: Response) => {
    try {
      const { category, page, limit } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;

      const userId = req.user?.userId;

      const result = await this._rentalService.getAllRentalItems(
        category as string,
        pageNum,
        limitNum,
        userId,
      );
      ApiResponse.success(res, result, Messages.RENTAL_ITEMS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getAdminItems = async (req: Request, res: Response) => {
    try {
      const { status, page, limit, search } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;
      const result = await this._rentalService.getAdminRentalItems(
        status as string,
        pageNum,
        limitNum,
        search as string,
      );
      ApiResponse.success(res, result, Messages.ADMIN_ITEMS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getItemDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await this._rentalService.getRentalItemDetails(id);
      ApiResponse.success(res, item, Messages.ITEM_DETAILS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  rentItem = async (req: AuthRequest, res: Response) => {
    try {
      console.log("[RentalController] rentItem called");
      console.log("[RentalController] Body:", JSON.stringify(req.body));

      const userId = req.user?.userId;
      const { itemIds, startDate, endDate, paymentIntentId, paymentMethod } =
        req.body as RentItemDTO;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      let parsedItemIds = itemIds;
      if (typeof itemIds === "string") {
        try {
          if (itemIds.trim().startsWith("[")) {
            parsedItemIds = JSON.parse(itemIds);
          } else {
            parsedItemIds = [itemIds];
          }
        } catch (error_) {
          console.warn("[RentalController] itemIds parse error, using as array:", error_);
          parsedItemIds = [itemIds];
        }
      }

      if (!parsedItemIds || (Array.isArray(parsedItemIds) && parsedItemIds.length === 0)) {
        parsedItemIds = [itemIds].flat();
      }

      console.log("[RentalController] Calling service with:", {
        userId,
        parsedItemIds,
        startDate,
        endDate,
        paymentMethod,
      });

      const result = await this._rentalService.rentItem(
        userId,
        parsedItemIds as string[],
        new Date(startDate),
        new Date(endDate),
        paymentIntentId,
        paymentMethod,
      );

      ApiResponse.success(res, result, Messages.ITEM_RENT_REQUEST_SUBMITTED);
    } catch (error) {
      console.error("[RentalController] rentItem Error:", error);
      handleError(res, error);
    }
  };

  confirmPayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        throw new AppError("Payment Intent ID is required", HttpStatus.BAD_REQUEST);
      }

      await this._rentalService.confirmRentalPayment(id, paymentIntentId);
      ApiResponse.success(res, { success: true }, "Payment confirmed successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  createItem = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const files = req.files as Express.Multer.File[];

      console.log("DEBUG: Rental Create Body:", req.body);
      console.log("DEBUG: Rental Create Files:", files?.length);

      const imageUrls = [];

      if (files && files.length > 0) {
        const newUrls = await this._fileService.uploadMultipleFiles(files, "rental-items", userId);
        imageUrls.push(...newUrls);
      }

      const itemData: CreateRentalItemDTO = {
        ...(req.body as CreateRentalItemDTO),
        pricePerDay: Number(req.body.pricePerDay),
        securityDeposit: Number(req.body.securityDeposit),
        minRentalPeriod: Number(req.body.minRentalPeriod),
        ownerId: userId,
        images: imageUrls,
      };

      const item = await this._rentalService.createRentalItem(itemData);
      ApiResponse.success(res, item, Messages.RENTAL_ITEM_CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      const page = req.query.page ? Number.parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const orders = await this._rentalService.getUserRentalOrders(
        userId,
        page,
        limit,
        search,
        status,
      );
      ApiResponse.success(res, orders, Messages.USER_RENTAL_ORDERS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getUserItems = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const { page, limit } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;

      const result = await this._rentalService.getUserRentalItems(userId, pageNum, limitNum);
      ApiResponse.success(res, result, Messages.USER_ITEMS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateItemStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      const item = await this._rentalService.updateRentalItemStatus(id, status, userId, role);
      ApiResponse.success(res, item, Messages.ITEM_STATUS_UPDATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getOwnerOrders = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const page = req.query.page ? Number.parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const orders = await this._rentalService.getOwnerRentalOrders(
        userId,
        page,
        limit,
        search,
        status,
      );
      ApiResponse.success(res, orders, "Owner orders fetched successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;
      const result = await this._rentalService.getAllRentalOrders(
        pageNum,
        limitNum,
        search as string,
        status as string,
      );
      ApiResponse.success(res, result, "All rental orders fetched");
    } catch (error) {
      handleError(res, error);
    }
  };

  updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._rentalService.updateOrderStatus(id, status, userId, role);
      ApiResponse.success(res, result, "Order status updated");
    } catch (error) {
      handleError(res, error);
    }
  };

  getOrderDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this._rentalService.getOrderDetails(id);
      ApiResponse.success(res, result, "Order details fetched");
    } catch (error) {
      handleError(res, error);
    }
  };

  acceptOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const order = await this._rentalService.acceptRentalOrder(id, userId);
      ApiResponse.success(res, order, "Order accepted");
    } catch (error) {
      handleError(res, error);
    }
  };

  rejectOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const order = await this._rentalService.rejectRentalOrder(id, userId);
      ApiResponse.success(res, order, "Order rejected");
    } catch (error) {
      handleError(res, error);
    }
  };

  payDeposit = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      if (!paymentIntentId) {
        throw new AppError("Payment Intent ID is required", HttpStatus.BAD_REQUEST);
      }

      const order = await this._rentalService.payRentalDeposit(id, paymentIntentId);
      ApiResponse.success(res, order, "Deposit paid");
    } catch (error) {
      handleError(res, error);
    }
  };

  createDepositPaymentIntent = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const session = await this._rentalService.createDepositPaymentIntent(id);
      ApiResponse.success(res, { url: session.url }, "Payment session created");
    } catch (error) {
      handleError(res, error);
    }
  };

  createBalancePaymentIntent = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const session = await this._rentalService.createBalancePaymentIntent(id);
      ApiResponse.success(res, session, "Balance payment intent created");
    } catch (error) {
      handleError(res, error);
    }
  };

  payBalance = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      if (!paymentIntentId) {
        throw new AppError("Payment Intent ID is required", HttpStatus.BAD_REQUEST);
      }

      const order = await this._rentalService.payRentalBalance(id, paymentIntentId);
      ApiResponse.success(res, order, "Balance paid successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  completeOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const order = await this._rentalService.completeRentalOrder(id);
      ApiResponse.success(res, order, "Order completed and funds released");
    } catch (error) {
      handleError(res, error);
    }
  };

  updateItem = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      await this._checkItemOwnership(id, userId, role);

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

      const updateData: UpdateRentalItemDTO = {
        ...(req.body as UpdateRentalItemDTO),
        images: imageUrls,
      };

      if (req.body.pricePerDay) updateData.pricePerDay = Number(req.body.pricePerDay);
      if (req.body.securityDeposit) updateData.securityDeposit = Number(req.body.securityDeposit);
      if (req.body.minRentalPeriod) updateData.minRentalPeriod = Number(req.body.minRentalPeriod);

      const updatedItem = await this._rentalService.updateRentalItem(id, updateData);
      ApiResponse.success(res, updatedItem, "Item updated successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  checkAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError("Start and End dates are required", HttpStatus.BAD_REQUEST);
      }

      const isAvailable = await this._rentalService.checkItemAvailability(
        id,
        new Date(startDate as string),
        new Date(endDate as string),
      );
      ApiResponse.success(res, { isAvailable }, "Availability checked");
    } catch (error) {
      handleError(res, error);
    }
  };

  getUnavailableDates = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this._rentalService.getUnavailableDates(id);
      ApiResponse.success(res, result, "Unavailable dates fetched");
    } catch (error) {
      handleError(res, error);
    }
  };

  blockDates = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, reason } = req.body as BlockDatesDTO;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._rentalService.blockRentalDates(
        id,
        new Date(startDate),
        new Date(endDate),
        reason,
        userId,
        role,
      );
      ApiResponse.success(res, result, "Dates blocked successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  unblockDates = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._rentalService.unblockRentalDates(
        id,
        new Date(startDate),
        new Date(endDate),
        userId,
        role,
      );
      ApiResponse.success(res, result, "Dates unblocked successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const stats = await this._rentalService.getRentalDashboardStats(userId);
      ApiResponse.success(res, stats, "Dashboard stats fetched successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  requestReschedule = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { requestedStartDate, requestedEndDate, reason } = req.body;
      const userId = req.user?.userId;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!requestedStartDate || !requestedEndDate || !reason) {
        throw new AppError("Start date, end date, and reason are required", HttpStatus.BAD_REQUEST);
      }

      const result = await this._rentalService.requestReschedule(
        id,
        new Date(requestedStartDate),
        new Date(requestedEndDate),
        reason,
      );
      ApiResponse.success(res, result, "Reschedule request submitted successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  respondToReschedule = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!action || (action !== "approve" && action !== "reject")) {
        throw new AppError("Invalid action", HttpStatus.BAD_REQUEST);
      }

      const result = await this._rentalService.respondToReschedule(id, action, userId, role);
      ApiResponse.success(res, result, "Reschedule request " + action + "ed");
    } catch (error) {
      handleError(res, error);
    }
  };

  toggleLike = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);

      const result = await this._rentalService.toggleLike(id, userId);
      ApiResponse.success(res, result, "Like toggled");
    } catch (error) {
      handleError(res, error);
    }
  };

  cancelRentalOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason, isEmergency } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }

      const result = await this._rentalService.cancelRentalOrder(id, userId, reason, isEmergency);
      ApiResponse.success(res, result, "Rental order cancelled successfully");
    } catch (error) {
      handleError(res, error);
    }
  };

  private async _checkItemOwnership(itemId: string, userId: string, role?: string): Promise<void> {
    const currentItem = await this._rentalService.getRentalItemDetails(itemId);
    if (role !== "admin") {
      const ownerId =
        currentItem.ownerId &&
        typeof currentItem.ownerId === "object" &&
        "_id" in currentItem.ownerId
          ? (currentItem.ownerId as { _id: string | { toString(): string } })._id.toString()
          : String(currentItem.ownerId);

      if (ownerId !== userId) {
        throw new AppError("Unauthorized to update this item", HttpStatus.FORBIDDEN);
      }
    }
  }
}
