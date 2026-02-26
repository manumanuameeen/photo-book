import { Router } from "express";
import { verifyAccessToken, verifyAdmin } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";
import { uploadMiddleware } from "../middleware/uploadMiddleware.ts";

const router = Router();
const reportController = container.reportController;

router.post(ROUTES.V1.REPORT.CREATE, verifyAccessToken, (req, res, next) =>
  reportController.createReport(req, res, next),
);

router.post(
  "/evidence/upload",
  verifyAccessToken,
  uploadMiddleware.array("evidence", 3),
  (req, res, next) => reportController.uploadEvidence(req, res, next),
);

router.get(ROUTES.V1.REPORT.GET_ALL, verifyAccessToken, verifyAdmin, (req, res, next) =>
  reportController.getReports(req, res, next),
);

router.patch(ROUTES.V1.REPORT.UPDATE_STATUS, verifyAccessToken, verifyAdmin, (req, res, next) =>
  reportController.updateStatus(req, res, next),
);

router.post(ROUTES.V1.REPORT.FORWARD_CHAT, verifyAccessToken, verifyAdmin, (req, res, next) =>
  reportController.forwardReport(req, res, next),
);

router.post(ROUTES.V1.REPORT.APPLY_PENALTY, verifyAccessToken, verifyAdmin, (req, res, next) =>
  reportController.applyPenalty(req, res, next),
);

router.get(ROUTES.V1.REPORT.GET_MESSAGES, verifyAccessToken, verifyAdmin, (req, res, next) =>
  reportController.getReportMessages(req, res, next),
);

export default router;
