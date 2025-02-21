const express = require("express");
const { saveUserChat, getUserChats } = require("../controller/aiCOntroller");
const router = express.Router();

// Save chat to database
router.post("/save-chat", saveUserChat);

// Get all chats for a user
router.get("/user-chats", getUserChats);

module.exports = router;
