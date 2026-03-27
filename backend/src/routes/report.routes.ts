import { Router } from "express";
import { verifyAccessToken, verifyAdmin, AuthRequest } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";
import { uploadMiddleware } from "../middleware/uploadMiddleware";

const router = Router();
const reportController = container.reportController;

router.post(ROUTES.V1.REPORT.CREATE, verifyAccessToken, (req, res) =>
  reportController.createReport(req as AuthRequest, res),
);

router.post(
  "/evidence/upload",
  verifyAccessToken,
  uploadMiddleware.array("evidence", 3),
  (req, res) => reportController.uploadEvidence(req as AuthRequest, res),
);

router.get(ROUTES.V1.REPORT.GET_ALL, verifyAccessToken, verifyAdmin, (req, res) =>
  reportController.getReports(req, res),
);

router.patch(ROUTES.V1.REPORT.UPDATE_STATUS, verifyAccessToken, verifyAdmin, (req, res) =>
  reportController.updateStatus(req, res),
);

router.post(ROUTES.V1.REPORT.FORWARD_CHAT, verifyAccessToken, verifyAdmin, (req, res) =>
  reportController.forwardReport(req as AuthRequest, res),
);

router.post(ROUTES.V1.REPORT.APPLY_PENALTY, verifyAccessToken, verifyAdmin, (req, res) =>
  reportController.applyPenalty(req as AuthRequest, res),
);

router.get(ROUTES.V1.REPORT.GET_MESSAGES, verifyAccessToken, verifyAdmin, (req, res) =>
  reportController.getReportMessages(req, res),
);

export default router;
