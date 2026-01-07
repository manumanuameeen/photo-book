import { ICategory, CategoryType } from "../../model/categoryModel.ts";

export interface ICategoryQuery {
    page: number;
    limit: number;
    search?: string;
    isBlocked?: "true" | "false" | "all";
    isActive?: "true" | "false" | "all";
    isSuggested?: string;
}

export interface ICategoryPagination {
    categories: ICategory[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface ICategoryService {
    getCategories(query: ICategoryQuery): Promise<ICategoryPagination>;
    createCategory(name: string, type: CategoryType, description: string): Promise<ICategory>;
    suggestCategory(name: string, type: string, description: string, explanation: string, userId: string): Promise<ICategory>;
    approveCategory(id: string, message?: string, adminId?: string): Promise<ICategory | null>;
    rejectCategory(id: string, reason: string, adminId?: string): Promise<ICategory | null>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    deleteCategory(id: string): Promise<boolean>;
}
