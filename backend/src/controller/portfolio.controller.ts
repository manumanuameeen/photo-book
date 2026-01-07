import { Request, Response, NextFunction } from "express";
import { IPortfolioController } from "./interface/IPortfolioController";
import { IPortfolioService } from "../services/photographer/IPortfolioService";
import { IFileService } from "../services/external/IFileService";
import { AuthRequest } from "../middleware/authMiddleware";
import { ApiResponse } from "../utils/response";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/messages";


export class PortfolioController implements IPortfolioController {
    private _service: IPortfolioService;
    private _fileService: IFileService;

    constructor(service: IPortfolioService, fileService: IFileService) {

        this._service = service;
        this._fileService = fileService;

    }

    createSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const { title, coverImage } = req.body;
            const result = await this._service.createSection(userId, title, coverImage);
            ApiResponse.success(res, result, Messages.SECTION_CREATED, HttpStatus.CREATED);
        } catch (error) {
            next(error);
        }
    };

    getSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const result = await this._service.getSections(userId);
            ApiResponse.success(res, result, Messages.SECTIONS_FETCHED);
        } catch (error) {
            next(error);
        }
    };

    updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        res.status(501).json({ message: "Not Implemented" });
    };

    deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;
            const { id } = req.params;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            await this._service.deleteSection(userId, id);
            ApiResponse.success(res, null, Messages.SECTION_DELETED);
        } catch (error) {
            next(error);
        }
    };

    addImageToSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;
            const { id } = req.params;

            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);


            let imageUrl: string;
            if (req.file) {
                imageUrl = await this._fileService.uploadFile(req.file, "portfolio", userId);
            } else if (req.body.imageUrl) {
                imageUrl = req.body.imageUrl;
            } else {
                throw new AppError("No image provided", HttpStatus.BAD_REQUEST);
            }


            const section = await this._service.getSectionById(userId, id);
            if (section && section.images.length >= 8) {
                throw new AppError("Maximum 8 images allowed per section", HttpStatus.BAD_REQUEST);
            }

            const result = await this._service.addImage(userId, id, imageUrl);
            ApiResponse.success(res, result, Messages.IMAGE_ADDED_TO_SECTION);
        } catch (error) {
            next(error);
        }
    };

    removeImageFromSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;
            const { id } = req.params;
            const { imageUrl } = req.body;
            if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

            const result = await this._service.removeImage(userId, id, imageUrl);
            ApiResponse.success(res, result, Messages.IMAGE_REMOVED_FROM_SECTION);
        } catch (error) {
            next(error);
        }
    };
}
