import { IReport } from "../../model/Report.ts";

export interface IReportRepository {
  create(data: Partial<IReport>): Promise<IReport>;
  findById(id: string): Promise<IReport | null>;
  findAll(
    filter?: Record<string, unknown>,
    skip?: number,
    limit?: number,
  ): Promise<{ reports: IReport[]; total: number }>;
  update(id: string, data: Partial<IReport>): Promise<IReport | null>;
}
