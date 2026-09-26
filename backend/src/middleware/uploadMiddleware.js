import multer from 'multer';
import path from 'path';
import { config } from '../config/env.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (config.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type '.${ext}' is not permitted. Allowed: ${config.allowedFileTypes.join(', ')}`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: config.maxSizeBytes },
  fileFilter
});
