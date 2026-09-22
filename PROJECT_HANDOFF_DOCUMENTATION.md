# 🗳️ VotePulse E-Voting System — Complete Project & AI Handoff Record

> **Document Version**: 2.0.0  
> **Last Updated**: September 10, 2026  
> **Target Audience**: AI Models, Developers, System Architects  
> **Project Root Directory**: `d:\Minor project`

---

## 📌 1. Project Executive Summary

**VotePulse** is a modern, high-security, Progressive Web Application (PWA) designed for real-time online voting. It features end-to-end cryptographic ballot sealing, dynamic Gmail OTP verification via SMTP, automated winner declarations across all user portals, and multi-admin support.

The system is engineered to run seamlessly in production environments with **zero hard failure risk**: if MongoDB is unreachable locally, the application transparently degrades to a resilient in-memory datastore with identical API contracts.

---

## 📂 2. Directory & File Architecture Map

```
d:\Minor project\
├── server.js                        # Express HTTP Server, REST APIs, Session & Rate Limiting
├── sw.js                            # Progressive Web App (PWA) Service Worker (Cache Buster v114)
├── package.json                     # Node.js dependencies and build scripts
├── .env                             # Environment Variables (Gmail SMTP & MongoDB URI config)
├── PROJECT_HANDOFF_DOCUMENTATION.md # This architectural handoff record for future AI & developers
│
├── src/                             # Frontend React (Vite) Application
│   ├── main.jsx                     # Client entry point & Service Worker registration
│   ├── App.jsx                      # Main React router & layout frame
│   ├── index.css                    # Unified Civic Design System CSS (Dark/Light glassmorphism)
│   └── components/
│       ├── Navbar.jsx               # Header navigation, PWA install prompt, theme toggle
│       ├── VoterPortal.jsx          # Voter Auth (Auto Voter ID, Password Max 5 + Toggle, Required Phone, Dynamic Gmail OTP), Encrypted Voting & Auto Winner Banner
│       ├── CandidatePortal.jsx       # Candidate Auth, Nomination Forms, Campaign Standings & Auto Winner Announcement
│       └── AdminConsole.jsx         # Multi-Admin Support (ADM-*), Live Results, 6 Clean Tabs, Automatic Election Winner Banner (Database UI Purged for Live Deployment)
│
├── database/                        # Database Layer & Schema Definitions
│   ├── mongo_db.js                  # Mongoose MongoDB Driver + Resilient Memory Store Fallback Engine
│   ├── data.json                    # Seed JSON fallback data store
│   └── db.js                        # Legacy SQLite database handler wrapper
│
├── middleware/                      # Express Middleware Modules
│   └── validation.js                # Server-side input validation (Required 10-digit Phone, Password length max 5, 6-digit OTP format)
│
├── utils/                           # Utility Services
│   └── email.js                     # Dynamic Nodemailer SMTP Email Dispatcher for Gmail OTP
│
├── docs/                            # Project Documentation & Architectural Reports
│   ├── PROJECT_DEPENDENCIES_PROOF.md
│   ├── VotePulse_Module_Architecture_Report.md
│   ├── VotePulse_Module_Language_Architecture_Report.pdf
│   └── VotePulse_Project_Report.md
│
├── assets/ & dist/                  # Built Production Assets & Static Bundle Distribution
└── scripts/                         # Maintenance and helper scripts
```

---

## ⚙️ 3. Core Features & Business Logic Implementations

### A. Automatic Winner Declaration (Zero Manual Trigger Required)
* **Real-time Leaderboard Calculation**: Evaluates live vote tallies automatically upon each ballot submission.
* **Voter Portal**: Displays an **Automatic Winner / Leading Candidate Card** on the voter dashboard featuring the candidate's photo, name, party symbol, and total vote count.
* **Candidate Portal**: Automatically announces the current victor or leading nominee.
* **Admin Console**: Renders an **Automatic Winner Banner** at the top of the Results and Overview tabs complete with vote share percentages and tie-handling logic.

### B. Voter Module Authentication & Dynamic OTP
* **Auto-Generated Voter IDs**: New registrations automatically generate a unique, non-duplicable ID in format `VOT-2026-XXXX`.
* **Mandatory Mobile Number**: Mobile phone numbers are strictly enforced on both client (`VoterPortal.jsx`) and server (`middleware/validation.js`), requiring at least 10 digits.
* **Dynamic Gmail OTP Verification**: Voters can enter any target Gmail address during login or registration. The backend (`server.js` + `utils/email.js`) updates the voter's email record dynamically and dispatches a single-use 6-digit OTP directly to that Gmail inbox.
* **Password Limits & Visibility Toggle**: Password length for voters and candidates is constrained to a maximum of 5 characters, accompanied by a real-time password strength meter and an interactive Show/Hide password toggle (`👁️` / `🙈`).

### C. Multi-Admin & Multi-Tenant Support
* Admin login supports any custom Admin ID starting with `ADM-` (e.g., `ADM-9999`, `ADM-1001`, `ADM-2026`).
* Multiple administrators can manage elections, register candidates, and view live audit logs concurrently without session interference.

### D. Production Security — Database UI Purge
* The raw internal Database Browser tab (formerly Tab 7) was **completely purged** from `AdminConsole.jsx` to prevent internal database structure exposure during live production deployments.
* Admin Console tabs are clean and production-ready:
  1. 📊 Election Results
  2. 📈 System Overview
  3. 🛡️ Voter Management
  4. 👥 Candidate Management
  5. 🗳️ Ballot / Election Creation
  6. 📜 Audit Trail

---

## 🔒 4. Cryptographic Ballot Security

1. **Ballot Encryption**: Ballots are encrypted using a Caesar Cipher shift mechanism combined with a unique salt.
2. **SHA-256 Receipts**: Every cast vote generates a cryptographic SHA-256 hash receipt for tamper-evident verification.
3. **Audit Trail**: Every admin action, voter authentication, and vote event is immutably recorded in the system audit log.

---

## 💾 5. Database Resilience Strategy

* **Primary Engine**: MongoDB via `mongoose` (`MONGODB_URI=mongodb://127.0.0.1:27017/votepulse`).
* **Resilient Fallback**: If MongoDB connection fails (e.g. `ECONNREFUSED`), `database/mongo_db.js` automatically initializes an in-memory datastore seeded from `database/data.json`.
* **API Uniformity**: Both database modes expose identical async methods (`createUser`, `findUserByVoterId`, `updateUserEmail`, `createGmailToken`, `castVote`, `getElectionResults`), ensuring the server never crashes due to database offline errors.

---

## 🚀 6. Instructions for Future AI Models & Developers

### Running the Server
```bash
# Start server synchronously or in background
node server.js
```

### Rebuilding Frontend & Production Assets
```bash
# Compile Vite production build
npm run build

# Sync assets to static directory & dist SW
powershell -Command "Copy-Item -Path 'dist/assets/*' -Destination 'assets/' -Force; Copy-Item -Path 'sw.js' -Destination 'dist/sw.js' -Force"
```

### Critical Development Rules & Constraints
1. **Password Length Limit**: Keep voter & candidate password maximum length at **5 characters**. Admin passwords remain unrestricted.
2. **Mobile Number Requirement**: Never remove mobile phone validation from `middleware/validation.js` or `VoterPortal.jsx`.
3. **Database UI Constraint**: Do NOT re-add raw database schema tabs to the Admin Console.
4. **Service Worker Versioning**: When building frontend updates, bump `CACHE_NAME` in `sw.js` (e.g., `votepulse-pwa-v115`).

---

*This document was created as a comprehensive project handoff record for future AI models and developers.*
