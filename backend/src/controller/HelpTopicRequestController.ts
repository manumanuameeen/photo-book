import { Response } from "express";
import { IHelpTopicRequestService } from "../interfaces/services/IHelpTopicRequestService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { IHelpTopicRequestController } from "../interfaces/controllers/IHelpTopicRequestController.ts";

export class HelpTopicRequestController implements IHelpTopicRequestController {
    private readonly _service: IHelpTopicRequestService;

    constructor(service: IHelpTopicRequestService) {
        this._service = service;
    }

    submitRequest = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                ApiResponse.error(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
                return;
            }
            const data = await this._service.createRequest({ ...req.body, user: userId });
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.CREATED);
        } catch (error) {
            console.error("Error submitting help topic request:", error);
            this._handleError(res, error);
        }
    };

    getAllRequests = async (_req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this._service.getAllRequests();
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            console.error("Error fetching help topic requests:", error);
            this._handleError(res, error);
        }
    };

    updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const data = await this._service.updateRequestStatus(id, status);
            ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
        } catch (error) {
            console.error("Error updating help topic request status:", error);
            this._handleError(res, error);
        }
    };

    private _handleError(res: Response, error: unknown): void {
        const err = error as { statusCode?: number; message?: string };
        const status = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        ApiResponse.error(res, err.message || "Failed to process request", status as HttpStatus);
    }
}
