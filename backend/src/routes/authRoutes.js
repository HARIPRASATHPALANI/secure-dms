import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { authenticateEntraToken } from '../middleware/entraAuthMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticateEntraToken, logout);
router.get('/me', authenticateEntraToken, getMe);

export default router;
