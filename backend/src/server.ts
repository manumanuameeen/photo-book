import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.ts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.ts";
import morganLogger from "./middleware/morganLogger.ts";
import authRoutes from "./routes/auth.routes.ts";
import adminRoute from "./routes/admin.route.ts";
import userRoute from "./routes/user.routes.ts";
import photoRoute from "./routes/photographer.routes.ts";
import bookingRoute from "./routes/booking.routes.ts";
import messageRoute from "./routes/message.routes.ts";
import { errorHandler } from "./middleware/errorMiddleware.ts";
import { ROUTES } from "./constants/routes.ts";
import { CronService } from "./services/common/CronService.ts";

const app = express();
const PORT = 5000;

app.use(morganLogger);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
connectDB();

app.use(ROUTES.V1.AUTH.BASE, authRoutes);
app.use(ROUTES.V1.ADMIN.BASE, adminRoute);
app.use(ROUTES.V1.USER.BASE, userRoute);
app.use(ROUTES.V1.PHOTOGRAPHER.BASE, photoRoute);
app.use(ROUTES.V1.BOOKING.BASE, bookingRoute);
app.use(ROUTES.V1.MESSAGE.BASE, messageRoute);
import paymentRoute from "./routes/payment.routes.ts";
app.use(ROUTES.V1.PAYMENT.BASE, paymentRoute);
import walletRoute from "./routes/wallet.routes.ts";
app.use(ROUTES.V1.WALLET.BASE, walletRoute);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


CronService.init();

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send(" Backend server is running successfully!");
});

app.listen(PORT, async () => {
  console.log(`✅Server is running at http://localhost:${PORT}`);
});
