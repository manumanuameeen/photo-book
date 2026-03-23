import { IBaseRepository } from "./IBaseRepository";
import { ICategory } from "../../models/category.model";
import { ICategoryPagination, ICategoryQuery } from "../services/ICategoryService";

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findAll(query: ICategoryQuery): Promise<ICategoryPagination>;
}
