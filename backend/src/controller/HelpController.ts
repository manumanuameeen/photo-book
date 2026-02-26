import { Response } from "express";
import { IHelpService } from "../interfaces/services/IHelpService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { IHelpController } from "../interfaces/controllers/IHelpController.ts";

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
            this._handleError(res, error);
        }
    };

    getHelpByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { category } = req.params;
            const data = await this._helpService.getHelpByCategory(category);
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    createHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this._helpService.createHelpSection(req.body);
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.CREATED);
        } catch (error) {
            console.error("Error creating help section:", error);
            this._handleError(res, error);
        }
    };

    updateHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const data = await this._helpService.updateHelpSection(id, req.body);
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    deleteHelpSection = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this._helpService.deleteHelpSection(id);
            ApiResponse.success(res, null, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    reorderHelpSections = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { newOrder } = req.body;
            const data = await this._helpService.reorderSections(id, newOrder);
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    private _handleError(res: Response, error: unknown): void {
        const err = error as { statusCode?: number; message?: string };
        const status = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = err.message || Messages.INTERNAL_SERVER_ERROR;
        ApiResponse.error(res, message, status as HttpStatus);
    }
}
