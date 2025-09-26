import express from "express";
import {
  forgotPassword,
  logOut,
  register,
  resetPassword,
  userLogin,
  userVerifyEmail,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/verify-email", userVerifyEmail);
userRouter.post("/login", userLogin);
userRouter.post("/logout", logOut);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
