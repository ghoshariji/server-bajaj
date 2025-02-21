const Workout = require("../modals/workoutModal");
const User = require("../modals/userModal");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const gemini_api_key = "AIzaSyBw_WJYny7xoZfn7p9UGhLYqr4eWnKXIp8";
console.log(gemini_api_key)
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
  },
});
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
    res
      .status(201)
      .json({ message: "Workout saved successfully", workout: newWorkout });
  } catch (error) {
    console.error("Error saving workout:", error);
    res.status(500).json({ message: "Server error" });
  }

};






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

    const userId = decoded.id;

    // Fetch workouts of the logged-in user
    const userWorkouts = await Workout.find({ user: userId })
      .populate("user", "name email") // Populate user name and email
      .sort({ createdAt: -1 }); // Sort workouts by latest

    // Get all unique users who have done workouts
    const allUsersWorkouts = await Workout.aggregate([
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: 1 }, // Count total workouts as score
          workoutNames: { $push: "$name" }, // Collect workout names
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          totalScore: 1,
          workoutNames: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
        },
      },
    ]);

    // Get the top 5 users based on the most workouts
    const topUsers = allUsersWorkouts
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    res.status(200).json({
      userWorkouts: userWorkouts.map((workout) => ({
        workoutName: workout.name,
        user: workout.user.name,
        result: workout.result,
      })),
      allUsersWorkouts,
      topUsers,
    });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTopWorkouts = async (req, res) => {
  try {
    const topSquats = await Workout.find({ name: "Squat" })
      .sort({ createdAt: -1 }) // Get latest
      .limit(3);

    const topPushUps = await Workout.find({ name: "Push Up" })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      squats: topSquats.length
        ? topSquats
        : [{ name: "Squat", time: 0, result: "N/A", user: null }],
      pushUps: topPushUps.length
        ? topPushUps
        : [{ name: "Push Up", time: 0, result: "N/A", user: null }],
    });
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
const workoutData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access Denied" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch all workouts for this user
    const workouts = await Workout.find({ user: userId });

    if (!workouts.length) {
      return res.status(404).json({ message: "No workout data found" });
    }

    // Format data for Gemini API
    const formattedData = workouts.map((w) => ({
      name: w.name,
      time: w.time,
      result: w.result,
      date: w.createdAt.toISOString().split("T")[0],
    }));

    // Call Gemini API for insights
    const prompt = `Analyze the following workout data and provide a short summary (4-5 lines) about the performance trends and possible improvements:\n${JSON.stringify(
      formattedData
    )}`;

    const result = await geminiModel.generateContent(prompt);
    const aiInsights = result.response.text().split("\n").slice(0, 5).join(" "); // Limit to 4-5 lines

    // Send response to frontend
    res.json({
      workouts: formattedData,
      insights: aiInsights,
    });
  } catch (error) {
    console.error("Error fetching workout data:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createWorkout,
  getWorkoutsByUser,
  getAllWorkouts,
  getTopWorkouts,
  workoutData,
};
