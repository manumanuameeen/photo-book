import { Router } from "express";
const router = Router();
import { container } from "../di/container";
import { ROUTES } from "../constants/routes";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { uploadMiddleware } from "../middleware/uploadMiddleware";

const photographerController = container.photographerController;
const packageAvailabilityController = container.packageAvailabilityController;
const portfolioController = container.portfolioController;
const categoryController = container.categoryController;

router.post(
  ROUTES.V1.PHOTOGRAPHER.APPLY,
  verifyAccessToken,
  uploadMiddleware.array("portfolioImages", 15),
  (req, res) => photographerController.apply(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.DASHBOARD, verifyAccessToken, (req, res) =>
  photographerController.getDashboardStats(req, res),
);

router.get(ROUTES.V1.PHOTOGRAPHER.GET_BOOKINGS, verifyAccessToken, (req, res) =>
  photographerController.getBookings(req, res),
);

router.post(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION, verifyAccessToken, (req, res) =>
  portfolioController.createSection(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTIONS, verifyAccessToken, (req, res) =>
  portfolioController.getSections(req, res),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_BY_ID, verifyAccessToken, (req, res) =>
  portfolioController.deleteSection(req, res),
);
router.patch(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_TOGGLE_LIKE, verifyAccessToken, (req, res) =>
  portfolioController.toggleLike(req, res),
);
router.post(
  ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_IMAGE,
  verifyAccessToken,
  uploadMiddleware.single("image"),
  (req, res) => portfolioController.addImageToSection(req, res),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PORTFOLIO_SECTION_IMAGE, verifyAccessToken, (req, res) =>
  portfolioController.removeImageFromSection(req, res),
);

router.post(
  ROUTES.V1.PHOTOGRAPHER.PACKAGES,
  verifyAccessToken,
  uploadMiddleware.single("coverImage"),
  (req, res) => packageAvailabilityController.createPackage(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PACKAGES, verifyAccessToken, (req, res) =>
  packageAvailabilityController.getPackages(req, res),
);
router.put(
  ROUTES.V1.PHOTOGRAPHER.PACKAGE_BY_ID,
  verifyAccessToken,
  uploadMiddleware.single("coverImage"),
  (req, res) => packageAvailabilityController.updatePackage(req, res),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.PACKAGE_BY_ID, verifyAccessToken, (req, res) =>
  packageAvailabilityController.deletePackage(req, res),
);
router.patch(ROUTES.V1.PHOTOGRAPHER.PACKAGE_TOGGLE_LIKE, verifyAccessToken, (req, res) =>
  packageAvailabilityController.toggleLike(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_PACKAGES, verifyAccessToken, (req, res) =>
  packageAvailabilityController.getPublicPackages(req, res),
);

router.post(ROUTES.V1.PHOTOGRAPHER.AVAILABILITY, verifyAccessToken, (req, res) =>
  packageAvailabilityController.setAvailability(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.AVAILABILITY, verifyAccessToken, (req, res) =>
  packageAvailabilityController.getAvailability(req, res),
);
router.post(ROUTES.V1.PHOTOGRAPHER.BLOCK_RANGE, verifyAccessToken, (req, res) =>
  packageAvailabilityController.blockRange(req, res),
);
router.post(ROUTES.V1.PHOTOGRAPHER.UNBLOCK_RANGE, verifyAccessToken, (req, res) =>
  packageAvailabilityController.unblockRange(req, res),
);
router.delete(ROUTES.V1.PHOTOGRAPHER.DELETE_AVAILABILITY, verifyAccessToken, (req, res) =>
  packageAvailabilityController.deleteAvailability(req, res),
);

router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_AVAILABILITY, (req, res) =>
  packageAvailabilityController.getPublicAvailability(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_LIST, (req, res) =>
  photographerController.getPhotographers(req, res),
);
router.get(ROUTES.V1.PHOTOGRAPHER.PUBLIC_DETAILS, (req, res) =>
  photographerController.getPhotographerById(req, res),
);
router.patch(ROUTES.V1.PHOTOGRAPHER.TOGGLE_LIKE, verifyAccessToken, (req, res) =>
  photographerController.toggleLike(req, res),
);
router.post(ROUTES.V1.PHOTOGRAPHER.ADD_REVIEW, verifyAccessToken, (req, res) =>
  photographerController.addReview(req, res),
);

router.get(ROUTES.V1.PHOTOGRAPHER.CATEGORIES, verifyAccessToken, (req, res) =>
  categoryController.getCategories(req, res),
);
router.post(ROUTES.V1.PHOTOGRAPHER.SUGGEST_CATEGORY, verifyAccessToken, (req, res) =>
  categoryController.suggestCategory(req, res),
);

router.put(ROUTES.V1.PHOTOGRAPHER.UPDATE_PROFILE, verifyAccessToken, (req, res) =>
  photographerController.updateProfile(req, res),
);

router.get(ROUTES.V1.PHOTOGRAPHER.GET_PROFILE, verifyAccessToken, (req, res) =>
  photographerController.getProfile(req, res),
);

export default router;
