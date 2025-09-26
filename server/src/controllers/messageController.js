import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const filterdUsers = await userModel
      .find({ _id: { $ne: userId } })
      .select("-password");

    // Count number of messages not seen

    const unseenMessage = {};

    const promises = filterdUsers.map(async (user) => {
      const message = await messageModel.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (message.length > 0) {
        return (unseenMessage[user._id] = message.length);
      }
      await Promise.all(promises);
    });

    res.status(200).json({ success: true, user: filterdUsers, unseenMessage });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;

    const messages = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error.message);

    res.status(400).json({ success: false, message: error.message });
  }
};
