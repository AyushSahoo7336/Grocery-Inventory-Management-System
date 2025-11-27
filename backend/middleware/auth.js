const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grocery-inventory-secret-2024');
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid - user not found' 
      });
    }

    // Add user ID to request
    req.userId = decoded.userId;
    req.user = user;
    
    console.log('🔒 Authenticated user:', user.email, 'ID:', user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth;