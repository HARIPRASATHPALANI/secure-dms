import express from 'express';
import { verifyReAuth } from '../controllers/securityController.js';
import { authenticateEntraToken } from '../middleware/entraAuthMiddleware.js';

const router = express.Router();
router.use(authenticateEntraToken);

router.post('/verify-reauth', verifyReAuth);

export default router;
