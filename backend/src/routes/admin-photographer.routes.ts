import { Router } from "express";
import { container } from "../di/container.ts";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";

const router = Router();
const { ADMIN } = ROUTES.V1;

router.get(
  ADMIN.PHOTOGRAPHERS,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getPhotographers,
);
router.get(
  ADMIN.PHOTOGRAPHER_STATS,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getStatistics,
);
router.get(
  ADMIN.PHOTOGRAPHER_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getPhotographerById,
);
router.patch(
  ADMIN.PHOTOGRAPHER_BLOCK,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.blockPhotographer,
);
router.patch(
  ADMIN.PHOTOGRAPHER_UNBLOCK,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.unblockPhotographer,
);

router.get(
  ADMIN.APPLICATIONS,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getApplications,
);
router.get(
  ADMIN.APPLICATION_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getApplicationById,
);
router.post(
  ADMIN.APPLICATION_APPROVE,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.approveApplication,
);
router.post(
  ADMIN.APPLICATION_REJECT,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.rejectApplication,
);

router.get(
  ADMIN.PACKAGES,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.getPackages,
);
router.post(
  ADMIN.PACKAGE_APPROVE,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.approvePackage,
);
router.post(
  ADMIN.PACKAGE_REJECT,
  verifyAccessToken,
  verifyAdmin,
  container.adminPhotographerController.rejectPackage,
);

export default router;
