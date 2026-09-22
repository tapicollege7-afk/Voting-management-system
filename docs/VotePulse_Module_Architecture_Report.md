# VotePulse E-Voting Platform — Module Language & Technical Architecture Report

> **Document Type**: Technical Specification & Language Architecture Report  
> **PDF Report Name**: `VotePulse_Module_Language_Architecture_Report.pdf`  
> **Date**: September 9, 2026  
> **Status**: ✅ Active & Verified System Architecture  

---

## 1. Module-by-Module Language & File Structure Matrix

| Module / Subsystem | Language / Tech Stack | File Location Path | Primary Responsibility & Operational Workflow |
| :--- | :--- | :--- | :--- |
| **Voter Portal Module** | JavaScript (React 19 / JSX), HTML5, Vanilla CSS | [src/components/VoterPortal.jsx](file:///d:/Minor%20project/src/components/VoterPortal.jsx) | Handles voter login, registration, password validation (max 5 chars), real-time Gmail OTP code input modal, live poll standings, single-vote ballot submission, and Caesar Cipher receipt hash copy. |
| **Candidate Command Center** | JavaScript (React 19 / JSX), Vanilla CSS | [src/components/CandidatePortal.jsx](file:///d:/Minor%20project/src/components/CandidatePortal.jsx) | Enables candidate login, nomination submission, campaign manifesto & slogan editing, live poll rank/vote share analytics, campaign announcements, and digital candidate verification badge generation. |
| **Administrator Console** | JavaScript (React 19 / JSX), Vanilla CSS | [src/components/AdminConsole.jsx](file:///d:/Minor%20project/src/components/AdminConsole.jsx) | Restricted admin authentication (`ADM-9999`), election lifecycle controls (active/closed), candidate addition, live vote breakdown charts, voter management, and MongoDB visual database inspector. |
| **Ballot Audit & Verification** | JavaScript (React 19 / JSX) | [src/components/BallotAuditTool.jsx](file:///d:/Minor%20project/src/components/BallotAuditTool.jsx) | Public verification portal. Accepts 256-bit cryptographic receipt hashes, decrypts Caesar shift ciphers, and verifies vote presence in MongoDB without revealing voter identity. |
| **App Shell & Router** | JavaScript (React 19 / JSX), HTML5 | [src/App.jsx](file:///d:/Minor%20project/src/App.jsx)<br/>[index.html](file:///d:/Minor%20project/index.html) | Client-side Single Page Application (SPA) router supporting `#voter`, `#candidate`, `#admin`, and `#audit` locations. Manages dark/light themes, font scaling, PWA banner, and global state. |
| **Navbar & Quick Access** | JavaScript (React 19 / JSX) | [src/components/Navbar.jsx](file:///d:/Minor%20project/src/components/Navbar.jsx) | Header component with active module navigation pills, secret admin gate (triple-click logo / `Ctrl+Shift+A`), and reactive Quick Admin/Voter toggle button. |
| **Backend REST API Server** | Node.js (ES6+ CommonJS), Express.js | [server.js](file:///d:/Minor%20project/server.js) | Express HTTP server running on `port 3000`. Handles API endpoints for user auth, vote casting, candidate/election CRUD, admin metrics, and static build serving. |
| **Database Engine (NoSQL)** | Node.js, Mongoose ODM, MongoDB BSON | [database/mongo_db.js](file:///d:/Minor%20project/database/mongo_db.js)<br/>[database/db.js](file:///d:/Minor%20project/database/db.js) | Pure MongoDB database engine defining Mongoose schemas (`User`, `Election`, `Candidate`, `Vote`, `GmailToken`). Manages queries, document creation, and auto-seeding. |
| **Email & OTP Dispatcher** | Node.js, Nodemailer, SMTP Protocol | [utils/email.js](file:///d:/Minor%20project/utils/email.js) | Real Gmail SMTP integration dispatching 6-digit verification codes to voters' Gmail inboxes using styled HTML email templates. |
| **Cryptographic Security Engine** | Node.js, Native Crypto Utilities | [utils/cipher.js](file:///d:/Minor%20project/utils/cipher.js) | Provides 256-bit SHA-256 hashing and custom 3-shift Caesar Cipher encryption & decryption for tamper-proof ballot sealing. |
| **Backend Request Validation** | Node.js (CommonJS) | [middleware/validation.js](file:///d:/Minor%20project/middleware/validation.js) | Server-side validation enforcing registration input rules, 5-character password constraints, 6-digit OTP formats, and vote payload integrity. |
| **Progressive Web App (PWA)** | JavaScript, Web App Manifest JSON | [sw.js](file:///d:/Minor%20project/sw.js)<br/>[manifest.json](file:///d:/Minor%20project/manifest.json) | Service Worker script handling offline caching (`votepulse-pwa-v106`), asset pre-caching, fetch interception, and standalone PWA home screen installation. |

---

## 2. Detailed Execution Workflows & How It Works

### A. Voter Authentication & Gmail OTP Verification
1. **Credentials Entry**: Voter submits Voter ID / Gmail and Password (1 to 5 characters) in `VoterPortal.jsx`.
2. **Server Verification**: `server.js` calls `db.findUserByVoterId()` and `verifyUserPassword()`.
3. **OTP Dispatch**: `createGmailToken()` saves a 6-digit OTP in MongoDB. `utils/email.js` sends an email to the voter's Gmail address via SMTP.
4. **Token Verification**: Voter enters code into the modal; `verifyGmailToken()` checks validity and grants authenticated session access.

### B. Encrypted Vote Casting & Cryptographic Receipt
1. **Candidate Selection**: Voter selects candidate on `VoterPortal.jsx`.
2. **Single-Vote Enforcement**: `db.hasVoted(election_id, voter_id)` checks MongoDB to prevent duplicate voting.
3. **Cryptographic Sealing**: Server encrypts ballot string with `caesarCipherEncrypt(raw, 3)` and generates `sha256Hash(raw)`.
4. **Atomic Tally**: Increment candidate `vote_count` by 1 in MongoDB.
5. **Receipt Generation**: Returns a 256-bit receipt hash to voter for independent auditing.

### C. Candidate Command Center & Manifesto Studio
1. **Candidate Auth**: Candidates log in via key or nominate candidacy in `CandidatePortal.jsx`.
2. **Manifesto Studio**: Candidates edit their promises and slogans, synced live to voter screens.
3. **Live Analytics**: 3-second auto-polling updates candidate rank, leader margin, and ballot share percentages.
4. **Digital Badge**: Generates candidate badge with verification hash.

### D. Administrator Console & Database Inspector
1. **Admin Sign-In**: Login via `ADM-9999` credentials in `AdminConsole.jsx`.
2. **Election & Candidate Master**: Create/manage polls and candidates in MongoDB.
3. **Voter Management**: View registered voters list with deletion options.
4. **Database Inspector**: Displays real-time collection counts (Users, Elections, Candidates, Votes, GmailTokens).

---

## 3. Technology Stack & Language Summary Table

| Category | Languages / Frameworks | Primary Package | Role in Application |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | JavaScript (ES6+), JSX, HTML5, CSS3 | `react@19.2.8`, `lucide-react` | Renders user interfaces, dynamic modal popups, and live standings charts. |
| **Backend REST API** | JavaScript (Node.js CommonJS) | `express@4.22.2`, `cors`, `dotenv` | Processes HTTP endpoints, route security, and serves static build assets. |
| **Database Storage** | NoSQL BSON Document Database | `mongoose@9.9.3`, `mongodb` | Provides document persistence, indexing, schema validations, and ACID operations. |
| **Security & Email** | Node Crypto, SMTP Protocol | `nodemailer@9.0.5`, SHA-256 | Sends Gmail OTP tokens and seals ballots with Caesar Cipher shift encryption. |
| **Build & PWA** | JavaScript ESBuild, Manifest | `vite@8.2.1`, `sw.js` | Bundles React components and manages offline PWA caching. |
