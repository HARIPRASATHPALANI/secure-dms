import express from 'express';
import { uploadDocument, getDocumentsByCase, getDocumentById, downloadDocument } from '../controllers/documentController.js';
import { authenticateEntraToken } from '../middleware/entraAuthMiddleware.js';
import { requireReAuthToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(authenticateEntraToken);


router.post('/upload', requireReAuthToken('UPDATE'), upload.single('file'), uploadDocument);
router.get('/case/:caseId', getDocumentsByCase);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);

export default router;
