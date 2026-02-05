console.log("✅ server.ts started executing");
console.log("🔥 TOP OF server.ts EXECUTED");

import dotenv from "dotenv";
console.log("🚀 server.ts script execution started...");
dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.ts";
import morganLogger from "./middleware/morganLogger.ts";
import authRoutes from "./routes/auth.routes.ts";
import adminRoute from "./routes/admin.route.ts";
import userRoute from "./routes/user.routes.ts";
import photoRoute from "./routes/photographer.routes.ts";
import bookingRoute from "./routes/booking.routes.ts";
import messageRoute from "./routes/message.routes.ts";
import walletRoute from "./routes/wallet.routes.ts";
import rentalRoute from "./routes/rental.routes.ts";
import reviewRoute from "./routes/review.routes.ts";
import reportRoute from "./routes/report.routes.ts";
import { ruleRouter } from "./routes/rule.routes.ts";
import { errorHandler } from "./middleware/errorMiddleware.ts";
import { ROUTES } from "./constants/routes.ts";


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

console.log("⏳ Connecting to MongoDB...");
try {
  await connectDB();
  console.log("✅ connectDB() executed.");
} catch (e) {
  console.error("❌ Critical DB Connection Error catch in server.ts:", e);
}

app.get("/", (req, res) => {
  res.send(" Backend server is running successfully!");
});

console.log("➡️ Mounting Routes...");
app.use(ROUTES.V1.AUTH.BASE, authRoutes);
app.use(ROUTES.V1.ADMIN.BASE, adminRoute);
app.use(ROUTES.V1.USER.BASE, userRoute);
app.use(ROUTES.V1.PHOTOGRAPHER.BASE, photoRoute);
app.use(ROUTES.V1.BOOKING.BASE, bookingRoute);
app.use(ROUTES.V1.MESSAGE.BASE, messageRoute);
app.use(ROUTES.V1.RENTAL.BASE, rentalRoute);
app.use(ROUTES.V1.REVIEWS.BASE, reviewRoute);
app.use(ROUTES.V1.REPORT.BASE, reportRoute);
app.use("/api/v1/rules", ruleRouter);
app.use("/api/v1/wallet", walletRoute);
console.log("✅ Routes mounted.");

console.log("➡️ Initializing CronService...");
import { CronService } from "./services/common/CronService.ts";




try {
  const { container } = await import("./di/container.ts");
  CronService.init(container.bookingService);
  console.log("✅ CronService initialized.");
} catch (error) {
  console.error("❌ CronService Initialization Failed:", error);
}

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send(" Backend server is running successfully!");
});

import { createServer } from "http";
import { SocketService } from "./services/messaging/SocketService.ts";

console.log("➡️ Starting Server...");
const httpServer = createServer(app);

// Initialize Socket.IO
SocketService.getInstance().init(httpServer);

httpServer.listen(PORT, async () => {
  console.log(`✅Server is running at http://localhost:${PORT}`);
});
