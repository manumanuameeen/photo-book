import { Router } from "express";
import { container } from "../di/container.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";

const router = Router();
const reviewController = container.reviewController;

router.post(ROUTES.V1.REVIEWS.ADD, verifyAccessToken, (req, res) => reviewController.addReview(req, res));

router.get(ROUTES.V1.REVIEWS.GET_TARGET_REVIEWS, verifyAccessToken, (req, res) => reviewController.getReviews(req, res));

router.get(ROUTES.V1.REVIEWS.GET_TARGET_STATS, verifyAccessToken, (req, res) =>
  reviewController.getStats(req, res),
);

router.patch(ROUTES.V1.REVIEWS.REPLY, verifyAccessToken, (req, res) =>
  reviewController.replyToReview(req, res),
);

router.patch(ROUTES.V1.REVIEWS.TOGGLE_LIKE, verifyAccessToken, (req, res) =>
  reviewController.toggleLikeReview(req, res),
);

router.get(ROUTES.V1.REVIEWS.MY_REVIEWS, verifyAccessToken, (req, res) =>
  reviewController.getUserReviews(req, res),
);
router.get(ROUTES.V1.REVIEWS.RECEIVED_REVIEWS, verifyAccessToken, (req, res) =>
  reviewController.getReceivedReviews(req, res),
);
router.patch(ROUTES.V1.REVIEWS.UPDATE, verifyAccessToken, (req, res) => reviewController.updateReview(req, res));

router.delete(ROUTES.V1.REVIEWS.DELETE, verifyAccessToken, (req, res) => reviewController.deleteReview(req, res));

export default router;
