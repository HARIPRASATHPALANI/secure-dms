# KAVACH DMS — Secure Digital Document Management System

> **A Secure, Centralized, and Intelligent Document Management & Evidentiary Tracking System for Law Enforcement Agencies, Courts, and Legal Institutions.**

---

## 🛡️ Key Features

1. **Multi-Tiered Access Security**:
   - **Primary Authentication**: JWT + Salted `bcryptjs` password hashing.
   - **Step-Up Re-Authentication Guard**: Sensitive operational modules (**UPDATE** & **NEW CASE**) require secondary authentication with a strict **2-attempt limit**.
   - **Telegram Security Alert Integration**: Upon 2 consecutive failed re-authentication attempts, the backend automatically dispatches suspicious login telemetry to the administrator's Telegram channel.
2. **Centralized Evidentiary Document Storage**:
   - Classify documents (FIR, Police Report, Witness Statement, Charge Sheet, Court Filing, Forensic Report, Judgment, Legal Notice).
   - Strict file validation: max size 15MB, extension filtering (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`), secure filename hashing.
3. **Case Management Lifecycle**:
   - Register new police cases with unique Case IDs (`CASE-YYYY-XXXX`).
   - Drill-down case inspection, live search, and classification filters.
4. **Forensic Audit Trail**:
   - Immutable audit table recording every user action, IP address, timestamp, and security alert.
5. **Modern Professional Interface**:
   - Dark slate/navy glassmorphic design tailored for law enforcement control centers.

---

## 💻 Tech Stack Summary

- **Frontend**: React (Vite) + Lucide Icons + Custom Security CSS
- **Backend**: Node.js + Express.js (REST APIs)
- **Database**: SQLite (Zero server setup required; 100% portable)
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs`
- **Uploads**: `multer` file middleware
- **External Integration**: Telegram Bot API (`node-fetch`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- VS Code / Terminal

---

### Step 1: Install Backend Dependencies & Initialize Database

```bash
cd backend
npm install
npm run db:init
```

---

### Step 2: Start Backend API Server

```bash
npm run dev
```

*The backend server will run on `http://localhost:5000`.*

---

### Step 3: Install Frontend Dependencies & Start App

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

*The frontend application will run on `http://localhost:3000`.*

---

## 🔑 Demo Account Credentials

| Role | Username | Password | Badge Number | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Chief** | `admin` | `Admin@123` | `ADM-001` | Full System Access & Audit Logs |
| **Investigating Officer** | `officer_sharma` | `Officer@123` | `INV-104` | View, Update Docs, Create Cases |
| **Legal Officer** | `legal_counsel` | `Legal@123` | `LEG-202` | View Cases & Legal Remarks |

---

## 🧪 Automated Security Test Suite

To run the automated security verification suite (verifies auth, re-auth 2-attempt rule, Telegram alert trigger, case creation, duplicate prevention, and audit logs):

```bash
cd backend
node tests/security.test.js
```

---

## 📺 Project Presentation & Demo Sequence

1. **Login Screen**:
   - Navigate to `http://localhost:3000/login`.
   - Sign in with `admin` / `Admin@123`.
2. **Main Dashboard**:
   - Review live metrics (Active Cases count, Evidentiary Docs count, Telegram security alerts log).
   - Observe the 3 major operational modules: **UPDATE**, **VIEW**, and **NEW CASE**.
3. **Module 2 — VIEW (Direct Access)**:
   - Click **VIEW**.
   - Search cases by name or ID (e.g. `CASE-2026-0101`).
   - Inspect attached FIRs, Witness Statements, and click **View** to open metadata summary modal or **Download**.
4. **Module 1 — UPDATE (Re-Auth Protected)**:
   - Click **UPDATE**.
   - Secondary Re-Authentication Modal opens asking for password.
   - Enter `Admin@123` → Access granted.
   - Select a case, choose document type `Forensic Report`, select file, and upload.
   - Observe document indexed immediately.
5. **Module 3 — NEW CASE (Re-Auth Protected)**:
   - Click **NEW CASE**.
   - Re-auth token already validated in session → Access granted.
   - Register a new case: Auto-generate Case ID, enter title, set status `UNDER_INVESTIGATION`, priority `CRITICAL`.
   - Submit → redirected to View module with new case listed.
6. **Demonstrate Failed Login Security & Telegram Bot Alert**:
   - Open an incognito tab or log out & log in as `officer_sharma` / `Officer@123`.
   - Click **UPDATE**.
   - **Attempt 1**: Enter wrong password `WrongPass1` → Warning shown: *"Invalid credentials. 1 attempt remaining."*
   - **Attempt 2**: Enter wrong password `WrongPass2` → Modal locks with Red Alert box: *"SECURITY ALERT: Unauthorized access attempt recorded. Telemetry dispatched to Administrator via Telegram."*
   - Show Telegram Bot message received or check `Audit Logs` / Dashboard Telemetry log.
7. **Audit Trail**:
   - Log in as `admin` → Navigate to **AUDIT TRAIL** (`/audit-logs`) to display forensic timestamped logs.

---

## ⚙️ Environment Variables Configuration (`.env`)

Backend `.env` path: `./backend/.env`

```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_dms_jwt_key_2026_law_enforcement_secure
JWT_EXPIRES_IN=8h
DATABASE_PATH=./database/dms.sqlite
TELEGRAM_BOT_TOKEN=789123456:AAFx_SampleTelegramBotTokenHereForSecurityAlerts
TELEGRAM_CHAT_ID=-1001234567890
MAX_FILE_SIZE_BYTES=15728640
ALLOWED_FILE_TYPES=pdf,png,jpg,jpeg,docx
```
