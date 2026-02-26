import { Request, Response, NextFunction } from "express";
import { IReportService } from "../interfaces/services/IReportService.ts";
import { Messages } from "../constants/messages.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { IReportController } from "../interfaces/controllers/IReportController.ts";
import { CreateReportDTOSchema, ApplyPenaltyDTOSchema } from "../dto/report.dto.ts";

export class ReportController implements IReportController {
  private readonly _reportService: IReportService;

  constructor(reportService: IReportService) {
    this._reportService = reportService;
  }

  createReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reporterId = req.user?.userId;
      if (!reporterId) {
        return ApiResponse.error(
          res,
          Messages.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const parsed = CreateReportDTOSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(
          res,
          `Validation failed: ${parsed.error.issues[0]?.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const dto = parsed.data;

      const report = await this._reportService.createReport(reporterId, dto);

      ApiResponse.success(
        res,
        report,
        Messages.REPORT_SUBMITTED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this._reportService.getReports(page, limit, status);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!status) {
        return ApiResponse.error(res, Messages.STATUS_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const updatedReport = await this._reportService.updateReportStatus(id, {
        status,
        adminNotes,
      });

      if (!updatedReport) {
        return ApiResponse.error(res, Messages.REPORT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, updatedReport, Messages.REPORT_STATUS_UPDATED, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  forwardReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { message, recipientType } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        return ApiResponse.error(
          res,
          Messages.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!message || !recipientType) {
        return ApiResponse.error(
          res,
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

      ApiResponse.success(
        res,
        null,
        Messages.REPORT_FORWARDED,
        HttpStatus.OK,
      );
    } catch (error) {
      next(error);
    }
  };

  applyPenalty = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        return ApiResponse.error(
          res,
          Messages.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const parsed = ApplyPenaltyDTOSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(
          res,
          `Validation failed: ${parsed.error.issues[0]?.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const dto = parsed.data;

      const report = await this._reportService.applyPenaltyAndResolve(
        id,
        dto,
        adminId,
      );

      if (!report) {
        return ApiResponse.error(
          res,
          Messages.REPORT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      ApiResponse.success(
        res,
        report,
        "Penalty applied successfully",
        HttpStatus.OK,
      );
    } catch (error) {
      next(error);
    }
  };

  uploadEvidence = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const uploaderId = req.user?.userId;
      if (!uploaderId) {
        return ApiResponse.error(
          res,
          Messages.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return ApiResponse.error(res, "No files uploaded", HttpStatus.BAD_REQUEST);
      }

      const files = req.files as Express.Multer.File[];
      const urls = await this._reportService.uploadEvidence(files, uploaderId);

      return ApiResponse.success(res, { urls }, "Files uploaded successfully", HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  getReportMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const messages = await this._reportService.getReportMessages(id);

      ApiResponse.success(
        res,
        messages,
        "Report messages retrieved successfully",
        HttpStatus.OK,
      );
    } catch (error) {
      next(error);
    }
  };
}
