import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 * Attaches user object to req.user if token is valid
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid token'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};
