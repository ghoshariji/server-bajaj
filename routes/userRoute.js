// backend/routes/userRoutes.js
const express = require('express');
const {registerUser,loginUser,getProfile,updateProfile} =require ("../controller/userController");
const multer = require('multer');
const protect = require ("../middleware/authMiddleware");

const storage = multer.memoryStorage(); 
const upload = multer({ storage });



const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


// Protected Route for Profile Get and Update (using 'protect' middleware)
router.get('/profile',protect, getProfile);
router.put('/profile',protect, upload.single('profilePicture'), updateProfile);

module.exports = router;
