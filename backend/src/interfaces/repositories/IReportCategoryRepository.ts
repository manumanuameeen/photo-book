import { IReportCategory } from "../models/IReportCategory";

export interface IReportCategoryRepository {
  create(data: Partial<IReportCategory>): Promise<IReportCategory>;
  findById(id: string): Promise<IReportCategory | null>;
  findAll(filter?: Record<string, unknown>): Promise<IReportCategory[]>;
  update(id: string, data: Partial<IReportCategory>): Promise<IReportCategory | null>;
  delete(id: string): Promise<boolean>;
}
