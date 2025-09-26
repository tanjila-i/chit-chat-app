import express from "express";
import protectRoute from "../middlewares/authMiddleware.js";
import {
  getMessagesByUserId,
  getUsers,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRoute = express.Router();

messageRoute.get("/users", protectRoute, getUsers);
messageRoute.get("/:id", protectRoute, getMessagesByUserId);
messageRoute.post("/send/:id", protectRoute, sendMessage);
messageRoute.put("/mark/:id", protectRoute, markMessageAsSeen);
export default messageRoute;
