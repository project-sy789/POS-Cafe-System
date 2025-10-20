import express from 'express';
import {
  getSettings,
  updateSettings
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get settings
 * Protected route - requires authentication (all roles can read settings)
 */
router.get('/', authenticate, getSettings);

/**
 * PUT /api/settings
 * Update settings with optional file uploads (favicon, logo)
 * Protected route - requires Manager role
 */
router.put(
  '/',
  authenticate,
  authorize('Manager'),
  upload.fields([
    { name: 'favicon', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'featuredIcon', maxCount: 1 }
  ]),
  updateSettings
);

export default router;
