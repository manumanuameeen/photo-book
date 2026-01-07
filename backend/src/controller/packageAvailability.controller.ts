import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware"; // Adjust path if needed
import { IPackageService, IAvailabilityService } from "../services/photographer/IPackageAvailabilityService";
import { ApiResponse } from "../utils/response";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/messages";
import { AppError } from "../utils/AppError";

import { IPackageAvailabilityController } from "./interface/IPackageAvailabilityController";

import { IFileService } from "../services/external/IFileService";

export class PackageAvailabilityController implements IPackageAvailabilityController {
    private _packageService: IPackageService;
    private _availabilityService: IAvailabilityService;
    private _fileService: IFileService;

    constructor(packageService: IPackageService, availabilityService: IAvailabilityService, fileService: IFileService) {
        this._packageService = packageService;
        this._availabilityService = availabilityService;
        this._fileService = fileService;
    }



    createPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const file = req.file;
            let coverImage = req.body.coverImage;

            if (file) {
                coverImage = await this._fileService.uploadFile(file, "packages", userId);
            }

            let features = req.body.features;
            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch {
                    features = features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                }
            }

            const packageData = { ...req.body, coverImage, features };

            const result = await this._packageService.createPackage(userId, packageData);
            ApiResponse.success(res, result, Messages.PACKAGE_CREATED, HttpStatus.CREATED);
        } catch (error) {
            next(error);
        }
    };

    getPackages = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const result = await this._packageService.getPhotographerPackages(userId);
            ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
        } catch (error) {
            next(error);
        }
    };

    getPublicPackages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { photographerId } = req.params;
            if (!photographerId) throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

            const result = await this._packageService.getPhotographerPackages(photographerId);
            ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
        } catch (error) {
            next(error);
        }
    };

    updatePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const file = req.file;
            let coverImage = req.body.coverImage;

            if (file) {
                coverImage = await this._fileService.uploadFile(file, "packages", userId);
            }

            let features = req.body.features;
            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch {
                    features = features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                }
            }

            const updateData = { ...req.body, id };
            if (coverImage) updateData.coverImage = coverImage;
            if (features) updateData.features = features;

            const result = await this._packageService.updatePackage(userId, updateData);
            ApiResponse.success(res, result, Messages.PACKAGE_UPDATED);
        } catch (error) {
            next(error);
        }
    };

    deletePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            await this._packageService.deletePackage(userId, id);
            ApiResponse.success(res, null, Messages.PACKAGE_DELETED);
        } catch (error) {
            next(error);
        }
    };


    setAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const result = await this._availabilityService.setAvailability(userId, req.body);
            ApiResponse.success(res, result, Messages.AVAILABILITY_SET);
        } catch (error) {
            next(error);
        }
    };


    getAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const { startDate, endDate } = req.query;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            if (!startDate || !endDate) {
                throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
            }

            const result = await this._availabilityService.getAvailability(
                userId,
                new Date(startDate as string),
                new Date(endDate as string)
            );
            ApiResponse.success(res, result, Messages.AVAILABILITY_FETCHED);
        } catch (error) {
            next(error);
        }
    };

    getPublicAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (!id) throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
            }


            const { PhotographerModel } = await import("../model/photographerModel");

            let targetUserId = id;
            const photographer = await PhotographerModel.findById(id);
            if (photographer) {
                targetUserId = photographer.userId.toString();
            } else {

                throw new AppError("Photographer not found", HttpStatus.NOT_FOUND);
            }

            const result = await this._availabilityService.getAvailability(
                targetUserId,
                new Date(startDate as string),
                new Date(endDate as string)
            );
            ApiResponse.success(res, result, Messages.AVAILABILITY_FETCHED);
        } catch (error) {
            next(error);
        }
    };


    blockRange = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const { startDate, endDate } = req.body;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            if (!startDate || !endDate) {
                throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
            }

            await this._availabilityService.blockRange(
                userId,
                new Date(startDate),
                new Date(endDate)
            );
            ApiResponse.success(res, null, "Range of dates blocked successfully", HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };
}
