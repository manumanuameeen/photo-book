import { Request, Response } from "express";
import { IPortfolioController } from "../../interfaces/controllers/IPortfolioController.ts";
import { IPortfolioService } from "../../interfaces/services/IPortfolioService.ts";
import { IFileService } from "../../interfaces/services/IFileService.ts";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { ApiResponse } from "../../utils/response.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";
import { handleError } from "../../utils/errorHandler.ts";
import { generateCaption } from "../../services/external/aiCaptionService.ts";
import { generateTags } from "../../services/external/aiTagService.ts";
import { getImageEmbedding } from "../../services/external/aiSearchService.ts";

export class PortfolioController implements IPortfolioController {
  private _service: IPortfolioService;
  private _fileService: IFileService;

  constructor(service: IPortfolioService, fileService: IFileService) {
    this._service = service;
    this._fileService = fileService;
  }

  createSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const { title, coverImage } = req.body;
      const result = await this._service.createSection(userId, title, coverImage);
      ApiResponse.success(res, result, Messages.SECTION_CREATED, HttpStatus.CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getSections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._service.getSectionsByUserId(userId);
      ApiResponse.success(res, result, Messages.SECTIONS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateSection = async (req: Request, res: Response): Promise<void> => {
    ApiResponse.error(res, Messages.NOT_IMPLEMENTED, HttpStatus.NOT_IMPLEMENTED);
  };

  deleteSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      await this._service.deleteSection(userId, id);
      ApiResponse.success(res, null, Messages.SECTION_DELETED);
    } catch (error) {
      handleError(res, error);
    }
  };

  addImageToSection = async (req: AuthRequest, res: Response): Promise<void> => {
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

      // AI Processing
      let aiCaption = "";
      let aiTags: string[] = [];
      let aiEmbedding: number[] = [];

      if (req.file?.buffer) {
        const base64Image = req.file.buffer.toString("base64");
        const [captionResult, tagResult, embeddingResult] = await Promise.allSettled([
          generateCaption(base64Image),
          generateTags(base64Image),
          getImageEmbedding(base64Image),
        ]);
        if (captionResult.status === "fulfilled") aiCaption = captionResult.value.caption;
        if (tagResult.status === "fulfilled") aiTags = tagResult.value.tags;
        if (embeddingResult.status === "fulfilled") aiEmbedding = embeddingResult.value.embedding;
      }

      const result = await this._service.addImage(userId, id, imageUrl, aiCaption, aiTags, aiEmbedding);
      ApiResponse.success(res, result, Messages.IMAGE_ADDED_TO_SECTION);
    } catch (error) {
      handleError(res, error);
    }
  };

  removeImageFromSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { imageUrl } = req.body;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

      const result = await this._service.removeImage(userId, id, imageUrl);
      ApiResponse.success(res, result, Messages.IMAGE_REMOVED_FROM_SECTION);
    } catch (error) {
      handleError(res, error);
    }
  };

  toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      const { id } = req.params;
      const section = await this._service.toggleLike(userId, id);
      ApiResponse.success(res, section, Messages.LIKE_TOGGLED);
    } catch (error) {
      handleError(res, error);
    }
  };
}
