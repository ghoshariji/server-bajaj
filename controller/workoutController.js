const Workout = require("../modals/workoutModal");
const User = require("../modals/userModal");
const jwt = require("jsonwebtoken");

// Create a new workout
const createWorkout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const { workoutName, count } = req.body;
    const [name, timeString] = workoutName.split(" - ");
    const time = parseInt(timeString, 10); 

    if (!name || isNaN(time)) {
      return res.status(400).json({ message: "Invalid workout format" });
    }

    // Create and save the workout in the database
    const newWorkout = new Workout({
      name,
      time,
      result: count, 
      user: decoded.id,
    });

    await newWorkout.save();
    res.status(201).json({ message: "Workout saved successfully", workout: newWorkout });
  } catch (error) {
    console.error("Error saving workout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all workouts of a user and the top 5 users
const getWorkoutsByUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Fetch workouts for the logged-in user
    const userWorkouts = await Workout.find({ user: decoded.id });

    const userIds = [...new Set(userWorkouts.map(workout => workout.user.toString()))];
    const userDetails = await User.find({ _id: { $in: userIds } }).select("-password");
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: "workouts",
          localField: "_id",
          foreignField: "user",
          as: "workoutData"
        }
      },
      { $addFields: { score: { $size: "$workoutData" } } },
      { $sort: { workoutCount: -1 } },
      { $limit: 5 },
      { $project: { password: 0, workoutData: 0 } } // Exclude sensitive data
    ]);

    res.status(200).json({ userIds, userDetails, topUsers });

  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get all workouts (admin or general view)
const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find();
    console.log(workouts);
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createWorkout, getWorkoutsByUser, getAllWorkouts };
