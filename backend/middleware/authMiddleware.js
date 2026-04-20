const jwt = require('jsonwebtoken');
const { usersFile, readData } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Read from local JSON instead of MongoDB
    const users = await readData(usersFile);
    const user = users.find(u => u._id === decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User not found.',
      });
    }

    // Remove password from the user object before attaching to req
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

module.exports = { protect };