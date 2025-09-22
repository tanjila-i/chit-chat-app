import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import connectDB from "./src/configs/bd.js";
import userRouter from "./src/routes/userRouter.js";
import cookieParser from "cookie-parser";

const app = express();

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// API testing
app.get("/", (req, res) => {
  res.send("server is running...");
});

// routes
app.use("/api/users", userRouter);
const port = process.env.PORT || 4000;
app.listen(port, async () => {
  console.log(`server is running at http://localhost:${port}`);
  await connectDB();
});
