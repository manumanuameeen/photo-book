import { IReportRepository } from "../../../interfaces/repositories/IReportRepository.ts";
import { Report, IReport } from "../../../models/report.model.ts";

export class ReportRepository implements IReportRepository {
  async create(data: Partial<IReport>): Promise<IReport> {
    const report = new Report(data);
    return await report.save();
  }

  async findById(id: string): Promise<IReport | null> {
    return await Report.findById(id).exec();
  }

  async findAll(
    filter: Record<string, unknown> = {},
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ reports: IReport[]; total: number }> {
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reporterId", "firstName lastName email profileImage")
      .exec();

    const total = await Report.countDocuments(filter).exec();

    return { reports, total };
  }

  async update(id: string, data: Partial<IReport>): Promise<IReport | null> {
    return await Report.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
