const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../modals/userModal');
const aiPersonalData = require('../modals/aiPersonalData');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register User
const registerUser = async (req, res) => {
  const { email, password,name,phone } = req.body;

  console.log(req.body);
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const user = await User.findById(userId).select('-password'); // Exclude password
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        _id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve profile' });
      console.error(error);
    }
  };
  const updateProfile = async (req, res) => {
    const { name, password } = req.body;
    const userId = req.user.id;

    console.log(req.file);
    console.log(req.body);
    console.log(userId);
    try {
      // Find user by user ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update user fields if provided
      if (name) {
        user.name = name;
      }
  
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
  
      // Handle profile picture if provided
      if (req.file) {
        user.profilePicture = {
          data: req.file.buffer, // Store the image as a Buffer
          contentType: req.file.mimetype, // Store the MIME type of the image
        };
      }
  
      // Save the updated user
      await user.save();
  
      // Prepare profile picture as base64-encoded string if exists
      const profilePictureBase64 = user.profilePicture?.data
        ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`
        : null;
  

        console.log(user);
      // Respond with the updated user information
      res.status(200).json({
        _id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: profilePictureBase64, // Send the base64 profile picture
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Profile update failed" });
    }
  };
  

  const getUserDetails = async (req, res) => {
    try {
      // Find the user by ID and exclude password and profile picture
      const user = await User.findById(req.user.id).select("-password -profilePicture");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch AI response data from UserModal using userId
      const aiResponses = await aiPersonalData.find({ userId: req.user.id });
  
      res.status(200).json({ user, aiResponses });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
const getUserRedeemBalance = async (req, res) => {
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ redeem: user.redeem });
  } catch (error) {
    console.error("Error fetching redeem balance:", error);
    res.status(500).json({ message: "Server error" });
  }
};





module.exports = { registerUser, loginUser, getProfile, updateProfile,getUserDetails,getUserRedeemBalance };
