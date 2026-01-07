import { IBaseRepository } from "./IBaseRepository.ts";
import { ICategory } from "../../model/categoryModel.ts";
import { ICategoryPagination, ICategoryQuery } from "../../services/common/ICategoryService.ts";

export interface ICategoryRepository extends IBaseRepository<ICategory> {
    findAll(query: ICategoryQuery): Promise<ICategoryPagination>;
}
