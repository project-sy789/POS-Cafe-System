import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Socket.IO authentication middleware
 * Verifies JWT token from handshake auth or query
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from handshake auth or query parameters
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user info to socket
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
