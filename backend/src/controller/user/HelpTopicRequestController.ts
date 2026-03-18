import { Response } from "express";
import { IHelpTopicRequestService } from "../../interfaces/services/IHelpTopicRequestService.ts";
import { ApiResponse } from "../../utils/response.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { IHelpTopicRequestController } from "../../interfaces/controllers/IHelpTopicRequestController.ts";
import { handleError } from "../../utils/errorHandler.ts";

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
      handleError(res, error);
    }
  };

  getAllRequests = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await this._service.getAllRequests();
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await this._service.updateRequestStatus(id, status);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };
}
