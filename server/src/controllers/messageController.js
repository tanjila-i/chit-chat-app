import cloudinary from "../middlewares/cloudinary.js";
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

    const seenMessage = await messageModel.updateMany(
      { senderId: id, receiverId: myId },
      { seen: true }
    );

    res.status(200).json({ messages, seenMessage });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params.id;

    await messageModel.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new messageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo:send message in real-time if user is online -soket io

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
