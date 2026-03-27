import { Response } from "express";
import { IHelpService } from "../../interfaces/services/IHelpService";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IHelpController } from "../../interfaces/controllers/IHelpController";
import { handleError } from "../../utils/errorHandler";

export class HelpController implements IHelpController {
  private readonly _helpService: IHelpService;

  constructor(helpService: IHelpService) {
    this._helpService = helpService;
  }

  getAllHelp = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await this._helpService.getAllHelpContent();
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getHelpByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const data = await this._helpService.getHelpByCategory(category);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  createHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await this._helpService.createHelpSection(req.body);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.CREATED);
    } catch (error) {
      console.error("Error creating help section:", error);
      handleError(res, error);
    }
  };

  updateHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await this._helpService.updateHelpSection(id, req.body);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  deleteHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this._helpService.deleteHelpSection(id);
      ApiResponse.success(res, null, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  reorderHelpSections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newOrder } = req.body;
      const data = await this._helpService.reorderSections(id, newOrder);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };
}
