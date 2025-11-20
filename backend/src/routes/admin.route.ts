import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";

const route = Router();
const adminController = container.adminController;

route.get(ROUTES.V1.ADMIN.USERS, verifyAccessToken, verifyAdmin, adminController.getAllUser);
route.get(ROUTES.V1.ADMIN.USER_BY_ID, verifyAccessToken, verifyAdmin, adminController.getUser);
route.patch(ROUTES.V1.ADMIN.BLOCK, verifyAccessToken, verifyAdmin, adminController.blockUser);
route.patch(ROUTES.V1.ADMIN.UNBLOCK, verifyAccessToken, verifyAdmin, adminController.unblockUser);

export default route;
