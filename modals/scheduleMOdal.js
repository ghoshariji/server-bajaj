const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    time: {
      type: String, // Store time in "HH:mm" format
      required: true,
    },
    repeat: {
      type: String,
      enum: ["daily"], // Ensures it repeats every day
      default: "daily",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
