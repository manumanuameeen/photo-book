import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IAdminPhotographerController } from "../../interfaces/controllers/IAdminPhotographerController";
import { IAdminPhotographerService } from "../../interfaces/services/IAdminPhotographerService";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { AppError } from "../../utils/AppError";
import { handleError } from "../../utils/errorHandler";
import {
  GetPhotographersQueryDto,
  BlockPhotographerDto,
  ApprovedApplicationDto,
  RejectedApplicationDto,
  GetPackagesQueryDto,
} from "../../dto/admin-photographer.dto";

export class AdminPhotographerController implements IAdminPhotographerController {
  private readonly _service: IAdminPhotographerService;
  constructor(service: IAdminPhotographerService) {
    this._service = service;
  }

  getPhotographers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query = GetPhotographersQueryDto.parse(req.query);
      const result = await this._service.getPhotographers(query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getPhotographerById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this._service.getPhotographerById(req.params.id);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  blockPhotographer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reason } = BlockPhotographerDto.parse(req.body);
      await this._service.blockPhotographer(req.params.id, reason);
      ApiResponse.success(res, null, Messages.PHOTOGRAPHER_BLOCKED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  unblockPhotographer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this._service.unblockPhotographer(req.params.id);
      ApiResponse.success(res, null, Messages.PHOTOGRAPHER_UNBLOCKED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query = GetPhotographersQueryDto.parse(req.query);
      const result = await this._service.getApplications(query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this._service.getApplicationById(req.params.id);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  approveApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { message } = ApprovedApplicationDto.parse(req.body);
      await this._service.approveApplication(req.params.id, message);
      ApiResponse.success(res, null, Messages.APPLICATION_APPROVED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reason } = RejectedApplicationDto.parse(req.body);
      await this._service.rejectApplication(req.params.id, reason);
      ApiResponse.success(res, null, Messages.APPLICATION_REJECTED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this._service.getStatistics();
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getPackages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query = GetPackagesQueryDto.parse(req.query);
      const result = await this._service.getPackages(query);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  approvePackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this._service.approvePackage(req.params.id, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_APPROVED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  rejectPackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reason } = req.body;
      await this._service.rejectPackage(req.params.id, reason, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_REJECTED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  blockPackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reason } = req.body;
      await this._service.blockPackage(req.params.id, reason, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_BLOCKED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  unblockPackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this._service.unblockPackage(req.params.id, req.user?.userId);
      ApiResponse.success(res, null, Messages.PACKAGE_UNBLOCKED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  fixLegacyData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this._service.fixLegacyData();
      ApiResponse.success(res, result, Messages.LEGACY_MIGRATION_SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };
}
