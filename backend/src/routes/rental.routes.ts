import { Router } from "express";
import { container } from "../di/container.ts";
import { verifyAccessToken, optionalAuth } from "../middleware/authMiddleware.ts";
import { ROUTES } from "../constants/routes.ts";

import { uploadMiddleware } from "../middleware/uploadMiddleware.ts";

const router = Router();
const rentalController = container.rentalController;
const adminRentalController = container.adminRentalController;

router.post(
  ROUTES.V1.RENTAL.GET_ITEMS,
  verifyAccessToken,
  uploadMiddleware.array("images"),
  (req, res, next) => rentalController.createItem(req, res, next),
);
router.get(ROUTES.V1.RENTAL.GET_ITEMS, optionalAuth, (req, res, next) =>
  rentalController.getAllItems(req, res, next),
);
router.get(ROUTES.V1.RENTAL.GET_ITEM_DETAILS, (req, res, next) =>
  rentalController.getItemDetails(req, res, next),
);
router.post(
  ROUTES.V1.RENTAL.RENT_ITEM,
  verifyAccessToken,
  uploadMiddleware.none(),
  (req, res, next) => rentalController.rentItem(req, res, next),
);
router.post(ROUTES.V1.RENTAL.CONFIRM_PAYMENT, verifyAccessToken, (req, res, next) =>
  rentalController.confirmPayment(req, res, next),
);
router.get(ROUTES.V1.RENTAL.USER_ORDERS, verifyAccessToken, (req, res, next) =>
  rentalController.getUserOrders(req, res, next),
);
router.get(ROUTES.V1.RENTAL.MY_ITEMS, verifyAccessToken, (req, res, next) =>
  rentalController.getUserItems(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.UPDATE_ITEM_STATUS, verifyAccessToken, (req, res, next) =>
  rentalController.updateItemStatus(req, res, next),
);

router.get(ROUTES.V1.RENTAL.ADMIN_ITEMS, verifyAccessToken, (req, res, next) =>
  adminRentalController.getAdminItems(req, res, next),
);
router.get(ROUTES.V1.RENTAL.ADMIN_ORDERS, verifyAccessToken, (req, res, next) =>
  adminRentalController.getAllOrders(req, res, next),
);

router.get(ROUTES.V1.RENTAL.ADMIN_ORDER_DETAILS, verifyAccessToken, (req, res, next) =>
  rentalController.getOrderDetails(req, res, next),
);

router.get(ROUTES.V1.RENTAL.OWNER_ORDERS, verifyAccessToken, (req, res, next) =>
  rentalController.getOwnerOrders(req, res, next),
);

router.patch(ROUTES.V1.RENTAL.UPDATE_ORDER_STATUS, verifyAccessToken, (req, res, next) =>
  rentalController.updateOrderStatus(req, res, next),
);
router.get(ROUTES.V1.RENTAL.ADMIN_ORDER_DETAILS, verifyAccessToken, (req, res, next) =>
  rentalController.getOrderDetails(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.ACCEPT_ORDER, verifyAccessToken, (req, res, next) =>
  rentalController.acceptOrder(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.REJECT_ORDER, verifyAccessToken, (req, res, next) =>
  rentalController.rejectOrder(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.CANCEL_ORDER, verifyAccessToken, (req, res, next) =>
  rentalController.cancelRentalOrder(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.PAY_DEPOSIT, verifyAccessToken, (req, res, next) =>
  rentalController.payDeposit(req, res, next),
);
router.post(ROUTES.V1.RENTAL.DEPOSIT_INTENT, verifyAccessToken, (req, res, next) =>
  rentalController.createDepositPaymentIntent(req, res, next),
);
router.post(ROUTES.V1.RENTAL.BALANCE_INTENT, verifyAccessToken, (req, res, next) =>
  rentalController.createBalancePaymentIntent(req, res, next),
);
router.post(ROUTES.V1.RENTAL.PAY_BALANCE, verifyAccessToken, (req, res, next) =>
  rentalController.payBalance(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.COMPLETE_ORDER, verifyAccessToken, (req, res, next) =>
  rentalController.completeOrder(req, res, next),
);
router.put(
  ROUTES.V1.RENTAL.UPDATE_ITEM,
  verifyAccessToken,
  uploadMiddleware.array("images"),
  (req, res, next) => rentalController.updateItem(req, res, next),
);
router.get(ROUTES.V1.RENTAL.CHECK_AVAILABILITY, (req, res, next) =>
  rentalController.checkAvailability(req, res, next),
);
router.get(ROUTES.V1.RENTAL.GET_UNAVAILABLE, (req, res, next) =>
  rentalController.getUnavailableDates(req, res, next),
);
router.post(ROUTES.V1.RENTAL.BLOCK_ITEM, verifyAccessToken, (req, res, next) =>
  rentalController.blockDates(req, res, next),
);
router.post(ROUTES.V1.RENTAL.UNBLOCK_ITEM, verifyAccessToken, (req, res, next) =>
  rentalController.unblockDates(req, res, next),
);
router.get(ROUTES.V1.RENTAL.STATS, verifyAccessToken, (req, res, next) =>
  rentalController.getDashboardStats(req, res, next),
);
router.patch(ROUTES.V1.RENTAL.TOGGLE_LIKE, verifyAccessToken, (req, res, next) =>
  rentalController.toggleLike(req, res, next),
);

router.post(ROUTES.V1.RENTAL.RESCHEDULE_REQUEST, verifyAccessToken, (req, res, next) =>
  rentalController.requestReschedule(req, res, next),
);

router.patch(ROUTES.V1.RENTAL.RESCHEDULE_RESPOND, verifyAccessToken, (req, res, next) =>
  rentalController.respondToReschedule(req, res, next),
);

export default router;
