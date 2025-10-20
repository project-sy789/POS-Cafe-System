import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getSalesReport,
  exportOrdersToCSV
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 * Requires Cashier or Manager role
 */
router.post(
  '/',
  authenticate,
  authorize('Cashier', 'Manager'),
  createOrder
);

/**
 * GET /api/orders
 * Get all orders with optional filtering
 * Requires authentication
 */
router.get(
  '/',
  authenticate,
  getOrders
);

/**
 * GET /api/orders/:id
 * Get a single order by ID
 * Requires authentication
 */
router.get(
  '/:id',
  authenticate,
  getOrderById
);

/**
 * PUT /api/orders/:id/status
 * Update order status
 * Requires Barista or Manager role
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('Barista', 'Manager'),
  updateOrderStatus
);

/**
 * GET /api/orders/reports/sales
 * Generate sales report with aggregated metrics
 * Requires Manager role
 */
router.get(
  '/reports/sales',
  authenticate,
  authorize('Manager'),
  getSalesReport
);

/**
 * GET /api/orders/reports/export
 * Export orders to CSV file
 * Requires Manager role
 */
router.get(
  '/reports/export',
  authenticate,
  authorize('Manager'),
  exportOrdersToCSV
);

export default router;
