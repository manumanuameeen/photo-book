import type { CreateReportDTO, ApplyPenaltyDTO } from "../../dto/report.dto.ts";
import type { IReport } from "../../model/Report.ts";
import type { IMapper } from "./IMapper.ts";
export interface IReportResponseDto {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: string;
  reason: string;
  status: string;
  actionTaken: string;
  createdAt: Date;
}
export interface IReportMapper extends IMapper<CreateReportDTO, IReport, IReportResponseDto> {
  fromPenaltyDto(dto: ApplyPenaltyDTO): {
    actionTaken: string;
    adminNotes: string;
    suspensionEndDate?: Date;
  };
}
