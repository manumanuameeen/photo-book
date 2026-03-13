import { Request, Response } from "express";
import { IRuleService } from "../../services/implementation/admin/RuleService.ts";
import { Messages } from "../../constants/messages.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { ApiResponse } from "../../utils/response.ts";
import { IRuleController } from "../../interfaces/controllers/IRuleController.ts";
import { AppError } from "../../utils/AppError.ts";
import { handleError } from "../../utils/errorHandler.ts";

export class RuleController implements IRuleController {
  constructor(private readonly _ruleService: IRuleService) {}

  createRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const rule = await this._ruleService.createRule(req.body);
      ApiResponse.success(res, rule, Messages.SUCCESS, HttpStatus.CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getAllRules = async (_req: Request, res: Response): Promise<void> => {
    try {
      const rules = await this._ruleService.getAllRules();
      ApiResponse.success(res, rules, Messages.SUCCESS);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const rule = await this._ruleService.updateRule(req.params.id, req.body);
      if (!rule) {
        throw new AppError(Messages.RULE_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, rule, Messages.SUCCESS);
    } catch (error) {
      handleError(res, error);
    }
  };

  deleteRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await this._ruleService.deleteRule(req.params.id);
      if (!success) {
        throw new AppError(Messages.RULE_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, null, Messages.SUCCESS);
    } catch (error) {
      handleError(res, error);
    }
  };
}
