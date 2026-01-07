import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.ts";
import type { IPhtogrpherController } from "../interfaces/user/IPhotographyController.ts";
import type { IPhotographerService } from "../services/photographer/IPhotographerService.ts";
import type { IFileService } from "../services/external/IFileService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";
import { z } from "zod";
import { ApplyPhtographerDto } from "../dto/photographer.dto.ts";


export class PhotographerController implements IPhtogrpherController {
    private readonly _photographerService: IPhotographerService;
    private readonly _fileService: IFileService;

    constructor(photographerService: IPhotographerService, fileService: IFileService) {
        this._photographerService = photographerService;
        this._fileService = fileService;
    }

    private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
        return schema.parse(data);
    }

    apply = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const files = req.files as Express.Multer.File[];
            console.log("Files received:", files?.length || 0);

            let portfolioImages: string[] = [];
            if (files && files.length > 0) {
                try {
                    portfolioImages = await this._fileService.uploadMultipleFiles(
                        files,
                        "photographer",
                        userId
                    );
                    console.log("✅ Uploaded to S3:", portfolioImages.length, "images");
                    console.log("S3 URLs:", portfolioImages);
                } catch (uploadError) {
                    console.error("❌ S3 upload error:", uploadError);
                    throw new AppError("Failed to upload images to S3", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                console.log("No files to upload");
            }

            const input = this._validate(ApplyPhtographerDto, {
                ...req.body,
                specialties: Array.isArray(req.body.specialties)
                    ? req.body.specialties
                    : req.body['specialties[]'] || [],
                portfolioImages: portfolioImages
            });

            console.log("Validated input - images count:", input.portfolioImages?.length || 0);

            const result = await this._photographerService.apply(userId, input);
            console.log("✅ Application created - images:", result.portfolioImages?.length || 0);

            ApiResponse.success(res, result, Messages.APPLYED_SUCCESSFULLY, HttpStatus.CREATED);
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    };

    private _handleError(res: Response, error: unknown): void {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            console.error("Validation error:", errorMessages);
            ApiResponse.error(res, errorMessages, HttpStatus.BAD_REQUEST);
            return;
        }
        if (error instanceof AppError) {
            console.error("App error:", error.message);
            ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
            return;
        }
        if (error instanceof Error) {
            console.error("Error:", error.message);
            ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
            return;
        }
        console.error("Unknown error:", error);
        ApiResponse.error(res, Messages.INTERNAL_ERROR);
    }

    getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const stats = await this._photographerService.getDashboardStats(userId);
            ApiResponse.success(res, stats, "Dashboard stats fetched successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    };

    getBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const { status, page, limit } = req.query;

            const bookings = await this._photographerService.getBookings(
                userId,
                status as string,
                page ? parseInt(page as string) : 1,
                limit ? parseInt(limit as string) : 10
            );

            ApiResponse.success(res, bookings, "Bookings fetched successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    }

    getPhotographers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { category, priceRange, location, lat, lng } = req.query;

            const photographers = await this._photographerService.getPhotographers({
                category: category as string,
                priceRange: priceRange as string,
                location: location as string,
                lat: lat ? parseFloat(lat as string) : undefined,
                lng: lng ? parseFloat(lng as string) : undefined
            });

            ApiResponse.success(res, photographers, "Photographers fetched successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    }

    getPhotographerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const photographer = await this._photographerService.getPhotographerById(id);
            ApiResponse.success(res, photographer, "Photographer fetched successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    }

    addReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }
            const { id } = req.params;
            const reviewData = req.body;

            if (!reviewData.rating || !reviewData.comment) {
                throw new AppError("Rating and comment are required", HttpStatus.BAD_REQUEST);
            }

            const review = await this._photographerService.addReview(userId, id, reviewData);
            ApiResponse.success(res, review, "Review added successfully", HttpStatus.CREATED);
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    }
}