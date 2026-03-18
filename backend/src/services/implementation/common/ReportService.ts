import {
  IReportService,
  IUpdateReportStatusDTO,
  ReportOwnerDetails,
  ReportTargetMetadata,
} from "../../../interfaces/services/IReportService.ts";
import { IReport } from "../../../models/report.model.ts";
import { IMessageService } from "../../../interfaces/services/IMessageService.ts";
import { IReportRepository } from "../../../interfaces/repositories/IReportRepository.ts";
import { RentalItemModel } from "../../../models/rentalItem.model.ts";
import { PhotographerModel } from "../../../models/photographer.model.ts";
import { User, IUser } from "../../../models/user.model.ts";
import { IMessage } from "../../../models/message.model.ts";
import mongoose from "mongoose";
import { CreateReportDTO, ApplyPenaltyDTO } from "../../../dto/report.dto.ts";
import { IFileService } from "../../../interfaces/services/IFileService.ts";
import { ModerationLog } from "../../../models/moderationLog.model.ts";

export class ReportService implements IReportService {
  private _messageService: IMessageService;
  private _reportRepository: IReportRepository;
  private _fileService: IFileService;

  constructor(
    messageService: IMessageService,
    reportRepository: IReportRepository,
    fileService: IFileService,
  ) {
    this._messageService = messageService;
    this._reportRepository = reportRepository;
    this._fileService = fileService;
  }

  async createReport(reporterId: string, data: CreateReportDTO): Promise<IReport> {
    return await this._reportRepository.create({
      reporterId: new mongoose.Types.ObjectId(reporterId),
      targetId: data.targetId,
      targetType: data.targetType,
      targetName: data.targetName,
      reason: data.reason,
      subReason: data.subReason,
      description: data.description,
      evidenceUrls: data.evidenceUrls,
      status: "pending",
      actionTaken: "none",
    });
  }

  async getReports(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{
    reports: (IReport & {
      ownerDetails?: ReportOwnerDetails;
      targetMetadata?: ReportTargetMetadata;
    })[];
    total: number;
  }> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const { reports, total } = await this._reportRepository.findAll(query, skip, limit);

    const enhancedReports = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject ? report.toObject() : report;
        let ownerDetails: ReportOwnerDetails | null = null;
        let targetMetadata: ReportTargetMetadata | null = null;

        try {
          if (report.targetType === "rental") {
            const rental = await RentalItemModel.findById(report.targetId).populate(
              "ownerId",
              "name email profileImage",
            );
            if (rental) {
              targetMetadata = {
                image: rental.images?.[0] || null,
                name: rental.name,
                price: rental.pricePerDay,
              };
              if (rental.ownerId) {
                const ownerDoc = rental.ownerId as unknown as Pick<
                  IUser,
                  "_id" | "name" | "email" | "profileImage"
                >;
                ownerDetails = {
                  name: ownerDoc.name || "",
                  email: ownerDoc.email,
                  profileImage: ownerDoc.profileImage,
                  _id: ownerDoc._id,
                };
              }
            }
          } else if (report.targetType === "photographer") {
            const photographer = await PhotographerModel.findById(report.targetId).populate(
              "userId",
              "name email profileImage",
            );
            if (photographer) {
              targetMetadata = {
                image: photographer.portfolio?.portfolioImages?.[0] || null,
                name: photographer.businessInfo?.businessName || "Photographer Profile",
              };
              if (photographer.userId) {
                const userDoc = photographer.userId as unknown as Pick<
                  IUser,
                  "_id" | "name" | "email" | "profileImage"
                >;
                ownerDetails = {
                  name: userDoc.name || "",
                  email: userDoc.email,
                  profileImage: userDoc.profileImage,
                  _id: userDoc._id,
                };
              }
            }
          } else if (report.targetType === "user") {
            const user = await User.findById(report.targetId);
            if (user) {
              const u = user as unknown as Pick<IUser, "_id" | "name" | "email" | "profileImage">;
              targetMetadata = {
                image: u.profileImage || null,
                name: u.name || "User",
              };
              ownerDetails = {
                name: u.name || "",
                email: u.email,
                profileImage: u.profileImage,
                _id: u._id,
              };
            }
          }
        } catch (error: unknown) {
          console.error(`Error populating report details for ${report._id}`, error);
        }

        return {
          ...reportObj,
          ownerDetails,
          targetMetadata,
        };
      }),
    );

    return { reports: enhancedReports, total };
  }

  async updateReportStatus(id: string, data: IUpdateReportStatusDTO): Promise<IReport | null> {
    return await this._reportRepository.update(id, data);
  }

  async forwardReportToChat(
    reportId: string,
    messageContent: string,
    adminId: string,
    recipientType: "reporter" | "owner",
  ): Promise<boolean> {
    const report = await this._reportRepository.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    let targetUserId: string | null = null;

    if (recipientType === "reporter") {
      targetUserId = report.reporterId.toString();
    } else {
      if (report.targetType === "rental") {
        const rental = await RentalItemModel.findById(report.targetId);
        if (rental && rental.ownerId) {
          targetUserId = rental.ownerId.toString();
        }
      } else if (report.targetType === "photographer") {
        const photographer = await PhotographerModel.findById(report.targetId);
        if (photographer && photographer.userId) {
          targetUserId = photographer.userId.toString();
        }
      } else if (report.targetType === "user") {
        targetUserId = report.targetId.toString();
      }
    }

    if (!targetUserId) {
      throw new Error("Could not resolve target user for this report message");
    }

    await this._messageService.sendSystemMessage(targetUserId, messageContent, adminId, reportId);

    const timestamp = new Date().toLocaleString();
    const recipientLabel = recipientType === "reporter" ? "Reporter" : "Owner";
    const actionLabel = recipientType === "reporter" ? "Requested Proof" : "Warning/Message";

    const newAdminNotes = report.adminNotes
      ? `${report.adminNotes}\n[${timestamp}] Sent ${actionLabel} to ${recipientLabel} via Chat`
      : `[${timestamp}] Sent ${actionLabel} to ${recipientLabel} via Chat`;

    await this._reportRepository.update(reportId, {
      adminNotes: newAdminNotes,
    });

    return true;
  }

  async applyPenaltyAndResolve(
    reportId: string,
    penaltyDto: ApplyPenaltyDTO,
    adminId: string,
  ): Promise<IReport | null> {
    const report = await this._reportRepository.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    const modLog = new ModerationLog({
      targetId: report.targetId,
      targetType: report.targetType,
      actionTaken: penaltyDto.actionTaken,
      reason: report.reason,
      adminId: new mongoose.Types.ObjectId(adminId),
      notes: penaltyDto.adminNotes,
      suspensionEndDate: penaltyDto.suspensionEndDate,
    });
    await modLog.save();

    const timestamp = new Date().toLocaleString();
    const finalNotes = report.adminNotes
      ? `${report.adminNotes}\n[${timestamp}] Penalty Applied: ${penaltyDto.actionTaken}. Notes: ${penaltyDto.adminNotes}`
      : `[${timestamp}] Penalty Applied: ${penaltyDto.actionTaken}. Notes: ${penaltyDto.adminNotes}`;

    let ownerId: string | null = null;
    let targetDoc:
      | (mongoose.Document & {
          _id?: mongoose.Types.ObjectId;
          ownerId?: mongoose.Types.ObjectId;
          userId?: mongoose.Types.ObjectId;
          isBlocked?: boolean;
          isBlock?: boolean;
          status?: string;
        })
      | null = null;
    if (report.targetType === "rental") {
      targetDoc = await RentalItemModel.findById(report.targetId);
      if (targetDoc && targetDoc.ownerId) ownerId = targetDoc.ownerId.toString();
    } else if (report.targetType === "photographer") {
      targetDoc = await PhotographerModel.findById(report.targetId);
      if (targetDoc && targetDoc.userId) ownerId = targetDoc.userId.toString();
    } else if (report.targetType === "user") {
      targetDoc = await User.findById(report.targetId);
      if (targetDoc && targetDoc._id) {
        ownerId = targetDoc._id.toString();
      }
    }

    if (penaltyDto.actionTaken === "block" && targetDoc) {
      if (report.targetType === "user") {
        targetDoc.isBlocked = true;
      } else if (report.targetType === "photographer") {
        targetDoc.isBlock = true;
      } else if (report.targetType === "rental") {
        targetDoc.status = "BLOCKED";
      }
      await targetDoc.save();
    }

    if (
      ownerId &&
      penaltyDto.actionTaken !== "resolved" &&
      penaltyDto.actionTaken !== "false_report_dismissed"
    ) {
      const penaltyMsg = `Action taken alert: A formal '${penaltyDto.actionTaken}' action has been placed on your account or listing due to a violation of our guidelines. Reason: ${report.reason.replace("_", " ")}. Notes: ${penaltyDto.adminNotes}`;
      await this._messageService.sendSystemMessage(ownerId, penaltyMsg, adminId, reportId);
    }

    if (report.reporterId) {
      const outcomeMsg =
        penaltyDto.actionTaken === "false_report_dismissed"
          ? `We reviewed your report regarding a ${report.targetType}. We found no violation of our guidelines at this time. Thank you for keeping our community safe.`
          : `Thanks for reporting. We've reviewed your report regarding a ${report.targetType} and took the necessary actions to keep our platform safe.`;

      await this._messageService.sendSystemMessage(
        report.reporterId.toString(),
        outcomeMsg,
        adminId,
        reportId,
      );
    }

    return await this._reportRepository.update(reportId, {
      status: penaltyDto.actionTaken === "false_report_dismissed" ? "dismissed" : "resolved",
      actionTaken: penaltyDto.actionTaken,
      adminNotes: finalNotes,
    });
  }

  async uploadEvidence(files: Express.Multer.File[], uploaderId: string): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }
    const evidenceUrls = await this._fileService.uploadMultipleFiles(
      files,
      "report-evidence",
      uploaderId,
    );
    return evidenceUrls;
  }

  async getReportMessages(reportId: string): Promise<IMessage[]> {
    return await this._messageService.getMessagesByReportId(reportId);
  }
}
