import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import cors from "cors";
import { connectDB } from "./config/db.ts";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.ts";
import adminRoute from "./routes/admin.route.ts"
const app = express();
const PORT = 5000;

app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
connectDB();

app.use("/api/user", authRoutes);
app.use("/api/admin",adminRoute);

app.get("/", (req, res) => {
  res.send(" Backend server is running successfully!");
});

app.listen(PORT, async () => {
  console.log(` ✅Server is running at http://localhost:${PORT}`);
});
