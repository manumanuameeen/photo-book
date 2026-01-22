import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import {
  IPackageService,
  IAvailabilityService,
} from "../interfaces/services/IPackageAvailabilityService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";

import { IPackageAvailabilityController } from "../interfaces/controllers/IPackageAvailabilityController.ts";

import { IFileService } from "../interfaces/services/IFileService.ts";

export class PackageAvailabilityController implements IPackageAvailabilityController {
  private _packageService: IPackageService;
  private _availabilityService: IAvailabilityService;
  private _fileService: IFileService;

  constructor(
    packageService: IPackageService,
    availabilityService: IAvailabilityService,
    fileService: IFileService,
  ) {
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
      if (typeof features === "string") {
        try {
          features = JSON.parse(features);
        } catch {
          features = features
            .split(",")
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);
        }
      }

      const packageData = { ...req.body, coverImage, features };

      const result = await this._packageService.createPackage(userId, packageData);
      ApiResponse.success(res, result, Messages.PACKAGE_CREATED, HttpStatus.CREATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPackages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._packageService.getPhotographerPackages(userId);
      ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPublicPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { photographerId } = req.params;
      if (!photographerId)
        throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

      const result = await this._packageService.getPhotographerPackages(photographerId);
      ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
    } catch (error) {
      this._handleError(res, error);
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
      if (typeof features === "string") {
        try {
          features = JSON.parse(features);
        } catch {
          features = features
            .split(",")
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);
        }
      }

      const updateData = { ...req.body, id };
      if (coverImage) updateData.coverImage = coverImage;
      if (features) updateData.features = features;

      const result = await this._packageService.updatePackage(userId, updateData);
      ApiResponse.success(res, result, Messages.PACKAGE_UPDATED);
    } catch (error) {
      this._handleError(res, error);
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
      this._handleError(res, error);
    }
  };

  setAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._availabilityService.setAvailability(userId, req.body);
      ApiResponse.success(res, result, Messages.AVAILABILITY_SET);
    } catch (error) {
      this._handleError(res, error);
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
        new Date(endDate as string),
      );
      ApiResponse.success(res, result, Messages.AVAILABILITY_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPublicAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`🔍 getPublicAvailability hit. ID: ${id}`);

      if (!id) throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

      const { startDate, endDate } = req.query;
      console.log(`📅 Dates: ${startDate} to ${endDate}`);

      if (!startDate || !endDate) {
        throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      // Dynamic import to avoid potential circular dependencies if any
      const { PhotographerModel } = await import("../model/photographerModel");
      const mongoose = (await import("mongoose")).default;

      let targetUserId = "";

      if (mongoose.Types.ObjectId.isValid(id)) {
        // Try to find if it's a Photographer Profile ID or a User ID linked to a photographer
        const photographer = await PhotographerModel.findOne({
          $or: [
            { _id: new mongoose.Types.ObjectId(id) },
            { userId: new mongoose.Types.ObjectId(id) }
          ]
        });

        if (photographer) {
          targetUserId = photographer.userId.toString();
          console.log(`✅ Found Photographer profile. Target UserID: ${targetUserId}`);
        } else {
          console.log("❌ Photographer not found by ID or UserID");
          throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
      } else {
        throw new AppError("Invalid ID format", HttpStatus.BAD_REQUEST);
      }

      const result = await this._availabilityService.getAvailability(
        targetUserId,
        new Date(startDate as string),
        new Date(endDate as string),
      );
      ApiResponse.success(res, result, Messages.AVAILABILITY_FETCHED);
    } catch (error) {
      console.error("Error in getPublicAvailability:", error);
      this._handleError(res, error);
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

      await this._availabilityService.blockRange(userId, new Date(startDate), new Date(endDate));
      ApiResponse.success(res, null, Messages.RANGE_BLOCKED, HttpStatus.OK);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  deleteAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { date } = req.params;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      if (!date) throw new AppError("Date is required", HttpStatus.BAD_REQUEST);

      await this._availabilityService.deleteAvailability(userId, new Date(date));
      ApiResponse.success(res, null, "Availability deleted", HttpStatus.OK);
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

