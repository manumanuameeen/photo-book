import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import {
  IPackageService,
  IAvailabilityService,
} from "../../interfaces/services/IPackageAvailabilityService";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { AppError } from "../../utils/AppError";
import { handleError } from "../../utils/errorHandler";

import { IPackageAvailabilityController } from "../../interfaces/controllers/IPackageAvailabilityController";

import { IFileService } from "../../interfaces/services/IFileService";

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

  createPackage = async (req: AuthRequest, res: Response) => {
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
      handleError(res, error);
    }
  };

  getPackages = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const { page, limit } = req.query;
      const result = await this._packageService.getPackagesByUserId(
        userId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );
      ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getPublicPackages = async (req: Request, res: Response) => {
    try {
      const { photographerId } = req.params;
      if (!photographerId)
        throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

      const { page, limit } = req.query;
      const result = await this._packageService.getPackagesByPhotographerId(
        photographerId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );
      ApiResponse.success(res, result, Messages.PACKAGES_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  updatePackage = async (req: AuthRequest, res: Response) => {
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
      handleError(res, error);
    }
  };

  deletePackage = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      await this._packageService.deletePackage(userId, id);
      ApiResponse.success(res, null, Messages.PACKAGE_DELETED);
    } catch (error) {
      handleError(res, error);
    }
  };

  setAvailability = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._availabilityService.setAvailability(userId, req.body);
      ApiResponse.success(res, result, Messages.AVAILABILITY_SET);
    } catch (error) {
      handleError(res, error);
    }
  };

  getAvailability = async (req: AuthRequest, res: Response) => {
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
      handleError(res, error);
    }
  };

  getPublicAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`🔍 getPublicAvailability hit. ID: ${id}`);

      if (!id) throw new AppError(Messages.PHOTOGRAPHER_ID_REQUIRED, HttpStatus.BAD_REQUEST);

      const { startDate, endDate } = req.query;
      console.log(`📅 Dates: ${startDate} to ${endDate}`);

      if (!startDate || !endDate) {
        throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const { PhotographerModel } = await import("../../models/photographer.model");
      const mongoose = (await import("mongoose")).default;

      let targetUserId = "";

      if (mongoose.Types.ObjectId.isValid(id)) {
        const photographer = await PhotographerModel.findOne({
          $or: [
            { _id: new mongoose.Types.ObjectId(id) },
            { userId: new mongoose.Types.ObjectId(id) },
          ],
        });

        if (photographer) {
          targetUserId = photographer.userId.toString();
          console.log(`✅ Found Photographer profile. Target UserID: ${targetUserId}`);
        } else {
          console.log("❌ Photographer not found by ID or UserID");
          throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
      } else {
        throw new AppError(Messages.INVALID_ID_FORMAT, HttpStatus.BAD_REQUEST);
      }

      const result = await this._availabilityService.getAvailability(
        targetUserId,
        new Date(startDate as string),
        new Date(endDate as string),
      );
      ApiResponse.success(res, result, Messages.AVAILABILITY_FETCHED);
    } catch (error) {
      console.error("Error in getPublicAvailability:", error);
      handleError(res, error);
    }
  };

  blockRange = async (req: AuthRequest, res: Response) => {
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
      handleError(res, error);
    }
  };

  unblockRange = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { startDate, endDate } = req.body;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      if (!startDate || !endDate) {
        throw new AppError(Messages.DATE_RANGE_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      await this._availabilityService.unblockRange(userId, new Date(startDate), new Date(endDate));
      ApiResponse.success(res, null, Messages.RANGE_UNBLOCKED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  deleteAvailability = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { date } = req.params;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      if (!date) throw new AppError(Messages.DATE_REQUIRED, HttpStatus.BAD_REQUEST);

      await this._availabilityService.deleteAvailability(userId, new Date(date));
      ApiResponse.success(res, null, Messages.AVAILABILITY_DELETED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  toggleLike = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      const { id } = req.params;
      const pkg = await this._packageService.toggleLike(id, userId);
      ApiResponse.success(res, pkg, Messages.LIKE_TOGGLED);
    } catch (error) {
      handleError(res, error);
    }
  };
}
