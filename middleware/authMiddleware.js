const jwt = require('jsonwebtoken');
const User = require('../modals/userModal');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Get the token

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

      req.user = await User.findById(decoded.id).select('-password'); // Attach user to req

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      next(); // Continue to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'No token, authorization denied' });
  }
};


module.exports = { protect };
