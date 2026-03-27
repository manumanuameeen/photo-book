import { Request, Response } from "express";
import { IReportCategoryController } from "../../interfaces/controllers/IReportCategoryController";
import { IReportCategoryService } from "../../interfaces/services/IReportCategoryService";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { CreateReportCategoryDTOSchema, UpdateReportCategoryDTOSchema } from "../../dto/report.dto";

export class ReportCategoryController implements IReportCategoryController {
  private _service: IReportCategoryService;

  constructor(service: IReportCategoryService) {
    this._service = service;
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreateReportCategoryDTOSchema.safeParse(req.body);
      if (!parsed.success) {
        ApiResponse.error(
          res,
          `Validation failed: ${parsed.error.issues[0]?.message}`,
          HttpStatus.BAD_REQUEST,
        );
        return;
      }
      const dto = parsed.data;

      const category = await this._service.createCategory(dto);
      ApiResponse.success(res, category, "Category created successfully", HttpStatus.CREATED);
    } catch (error: unknown) {
      const err = error as Error;
      const status = err.message.includes("already exists")
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;
      ApiResponse.error(res, err.message, status);
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const category = await this._service.getCategoryById(req.params.id);
      if (!category) {
        ApiResponse.error(res, "Category not found", HttpStatus.NOT_FOUND);
        return;
      }
      ApiResponse.success(res, category, "Category found");
    } catch (error: unknown) {
      const err = error as Error;
      ApiResponse.error(res, err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this._service.getAllCategories();
      ApiResponse.success(res, categories, "Categories retrieved successfully");
    } catch (error: unknown) {
      const err = error as Error;
      ApiResponse.error(res, err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const parsed = UpdateReportCategoryDTOSchema.safeParse(req.body);
      if (!parsed.success) {
        ApiResponse.error(
          res,
          `Validation failed: ${parsed.error.issues[0]?.message}`,
          HttpStatus.BAD_REQUEST,
        );
        return;
      }
      const dto = parsed.data;

      const category = await this._service.updateCategory(req.params.id, dto);
      if (!category) {
        ApiResponse.error(res, "Category not found", HttpStatus.NOT_FOUND);
        return;
      }

      ApiResponse.success(res, category, "Category updated successfully");
    } catch (error: unknown) {
      const err = error as Error;
      const status = err.message.includes("already exists")
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;
      ApiResponse.error(res, err.message, status);
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this._service.deleteCategory(req.params.id);
      if (!deleted) {
        ApiResponse.error(res, "Category not found", HttpStatus.NOT_FOUND);
        return;
      }
      ApiResponse.success(res, null, "Category deleted successfully");
    } catch (error: unknown) {
      const err = error as Error;
      ApiResponse.error(res, err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
