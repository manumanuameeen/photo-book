import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";

const route = Router();
const adminController = container.adminController;
const adminPhotographerController = container.adminPhotographerController;

// User Management
route.get(ROUTES.V1.ADMIN.USERS, verifyAccessToken, verifyAdmin, adminController.getAllUser);
route.get(ROUTES.V1.ADMIN.USER_BY_ID, verifyAccessToken, verifyAdmin, adminController.getUser);
route.patch(ROUTES.V1.ADMIN.BLOCK, verifyAccessToken, verifyAdmin, adminController.blockUser);
route.patch(ROUTES.V1.ADMIN.UNBLOCK, verifyAccessToken, verifyAdmin, adminController.unblockUser);

// Photographer Management
route.get(ROUTES.V1.ADMIN.PHOTOGRAPHERS, verifyAccessToken, verifyAdmin, adminPhotographerController.getPhotographers);
route.get(ROUTES.V1.ADMIN.PHOTOGRAPHER_STATS, verifyAccessToken, verifyAdmin, adminPhotographerController.getStatistics);
route.get(ROUTES.V1.ADMIN.PHOTOGRAPHER_BY_ID, verifyAccessToken, verifyAdmin, adminPhotographerController.getPhotographerById);
route.patch(ROUTES.V1.ADMIN.PHOTOGRAPHER_BLOCK, verifyAccessToken, verifyAdmin, adminPhotographerController.blockPhotographer);
route.patch(ROUTES.V1.ADMIN.PHOTOGRAPHER_UNBLOCK, verifyAccessToken, verifyAdmin, adminPhotographerController.unblockPhotographer);

// Application Management
route.get(ROUTES.V1.ADMIN.APPLICATIONS, verifyAccessToken, verifyAdmin, adminPhotographerController.getApplications);
route.get(ROUTES.V1.ADMIN.APPLICATION_BY_ID, verifyAccessToken, verifyAdmin, adminPhotographerController.getApplicationById);
route.post(ROUTES.V1.ADMIN.APPLICATION_APPROVE, verifyAccessToken, verifyAdmin, adminPhotographerController.approveApplication);
route.post(ROUTES.V1.ADMIN.APPLICATION_REJECT, verifyAccessToken, verifyAdmin, adminPhotographerController.rejectApplication);

export default route;
