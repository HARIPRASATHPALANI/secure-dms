import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document.js';
import { Case } from '../models/Case.js';
import { AuditLog } from '../models/AuditLog.js';
import { FileService } from '../services/fileService.js';

export const uploadDocument = async (req, res, next) => {
  try {
    const { case_id, title, document_type, description, remarks, version } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No document file attached to request.' });
    }

    if (!case_id || !title || !document_type) {
      // Clean up uploaded file if validation fails
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, error: 'Case ID, Title, and Document Type are required fields.' });
    }

    // Verify Case exists
    const targetCase = await Case.findById(case_id);
    if (!targetCase) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ success: false, error: `Associated Case ID '${case_id}' does not exist.` });
    }

    // Validate file properties
    const validation = FileService.validateFile(file);
    if (!validation.valid) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, error: validation.error });
    }

    const documentId = FileService.generateDocumentId();

    const newDocId = await Document.create({
      document_id: documentId,
      case_id: targetCase.id,
      title,
      document_type,
      file_name: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      version: version || 'v1.0',
      description,
      remarks,
      uploaded_by: req.user.id
    });

    await AuditLog.log({
      user_id: req.user.id,
      action: 'DOCUMENT_UPLOAD',
      entity: 'Document',
      details: { documentId, caseId: targetCase.case_id, title, document_type },
      ip_address: req.ip
    });

    const docRecord = await Document.findById(newDocId);

    return res.status(201).json({
      success: true,
      document: docRecord,
      message: 'Document uploaded and indexed successfully.'
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

export const getDocumentsByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const targetCase = await Case.findById(caseId);

    if (!targetCase) {
      return res.status(404).json({ success: false, error: 'Case not found.' });
    }

    const documents = await Document.findByCaseId(targetCase.id);
    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    return res.status(200).json({ success: true, document });
  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, error: 'Physical document file missing from storage disk.' });
    }

    await AuditLog.log({
      user_id: req.user.id,
      action: 'DOCUMENT_DOWNLOAD',
      entity: 'Document',
      details: { documentId: document.document_id, title: document.title },
      ip_address: req.ip
    });

    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
    res.setHeader('Content-Type', document.mime_type);
    
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};
