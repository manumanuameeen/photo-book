import { Router } from "express";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { verifyAdmin } from "../middleware/verifyAdmin.ts";

const route = Router()


const adminRepository  = new AdminRepository()
const adminService = new AdminServices(adminRepository)
const adminController = new AdminController(adminService)


route.get("/users",verifyAdmin,adminController.getAllUser);
route.get("/users/:id",verifyAdmin,adminController.getUserId);
route.patch("/users/:id/block",verifyAdmin,adminController.blockUser);
route.patch("/users/:id/unblock",verifyAdmin,adminController.unblockUser);


export default route