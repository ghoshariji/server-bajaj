// backend/models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an email"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phone:{
      type:String,
      default:""
    },
    redeem:{
      type:Number,
      default:""
    },
    profilePicture: {
        data: {
          type: Buffer,
          default: "", // Set default image
        },
        contentType: {
          type: String,
          default: "image/png", // Default content type
        },
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
