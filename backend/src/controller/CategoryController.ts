import { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import {
  CreateCategorySchema,
  GetCategoriesQueryDto,
  RejectCategorySchema,
  SuggestCategorySchema,
  UpdateCategorySchema,
} from "../dto/category.dto.ts";
import { ICategoryController } from "../interfaces/controllers/ICategoryController.ts";
import { ICategoryService } from "../interfaces/services/ICategoryService.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { AppError } from "../utils/AppError.ts";
import { ApiResponse } from "../utils/response.ts";

export class CategoryController implements ICategoryController {
  private readonly _service: ICategoryService;

  constructor(service: ICategoryService) {
    this._service = service;
  }

  private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  getCategories = async (req: Request, res: Response) => {
    try {
      const queryDto = this._validate(GetCategoriesQueryDto, req.query);

      const result = await this._service.getCategories({
        page: queryDto.page,
        limit: queryDto.limit,
        search: queryDto.search,
        isBlocked: queryDto.isBlocked,
        isActive: queryDto.isActive,
        isSuggested: queryDto.isSuggested,
      });

      ApiResponse.success(res, result, Messages.CATEGORIES_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  createCategory = async (req: Request, res: Response) => {
    try {
      const validatedData = this._validate(CreateCategorySchema, req.body);
      const category = await this._service.createCategory(
        validatedData.name,
        validatedData.type,
        validatedData.description,
      );
      ApiResponse.success(res, category, Messages.CATEGORY_CREATED, HttpStatus.CREATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  suggestCategory = async (req: AuthRequest, res: Response) => {
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
        userId,
      );
      ApiResponse.success(res, category, Messages.CATEGORY_SUGGESTION_submitted);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  approveCategory = async (req: AuthRequest, res: Response) => {
    try {
      const adminId = req.user?.userId;
      const { id } = req.params;
      const { message } = req.body;
      const updated = await this._service.approveCategory(id, message, adminId);
      if (!updated) {
        throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, updated, Messages.CATEGORY_APPROVED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  rejectCategory = async (req: AuthRequest, res: Response) => {
    try {
      const adminId = req.user?.userId;
      const { id } = req.params;
      const { reason } = RejectCategorySchema.parse(req.body);
      const updated = await this._service.rejectCategory(id, reason, adminId);
      if (!updated) {
        throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, updated, Messages.CATEGORY_REJECTED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = this._validate(UpdateCategorySchema, req.body);
      const updated = await this._service.updateCategory(id, validatedData);

      if (!updated) {
        throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, updated, Messages.CATEGORY_UPDATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await this._service.deleteCategory(id);
      if (!deleted) {
        throw new AppError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, null, Messages.CATEGORY_DELETED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  private _handleError(res: Response, error: unknown): void {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue) => issue.message).join(", ");
      ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
      return;
    }
    if (error instanceof AppError) {
      ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
      return;
    }
    if (error instanceof Error) {
      ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
      return;
    }
    ApiResponse.error(res, Messages.INTERNAL_ERROR);
  }
}
