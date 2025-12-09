// import type { Response, NextFunction } from "express";
// import type { AuthRequest } from "../middleware/authMiddleware.ts";
// import type { IAdminPhotographerController } from "../interfaces/admin/IAdminPhotographerController.ts";
// import type { IAdminPhotographerService } from "../services/admin/interface/IAdminPhotographerService.ts";
// import { ApiResponse } from "../utils/response.ts";
// import { HttpStatus } from "../constants/httpStatus.ts";
// import { Messages } from "../constants/messages.ts";
// import { AppError } from "../utils/AppError.ts";

// export class AdminPhotographerController implements IAdminPhotographerController {
//     private readonly _adminPhotographerService: IAdminPhotographerService;

//     constructor(adminPhotographerService: IAdminPhotographerService) {
//         this._adminPhotographerService = adminPhotographerService;
//     }

//     getPhotographers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const result = await this._adminPhotographerService.getPhotographers(req.query);
//             ApiResponse.success(res, result, "Photographers fetched successfully");
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     getPhotographerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const photographer = await this._adminPhotographerService.getPhotographerById(req.params.id);
//             ApiResponse.success(res, photographer, "Photographer fetched successfully");
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     blockPhotographer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const { reason } = req.body;
//             await this._adminPhotographerService.blockPhotographer(req.params.id, reason);
//             ApiResponse.success(res, null, Messages.PHOTOGRAPHER_BLOCKED);
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     unblockPhotographer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             await this._adminPhotographerService.unblockPhotographer(req.params.id);
//             ApiResponse.success(res, null, Messages.PHOTOGRAPHER_UNBLOCKED);
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const result = await this._adminPhotographerService.getApplications(req.query);
//             ApiResponse.success(res, result, "Applications fetched successfully");
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const application = await this._adminPhotographerService.getApplicationById(req.params.id);
//             ApiResponse.success(res, application, "Application fetched successfully");
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     approveApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const { message } = req.body;
//             await this._adminPhotographerService.approveApplication(req.params.id, message || "");
//             ApiResponse.success(res, null, Messages.APPLICATION_APPROVED);
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     rejectApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const { reason } = req.body;
//             await this._adminPhotographerService.rejectApplication(req.params.id, reason);
//             ApiResponse.success(res, null, Messages.APPLICATION_REJECTED);
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const stats = await this._adminPhotographerService.getStatistics();
//             ApiResponse.success(res, stats, "Statistics fetched successfully");
//         } catch (error: unknown) {
//             this._handleError(res, error);
//         }
//     };

//     private _handleError(res: Response, error: unknown): void {
//         if (error instanceof AppError) {
//             ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
//             return;
//         }

//         if (error instanceof Error) {
//             ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
//             return;
//         }

//         ApiResponse.error(res, Messages.INTERNAL_ERROR);
//     }
// }

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
