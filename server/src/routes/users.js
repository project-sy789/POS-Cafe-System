import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users
 * Protected route - requires Manager role
 */
router.get('/', authenticate, authorize('Manager'), getUsers);

/**
 * POST /api/users
 * Create a new user
 * Protected route - requires Manager role
 */
router.post('/', authenticate, authorize('Manager'), createUser);

/**
 * PUT /api/users/:id
 * Update a user
 * Protected route - requires Manager role
 */
router.put('/:id', authenticate, authorize('Manager'), updateUser);

/**
 * DELETE /api/users/:id
 * Delete a user
 * Protected route - requires Manager role
 */
router.delete('/:id', authenticate, authorize('Manager'), deleteUser);

export default router;
