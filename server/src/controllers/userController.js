import { genereateToken } from "../middlewares/token.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

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

    res.status(201).json({
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
