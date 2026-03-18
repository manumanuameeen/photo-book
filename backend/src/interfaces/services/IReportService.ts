import { IReport } from "../../models/report.model.ts";
import { CreateReportDTO, ApplyPenaltyDTO } from "../../dto/report.dto.ts";
import { IMessage } from "../../models/message.model.ts";

export interface IUpdateReportStatusDTO {
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  adminNotes?: string;
}

export interface ReportOwnerDetails {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface ReportTargetMetadata {
  image: string | null;
  name: string;
  price?: number;
}

export interface IReportService {
  createReport(reporterId: string, data: CreateReportDTO): Promise<IReport>;

  getReports(
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<{
    reports: (IReport & {
      ownerDetails?: ReportOwnerDetails;
      targetMetadata?: ReportTargetMetadata;
    })[];
    total: number;
  }>;

  updateReportStatus(id: string, data: IUpdateReportStatusDTO): Promise<IReport | null>;

  forwardReportToChat(
    reportId: string,
    messageContent: string,
    adminId: string,
    recipientType: "reporter" | "owner",
  ): Promise<boolean>;

  applyPenaltyAndResolve(
    reportId: string,
    penaltyDto: ApplyPenaltyDTO,
    adminId: string,
  ): Promise<IReport | null>;

  uploadEvidence(files: Express.Multer.File[], uploaderId: string): Promise<string[]>;

  getReportMessages(reportId: string): Promise<IMessage[]>;
}
