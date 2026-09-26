import path from 'path';
import { config } from '../config/env.js';

export class FileService {
  static validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > config.maxSizeBytes) {
      const maxMb = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `File size exceeds maximum limit of ${maxMb}MB.` };
    }

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!config.allowedFileTypes.includes(ext)) {
      return {
        valid: false,
        error: `File type '.${ext}' is not permitted. Allowed extensions: ${config.allowedFileTypes.join(', ')}.`
      };
    }

    return { valid: true };
  }

  static generateDocumentId() {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `DOC-${year}-${randomHex}`;
  }
}
