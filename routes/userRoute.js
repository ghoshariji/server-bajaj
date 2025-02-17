// backend/routes/userRoutes.js
const express = require('express');
const {registerUser,loginUser} =require ("../controller/userController");
const protect = require ("../middleware/authMiddleware");
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
