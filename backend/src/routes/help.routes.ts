import express from "express";
import { IHelpController } from "../interfaces/controllers/IHelpController";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { ROUTES } from "../constants/routes";
export function helpRoutes(helpController: IHelpController) {
  const router = express.Router();

  router.get(ROUTES.V1.HELP.GET_ALL, helpController.getAllHelp);
  router.get(ROUTES.V1.HELP.GET_BY_CATEGORY, helpController.getHelpByCategory);

  router.post(
    ROUTES.V1.HELP.CREATE,
    verifyAccessToken,
    verifyAdmin,
    helpController.createHelpSection,
  );
  router.put(
    ROUTES.V1.HELP.UPDATE,
    verifyAccessToken,
    verifyAdmin,
    helpController.updateHelpSection,
  );
  router.delete(
    ROUTES.V1.HELP.DELETE,
    verifyAccessToken,
    verifyAdmin,
    helpController.deleteHelpSection,
  );
  router.patch(
    ROUTES.V1.HELP.REORDER,
    verifyAccessToken,
    verifyAdmin,
    helpController.reorderHelpSections,
  );

  return router;
}
