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
connectDB();

app.use(ROUTES.V1.AUTH.BASE, authRoutes);
app.use(ROUTES.V1.ADMIN.BASE, adminRoute);

app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send(" Backend server is running successfully!");
});

app.listen(PORT, async () => {
  console.log(`✅Server is running at http://localhost:${PORT}`);
});
