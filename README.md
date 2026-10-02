# 🗳️ VotePulse - Secure Online Voting & Election Management System (PWA)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VotePulse** is an enterprise-grade, full-stack **e-Voting & Election Management Platform** built with **React 19**, **Node.js Express REST API**, **MongoDB NoSQL document store (with resilient in-memory fallback)**, and **Progressive Web App (PWA)** capabilities.

The platform provides 3 distinct, interconnected modules:
1. **Voter Portal** (`/#voter`): Voter registration with real-time Gmail SMTP OTP verification, official credential ticket dispatch, cryptographic Caesar + SHA-256 sealed voting, duplicate ballot prevention, and live standings streaming.
2. **Candidate Portal** (`/#candidate`): Candidate nomination self-registration with mandatory email OTP verification, 2-Factor authentication Command Center login, campaign manifesto studio, and announcement publisher.
3. **Admin Console** (`/#admin`): Election creation & lifecycle management, verified candidate oversight, real-time vote percentage breakdown charts, audit trail inspection, and zero-compromise credential protection.

---

## ✨ Key Features

- 🔐 **Real-Time Gmail SMTP OTP Verification**: 6-digit email OTP verification codes dispatched dynamically via Google SMTP with in-modal error feedback and instant auto-submit upon typing the 6th digit.
- 🛑 **Strict Duplicate Vote Prevention**: Server-side composite constraint `(election_id, voter_id)` guaranteeing voters can cast a ballot **exactly once per election**. Re-voting attempts display the sealed cryptographic receipt.
- 📜 **Cryptographic Ballot Sealing**: Dual-layer verification utilizing Caesar-Cipher shifted receipts and SHA-256 digital seals for independent ballot auditing (`/#audit`).
- 👤 **Verified Candidates Only**: Candidate nominations and Command Center logins are authenticated exclusively through real-time email verification.
- 📱 **Progressive Web App (PWA)**: Built-in Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) supporting offline caching, homescreen installation on iOS & Android, and desktop desktop application mode.
- 🎨 **Civic Design System**: Sleek Cosmic Sapphire & Emerald palette, dark & light themes, high-contrast mode, and responsive mobile-first layouts.
- 🧪 **Comprehensive 3-Tier Quality Assurance**: 59 automated unit, integration, and system tests covering cipher algorithms, database layers, REST endpoints, and security boundaries.

---

## 📂 Project Directory Structure

```text
e:\Minor project\
├── backend-server/          # Backend Express REST API Layer
│   ├── api/                 # Modular API routes (voter, candidate, admin, election, audit)
│   ├── checks/              # Request payload validation middleware
│   ├── helpers/             # Cipher hashing & SMTP email dispatchers
│   └── app.js               # Express app configuration & static middleware
│
├── database/                # Database Layer & Schema Definitions
│   ├── models/              # Mongoose schemas (voter, candidate, admin, election)
│   ├── connection.js        # MongoDB client + resilient in-memory fallback
│   ├── data.json            # Default seed data store
│   └── index.js             # Database entrypoint
│
├── frontend-website/        # React + Vite Frontend Application
│   ├── index.html           # Source HTML template for Vite
│   └── src/
│       ├── admin/           # Admin Console portal
│       ├── audit/           # Cryptographic ballot audit tool
│       ├── candidate/       # Candidate Command Center & nomination portal
│       ├── common/          # Global UI components (Navbar, SettingsModal)
│       ├── helpers/         # Form navigation & utility functions
│       ├── voter/           # Voter Portal (ballot booth, credentials, live standings)
│       ├── App.jsx          # Route controller & layout
│       ├── index.css        # Design system styles
│       └── main.jsx         # React DOM mount entry point
│
├── public/                  # PWA Assets (app icons, manifest, service worker)
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.json
│   └── sw.js
│
├── scripts/                 # Production Automation
│   └── build.js             # Automated Vite compilation & multi-target sync
│
├── tests/                   # 3-Tier Quality Assurance Suite (59 tests)
│   ├── unit/                # Unit test specifications
│   ├── integration/         # REST API & workflow integration tests
│   ├── system/              # Production health & PWA route tests
│   └── run_all_tests.js     # Unified test runner
│
├── dist/                    # Compiled Vite production bundle
├── docs/                    # GitHub Pages production deployment folder
├── assets/                  # Root assets mirror for GitHub Pages
├── index.html               # Compiled root HTML shell
├── 404.html                 # Compiled client-side routing fallback
├── manifest.json            # Root-scoped PWA manifest
├── sw.js                    # Root-scoped PWA service worker
├── server.js                # System application launcher
├── start-server.bat         # Windows 1-click execution batch file
├── vite.config.mjs          # Vite build & proxy configuration
├── package.json             # NPM package scripts & dependencies
├── .env                     # Local environment configuration
└── README.md                # System documentation & usage guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (bundled with Node.js)
- Optional: Local [MongoDB](https://www.mongodb.com/) instance (system automatically falls back to an in-memory datastore if MongoDB is not running)

### Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment (`.env`)**
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/votepulse
   PROJECT_SYSTEM_EMAIL=projectsystem2234@gmail.com
   EMAIL_USER=tapicollege7@gmail.com
   EMAIL_APP_PASSWORD=your_google_app_password
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Start the Server**
   ```bash
   npm start
   # or run double-click start-server.bat on Windows
   ```

5. **Access the Application**
   - Open: `http://localhost:3000`

---

## 🔐 Default Access Credentials

- **Administrator**:
  - Admin ID: `ADM-9999`
  - Passcode: `admin123`
  - Portal URL: `http://localhost:3000/#admin`

- **Voter**:
  - Auto-generated on registration (`VOT-2026-XXXX`).
  - Single-use 6-digit email OTP verification required on registration & login.

- **Candidate**:
  - Auto-generated on nomination (`CAND-2026-XXXX`).
  - Mandatory 6-digit email OTP verification required for nomination & Command Center sign-in.

---

## 🧪 Testing & Verification

Run the complete 59-test suite across all three tiers:

```bash
npm test
```

Or run individual tiers:
```bash
npm run test:unit         # Tier 1: Ciphers, validation, and database operations
npm run test:integration  # Tier 2: Authentication, ballot engine, candidate & admin APIs
npm run test:system       # Tier 3: Health endpoints, PWA manifests, and static redirects
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
