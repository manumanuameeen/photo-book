import { IReportCategoryRepository } from "../../../interfaces/repositories/IReportCategoryRepository";
import { ReportCategory } from "../../../models/reportCategory.model";
import { IReportCategory } from "../../../interfaces/models/IReportCategory";

export class ReportCategoryRepository implements IReportCategoryRepository {
  async create(data: Partial<IReportCategory>): Promise<IReportCategory> {
    const category = new ReportCategory(data);
    return await category.save();
  }

  async findById(id: string): Promise<IReportCategory | null> {
    return await ReportCategory.findById(id).exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IReportCategory[]> {
    return await ReportCategory.find(filter).sort({ name: 1 }).exec();
  }

  async update(id: string, data: Partial<IReportCategory>): Promise<IReportCategory | null> {
    return await ReportCategory.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReportCategory.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
