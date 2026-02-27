import { IReportCategory } from "../models/IReportCategory.ts";
import { CreateReportCategoryDTO, UpdateReportCategoryDTO } from "../../dto/report.dto.ts";

export interface IReportCategoryService {
  createCategory(data: CreateReportCategoryDTO): Promise<IReportCategory>;
  getCategoryById(id: string): Promise<IReportCategory | null>;
  getAllCategories(filter?: Record<string, unknown>): Promise<IReportCategory[]>;
  updateCategory(id: string, data: UpdateReportCategoryDTO): Promise<IReportCategory | null>;
  deleteCategory(id: string): Promise<boolean>;
}
