import { genereateToken } from "../middlewares/token.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../nodemailer/email.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "../nodemailer/emailTemplted.js";
import transporter from "../nodemailer/nodemailer.config.js";

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.json({ success: false, message: "All files required" });
    }

    const exitsUser = await userModel.findOne({ email });

    if (exitsUser) {
      return res
        .status(400)
        .json({ success: false, message: "User is already exits" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = new userModel({
      fullName,
      email,
      password: hashPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newUser.save();

    const token = genereateToken(res, newUser._id);

    await sendVerificationEmail(newUser.email, verificationToken);

    await res.status(201).json({
      success: true,
      newUser,
      token,
      message: "Register Successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
};

export const userVerifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const verifyedUser = await userModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!verifyedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    verifyedUser.isVerified = true;
    verifyedUser.verificationToken = undefined;
    verifyedUser.verificationTokenExpiresAt = undefined;

    await verifyedUser.save();

    res
      .status(200)
      .json({ success: true, message: "User is verifyed successfully" });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password incorrect" });
    }

    const token = await genereateToken(res, user._id);

    await user.save();

    res.status(200).json({
      success: true,
      user,
      token,
      message: "User Login Succfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ success: false, message: error.message });
  }
};

export const logOut = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Loggout successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: " email not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    const resetMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset your password",
      text: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      ),
      category: "password reset",
    };

    await transporter.sendMail(resetMailOptions);
    res.status(200).json({
      success: true,
      message: "Password reset link send to your email",
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your email",
      text: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
