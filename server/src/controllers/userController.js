import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users
 * GET /api/users
 * Manager only
 */
export const getUsers = async (req, res) => {
  try {
    // Fetch all users, excluding password field
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching users'
    });
  }
};

/**
 * Create a new user
 * POST /api/users
 * Manager only
 */
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username, password, and role are required'
      });
    }

    // Validate role
    const validRoles = ['Cashier', 'Barista', 'Manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid role. Must be Cashier, Barista, or Manager'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'Username already exists'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      username,
      password,
      role
    });

    await user.save();

    // Return user without password
    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while creating user'
    });
  }
};

/**
 * Update a user
 * PUT /api/users/:id
 * Manager only
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (username) {
      // Check if new username is already taken by another user
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Duplicate Entry',
          message: 'Username already exists'
        });
      }
      user.username = username;
    }

    if (role) {
      const validRoles = ['Cashier', 'Barista', 'Manager'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid role. Must be Cashier, Barista, or Manager'
        });
      }
      user.role = role;
    }

    // Update password if provided (will be hashed by pre-save hook)
    if (password) {
      user.password = password;
    }

    await user.save();

    // Return updated user without password
    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating user'
    });
  }
};

/**
 * Delete a user
 * DELETE /api/users/:id
 * Manager only
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting user'
    });
  }
};
