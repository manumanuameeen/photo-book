import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";
import { verifyUserNotBlocked } from "../middleware/verifyUserBlock";
import { checkTokenBlacklist } from "../middleware/checkTokenBlacklist";
const router = Router();
const userController = container.userController;

router.get(ROUTES.V1.USER.PROFILE, verifyAccessToken, userController.getProfile);
router.post(ROUTES.V1.USER.UPDATE_PROFILE,checkTokenBlacklist,verifyUserNotBlocked,verifyAccessToken,userController.UpdateProfile,);
router.post(ROUTES.V1.USER.CHANGE_PASSWORD,checkTokenBlacklist,verifyUserNotBlocked,verifyAccessToken,userController.changePassword);

export default router;                 
