import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authenticateEntraToken } from '../middleware/entraAuthMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateEntraToken);
router.use(requireRole(['ADMIN', 'AUDITOR']));

router.get('/', getAuditLogs);

export default router;
