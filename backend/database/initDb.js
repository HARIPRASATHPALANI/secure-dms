import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { dbExec, dbGet, dbRun } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const initDatabase = async () => {
  console.log('🚀 Initializing Database Schema...');

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      badge_number TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'INVESTIGATOR', 'LEGAL_OFFICER', 'AUDITOR')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT UNIQUE NOT NULL,
      case_name TEXT NOT NULL,
      case_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('OPEN', 'UNDER_INVESTIGATION', 'IN_COURT', 'CLOSED')),
      priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      location TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT UNIQUE NOT NULL,
      case_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      version TEXT DEFAULT 'v1.0',
      description TEXT,
      remarks TEXT,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS security_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      module_name TEXT NOT NULL,
      attempt_count INTEGER NOT NULL,
      ip_address TEXT,
      telegram_sent INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  await dbExec(schemaSql);
  console.log('✅ Tables created successfully.');

  // Check if admin user exists, if not seed database
  const existingAdmin = await dbGet('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    console.log('🌱 Seeding initial database records...');

    // Hashed default passwords
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const officerPass = await bcrypt.hash('Officer@123', 10);
    const legalPass = await bcrypt.hash('Legal@123', 10);

    // Seed Users
    const resAdmin = await dbRun(
      'INSERT INTO users (username, password_hash, full_name, badge_number, role) VALUES (?, ?, ?, ?, ?)',
      ['admin', adminPass, 'Chief Inspector Rajesh Kumar', 'ADM-001', 'ADMIN']
    );

    const resOfficer = await dbRun(
      'INSERT INTO users (username, password_hash, full_name, badge_number, role) VALUES (?, ?, ?, ?, ?)',
      ['officer_sharma', officerPass, 'Inspector Vikram Sharma', 'INV-104', 'INVESTIGATOR']
    );

    const resLegal = await dbRun(
      'INSERT INTO users (username, password_hash, full_name, badge_number, role) VALUES (?, ?, ?, ?, ?)',
      ['legal_counsel', legalPass, 'Adv. Ananya Roy', 'LEG-202', 'LEGAL_OFFICER']
    );

    // Seed Cases
    const case1 = await dbRun(
      `INSERT INTO cases (case_id, case_name, case_type, status, priority, location, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'CASE-2026-0101',
        'Cyber Financial Fraud at Metro Bank',
        'Cybercrime',
        'UNDER_INVESTIGATION',
        'HIGH',
        'Cyber Crime Cell, District HQ',
        'Unauthorized unauthorized transaction of ₹4.5 Crore via spoofed gateway endpoints.',
        resOfficer.lastID
      ]
    );

    const case2 = await dbRun(
      `INSERT INTO cases (case_id, case_name, case_type, status, priority, location, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'CASE-2026-0102',
        'State vs. Sector 4 Warehouse Theft',
        'Criminal',
        'IN_COURT',
        'CRITICAL',
        'Special Crime Branch, Zone 2',
        'Break-in and theft of seized contraband goods from government warehouse.',
        resAdmin.lastID
      ]
    );

    // Create sample physical test files in uploads directory
    const sampleFirPath = path.join(uploadsDir, 'sample_fir_2026_0101.pdf');
    const sampleWitnessPath = path.join(uploadsDir, 'sample_witness_statement.pdf');

    const samplePdfContent = '%PDF-1.4 Mock Legal Evidentiary Document Content for DMS Testing %EOF';
    fs.writeFileSync(sampleFirPath, samplePdfContent);
    fs.writeFileSync(sampleWitnessPath, samplePdfContent);

    // Seed Documents
    await dbRun(
      `INSERT INTO documents (document_id, case_id, title, document_type, file_name, original_name, file_path, file_size, mime_type, version, description, remarks, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'DOC-2026-0001',
        case1.lastID,
        'Initial FIR Copy - Bank Fraud',
        'FIR',
        'sample_fir_2026_0101.pdf',
        'FIR_MetroBank_Fraud.pdf',
        sampleFirPath,
        samplePdfContent.length,
        'application/pdf',
        'v1.0',
        'First Information Report registered under Section 66D IT Act.',
        'HIGHLY CONFIDENTIAL - Evidentiary Exhibit A',
        resOfficer.lastID
      ]
    );

    await dbRun(
      `INSERT INTO documents (document_id, case_id, title, document_type, file_name, original_name, file_path, file_size, mime_type, version, description, remarks, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'DOC-2026-0002',
        case2.lastID,
        'Key Witness Statement - Warehouse Security',
        'Witness Statement',
        'sample_witness_statement.pdf',
        'Witness_Statement_Guard.pdf',
        sampleWitnessPath,
        samplePdfContent.length,
        'application/pdf',
        'v1.0',
        'Recorded statement of night security guard present during breach.',
        'Verified under oath.',
        resAdmin.lastID
      ]
    );

    // Seed Audit Log
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, entity, details, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [resAdmin.lastID, 'SYSTEM_INIT', 'Database', 'Initial seed data populated successfully.', '127.0.0.1']
    );

    console.log('✅ Seed data populated successfully.');
  } else {
    console.log('ℹ️ Database already seeded.');
  }
};

// Execute if called directly from CLI
if (process.argv[1] && process.argv[1].endsWith('initDb.js')) {
  initDatabase().then(() => {
    console.log('🏁 Database setup script completed.');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Database init failed:', err);
    process.exit(1);
  });
}
