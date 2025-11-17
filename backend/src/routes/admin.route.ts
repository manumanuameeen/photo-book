import { Router } from "express";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
const route = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminServices(adminRepository);
const adminController = new AdminController(adminService);

route.get(ROUTES.ADMIN.USERS, verifyAccessToken, verifyAdmin, adminController.getAllUser);
route.get(ROUTES.ADMIN.USER_BY_ID, verifyAccessToken, verifyAdmin, adminController.getUser);
route.patch(ROUTES.ADMIN.BLOCK, verifyAccessToken, verifyAdmin, adminController.blockUser);
route.patch(ROUTES.ADMIN.UNBLOCK, verifyAccessToken, verifyAdmin, adminController.unblockUser);

export default route;