// backend/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
 name: { type: String,  required: [true, 'Please add an email'],
    unique: true,
    trim: true,},
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  profilePicture: { type: Buffer }, 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
