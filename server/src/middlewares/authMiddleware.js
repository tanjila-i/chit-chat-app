import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export default protectRoute;
