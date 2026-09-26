import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  databasePath: process.env.DATABASE_PATH || './database/dms.sqlite',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  entraTenantId: process.env.ENTRA_TENANT_ID,
  entraBackendClientId: process.env.ENTRA_BACKEND_CLIENT_ID,
  entraApiAudience: process.env.ENTRA_API_AUDIENCE,
  maxSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '15728640', 10),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,png,jpg,jpeg,docx').split(',')
};
