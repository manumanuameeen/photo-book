import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware";
import { ROUTES } from "../constants/routes";
import { container } from "../di/container";

const router = Router();
const bookingController = container.bookingController;

router.post(ROUTES.V1.BOOKING.CREATE, verifyAccessToken, (req, res) => bookingController.createBooking(req, res));
router.get(ROUTES.V1.BOOKING.USER_BOOKINGS, verifyAccessToken, (req, res) => bookingController.getUserBookings(req, res));
router.get(ROUTES.V1.BOOKING.PHOTOGRAPHER_BOOKINGS, verifyAccessToken, (req, res) => bookingController.getPhotographerBookings(req, res));
router.get(ROUTES.V1.BOOKING.DETAILS, verifyAccessToken, (req, res) => bookingController.getBookingDetails(req, res));


router.patch(ROUTES.V1.BOOKING.ACCEPT, verifyAccessToken, (req, res) => bookingController.acceptBooking(req, res));
router.patch("/:id/pay", verifyAccessToken, (req, res) => bookingController.confirmPayment(req, res));
router.patch(ROUTES.V1.BOOKING.REJECT, verifyAccessToken, (req, res) => bookingController.rejectBooking(req, res));
router.patch(ROUTES.V1.BOOKING.CANCEL, verifyAccessToken, (req, res) => bookingController.cancelBooking(req, res));

export default router;
