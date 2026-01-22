import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { container } from "../di/container.ts";
import { verifyUserNotBlocked } from "../middleware/verifyUserBlock.ts";
import { checkTokenBlacklist } from "../middleware/checkTokenBlacklist.ts";
import { uploadMiddleware } from "../middleware/uploadMiddleware.ts";
const router = Router();
const userController = container.userController;

router.get(ROUTES.V1.USER.PROFILE, verifyAccessToken, userController.getProfile);
router.post(
  ROUTES.V1.USER.UPDATE_PROFILE,
  verifyAccessToken,
  checkTokenBlacklist,
  verifyUserNotBlocked,
  userController.UpdateProfile,
);
router.post(
  ROUTES.V1.USER.CHANGE_PASSWORD,
  verifyAccessToken,
  checkTokenBlacklist,
  verifyUserNotBlocked,
  userController.changePassword,
);
router.post(
  ROUTES.V1.USER.INITIATE_CHANGE_PASSWORD,
  verifyAccessToken,
  checkTokenBlacklist,
  verifyUserNotBlocked,
  userController.initiateChangePassword,
);
router.post(
  ROUTES.V1.USER.PROFILE_IMAGE,
  verifyAccessToken,
  checkTokenBlacklist,
  verifyUserNotBlocked,
  uploadMiddleware.single("image"),
  userController.uploadProfileImage,
);
router.post(
  ROUTES.V1.USER.VERIFY_OTP,
  verifyAccessToken,
  checkTokenBlacklist,
  verifyUserNotBlocked,
  userController.verifyOtp,
);

export default router;

