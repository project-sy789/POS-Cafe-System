import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories
 * Public route
 */
router.get('/', getCategories);

/**
 * POST /api/categories
 * Create a new category with optional image and icon upload
 * Protected route - requires Manager role
 */
router.post(
  '/',
  authenticate,
  authorize('Manager'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
  ]),
  createCategory
);

/**
 * PUT /api/categories/:id
 * Update a category with optional image and icon upload
 * Protected route - requires Manager role
 */
router.put(
  '/:id',
  authenticate,
  authorize('Manager'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
  ]),
  updateCategory
);

/**
 * DELETE /api/categories/:id
 * Delete a category
 * Protected route - requires Manager role
 */
router.delete('/:id', authenticate, authorize('Manager'), deleteCategory);

export default router;
