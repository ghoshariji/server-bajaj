// workoutRoute.js
const express = require('express');
const {
  createWorkout,
  getWorkoutsByUser,
  getAllWorkouts,
  getTopWorkouts,
  workoutData
} = require('../controller/workoutController');
const  protect = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createWorkout)
  .get(protect, getAllWorkouts);

router.route('/user')
  .get(protect, getWorkoutsByUser);

  router.get("/top-workouts", getTopWorkouts);
  router.get("/top-workouts-graph", workoutData);


module.exports = router;
