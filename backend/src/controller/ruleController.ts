import { Request, Response, NextFunction } from "express";
import { IRuleService } from "../services/implementaion/admin/RuleService.ts";
import { AppError } from "../utils/AppError.ts";
import { Messages } from "../constants/messages.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { ApiResponse } from "../utils/response.ts";
import { IRuleController } from "../interfaces/controllers/IRuleController.ts";

export class RuleController implements IRuleController {
  constructor(private readonly _ruleService: IRuleService) {}

  createRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await this._ruleService.createRule(req.body);

      ApiResponse.success(res, rule, Messages.SUCCESS, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  getAllRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rules = await this._ruleService.getAllRules();

      ApiResponse.success(res, rules, Messages.SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  updateRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await this._ruleService.updateRule(req.params.id, req.body);
      if (!rule) {
        throw new AppError(Messages.RULE_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, rule, Messages.SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  deleteRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this._ruleService.deleteRule(req.params.id);
      if (!success) {
        throw new AppError(Messages.RULE_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, null, Messages.SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
