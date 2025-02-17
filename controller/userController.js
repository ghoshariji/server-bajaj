const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../modals/userModal');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register User
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
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
        profilePicture: user.profilePicture
          ? `data:image/png;base64,${user.profilePicture.toString('base64')}`
          : null,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve profile' });
      console.error(error);
    }
  };
  
  



// Update User Profile (Name, Password, Profile Picture)
const updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const userId = req.user.id; 

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) {
      user.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle profile picture (stored as Buffer in MongoDB)
    if (req.file) {
      user.profilePicture = req.file.buffer; // Store image as Buffer
    }

    await user.save(); // Save updated user to DB

    res.status(200).json({
      _id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture ? true : false, // Send back a flag to indicate profile picture exists
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed' });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
