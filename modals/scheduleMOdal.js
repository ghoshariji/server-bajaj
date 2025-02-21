const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: {
      type: String, 
      required: true,
    },
    repeat: {
      type: String,
      enum: ["daily"], 
      default: "daily",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
