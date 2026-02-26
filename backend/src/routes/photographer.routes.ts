import { Router } from "express";
const router = Router();
import { container } from "../di/container.ts";
import { ROUTES } from "../constants/routes.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { uploadMiddleware } from "../middleware/uploadMiddleware.ts";

const photographerController = container.photographerController;
const packageAvailabilityController = container.packageAvailabilityController;
const portfolioController = container.portfolioController;
const categoryController = container.categoryController;

router.post(
  ROUTES.V1.PHOTOGRAPHER.APPLY,
  verifyAccessToken,
  uploadMiddleware.array("portfolioImages", 15),
  (req, res, next) => photographerController.apply(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.DASHBOARD, verifyAccessToken, (req, res, next) =>
  photographerController.getDashboardStats(req, res, next),
);

router.get(ROUTES.V1.PHOTOGRAPHER.GET_BOOKINGS, verifyAccessToken, (req, res, next) =>
  photographerController.getBookings(req, res, next),
);

router.post(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION, verifyAccessToken, (req, res, next) =>
  portfolioController.createSection(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTIONS, verifyAccessToken, (req, res, next) =>
  portfolioController.getSections(req, res, next),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_BY_ID, verifyAccessToken, (req, res, next) =>
  portfolioController.deleteSection(req, res, next),
);
router.patch(
  ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_TOGGLE_LIKE,
  verifyAccessToken,
  (req, res, next) => portfolioController.toggleLike(req, res, next),
);
router.post(
  ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_IMAGE,
  verifyAccessToken,
  uploadMiddleware.single("image"),
  (req, res, next) => portfolioController.addImageToSection(req, res, next),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_IMAGE, verifyAccessToken, (req, res, next) =>
  portfolioController.removeImageFromSection(req, res, next),
);

router.post(
  ROUTES.V1.PHOTOGRAPHER.PACKAGES,
  verifyAccessToken,
  uploadMiddleware.single("coverImage"),
  (req, res, next) => packageAvailabilityController.createPackage(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PACKAGES, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.getPackages(req, res, next),
);
router.put(
  ROUTES.V1.PHOTOGRAPHER.PACKAGE_BY_ID,
  verifyAccessToken,
  uploadMiddleware.single("coverImage"),
  (req, res, next) => packageAvailabilityController.updatePackage(req, res, next),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PACKAGE_BY_ID, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.deletePackage(req, res, next),
);
router.patch(ROUTES.V1.PHOTOGRAPHER.PACKAGE_TOGGLE_LIKE, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.toggleLike(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_PACKAGES, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.getPublicPackages(req, res, next),
);

router.post(ROUTES.V1.PHOTOGRAPHER.AVAILABILITY, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.setAvailability(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.AVAILABILITY, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.getAvailability(req, res, next),
);
router.post(ROUTES.V1.PHOTOGRAPHER.BLOCK_RANGE, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.blockRange(req, res, next),
);
router.post(ROUTES.V1.PHOTOGRAPHER.UNBLOCK_RANGE, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.unblockRange(req, res, next),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.DELETE_AVAILABILITY, verifyAccessToken, (req, res, next) =>
  packageAvailabilityController.deleteAvailability(req, res, next),
);

router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_AVAILABILITY, (req, res, next) =>
  packageAvailabilityController.getPublicAvailability(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_LIST, (req, res, next) =>
  photographerController.getPhotographers(req, res, next),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_DETAILS, (req, res, next) =>
  photographerController.getPhotographerById(req, res, next),
);
router.patch(ROUTES.V1.PHOTOGRAPHER.TOGGLE_LIKE, verifyAccessToken, (req, res, next) =>
  photographerController.toggleLike(req, res, next),
);
router.post(ROUTES.V1.PHOTOGRAPHER.ADD_REVIEW, verifyAccessToken, (req, res, next) =>
  photographerController.addReview(req, res, next),
);

router.get(ROUTES.V1.PHOTOGRAPHER.CATEGORIES, verifyAccessToken, (req, res, next) =>
  categoryController.getCategories(req, res, next),
);
router.post(ROUTES.V1.PHOTOGRAPHER.SUGGEST_CATEGORY, verifyAccessToken, (req, res, next) =>
  categoryController.suggestCategory(req, res, next),
);

router.put(ROUTES.V1.PHOTOGRAPHER.UPDATE_PROFILE, verifyAccessToken, (req, res, next) =>
  photographerController.updateProfile(req, res, next),
);

router.get(ROUTES.V1.PHOTOGRAPHER.GET_PROFILE, verifyAccessToken, (req, res, next) =>
  photographerController.getProfile(req, res, next),
);

export default router;
