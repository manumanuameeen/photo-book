import { Router } from "express";
import { container } from "../di/container";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { ROUTES } from "../constants/routes";

const router = Router();
const { ADMIN } = ROUTES.V1;

// Photographer Management
router.get(ADMIN.PHOTOGRAPHERS, verifyAdmin, container.adminPhotographerController.getPhotographers);
router.get(ADMIN.PHOTOGRAPHER_STATS, verifyAdmin, container.adminPhotographerController.getStatistics);
router.get(ADMIN.PHOTOGRAPHER_BY_ID, verifyAdmin, container.adminPhotographerController.getPhotographerById);
router.patch(ADMIN.PHOTOGRAPHER_BLOCK, verifyAdmin, container.adminPhotographerController.blockPhotographer);
router.patch(ADMIN.PHOTOGRAPHER_UNBLOCK, verifyAdmin, container.adminPhotographerController.unblockPhotographer);

// Application Management
router.get(ADMIN.APPLICATIONS, verifyAdmin, container.adminPhotographerController.getApplications);
router.get(ADMIN.APPLICATION_BY_ID, verifyAdmin, container.adminPhotographerController.getApplicationById);
router.post(ADMIN.APPLICATION_APPROVE, verifyAdmin, container.adminPhotographerController.approveApplication);
router.post(ADMIN.APPLICATION_REJECT, verifyAdmin, container.adminPhotographerController.rejectApplication);

export default router;
