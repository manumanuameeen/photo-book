import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";

const router = Router();
const bookingController = container.bookingController;

router.post(ROUTES.V1.BOOKING.CREATE, verifyAccessToken, (req, res) =>
  bookingController.createBooking(req, res),
);
router.get(ROUTES.V1.BOOKING.USER_BOOKINGS, verifyAccessToken, (req, res) =>
  bookingController.getUserBookings(req, res),
);
router.get(ROUTES.V1.BOOKING.PHOTOGRAPHER_BOOKINGS, verifyAccessToken, (req, res) =>
  bookingController.getPhotographerBookings(req, res),
);
router.get(ROUTES.V1.BOOKING.LOOKUP, verifyAccessToken, (req, res) =>
  bookingController.getBookingByBookingId(req, res),
);

router.get(ROUTES.V1.BOOKING.DETAILS, verifyAccessToken, (req, res) =>
  bookingController.getBookingDetails(req, res),
);

router.patch(ROUTES.V1.BOOKING.ACCEPT, verifyAccessToken, (req, res) =>
  bookingController.acceptBooking(req, res),
);
router.patch(ROUTES.V1.BOOKING.PAY, verifyAccessToken, (req, res) =>
  bookingController.confirmPayment(req, res),
);
router.post(ROUTES.V1.BOOKING.PAYMENT_INTENT, verifyAccessToken, (req, res) =>
  bookingController.createBookingPaymentIntent(req, res),
);
router.patch(ROUTES.V1.BOOKING.REJECT, verifyAccessToken, (req, res) =>
  bookingController.rejectBooking(req, res),
);
router.patch(ROUTES.V1.BOOKING.CANCEL, verifyAccessToken, (req, res) =>
  bookingController.cancelBooking(req, res),
);
router.patch(ROUTES.V1.BOOKING.COMPLETE, verifyAccessToken, (req, res) =>
  bookingController.completeBooking(req, res),
);

router.patch(ROUTES.V1.BOOKING.START_WORK, verifyAccessToken, (req, res) =>
  bookingController.startWork(req, res),
);

router.patch(ROUTES.V1.BOOKING.END_WORK, verifyAccessToken, (req, res) =>
  bookingController.endWork(req, res),
);

router.patch(ROUTES.V1.BOOKING.CONFIRM_END_WORK, verifyAccessToken, (req, res) =>
  bookingController.confirmEndWork(req, res),
);

router.patch(ROUTES.V1.BOOKING.DELIVER_WORK, verifyAccessToken, (req, res) =>
  bookingController.deliverWork(req, res),
);

router.patch(ROUTES.V1.BOOKING.CONFIRM_DELIVERY, verifyAccessToken, (req, res) =>
  bookingController.confirmWorkDelivery(req, res),
);

router.post(ROUTES.V1.BOOKING.RESCHEDULE_REQUEST, verifyAccessToken, (req, res) =>
  bookingController.requestReschedule(req, res),
);

router.post(ROUTES.V1.BOOKING.RESCHEDULE_RESPONSE, verifyAccessToken, (req, res) =>
  bookingController.respondToReschedule(req, res),
);

export default router;
