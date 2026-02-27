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
  (req, res) => rentalController.createItem(req, res),
);
router.get(ROUTES.V1.RENTAL.GET_ITEMS, optionalAuth, (req, res) =>
  rentalController.getAllItems(req, res),
);
router.get(ROUTES.V1.RENTAL.GET_ITEM_DETAILS, (req, res) =>
  rentalController.getItemDetails(req, res),
);
router.post(ROUTES.V1.RENTAL.RENT_ITEM, verifyAccessToken, uploadMiddleware.none(), (req, res) =>
  rentalController.rentItem(req, res),
);
router.post(ROUTES.V1.RENTAL.CONFIRM_PAYMENT, verifyAccessToken, (req, res) =>
  rentalController.confirmPayment(req, res),
);
router.get(ROUTES.V1.RENTAL.USER_ORDERS, verifyAccessToken, (req, res) =>
  rentalController.getUserOrders(req, res),
);
router.get(ROUTES.V1.RENTAL.MY_ITEMS, verifyAccessToken, (req, res) =>
  rentalController.getUserItems(req, res),
);
router.patch(ROUTES.V1.RENTAL.UPDATE_ITEM_STATUS, verifyAccessToken, (req, res) =>
  rentalController.updateItemStatus(req, res),
);

router.get(ROUTES.V1.RENTAL.ADMIN_ITEMS, verifyAccessToken, (req, res) =>
  adminRentalController.getAdminItems(req, res),
);
router.get(ROUTES.V1.RENTAL.ADMIN_ORDERS, verifyAccessToken, (req, res) =>
  adminRentalController.getAllOrders(req, res),
);

router.get(ROUTES.V1.RENTAL.ADMIN_ORDER_DETAILS, verifyAccessToken, (req, res) =>
  rentalController.getOrderDetails(req, res),
);

router.get(ROUTES.V1.RENTAL.OWNER_ORDERS, verifyAccessToken, (req, res) =>
  rentalController.getOwnerOrders(req, res),
);

router.patch(ROUTES.V1.RENTAL.UPDATE_ORDER_STATUS, verifyAccessToken, (req, res) =>
  rentalController.updateOrderStatus(req, res),
);
router.get(ROUTES.V1.RENTAL.ADMIN_ORDER_DETAILS, verifyAccessToken, (req, res) =>
  rentalController.getOrderDetails(req, res),
);
router.patch(ROUTES.V1.RENTAL.ACCEPT_ORDER, verifyAccessToken, (req, res) =>
  rentalController.acceptOrder(req, res),
);
router.patch(ROUTES.V1.RENTAL.REJECT_ORDER, verifyAccessToken, (req, res) =>
  rentalController.rejectOrder(req, res),
);
router.patch(ROUTES.V1.RENTAL.CANCEL_ORDER, verifyAccessToken, (req, res) =>
  rentalController.cancelRentalOrder(req, res),
);
router.patch(ROUTES.V1.RENTAL.PAY_DEPOSIT, verifyAccessToken, (req, res) =>
  rentalController.payDeposit(req, res),
);
router.post(ROUTES.V1.RENTAL.DEPOSIT_INTENT, verifyAccessToken, (req, res) =>
  rentalController.createDepositPaymentIntent(req, res),
);
router.post(ROUTES.V1.RENTAL.BALANCE_INTENT, verifyAccessToken, (req, res) =>
  rentalController.createBalancePaymentIntent(req, res),
);
router.post(ROUTES.V1.RENTAL.PAY_BALANCE, verifyAccessToken, (req, res) =>
  rentalController.payBalance(req, res),
);
router.patch(ROUTES.V1.RENTAL.COMPLETE_ORDER, verifyAccessToken, (req, res) =>
  rentalController.completeOrder(req, res),
);
router.put(
  ROUTES.V1.RENTAL.UPDATE_ITEM,
  verifyAccessToken,
  uploadMiddleware.array("images"),
  (req, res) => rentalController.updateItem(req, res),
);
router.get(ROUTES.V1.RENTAL.CHECK_AVAILABILITY, (req, res) =>
  rentalController.checkAvailability(req, res),
);
router.get(ROUTES.V1.RENTAL.GET_UNAVAILABLE, (req, res) =>
  rentalController.getUnavailableDates(req, res),
);
router.post(ROUTES.V1.RENTAL.BLOCK_ITEM, verifyAccessToken, (req, res) =>
  rentalController.blockDates(req, res),
);
router.post(ROUTES.V1.RENTAL.UNBLOCK_ITEM, verifyAccessToken, (req, res) =>
  rentalController.unblockDates(req, res),
);
router.get(ROUTES.V1.RENTAL.STATS, verifyAccessToken, (req, res) =>
  rentalController.getDashboardStats(req, res),
);
router.patch(ROUTES.V1.RENTAL.TOGGLE_LIKE, verifyAccessToken, (req, res) =>
  rentalController.toggleLike(req, res),
);

router.post(ROUTES.V1.RENTAL.RESCHEDULE_REQUEST, verifyAccessToken, (req, res) =>
  rentalController.requestReschedule(req, res),
);

router.patch(ROUTES.V1.RENTAL.RESCHEDULE_RESPOND, verifyAccessToken, (req, res) =>
  rentalController.respondToReschedule(req, res),
);

export default router;
