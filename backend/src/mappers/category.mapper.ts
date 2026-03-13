import mongoose from "mongoose";
import { CategoryType } from "../models/category.model";
import type { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";
import type { ICategory } from "../models/category.model";
import type { ICategoryMapper, ICategoryResponseDto } from "./interfaces/ICategoryMapper.ts";
export class CategoryMapper implements ICategoryMapper {
  fromDto(dto: CreateCategoryDto): Partial<ICategory> {
    return {
      name: dto.name.trim().toLowerCase(),
      type: dto.type as CategoryType,
      description: dto.description,
      isBlocked: false,
      isSuggested: false,
    };
  }
  toResponse(category: ICategory): ICategoryResponseDto {
    return {
      id: category._id?.toString() || "",
      name: category.name,
      type: category.type,
      description: category.description,
      isBlocked: category.isBlocked,
      createdAt: category.createdAt || new Date(),
    };
  }
  fromUpdateDto(dto: UpdateCategoryDto): Partial<ICategory> {
    const updateData: Partial<ICategory> = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name.trim().toLowerCase();
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type as CategoryType;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.isBlocked !== undefined) {
      updateData.isBlocked = dto.isBlocked;
    }
    return updateData;
  }
  fromSuggestionDto(dto: unknown): { isSuggested: boolean; suggestionStatus: string } {
    return {
      isSuggested: true,
      suggestionStatus: "PENDING",
    };
  }
}
