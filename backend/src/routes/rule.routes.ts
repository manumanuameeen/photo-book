import { Router } from "express";
import { IRuleController } from "../interfaces/controllers/IRuleController";
import { ROUTES } from "../constants/routes";

export function ruleRoutes(ruleController: IRuleController) {
  const router = Router();

  router.get(ROUTES.V1.RULE.GET_ALL, ruleController.getAllRules);
  router.post(ROUTES.V1.RULE.CREATE, ruleController.createRule);
  router.put(ROUTES.V1.RULE.UPDATE, ruleController.updateRule);
  router.delete(ROUTES.V1.RULE.DELETE, ruleController.deleteRule);

  return router;
}
