import {
  ICategoryService,
  ICategoryQuery,
  ICategoryPagination,
} from "../../interfaces/services/ICategoryService";
import { CategoryRepository } from "../../repositories/common/category.repository";
import { ICategory, CategoryType } from "../../models/category.model";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { IMessageService } from "../../interfaces/services/IMessageService";
import mongoose from "mongoose";

export class CategoryService implements ICategoryService {
  private _repository: CategoryRepository;
  private _messageService: IMessageService;

  constructor(repository: CategoryRepository, messageService: IMessageService) {
    this._repository = repository;
    this._messageService = messageService;
  }

  async getCategories(query: ICategoryQuery): Promise<ICategoryPagination> {
    return await this._repository.findAll(query);
  }

  async createCategory(name: string, type: string, description: string): Promise<ICategory> {
    const trimmedName = name.trim();
    const escapedName = trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`^${escapedName}$`, "i");

    const existingCategory = await this._repository.findOne({
      name: { $regex: regex },
    } as Record<string, unknown>);
    if (existingCategory) {
      throw new AppError(Messages.CATEGORY_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    return await this._repository.create({
      name: trimmedName.toLowerCase(),
      type: type as CategoryType,
      description,
      isBlocked: false,
    });
  }

  async suggestCategory(
    name: string,
    type: string,
    description: string,
    explanation: string,
    userId: string,
  ): Promise<ICategory> {
    return await this._repository.create({
      name,
      type: type as CategoryType,
      description,
      explanation,
      isBlocked: true,
      isSuggested: true,
      suggestionStatus: "PENDING",
      requestedBy: new mongoose.Types.ObjectId(userId),
    });
  }

  async approveCategory(id: string, message?: string, adminId?: string): Promise<ICategory | null> {
    const updated = await this._repository.update(id, {
      suggestionStatus: "APPROVED",
      isBlocked: false,
      isSuggested: false,
    });

    if (updated && updated.requestedBy) {
      const content = message || `Your category suggestion "${updated.name}" has been approved.`;
      await this._messageService.sendSystemMessage(
        updated.requestedBy.toString(),
        content,
        adminId,
      );
    }

    return updated;
  }

  async rejectCategory(id: string, reason: string, adminId?: string): Promise<ICategory | null> {
    const updated = await this._repository.update(id, {
      suggestionStatus: "REJECTED",
      rejectionReason: reason,
      isBlocked: true,
      isSuggested: false,
    });

    if (updated && updated.requestedBy) {
      const content = `Your category suggestion "${updated.name}" was rejected. Reason: ${reason}`;
      await this._messageService.sendSystemMessage(
        updated.requestedBy.toString(),
        content,
        adminId,
      );
    }

    return updated;
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    if (data.name) {
      const trimmedName = data.name.trim();
      const escapedName = trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = new RegExp(`^${escapedName}$`, "i");

      const existingCategory = await this._repository.findOne({
        name: { $regex: regex },
        _id: { $ne: id },
      } as Record<string, unknown>);

      if (existingCategory) {
        throw new AppError(Messages.CATEGORY_ALREADY_EXISTS, HttpStatus.CONFLICT);
      }
      data.name = trimmedName.toLowerCase();
    }
    return await this._repository.update(id, data);
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (this._repository.delete) {
      return await this._repository.delete(id);
    }
    return false;
  }
}


