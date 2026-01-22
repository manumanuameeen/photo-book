import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { IAdminPhotographerController } from "../interfaces/admin/IAdminPhotographerController.ts";
import { IAdminPhotographerService } from "../interfaces/services/IAdminPhotographerService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";
import {
  GetPhotographersQueryDto,
  BlockPhotographerDto,
  ApprovedApplicationDto,
  RejectedApplicationDto,
} from "../dto/admin-photographer.dto";

export class AdminPhotographerController implements IAdminPhotographerController {
  private readonly service: IAdminPhotographerService;
  constructor(service: IAdminPhotographerService) {
    this.service = service;
  }

  getPhotographers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetPhotographersQueryDto.parse(req.query);
      const result = await this.service.getPhotographers(query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPhotographerById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.getPhotographerById(req.params.id);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  blockPhotographer = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { reason } = BlockPhotographerDto.parse(req.body);
      await this.service.blockPhotographer(req.params.id, reason);
      ApiResponse.success(res, null, Messages.PHOTOGRAPHER_BLOCKED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  unblockPhotographer = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.service.unblockPhotographer(req.params.id);
      ApiResponse.success(res, null, Messages.PHOTOGRAPHER_UNBLOCKED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetPhotographersQueryDto.parse(req.query);
      const result = await this.service.getApplications(query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getApplicationById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.getApplicationById(req.params.id);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  approveApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { message } = ApprovedApplicationDto.parse(req.body);
      await this.service.approveApplication(req.params.id, message);
      ApiResponse.success(res, null, Messages.APPLICATION_APPROVED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  rejectApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { reason } = RejectedApplicationDto.parse(req.body);
      await this.service.rejectApplication(req.params.id, reason);
      ApiResponse.success(res, null, Messages.APPLICATION_REJECTED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getStatistics();
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPackages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPackages(req.query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  approvePackage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.approvePackage(req.params.id, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_APPROVED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  rejectPackage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reason } = req.body;
      await this.service.rejectPackage(req.params.id, reason, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_REJECTED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  blockPackage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reason } = req.body;
      await this.service.blockPackage(req.params.id, reason, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_BLOCKED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  unblockPackage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.unblockPackage(req.params.id, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_UNBLOCKED, HttpStatus.OK);
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
