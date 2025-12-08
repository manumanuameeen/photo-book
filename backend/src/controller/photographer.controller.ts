import { ApiResponse } from "../utils/response";
import type { IPhotographerService } from "../services/photographer/IPhotographerService";
import { Messages } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatus";
import { ApplyPhtographerDto } from "../dto/photographer.dto";
import { Response, NextFunction } from "express";
import type { IPhtogrpherController } from "../interfaces/user/IPhotographyController";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import { IFileService } from "../services/external/IFileService";
import { ROLE } from "../constants/role";

export class PhotographerController implements IPhtogrpherController {
  private readonly _photoService: IPhotographerService;
  private readonly _fileService: IFileService;

  constructor(PhotoService: IPhotographerService, FileService: IFileService) {
    this._photoService = PhotoService;
    this._fileService = FileService;
  }

  apply = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(Messages.VERIFY_FIRST, HttpStatus.UNAUTHORIZED);
      let uploadedUrls: string[] = [];
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        uploadedUrls = await this._fileService.uploadMultipleFiles(files, ROLE.PHOTOGRAPHER, userId);
      }
      const payload = {
        ...req.body,
        portfolioImages: uploadedUrls,
      };
      const input = ApplyPhtographerDto.parse(payload);
      const result = await this._photoService.apply(userId, input);
      ApiResponse.success(res, result, Messages.APPLYED_SUCCESSFULLY, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };
}
