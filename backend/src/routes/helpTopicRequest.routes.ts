import express from "express";
import { IHelpTopicRequestController } from "../interfaces/controllers/IHelpTopicRequestController";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { ROUTES } from "../constants/routes";

export function helpRequestRoutes(controller: IHelpTopicRequestController) {
  const router = express.Router();

  router.post(ROUTES.V1.HELP_TOPIC_REQUEST.SUBMIT, verifyAccessToken, controller.submitRequest);

  router.get(
    ROUTES.V1.HELP_TOPIC_REQUEST.GET_ALL,
    verifyAccessToken,
    verifyAdmin,
    controller.getAllRequests,
  );
  router.patch(
    ROUTES.V1.HELP_TOPIC_REQUEST.UPDATE_STATUS,
    verifyAccessToken,
    verifyAdmin,
    controller.updateStatus,
  );

  return router;
}
