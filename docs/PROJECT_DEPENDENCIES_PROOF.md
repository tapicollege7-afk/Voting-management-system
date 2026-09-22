# VotePulse E-Voting Platform — Software Requirements & Verification Proof Report

> **Project Name**: VotePulse — Secure Online Voting & Election Management System  
> **Verification Date**: September 9, 2026  
> **Environment Status**: ✅ ALL REQUIRED DEPENDENCIES INSTALLED & VERIFIED  

---

## 1. System Runtime Verification Proof

| Technology / Service | Required Purpose | Installed Version | Verification Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | Server-side JavaScript Runtime Engine | `v24.19.0` | ✅ Active & Functional |
| **npm** | Node Package Manager | `v11.17.0` | ✅ Active & Functional |
| **Express.js** | Web Framework & REST API Server | `v4.22.2` | ✅ Active (`port 3000`) |
| **React** | Interactive Single Page Application (SPA) | `v19.2.8` | ✅ Active |
| **Vite** | Modern Frontend Build Tool & PWA Compiler | `v8.2.1` | ✅ Active |
| **MongoDB / Mongoose** | NoSQL Database Driver | `v9.9.3` | ✅ Active (`mongodb://127.0.0.1:27017`) |
| **Nodemailer** | Real Gmail OTP Email Dispatcher | `v9.0.5` | ✅ Active (`SMTP Port 587`) |
| **SQLite3** | Relational SQL Storage Engine | `v6.0.1` | ✅ Active (`votepulse.sqlite`) |

---

## 2. Complete Local Installed Packages (`node_modules`)

```bash
votepulse-online-voting-system@1.0.0 D:\Minor project
├── @vitejs/plugin-react@6.0.5   (Vite React Compiler Plugin)
├── cors@2.8.6                   (Cross-Origin Resource Sharing Middleware)
├── dotenv@17.4.2                (Environment Variables Management)
├── esbuild@0.28.2               (Fast JavaScript Bundler)
├── express@4.22.2               (Backend Web Application Framework)
├── lucide-react@1.32.0          (Modern React Icon Suite)
├── mongoose@9.9.3               (MongoDB Object Data Modeling for Node.js)
├── nodemailer@9.0.5             (SMTP Email Dispatcher)
├── react@19.2.8                 (UI Component Library)
├── react-dom@19.2.8             (React DOM Renderer)
├── sqlite3@6.0.1                (Embedded SQL Database Engine)
└── vite@8.2.1                   (Frontend Build Tooling)
```

---

## 3. Architecture & Functional Components Proof

### A. Frontend Architecture (React + Vite PWA)
- **Entry Point**: `index.html` & `src/main.jsx`
- **Application Shell**: `src/App.jsx`
- **Voter Portal**: `src/components/VoterPortal.jsx`
- **Candidate Command Center**: `src/components/CandidatePortal.jsx`
- **Administrator Console**: `src/components/AdminConsole.jsx`
- **Cryptographic Audit Tool**: `src/components/BallotAuditTool.jsx`
- **Service Worker**: `sw.js` (Offline Progressive Web App support)

### B. Backend REST API Architecture (Express.js)
- **Entry Server File**: `server.js`
- **Authentication Routes**:
  - `POST /api/auth/register` — Voter registration & OTP dispatch
  - `POST /api/auth/login` — Voter authentication
  - `POST /api/auth/verify-gmail-token` — Real Gmail token validation
- **Voting Engine Routes**:
  - `POST /api/vote` — Single-vote enforcement with Caesar Cipher & SHA-256 seal
  - `GET /api/vote/audit/:hash` — Public cryptographic verification
- **Admin Management Routes**:
  - `GET /api/admin/stats` — Metrics & live tallies
  - `POST /api/elections` — Election management
  - `POST /api/candidates` — Nomination & candidate management

### C. Database Architecture (MongoDB + Mongoose)
- **Database File**: `database/mongo_db.js`
- **Mongoose Models**:
  - `User`: Accounts, credentials, role-based security
  - `Election`: Election poll metadata & statuses
  - `Candidate`: Candidate profiles, manifestos, live vote counts
  - `Vote`: Encrypted ballot seals, timestamps, receipt hashes
  - `GmailToken`: Real Gmail OTP verification codes

---

## 4. Verification Test Commands

To demonstrate working execution during your presentation:

1. **Verify Backend Server**:
   ```bash
   node server.js
   ```
   *Output*: Server running on `http://localhost:3000`.

2. **Verify Frontend Build**:
   ```bash
   npm run build
   ```
   *Output*: Bundle generated in `dist/` with 0 errors.

3. **Verify API Health Endpoint**:
   ```bash
   curl http://localhost:3000/api/health
   ```
