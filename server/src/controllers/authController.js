import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Login user with username and password
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });

    // Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login'
    });
  }
};

/**
 * Verify JWT token and return user info
 * POST /api/auth/verify
 */
export const verify = async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during token verification'
    });
  }
};
