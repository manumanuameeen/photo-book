import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";

const route = Router();
const adminController = container.adminController;
const adminPhotographerController = container.adminPhotographerController;

route.get(ROUTES.V1.ADMIN.USERS, verifyAccessToken, verifyAdmin, adminController.getAllUser);
route.get(ROUTES.V1.ADMIN.USER_BY_ID, verifyAccessToken, verifyAdmin, adminController.getUser);
route.patch(ROUTES.V1.ADMIN.BLOCK, verifyAccessToken, verifyAdmin, adminController.blockUser);
route.patch(ROUTES.V1.ADMIN.UNBLOCK, verifyAccessToken, verifyAdmin, adminController.unblockUser);

route.get(
  ROUTES.V1.ADMIN.PHOTOGRAPHERS,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getPhotographers,
);
route.get(
  ROUTES.V1.ADMIN.PHOTOGRAPHER_STATS,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getStatistics,
);
route.get(
  ROUTES.V1.ADMIN.PHOTOGRAPHER_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getPhotographerById,
);
route.patch(
  ROUTES.V1.ADMIN.PHOTOGRAPHER_BLOCK,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.blockPhotographer,
);
route.patch(
  ROUTES.V1.ADMIN.PHOTOGRAPHER_UNBLOCK,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.unblockPhotographer,
);

route.get(
  ROUTES.V1.ADMIN.APPLICATIONS,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getApplications,
);
route.get(
  ROUTES.V1.ADMIN.APPLICATION_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getApplicationById,
);
route.post(
  ROUTES.V1.ADMIN.APPLICATION_APPROVE,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.approveApplication,
);
route.post(
  ROUTES.V1.ADMIN.APPLICATION_REJECT,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.rejectApplication,
);

route.get(
  ROUTES.V1.ADMIN.PACKAGES,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.getPackages,
);
route.post(
  ROUTES.V1.ADMIN.PACKAGE_APPROVE,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.approvePackage,
);
route.post(
  ROUTES.V1.ADMIN.PACKAGE_REJECT,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.rejectPackage,
);
route.patch(
  ROUTES.V1.ADMIN.PACKAGE_BLOCK,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.blockPackage,
);
route.patch(
  ROUTES.V1.ADMIN.PACKAGE_UNBLOCK,
  verifyAccessToken,
  verifyAdmin,
  adminPhotographerController.unblockPackage,
);

route.post(
  ROUTES.V1.ADMIN.CATEGORY,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.createCategory,
);
route.put(
  ROUTES.V1.ADMIN.CATEGORY_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.updateCategory,
);
route.delete(
  ROUTES.V1.ADMIN.CATEGORY_BY_ID,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.deleteCategory,
);
route.get(
  ROUTES.V1.ADMIN.CATEGORIES,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.getCategories,
);
route.post(
  ROUTES.V1.ADMIN.CATEGORY_APPROVE,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.approveCategory,
);
route.post(
  ROUTES.V1.ADMIN.CATEGORY_REJECT,
  verifyAccessToken,
  verifyAdmin,
  container.categoryController.rejectCategory,
);

export default route;

