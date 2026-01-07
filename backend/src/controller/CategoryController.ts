import { Request, Response, NextFunction } from "express";
import { ICategoryController } from "./interface/ICategoryController.ts";
import { ICategoryService } from "../services/common/ICategoryService.ts";
import { ApiResponse } from "../utils/response.ts";
import { Messages } from "../constants/messages.ts";
import { z } from "zod";
import { CreateCategorySchema, UpdateCategorySchema, SuggestCategorySchema, GetCategoriesQueryDto, RejectCategorySchema } from "../dto/category.dto.ts";
import { AppError } from "../utils/AppError.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { CategoryType } from "../model/categoryModel.ts";

export class CategoryController implements ICategoryController {
    private _service: ICategoryService;

    constructor(service: ICategoryService) {
        this._service = service;
    }

    private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
        return schema.parse(data);
    }

    getCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("cat controller:", req.query)
            const queryDto = this._validate(GetCategoriesQueryDto, req.query);

            const result = await this._service.getCategories({
                page: queryDto.page,
                limit: queryDto.limit,
                search: queryDto.search,
                isBlocked: queryDto.isBlocked as any,
                isActive: queryDto.isActive as any,
                isSuggested: queryDto.isSuggested as any,
            });
            console.log("result from category controller:", result)
            ApiResponse.success(res, result, Messages.CATEGORIES_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    createCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = this._validate(CreateCategorySchema, req.body);
            const category = await this._service.createCategory(validatedData.name, validatedData.type, validatedData.description);
            ApiResponse.success(res, category, Messages.CATEGORY_CREATED, HttpStatus.CREATED);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map(issue => issue.message).join(", ");
                ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    suggestCategory = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const validatedData = this._validate(SuggestCategorySchema, req.body);
            const category = await this._service.suggestCategory(
                validatedData.name,
                validatedData.type,
                validatedData.description,
                validatedData.explanation,
                userId
            );
            ApiResponse.success(res, category, Messages.CATEGORY_SUGGESTION_submitted);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map(issue => issue.message).join(", ");
                ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    approveCategory = async (req: any, res: Response, next: NextFunction) => {
        try {
            const adminId = req.user?.userId;
            const { id } = req.params;
            const { message } = req.body;
            const updated = await this._service.approveCategory(id, message, adminId);
            if (!updated) {
                throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            ApiResponse.success(res, updated, "Category approved successfully");
        } catch (error) {
            next(error);
        }
    }

    rejectCategory = async (req: any, res: Response, next: NextFunction) => {
        try {
            const adminId = req.user?.userId;
            const { id } = req.params;
            const { reason } = RejectCategorySchema.parse(req.body);
            const updated = await this._service.rejectCategory(id, reason, adminId);
            if (!updated) {
                throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            ApiResponse.success(res, updated, "Category rejected successfully");
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map(issue => issue.message).join(", ");
                ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    updateCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const validatedData = this._validate(UpdateCategorySchema, req.body);
            const updated = await this._service.updateCategory(id, validatedData);

            if (!updated) {
                throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            ApiResponse.success(res, updated, Messages.CATEGORY_UPDATED);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map(issue => issue.message).join(", ");
                ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
            } else if (error instanceof AppError) {
                ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
            } else {
                next(error);
            }
        }
    }

    deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const deleted = await this._service.deleteCategory(id);
            if (!deleted) {
                throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            ApiResponse.success(res, null, Messages.CATEGORY_DELETED);
        } catch (error: any) {
            if (error instanceof AppError) {
                ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
            } else {
                next(error);
            }
        }
    }
}
