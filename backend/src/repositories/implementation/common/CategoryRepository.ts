import { BaseRepository } from "../../base/BaseRepository.ts";
import { FilterQuery } from "mongoose";
import { ICategory, CategoryModel } from "../../../models/category.model.ts";
import { ICategoryRepository } from "../../../interfaces/repositories/ICategoryRepository.ts";
import { ICategoryPagination, ICategoryQuery } from "../../../interfaces/services/ICategoryService.ts";

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findAll(query: ICategoryQuery): Promise<ICategoryPagination> {
    const { limit, page, search, isBlocked } = query;
    const skip = (page - 1) * limit;

    const filterQuery: FilterQuery<ICategory> = {};

    if (search) {
      filterQuery.name = { $regex: search, $options: "i" };
    }

    if (isBlocked && isBlocked !== "all") {
      const isBlk = isBlocked === "true";
      filterQuery.isBlocked = isBlk ? true : { $ne: true };
    }

    if (query.isActive && query.isActive !== "all") {
      const isAct = query.isActive === "true";
      filterQuery.isActive = isAct ? true : { $ne: true };
    }

    if (query.isSuggested !== undefined) {
      const isSug = query.isSuggested === "true";
      filterQuery.isSuggested = isSug ? true : { $ne: true };
    }

    const categories = await this._model
      .find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this._model.countDocuments(filterQuery);
    console.log("categories getting", categories);

    return {
      categories,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
