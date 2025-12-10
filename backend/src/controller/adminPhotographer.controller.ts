import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { IAdminPhotographerController } from "../interfaces/admin/IAdminPhotographerController";
import { IAdminPhotographerService } from "../services/admin/interface/IAdminPhotographerService";
import { ApiResponse } from "../utils/response";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/messages";
import {
    GetPhotographersQueryDto,
    BlockPhotographerDto,
    ApprovedApplicationDto,
    RejectedApplicationDto,
} from "../dto/admin-photographer.dto";

export class AdminPhotographerController implements IAdminPhotographerController {
    constructor(private readonly service: IAdminPhotographerService) { }

    getPhotographers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = GetPhotographersQueryDto.parse(req.query);
            const result = await this.service.getPhotographers(query);
            console.log("from controller",result)
            ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    getPhotographerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.getPhotographerById(req.params.id);
            ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    blockPhotographer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { reason } = BlockPhotographerDto.parse(req.body);
            await this.service.blockPhotographer(req.params.id, reason);
            ApiResponse.success(res, null, Messages.PHOTOGRAPHER_BLOCKED, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    unblockPhotographer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.unblockPhotographer(req.params.id);
            ApiResponse.success(res, null, Messages.PHOTOGRAPHER_UNBLOCKED, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = GetPhotographersQueryDto.parse(req.query);
            const result = await this.service.getApplications(query);
            ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.getApplicationById(req.params.id);
            ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    approveApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { message } = ApprovedApplicationDto.parse(req.body);
            await this.service.approveApplication(req.params.id, message);
            ApiResponse.success(res, null, Messages.APPLICATION_APPROVED, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    rejectApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { reason } = RejectedApplicationDto.parse(req.body);
            await this.service.rejectApplication(req.params.id, reason);
            ApiResponse.success(res, null, Messages.APPLICATION_REJECTED, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.getStatistics();
            ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };
}
