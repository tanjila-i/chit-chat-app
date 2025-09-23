import express from "express";
import { register, userVerifyEmail } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/verify-email", userVerifyEmail);

export default userRouter;
