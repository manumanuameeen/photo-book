import { Request, Response } from "express";
import { IReportService } from "../../interfaces/services/IReportService.ts";
import { Messages } from "../../constants/messages.ts";
import { ApiResponse } from "../../utils/response.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { IReportController } from "../../interfaces/controllers/IReportController.ts";
import { CreateReportDTOSchema, ApplyPenaltyDTOSchema } from "../../dto/report.dto.ts";
import { AppError } from "../../utils/AppError.ts";
import { handleError } from "../../utils/errorHandler.ts";

export class ReportController implements IReportController {
  private readonly _reportService: IReportService;

  constructor(reportService: IReportService) {
    this._reportService = reportService;
  }

  createReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reporterId = req.user?.userId;
      if (!reporterId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const parsed = CreateReportDTOSchema.parse(req.body);
      const report = await this._reportService.createReport(reporterId, parsed);

      ApiResponse.success(res, report, Messages.REPORT_SUBMITTED, HttpStatus.CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this._reportService.getReports(page, limit, status);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!status) {
        throw new AppError(Messages.STATUS_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const updatedReport = await this._reportService.updateReportStatus(id, {
        status,
        adminNotes,
      });

      if (!updatedReport) {
        throw new AppError(Messages.REPORT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, updatedReport, Messages.REPORT_STATUS_UPDATED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  forwardReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { message, recipientType } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (!message || !recipientType) {
        throw new AppError(
          "Message content and recipient type are required",
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._reportService.forwardReportToChat(
        id,
        message,
        adminId,
        recipientType as "reporter" | "owner",
      );

      ApiResponse.success(res, null, Messages.REPORT_FORWARDED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  applyPenalty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const parsed = ApplyPenaltyDTOSchema.parse(req.body);
      const report = await this._reportService.applyPenaltyAndResolve(id, parsed, adminId);

      if (!report) {
        throw new AppError(Messages.REPORT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, report, "Penalty applied successfully", HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  uploadEvidence = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uploaderId = req.user?.userId;
      if (!uploaderId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError("No files uploaded", HttpStatus.BAD_REQUEST);
      }

      const files = req.files as Express.Multer.File[];
      const urls = await this._reportService.uploadEvidence(files, uploaderId);

      ApiResponse.success(res, { urls }, "Files uploaded successfully", HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getReportMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const messages = await this._reportService.getReportMessages(id);

      ApiResponse.success(res, messages, "Report messages retrieved successfully", HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };
}
