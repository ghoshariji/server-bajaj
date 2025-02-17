const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a workout name'],
    trim: true,
  },
  time: {
    type: Number,
    required: [true, 'Please add the time for the workout in minutes'],
  },
  result: {
    type: String,
    required: [true, 'Please add the result of the workout'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
