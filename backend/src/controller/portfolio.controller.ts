import { Request, Response, NextFunction } from "express";
import { IPortfolioController } from "../interfaces/controllers/IPortfolioController.ts";
import { IPortfolioService } from "../interfaces/services/IPortfolioService.ts";
import { IFileService } from "../interfaces/services/IFileService.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { ApiResponse } from "../utils/response.ts";
import { AppError } from "../utils/AppError.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";

export class PortfolioController implements IPortfolioController {
  private _service: IPortfolioService;
  private _fileService: IFileService;

  constructor(service: IPortfolioService, fileService: IFileService) {
    this._service = service;
    this._fileService = fileService;
  }

  createSection = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const { title, coverImage } = req.body;
      const result = await this._service.createSection(userId, title, coverImage);
      ApiResponse.success(res, result, Messages.SECTION_CREATED, HttpStatus.CREATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getSections = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._service.getSectionsByUserId(userId);
      ApiResponse.success(res, result, Messages.SECTIONS_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  updateSection = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    ApiResponse.error(res, Messages.NOT_IMPLEMENTED, HttpStatus.NOT_IMPLEMENTED);
  };

  deleteSection = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      await this._service.deleteSection(userId, id);
      ApiResponse.success(res, null, Messages.SECTION_DELETED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  addImageToSection = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      let imageUrl: string;
      if (req.file) {
        imageUrl = await this._fileService.uploadFile(req.file, "portfolio", userId);
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
      } else {
        throw new AppError(Messages.NO_IMAGE_PROVIDED, HttpStatus.BAD_REQUEST);
      }

      const section = await this._service.getSectionById(userId, id);
      if (section && section.images.length >= 8) {
        throw new AppError(Messages.MAX_IMAGES_EXCEEDED, HttpStatus.BAD_REQUEST);
      }

      const result = await this._service.addImage(userId, id, imageUrl);
      ApiResponse.success(res, result, Messages.IMAGE_ADDED_TO_SECTION);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  removeImageFromSection = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { imageUrl } = req.body;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._service.removeImage(userId, id, imageUrl);
      ApiResponse.success(res, result, Messages.IMAGE_REMOVED_FROM_SECTION);
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

  toggleLike = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      const { id } = req.params;
      const section = await this._service.toggleLike(userId, id);
      ApiResponse.success(res, section, Messages.LIKE_TOGGLED);
    } catch (error) {
      this._handleError(res, error);
    }
  };
}
