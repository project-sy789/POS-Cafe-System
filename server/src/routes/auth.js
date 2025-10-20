import express from 'express';
import { login, verify } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with username and password
 * Public route
 */
router.post('/login', login);

/**
 * POST /api/auth/verify
 * Verify JWT token and get user info
 * Protected route - requires valid JWT token
 */
router.post('/verify', authenticate, verify);

export default router;
