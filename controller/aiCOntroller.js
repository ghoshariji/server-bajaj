const UserModal = require("../modals/aiPersonalData");
const jwt = require("jsonwebtoken");

// Save or Update Chat
exports.saveUserChat = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from the token

    const { text, aiResponse } = req.body;

    if (!text || !aiResponse) {
      return res.status(400).json({ message: "Text and AI response are required." });
    }

    // Remove previous chat entry (if any)
    await UserModal.deleteOne({ userId });

    // Save new chat
    const newChat = new UserModal({ userId, text, aiResponse });
    await newChat.save();

    res.status(201).json({ message: "Chat saved successfully!", chat: newChat });
  } catch (error) {
    res.status(500).json({ message: "Error saving chat", error: error.message });
  }
};

// Get User Chats
exports.getUserChats = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from the token

    const chats = await UserModal.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};
