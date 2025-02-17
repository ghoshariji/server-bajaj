
const Workout = require("../modals/workoutModal");
const User=require("../modals/userModal");

// Create a new workout
const createWorkout = async (req, res) => {
  const { name, time, result } = req.body;

  if (!name || !time || !result) {
    return res.status(400).json({ message: 'Please provide all the required fields' });
  }

  try {
    const workout = new Workout({
      name,
      time,
      result,
      user: req.user._id, 
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getWorkoutsByUser = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all workouts (admin or general view)
const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createWorkout, getWorkoutsByUser, getAllWorkouts };
