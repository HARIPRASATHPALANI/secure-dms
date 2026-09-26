import { Document } from '../models/Document.js';
import { Case } from '../models/Case.js';
import { AuditLog } from '../models/AuditLog.js';
import { FileService } from '../services/fileService.js';
import { containerClient } from '../services/blobService.js';

export const uploadDocument = async (req, res, next) => {
  try {
    const {
      case_id,
      title,
      document_type,
      description,
      remarks,
      version
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No document file attached to request.'
      });
    }

    if (!case_id || !title || !document_type) {
      return res.status(400).json({
        success: false,
        error: 'Case ID, Title, and Document Type are required fields.'
      });
    }

    const targetCase = await Case.findById(case_id);

    if (!targetCase) {
      return res.status(404).json({
        success: false,
        error: `Associated Case ID '${case_id}' does not exist.`
      });
    }

    const validation = FileService.validateFile(file);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const documentId = FileService.generateDocumentId();

    const extension = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase()
      : '';

    const blobName = `${documentId}${extension}`;

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    const newDocId = await Document.create({
      document_id: documentId,
      case_id: targetCase.id,
      title,
      document_type,
      file_name: blobName,
      original_name: file.originalname,
      file_path: blobName,
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
      details: {
        documentId,
        caseId: targetCase.case_id,
        title,
        document_type
      },
      ip_address: req.ip
    });

    const docRecord = await Document.findById(newDocId);

    return res.status(201).json({
      success: true,
      document: docRecord,
      message: 'Document uploaded to Azure Blob Storage and indexed successfully.'
    });

  } catch (err) {
    next(err);
  }
};

export const getDocumentsByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const targetCase = await Case.findById(caseId);

    if (!targetCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.'
      });
    }

    const documents = await Document.findByCaseId(targetCase.id);

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }

    return res.status(200).json({
      success: true,
      document
    });

  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }

    const blobName = document.file_path;

    if (!blobName) {
      return res.status(404).json({
        success: false,
        error: 'Blob reference missing for document.'
      });
    }

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();

    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Document file missing from Azure Blob Storage.'
      });
    }

    await AuditLog.log({
      user_id: req.user.id,
      action: 'DOCUMENT_DOWNLOAD',
      entity: 'Document',
      details: {
        documentId: document.document_id,
        title: document.title
      },
      ip_address: req.ip
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.original_name}"`
    );

    res.setHeader(
      'Content-Type',
      document.mime_type
    );

    const downloadResponse =
      await blockBlobClient.download();

    downloadResponse.readableStreamBody.pipe(res);

  } catch (err) {
    next(err);
  }
};
