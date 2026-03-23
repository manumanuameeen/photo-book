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
import { connectDB } from "./config/db";
import morganLogger from "./middleware/morganLogger";
import authRoutes from "./routes/auth.routes";
import adminRoute from "./routes/admin.route";
import userRoute from "./routes/user.routes";
import photoRoute from "./routes/photographer.routes";
import bookingRoute from "./routes/booking.routes";
import messageRoute from "./routes/message.routes";
import walletRoute from "./routes/wallet.routes";
import rentalRoute from "./routes/rental.routes";
import reviewRoute from "./routes/review.routes";
import reportRoute from "./routes/report.routes";
import reportCategoryRoute from "./routes/reportCategory.routes";
import { helpRoutes } from "./routes/help.routes";
import { helpRequestRoutes } from "./routes/helpTopicRequest.routes";
import { ruleRoutes } from "./routes/rule.routes";
import aiRoutes from "./routes/ai.routes";
import { container } from "./di/container";
import { errorHandler } from "./middleware/errorMiddleware";
import { ROUTES } from "./constants/routes";

const app = express();
const PORT = 5000;

app.use(morganLogger);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
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
app.use(ROUTES.V1.REPORT_CATEGORY.BASE, reportCategoryRoute);
app.use(ROUTES.V1.HELP.BASE, helpRoutes(container.helpController));
app.use(ROUTES.V1.HELP_TOPIC_REQUEST.BASE, helpRequestRoutes(container.helpTopicRequestController));
app.use(ROUTES.V1.RULE.BASE, ruleRoutes(container.ruleController));
app.use(ROUTES.V1.WALLET.BASE, walletRoute);
app.use(ROUTES.V1.AI.BASE, aiRoutes);
console.log("✅ Routes mounted.");

console.log("➡️ Initializing CronService...");
import { CronService } from "./services/common/CronService";

try {
  const { container } = await import("./di/container");
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
import { SocketService } from "./services/messaging/SocketService";

console.log("➡️ Starting Server...");
const httpServer = createServer(app);

SocketService.getInstance().init(httpServer);

httpServer.listen(PORT, async () => {
  console.log(`✅Server is running at http://localhost:${PORT}`);
});
