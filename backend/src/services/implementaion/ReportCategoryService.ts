import { IReportCategoryService } from "../../interfaces/services/IReportCategoryService.ts";
import { IReportCategoryRepository } from "../../interfaces/repositories/IReportCategoryRepository.ts";
import { IReportCategory } from "../../interfaces/models/IReportCategory.ts";
import {
    CreateReportCategoryDTO,
    UpdateReportCategoryDTO,
} from "../../dto/report.dto.ts";

export class ReportCategoryService implements IReportCategoryService {
    private _repository: IReportCategoryRepository;

    constructor(repository: IReportCategoryRepository) {
        this._repository = repository;
    }

    async createCategory(
        data: CreateReportCategoryDTO,
    ): Promise<IReportCategory> {
        const existing = await this._repository.findAll({ name: { $regex: new RegExp(`^${data.name}$`, "i") } });
        if (existing && existing.length > 0) {
            throw new Error(`Category with name '${data.name}' already exists.`);
        }

        return await this._repository.create({
            name: data.name,
            description: data.description,
            subReasons: data.subReasons,
            isActive: true,
        });
    }

    async getCategoryById(id: string): Promise<IReportCategory | null> {
        return await this._repository.findById(id);
    }

    async getAllCategories(
        filter: Record<string, unknown> = {},
    ): Promise<IReportCategory[]> {
        return await this._repository.findAll(filter);
    }

    async updateCategory(
        id: string,
        data: UpdateReportCategoryDTO,
    ): Promise<IReportCategory | null> {
        if (data.name) {
            const existing = await this._repository.findAll({ name: { $regex: new RegExp(`^${data.name}$`, "i") }, _id: { $ne: id } });
            if (existing && existing.length > 0) {
                throw new Error(`Category with name '${data.name}' already exists.`);
            }
        }
        return await this._repository.update(id, data);
    }

    async deleteCategory(id: string): Promise<boolean> {
        return await this._repository.delete(id);
    }
}
