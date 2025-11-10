

import { Router } from "express";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";

const route = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminServices(adminRepository);
const adminController = new AdminController(adminService);

route.get("/users",adminController.getAllUser); 
route.get("/users/:id", adminController.getUserId);
route.patch("/users/:id/block", adminController.blockUser);
route.patch("/users/:id/unblock", adminController.unblockUser);

export default route;