import express from "express";
import protectRoute from "../middlewares/authMiddleware.js";
import {
  getMessagesByUserId,
  getUsers,
} from "../controllers/messageController.js";

const messageRoute = express.Router();

messageRoute.get("/users", protectRoute, getUsers);
messageRoute.get("/:id", protectRoute, getMessagesByUserId);

export default messageRoute;
