import express from 'express';
import { getCases, getCaseById, createCase, getDashboardMetrics } from '../controllers/caseController.js';import { authenticateEntraToken } from '../middleware/entraAuthMiddleware.js';
import { requireReAuthToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateEntraToken);
router.get('/', getCases);
router.get('/metrics', getDashboardMetrics);
router.get('/:id', getCaseById);
router.post('/', requireReAuthToken('NEW_CASE'), createCase);

export default router;
