import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellingProducts
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * GET /api/products
 * Get all products with optional category filter
 * Public access
 */
router.get('/', getProducts);

/**
 * GET /api/products/best-sellers
 * Get best-selling products based on sales statistics
 * Requires authentication
 */
router.get('/best-sellers', authenticate, getBestSellingProducts);

/**
 * GET /api/products/:id
 * Get a single product by ID
 * Public access
 */
router.get('/:id', getProductById);

/**
 * POST /api/products
 * Create a new product with image upload and option icons
 * Requires Manager role
 */
router.post(
  '/',
  authenticate,
  authorize('Manager'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'optionIcons', maxCount: 50 }
  ]),
  createProduct
);

/**
 * PUT /api/products/:id
 * Update a product with optional image and option icons update
 * Requires Manager role
 */
router.put(
  '/:id',
  authenticate,
  authorize('Manager'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'optionIcons', maxCount: 50 }
  ]),
  updateProduct
);

/**
 * DELETE /api/products/:id
 * Delete a product
 * Requires Manager role
 */
router.delete(
  '/:id',
  authenticate,
  authorize('Manager'),
  deleteProduct
);

export default router;
