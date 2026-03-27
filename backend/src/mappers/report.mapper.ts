import mongoose from "mongoose";
import type { CreateReportDTO, ApplyPenaltyDTO } from "../dto/report.dto";
import type { IReport } from "../models/report.model";
import type { IReportMapper, IReportResponseDto } from "./interfaces/IReportMapper";
export class ReportMapper implements IReportMapper {
  fromDto(dto: CreateReportDTO): Partial<IReport> {
    return {
      reporterId: new mongoose.Types.ObjectId(),
      targetId: dto.targetId ?? "",
      targetType: (dto.targetType ?? "user") as "photographer" | "rental" | "user" | "package",
      targetName: dto.targetName,
      reason: dto.reason,
      subReason: dto.subReason,
      description: dto.description,
      evidenceUrls: dto.evidenceUrls ?? [],
      status: "pending",
      actionTaken: "none",
    };
  }
  toResponse(report: IReport): IReportResponseDto {
    return {
      id: report._id?.toString() ?? "",
      reporterId: report.reporterId?.toString() ?? "",
      targetId: report.targetId ?? "",
      targetType: report.targetType,
      reason: report.reason,
      status: report.status,
      actionTaken: report.actionTaken ?? "none",
      createdAt: report.createdAt ?? new Date(),
    };
  }
  fromPenaltyDto(dto: ApplyPenaltyDTO): {
    actionTaken: string;
    adminNotes: string;
    suspensionEndDate?: Date;
  } {
    return {
      actionTaken: dto.actionTaken,
      adminNotes: dto.adminNotes,
      suspensionEndDate: dto.suspensionEndDate,
    };
  }
}
