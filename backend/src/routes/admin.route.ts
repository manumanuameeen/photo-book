

import { Router } from "express";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts"

const route = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminServices(adminRepository);
const adminController = new AdminController(adminService);

route.get("/users",verifyAccessToken,verifyAdmin,adminController.getAllUser); 
route.get("/users/:id",verifyAccessToken,verifyAdmin, adminController.getUserId);
route.patch("/users/:id/block",verifyAccessToken,verifyAdmin, adminController.blockUser);
route.patch("/users/:id/unblock",verifyAccessToken,verifyAdmin, adminController.unblockUser);

export default route;