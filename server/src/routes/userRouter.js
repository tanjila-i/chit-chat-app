import express from "express";
import {
  register,
  userLogin,
  userVerifyEmail,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/verify-email", userVerifyEmail);
userRouter.post("/login", userLogin);

export default userRouter;
