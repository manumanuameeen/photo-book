import { IBaseRepository } from "./IBaseRepository.ts";
import { ICategory } from "../../models/category.model.ts";
import { ICategoryPagination, ICategoryQuery } from "../services/ICategoryService.ts";

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findAll(query: ICategoryQuery): Promise<ICategoryPagination>;
}
