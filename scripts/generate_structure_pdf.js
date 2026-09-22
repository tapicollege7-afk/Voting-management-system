/**
 * VotePulse — Project Structure, System Flow & Technology Stack PDF Generator
 * Output: docs/VotePulse_Project_Structure.pdf
 * 
 * Master 8-Page Architectural Document:
 *  Page 1: Executive Cover Page (Branding, Metrics & Academic Details)
 *  Page 2: Module Architecture Flow — How All Modules Work Together
 *  Page 3: System Request & Data Flow Pipeline (Step-by-Step User Journeys & State Machine)
 *  Page 4: Complete File System Architecture Tree (The Full Workspace Structured Tree Diagram)
 *  Page 5: File Purpose & Architectural Rationale Guide (frontend-website, backend-server, database)
 *  Page 6: Technology Stack — Languages, Frontend & Backend
 *  Page 7: Database Architecture, Mongoose Schemas & Security Engine
 *  Page 8: Development Tools, npm Dependencies Audit Table & Execution Commands
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '../docs/VotePulse_Project_Structure.pdf');

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  bgDark:       '#0b1329',
  cardDark:     '#131f3d',
  cardDark2:    '#1a294f',
  primary:      '#0f172a',
  primaryLight: '#1e293b',
  accent:       '#2563eb',
  accentLight:  '#38bdf8',
  indigo:       '#4f46e5',
  cyan:         '#0891b2',
  emerald:      '#059669',
  emeraldLight: '#10b981',
  emeraldBg:    '#f0fdf4',
  purple:       '#7c3aed',
  purpleBg:     '#f5f3ff',
  orange:       '#d97706',
  orangeBg:     '#fffbeb',
  red:          '#dc2626',
  redBg:        '#fef2f2',
  blueBg:       '#eff6ff',
  cyanBg:       '#ecfeff',
  cardBg:       '#f8fafc',
  border:       '#e2e8f0',
  borderDark:   '#cbd5e1',
  text:         '#1e293b',
  textSecondary:'#475569',
  textMuted:    '#64748b',
  white:        '#ffffff',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT_M = 42;
const RIGHT_M = 42;
const CONTENT_W = PAGE_W - LEFT_M - RIGHT_M; // 511.28 pt

// Initialize document with zero margins to prevent any accidental auto-paging
const doc = new PDFDocument({
  size: 'A4',
  autoFirstPage: false,
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: 'VotePulse — Project Structure & Technology Stack',
    Author: 'VotePulse Architecture Team',
    Subject: 'System Flow, Module Architecture, File Purpose Guide, Languages & Tools',
    Keywords: 'VotePulse, Module Flow, File Structure, Purpose Guide, React, Node.js, Express, MongoDB'
  }
});

doc.pipe(fs.createWriteStream(OUT_PATH));

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

function addContentPage(categoryTitle, pageNumber, totalPages = 8) {
  doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  
  // Header bar
  doc.rect(0, 0, PAGE_W, 40).fill(C.primary);
  doc.rect(0, 40, PAGE_W, 2.5).fill(C.accent);

  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8.5)
     .text('VotePulse — E-Voting & Election Management Platform', LEFT_M, 15);
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(8.5)
     .text(categoryTitle, LEFT_M, 15, { width: CONTENT_W, align: 'right' });

  // Footer bar
  doc.rect(LEFT_M, 804, CONTENT_W, 1).fill(C.border);
  doc.fillColor(C.textMuted).font('Helvetica').fontSize(7.5)
     .text('VotePulse Project Architecture, Module Flow & File Purpose Specification', LEFT_M, 812);
  doc.fillColor(C.textMuted).font('Helvetica-Bold').fontSize(7.5)
     .text(`Page ${pageNumber} of ${totalPages}`, LEFT_M, 812, { width: CONTENT_W, align: 'right' });
}

function drawSectionHeader(y, title, subtitle = '', accentColor = C.primary) {
  doc.roundedRect(LEFT_M, y, CONTENT_W, 22, 3).fill(accentColor);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(9.5)
     .text(title, LEFT_M + 10, y + 6);
  if (subtitle) {
    doc.fillColor('#cbd5e1').font('Helvetica-Bold').fontSize(8)
       .text(subtitle, LEFT_M + 10, y + 6.5, { width: CONTENT_W - 20, align: 'right' });
  }
  return y + 27;
}

function drawFolderIcon(x, y, color = C.accent) {
  doc.save();
  doc.fillColor(color);
  doc.roundedRect(x, y + 1, 6, 2.5, 0.8).fill();
  doc.roundedRect(x, y + 3, 13, 9, 1.2).fill();
  doc.restore();
}

function drawFileIcon(x, y, color = C.textMuted) {
  doc.save();
  doc.fillColor('#f8fafc').strokeColor(color).lineWidth(1);
  doc.roundedRect(x + 1, y + 1, 9, 11, 1).fillAndStroke();
  doc.strokeColor(color).lineWidth(0.8);
  doc.moveTo(x + 3, y + 4.5).lineTo(x + 8, y + 4.5).stroke();
  doc.moveTo(x + 3, y + 7.5).lineTo(x + 8, y + 7.5).stroke();
  doc.restore();
}

function drawRightArrow(x1, y, x2, color = C.accent) {
  doc.save();
  doc.strokeColor(color).lineWidth(1.5);
  doc.moveTo(x1, y).lineTo(x2 - 4, y).stroke();
  doc.fillColor(color);
  doc.polygon([x2 - 5, y - 3], [x2, y], [x2 - 5, y + 3]).fill();
  doc.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1: COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });

doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.bgDark);

// Subtle background grid
doc.save();
doc.strokeColor('#172554').lineWidth(0.8);
for (let lx = 60; lx < PAGE_W; lx += 90) {
  doc.moveTo(lx, 0).lineTo(lx, PAGE_H).stroke();
}
for (let ly = 60; ly < PAGE_H; ly += 90) {
  doc.moveTo(0, ly).lineTo(PAGE_W, ly).stroke();
}
doc.restore();

// Top branding badge
doc.save();
doc.roundedRect(247, 70, 100, 100, 22).fill(C.cardDark);
doc.strokeColor(C.accent).lineWidth(2).roundedRect(247, 70, 100, 100, 22).stroke();
doc.roundedRect(257, 80, 80, 80, 16).fill(C.accent);
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(40).text('VP', 247, 101, { width: 100, align: 'center' });
doc.restore();

// Title & Subtitle
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(34)
   .text('VotePulse', 0, 195, { width: PAGE_W, align: 'center' });
doc.fillColor(C.accentLight).font('Helvetica-Bold').fontSize(13)
   .text('E-VOTING & ELECTION MANAGEMENT PLATFORM', 0, 238, { width: PAGE_W, align: 'center' });

doc.rect((PAGE_W - 180) / 2, 264, 180, 2.5).fill(C.accent);

// Document specification title
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(16)
   .text('System Flow, File Structure & Technology Specification', 0, 282, { width: PAGE_W, align: 'center' });
doc.fillColor('#94a3b8').font('Helvetica').fontSize(10)
   .text('Module Interaction Flow  |  Complete File System Tree  |  File Purpose Guide', 0, 305, { width: PAGE_W, align: 'center' });

// 6 Metric Summary Cards
const coverCards = [
  { tier: 'FRONTEND TIER', tech: 'React 19 + Vite 8', desc: 'Single Page App • Glassmorphism CSS', color: C.accent },
  { tier: 'BACKEND TIER', tech: 'Node.js + Express 4', desc: 'REST API • Check Middleware Pipeline', color: '#6366f1' },
  { tier: 'DATABASE TIER', tech: 'MongoDB + Mongoose', desc: 'NoSQL Store • Resilient JSON Fallback', color: C.emeraldLight },
  { tier: 'AUTHENTICATION', tech: '6-Digit Gmail OTP', desc: 'Automated SMTP Verification Delivery', color: C.cyan },
  { tier: 'CRYPTOGRAPHY', tech: 'SHA-256 Ballot Seal', desc: 'Tamper-Evident Hash Audit Receipts', color: C.orange },
  { tier: 'FOLDER MODEL', tech: 'Plain-English & Clean', desc: 'frontend-website • backend-server • db', color: '#ec4899' },
];

const cardW = 158;
const cardH = 68;
const colGap = 16;
const startX = (PAGE_W - (3 * cardW + 2 * colGap)) / 2;

coverCards.forEach((c, idx) => {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const x = startX + col * (cardW + colGap);
  const y = 345 + row * (cardH + 14);

  doc.roundedRect(x, y, cardW, cardH, 8).fill(C.cardDark);
  doc.strokeColor('#1e293b').lineWidth(1).roundedRect(x, y, cardW, cardH, 8).stroke();
  doc.rect(x + 10, y, 32, 2.5).fill(c.color);

  doc.fillColor(c.color).font('Helvetica-Bold').fontSize(7.5)
     .text(c.tier, x + 10, y + 10, { width: cardW - 20 });
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(10)
     .text(c.tech, x + 10, y + 23, { width: cardW - 20 });
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
     .text(c.desc, x + 10, y + 42, { width: cardW - 20 });
});

// Academic metadata container
const metaY = 530;
doc.roundedRect(LEFT_M + 15, metaY, CONTENT_W - 30, 160, 10).fill(C.cardDark);
doc.strokeColor('#1e3a5f').lineWidth(1.2).roundedRect(LEFT_M + 15, metaY, CONTENT_W - 30, 160, 10).stroke();

doc.fillColor(C.accentLight).font('Helvetica-Bold').fontSize(10)
   .text('ACADEMIC PROJECT SUBMISSION DETAILS', LEFT_M + 30, metaY + 16);
doc.rect(LEFT_M + 30, metaY + 30, 200, 1).fill(C.accent);

const metaFields = [
  ['Project Title', 'VotePulse — Secure E-Voting & Election Management System'],
  ['Project Type', 'Undergraduate Minor Project Submission (CSE/IT)'],
  ['Architecture Pattern', '3-Tier Decoupled Flow Architecture (UI Website -> Server -> Database)'],
  ['Platform Scope', 'Voter Portal, Admin Console, Candidate Hub & Public Ballot Audit Tool'],
  ['Deployment Target', 'Single Node Production Server (Node.js Express + Vite Bundled Static Assets)'],
  ['Document Version', 'Release 2.3 — Master Architectural Specification & File Tree Diagram']
];

metaFields.forEach(([lbl, val], mi) => {
  const fy = metaY + 40 + mi * 18;
  doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(8.5).text(lbl + ':', LEFT_M + 30, fy, { width: 130 });
  doc.fillColor(C.white).font('Helvetica').fontSize(8.5).text(val, LEFT_M + 165, fy, { width: CONTENT_W - 195 });
});

doc.fillColor('#64748b').font('Helvetica').fontSize(8)
   .text('Confidential Engineering Document  •  Generated for Project Review & Archival  •  September 2026', 0, 812, { width: PAGE_W, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2: MODULE ARCHITECTURE FLOW — HOW ALL MODULES WORK TOGETHER
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('01 | Module Architecture: How All Modules Work Together', 2, 8);

let curY = 54;

curY = drawSectionHeader(curY, '1. Core System Modules & How They Work Together', 'INTER-MODULE FLOW', C.primary);

doc.roundedRect(LEFT_M, curY, CONTENT_W, 46, 4).fill(C.cardBg);
doc.strokeColor(C.border).lineWidth(1).roundedRect(LEFT_M, curY, CONTENT_W, 46, 4).stroke();
doc.fillColor(C.text).font('Helvetica').fontSize(7.8)
   .text('VotePulse is structured around 4 distinct functional modules that interact through a central React state controller (App.jsx) on the client and an Express REST API hub on the server. Below is the complete visual map of each module, its operational lifecycle, and how data moves across frontend components, backend APIs, validation checks, helper utilities, and database schemas.',
         LEFT_M + 10, curY + 6, { width: CONTENT_W - 20, lineGap: 1.8 });

curY += 54;

// 4 Module Cards
const modules = [
  {
    name: 'MODULE 1: VOTER PORTAL MODULE',
    color: C.accent,
    bg: C.blueBg,
    fe: 'frontend-website/src/voter/VoterPortal.jsx',
    be: 'backend-server/api/voter.routes.js',
    db: 'database/models/voter.schema.js',
    helpers: 'checks/validation.js  •  helpers/email.js (Gmail OTP)  •  helpers/cipher.js (SHA-256)',
    how: 'How It Works: Voter registers with Name, Voter ID, Email & Password -> validation.js checks syntax -> email.js sends 6-digit OTP via Gmail SMTP -> voter enters OTP to activate account -> logs in with Voter ID -> views active elections -> casts ballot -> cipher.js seals vote with SHA-256 hash -> confetti.js launches celebratory visual animation.'
  },
  {
    name: 'MODULE 2: ADMIN CONSOLE MODULE',
    color: C.red,
    bg: C.redBg,
    fe: 'frontend-website/src/admin/AdminConsole.jsx',
    be: 'backend-server/api/admin.routes.js  &  api/election.routes.js',
    db: 'database/models/admin.schema.js  &  models/election.schema.js',
    helpers: 'checks/validation.js (Admin credential verification)  •  database/index.js',
    how: 'How It Works: Admin logs in with privileged ADM- credentials -> App.jsx unlocks Admin Console -> fetches live election statistics (total registered voters, ballots cast, turnout %) -> renders real-time candidate vote tallies in dynamic bar charts -> creates new elections with start/end schedules -> registers verified candidates -> views voter roster with ADM-9999 master privacy filter.'
  },
  {
    name: 'MODULE 3: CANDIDATE PORTAL MODULE',
    color: C.emerald,
    bg: C.emeraldBg,
    fe: 'frontend-website/src/candidate/CandidatePortal.jsx',
    be: 'backend-server/api/candidate.routes.js',
    db: 'database/models/candidate.schema.js',
    helpers: 'checks/validation.js (Party emblem validation)  •  database/models/election.schema.js',
    how: 'How It Works: Prospective candidates or administrators submit nominations -> input candidate name, select political party, and assign party symbol -> backend links candidate to specific active election ID -> database records candidate document -> candidate automatically appears on the voter ballot screen for eligible voters.'
  },
  {
    name: 'MODULE 4: BALLOT AUDIT & VERIFICATION MODULE',
    color: C.purple,
    bg: C.purpleBg,
    fe: 'frontend-website/src/audit/BallotAuditTool.jsx',
    be: 'backend-server/api/audit.routes.js',
    db: 'database/models/voter.schema.js  (votes collection / data.json)',
    helpers: 'helpers/cipher.js (SHA-256 signature verification)  •  checks/validation.js',
    how: 'How It Works: Independent public audit tool accessible to any citizen -> voter inputs their unique SHA-256 ballot hash receipt -> GET /api/vote/audit/:hash queries the database -> matches the cryptographic hash seal -> displays official verification badge with timestamp, proving the vote was counted without exposing which candidate was selected.'
  }
];

modules.forEach((m) => {
  const cardH = 92;
  doc.roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).fill(m.bg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).stroke();
  doc.rect(LEFT_M, curY + 4, 3.5, cardH - 8).fill(m.color);

  doc.fillColor(m.color).font('Helvetica-Bold').fontSize(8.5)
     .text(m.name, LEFT_M + 12, curY + 6);

  // Technical cross-references
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7)
     .text('UI File: ', LEFT_M + 12, curY + 18, { continued: true });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7)
     .text(m.fe, { continued: true });
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7)
     .text('   API Route: ', { continued: true });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7)
     .text(m.be);

  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7)
     .text('DB Schema: ', LEFT_M + 12, curY + 29, { continued: true });
  doc.fillColor(C.emerald).font('Helvetica').fontSize(7)
     .text(m.db, { continued: true });
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7)
     .text('   Services: ', { continued: true });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7)
     .text(m.helpers);

  // How it works description
  doc.fillColor(C.primaryLight).font('Helvetica').fontSize(7.2)
     .text(m.how, LEFT_M + 12, curY + 42, { width: CONTENT_W - 24, lineGap: 1.5 });

  curY += cardH + 7;
});

curY += 4;

// Shared glue notice
doc.roundedRect(LEFT_M, curY, CONTENT_W, 36, 4).fill(C.cardBg);
doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, 36, 4).stroke();
doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(7.8)
   .text('CENTRAL INTEGRATION GLUE (How Modules Communicate):', LEFT_M + 10, curY + 6);
doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7.2)
   .text('Client-side: App.jsx maintains the activeTab state and user authentication context, seamlessly mounting the corresponding portal. Server-side: backend-server/api/index.js mounts all module routes onto a single Express server on port 3000.',
         LEFT_M + 10, curY + 17, { width: CONTENT_W - 20, lineGap: 1.5 });

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3: SYSTEM REQUEST & DATA FLOW PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('02 | System Request & Data Flow Pipeline', 3, 8);

curY = 54;

curY = drawSectionHeader(curY, '1. End-to-End System Request & Data Flow Architecture', 'BROWSER -> API -> SERVICES -> DB', C.accent);

const flowStages = [
  {
    badge: 'CLIENT TIER',
    badgeColor: C.accent,
    title: 'React Browser SPA',
    line1: '• User Action / Forms',
    line2: '• App.jsx State Router',
    line3: '• fetch() JSON Request',
    folder: 'frontend-website/'
  },
  {
    badge: 'API GATEWAY',
    badgeColor: C.indigo,
    title: 'Express REST Server',
    line1: '• Modular api/*.routes.js',
    line2: '• checks/validation.js',
    line3: '• Body-Parser & CORS',
    folder: 'backend-server/api/'
  },
  {
    badge: 'CORE SERVICES',
    badgeColor: C.purple,
    title: 'Auxiliary Engines',
    line1: '• helpers/email.js (OTP)',
    line2: '• helpers/cipher.js',
    line3: '• SHA-256 Ballot Sealer',
    folder: 'backend-server/helpers/'
  },
  {
    badge: 'DATA TIER',
    badgeColor: C.emerald,
    title: 'Persistence Watchdog',
    line1: '• Primary: MongoDB NoSQL',
    line2: '• models/*.schema.js',
    line3: '• Fallback: data.json',
    folder: 'database/models/'
  }
];

const boxW = 110;
const boxH = 78;
const gapB = 23.7;

flowStages.forEach((st, sidx) => {
  const bx = LEFT_M + sidx * (boxW + gapB);
  
  doc.roundedRect(bx, curY, boxW, boxH, 5).fill(C.cardBg);
  doc.strokeColor(st.badgeColor).lineWidth(1).roundedRect(bx, curY, boxW, boxH, 5).stroke();

  doc.roundedRect(bx, curY, boxW, 16, 3).fill(st.badgeColor);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(7)
     .text(st.badge, bx, curY + 4.5, { width: boxW, align: 'center' });

  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.5)
     .text(st.title, bx + 6, curY + 21, { width: boxW - 12 });

  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(st.line1, bx + 6, curY + 34, { width: boxW - 12 });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(st.line2, bx + 6, curY + 45, { width: boxW - 12 });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(st.line3, bx + 6, curY + 56, { width: boxW - 12 });

  doc.fillColor(C.textMuted).font('Helvetica-Oblique').fontSize(6.2)
     .text(st.folder, bx + 6, curY + 68, { width: boxW - 12 });

  if (sidx < flowStages.length - 1) {
    drawRightArrow(bx + boxW + 2, curY + 39, bx + boxW + gapB - 2, st.badgeColor);
  }
});

curY += boxH + 6;

// Feedback loop banner
doc.roundedRect(LEFT_M, curY, CONTENT_W, 26, 4).fill(C.cyanBg);
doc.strokeColor(C.cyan).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, 26, 4).stroke();

doc.fillColor(C.cyan).font('Helvetica-Bold').fontSize(7.5)
   .text('RETURN RESPONSE CYCLE:', LEFT_M + 8, curY + 8);
doc.fillColor(C.text).font('Helvetica').fontSize(7.3)
   .text('Express sends HTTP 200/201 JSON -> React updates UI State -> Session cached in localStorage -> Dynamic visual indicators trigger -> Canvas confetti animates.',
         LEFT_M + 128, curY + 8, { width: CONTENT_W - 136 });

curY += 34;

// Section 2: Step-by-Step Operational Sequences
curY = drawSectionHeader(curY, '2. Detailed Operational Sequence: Voter Journey', 'END-TO-END FLOW', C.primary);

const voterSteps = [
  ['Step 1: Open Portal', 'User visits http://localhost:3000 -> React mounts VoterPortal.jsx -> Checks active session in localStorage.'],
  ['Step 2: Enter Details', 'Voter inputs Full Name, Voter ID, Email, Password -> POST /api/auth/register -> validation.js verifies fields.'],
  ['Step 3: OTP Dispatch', 'helpers/email.js connects via Gmail SMTP (port 587) -> Dispatches 6-digit code -> Saves voter with isVerified: false.'],
  ['Step 4: Verify OTP', 'Voter enters 6-digit OTP from email inbox -> POST /api/auth/verify-otp -> Server validates code -> Marks isVerified: true.'],
  ['Step 5: Login & Browse', 'Voter logs in with Voter ID + Password -> POST /api/auth/login -> System loads active elections from GET /api/elections.'],
  ['Step 6: Cast Ballot', 'Voter selects candidate -> POST /api/vote -> Server enforces hasVoted: false check -> Seals ballot with SHA-256 hash.'],
  ['Step 7: Receipt & Audit', 'confetti.js launches visual celebration -> Voter receives cryptographic Ballot Hash receipt -> Verification link generated.']
];

voterSteps.forEach(([step, desc], si) => {
  const rowH = 21;
  const isAlt = si % 2 === 1;
  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? C.cardBg : C.white);
  doc.strokeColor(C.border).lineWidth(0.5).rect(LEFT_M, curY, CONTENT_W, rowH).stroke();

  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(7.5)
     .text(step, LEFT_M + 8, curY + 5.5, { width: 120 });
  doc.fillColor(C.text).font('Helvetica').fontSize(7.2)
     .text(desc, LEFT_M + 130, curY + 5.5, { width: CONTENT_W - 138 });

  curY += rowH;
});

curY += 12;

// Section 3: Voter State Lifecycle Machine
curY = drawSectionHeader(curY, '3. Voter State Lifecycle & Flow Transitions', 'STATE MACHINE', C.emerald);

const stateCards = [
  { state: 'STATE 1: UNVERIFIED', sub: 'POST /api/auth/register', d1: 'Voter registers credentials.', d2: 'Status: Pending Email OTP.', color: C.orange, bg: C.orangeBg },
  { state: 'STATE 2: ACTIVATED', sub: 'POST /api/auth/verify-otp', d1: '6-digit OTP code verified.', d2: 'Status: isVerified = true.', color: C.cyan, bg: C.cyanBg },
  { state: 'STATE 3: AUTHENTICATED', sub: 'POST /api/auth/login', d1: 'Voter ID + Password matched.', d2: 'Status: Active Session.', color: C.accent, bg: C.blueBg },
  { state: 'STATE 4: SEALED & VOTED', sub: 'POST /api/vote', d1: 'Vote cast, SHA-256 sealed.', d2: 'Status: hasVoted = true locked.', color: C.emerald, bg: C.emeraldBg }
];

const stateW = (CONTENT_W - 27) / 4;
stateCards.forEach((sc, sci) => {
  const sx = LEFT_M + sci * (stateW + 9);
  doc.roundedRect(sx, curY, stateW, 54, 4).fill(sc.bg);
  doc.strokeColor(sc.color).lineWidth(0.8).roundedRect(sx, curY, stateW, 54, 4).stroke();
  doc.rect(sx + 6, curY, stateW - 12, 2.5).fill(sc.color);

  doc.fillColor(sc.color).font('Helvetica-Bold').fontSize(6.8)
     .text(sc.state, sx + 5, curY + 6, { width: stateW - 10 });
  doc.fillColor(C.textMuted).font('Helvetica-Bold').fontSize(6.2)
     .text(sc.sub, sx + 5, curY + 17, { width: stateW - 10 });
  doc.fillColor(C.text).font('Helvetica').fontSize(6.5)
     .text(sc.d1, sx + 5, curY + 28, { width: stateW - 10 });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.5)
     .text(sc.d2, sx + 5, curY + 39, { width: stateW - 10 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 4: COMPLETE FILE SYSTEM ARCHITECTURE TREE (THE EXACT STRUCTURED DIAGRAM!)
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('03 | Complete File System Architecture Tree', 4, 8);

curY = 54;

// Section Header matching user image exactly
curY = drawSectionHeader(curY, '2. Complete File System Architecture Tree', 'FULL WORKSPACE REPOSITORY', C.accent);

const treeItems = [
  { level: 0, isDir: true,  isTop: false, name: 'E:\\Minor project\\', desc: 'Root project directory for VotePulse platform' },
  { level: 1, isDir: true,  isTop: true,  name: 'frontend-website/', desc: 'All client-side user interface source code (React 19 + Vite 8)' },
  { level: 2, isDir: true,  isTop: false, name: 'src/', desc: 'Modular React source code' },
  { level: 3, isDir: true,  isTop: false, name: 'voter/', desc: 'Flow 1: Voter registration, OTP verification, authentication & voting (VoterPortal.jsx)' },
  { level: 3, isDir: true,  isTop: false, name: 'admin/', desc: 'Flow 2: Election operations, live analytics & candidate roster (AdminConsole.jsx)' },
  { level: 3, isDir: true,  isTop: false, name: 'candidate/', desc: 'Flow 3: Candidate registration and application review (CandidatePortal.jsx)' },
  { level: 3, isDir: true,  isTop: false, name: 'audit/', desc: 'Flow 4: Cryptographic ballot verification and audit search (BallotAuditTool.jsx)' },
  { level: 3, isDir: true,  isTop: false, name: 'common/', desc: 'Shared UI components: global header (Navbar.jsx) and modal (SettingsModal.jsx)' },
  { level: 3, isDir: true,  isTop: false, name: 'helpers/', desc: 'Client utilities: confetti.js (HTML5 Canvas celebration) and formNavigation.js (auto-focus)' },
  { level: 3, isDir: false, isTop: false, name: 'App.jsx', desc: 'Central routing controller managing view state, session authentication, and modals' },
  { level: 3, isDir: false, isTop: false, name: 'main.jsx', desc: 'React entry point executing ReactDOM.createRoot and mounting root component' },
  { level: 3, isDir: false, isTop: false, name: 'index.css', desc: 'Custom glassmorphism design system, CSS variables, dark theme, and fluid layout' },
  { level: 1, isDir: true,  isTop: true,  name: 'backend-server/', desc: 'All server-side business logic, REST APIs, middleware, and email services' },
  { level: 2, isDir: true,  isTop: false, name: 'api/', desc: 'Modular REST API endpoints aggregated into a unified Express router' },
  { level: 3, isDir: false, isTop: false, name: 'voter.routes.js', desc: 'Endpoints: /api/auth/register, /api/auth/verify-otp, /api/auth/login, /api/vote' },
  { level: 3, isDir: false, isTop: false, name: 'admin.routes.js', desc: 'Endpoints: /api/admin/stats, /api/admin/voters, /api/admin/voters/:id' },
  { level: 3, isDir: false, isTop: false, name: 'candidate.routes.js', desc: 'Endpoints: /api/candidates, /api/candidates/add' },
  { level: 3, isDir: false, isTop: false, name: 'election.routes.js', desc: 'Endpoints: /api/elections, /api/elections/create' },
  { level: 3, isDir: false, isTop: false, name: 'audit.routes.js', desc: 'Endpoints: /api/vote/audit/:hash (public cryptographic ballot lookup)' },
  { level: 3, isDir: false, isTop: false, name: 'index.js', desc: 'Master router mounting all sub-routes into single Express router instance' },
  { level: 2, isDir: true,  isTop: false, name: 'checks/', desc: 'Request validation middleware (validation.js) inspecting email, OTP, and input payloads' },
  { level: 2, isDir: true,  isTop: false, name: 'helpers/', desc: 'Server utilities: email.js (Nodemailer Gmail OTP) and cipher.js (SHA-256 + encryption)' },
  { level: 2, isDir: false, isTop: false, name: 'app.js', desc: 'Express application instance, middleware registration, static file serving, and port binding' },
  { level: 1, isDir: true,  isTop: true,  name: 'database/', desc: 'Data persistence layer with MongoDB Mongoose models and resilient fallback store' },
  { level: 2, isDir: true,  isTop: false, name: 'models/', desc: 'Mongoose schemas: voter.schema.js, admin.schema.js, candidate.schema.js, election.schema.js' },
  { level: 2, isDir: false, isTop: false, name: 'connection.js', desc: 'MongoDB connection manager with auto-detection of server connectivity' },
  { level: 2, isDir: false, isTop: false, name: 'index.js', desc: 'Unified database interface exporting CRUD operations across MongoDB or fallback' },
  { level: 2, isDir: false, isTop: false, name: 'data.json', desc: 'Resilient disk storage ensuring zero downtime if MongoDB server is offline' },
  { level: 1, isDir: true,  isTop: true,  name: 'docs/', desc: 'Project documentation, technical reports, presentation decks, and generated PDFs' },
  { level: 1, isDir: true,  isTop: true,  name: 'public/', desc: 'PWA icons: favicon.ico, icon-192.png, icon-512.png, and manifest.json' },
  { level: 1, isDir: false, isTop: false, name: 'server.js', desc: 'Root entry point delegating directly to backend-server/app.js' },
  { level: 1, isDir: false, isTop: false, name: 'vite.config.mjs', desc: 'Vite build configuration with React plugin and development proxy setup' },
  { level: 1, isDir: false, isTop: false, name: 'package.json', desc: 'Project manifest with dependencies, devDependencies, and execution scripts' },
  { level: 1, isDir: false, isTop: false, name: 'start-server.bat', desc: 'One-click Windows batch script to launch the production server environment' }
];

treeItems.forEach((item, ti) => {
  const rowH = 18.2;
  const isAlt = ti % 2 === 1;
  const ind = item.level * 16;

  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? '#f8fafc' : C.white);

  // Draw vector icon
  if (item.isDir) {
    drawFolderIcon(LEFT_M + 6 + ind, curY + 3.5, item.isTop ? C.accent : '#64748b');
  } else {
    drawFileIcon(LEFT_M + 6 + ind, curY + 3.5, '#94a3b8');
  }

  const nameColor = item.isTop ? C.accent : (item.isDir ? C.text : C.textSecondary);
  const fontName = (item.isTop || item.isDir) ? 'Helvetica-Bold' : 'Helvetica';
  const fontSize = item.isTop ? 8 : 7.5;

  doc.fillColor(nameColor).font(fontName).fontSize(fontSize)
     .text(item.name, LEFT_M + 24 + ind, curY + 5, { width: 145 - ind });

  doc.fillColor(C.textMuted).font('Helvetica').fontSize(7.2)
     .text(item.desc, LEFT_M + 175, curY + 5, { width: CONTENT_W - 180 });

  curY += rowH;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 5: FILE PURPOSE & ARCHITECTURAL RATIONALE GUIDE
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('04 | File Purpose & Architectural Rationale Guide', 5, 8);

curY = 54;

curY = drawSectionHeader(curY, '1. Frontend File Purpose Breakdown: frontend-website/src/', 'CLIENT UI MODULES', C.accent);

const feExplain = [
  ['src/voter/VoterPortal.jsx', 'Voter Registration, OTP & Voting Screen', 'Complete voter UI: handles registration form, OTP verification modal, login, election candidate cards, and cryptographic ballot receipt. Keeps voter logic isolated.'],
  ['src/admin/AdminConsole.jsx', 'Election Operations & Analytics Console', 'Privileged dashboard: live voter turnout %, real-time vote tallies rendered in dynamic bar charts, election scheduling modal, candidate manager, and voter roster with ADM-9999 masking.'],
  ['src/candidate/CandidatePortal.jsx', 'Candidate Application & Nomination Portal', 'Allows prospective candidates to submit election nominations, choose party affiliation, select emblems, and view approval status independent of voter forms.'],
  ['src/audit/BallotAuditTool.jsx', 'Public Cryptographic Ballot Verification', 'Citizen trust tool: provides an audit search bar where voters enter their SHA-256 ballot hash to verify their vote is in the immutable ledger without exposing choices.'],
  ['src/common/Navbar.jsx & SettingsModal.jsx', 'Header Navigation & Preferences Modals', 'Navbar renders top brand header, role indicators, and tab navigation. SettingsModal provides accessible font scaling, high-contrast mode, and dark/light themes.'],
  ['src/helpers/confetti.js & formNavigation.js', 'Canvas Particle Engine & Accessible Input Navigation', 'Custom physics engine rendering 60fps canvas celebration particles on ballot submission. formNavigation.js provides automatic focus advancing across multi-digit OTP inputs.'],
  ['src/App.jsx, main.jsx, index.css', 'State Router, DOM Entry Point & Glassmorphism Design', 'App.jsx manages activeTab and session auth. main.jsx mounts the React component tree into index.html. index.css establishes custom CSS variables, gradients, and blur cards.']
];

feExplain.forEach(([fname, ftitle, fdesc]) => {
  const cardH = 37;
  doc.roundedRect(LEFT_M, curY, CONTENT_W, cardH, 3).fill(C.cardBg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, cardH, 3).stroke();
  doc.rect(LEFT_M, curY + 3, 3, cardH - 6).fill(C.accent);

  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(7.8)
     .text(fname + '  ', LEFT_M + 10, curY + 5, { continued: true });
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.5)
     .text(`—  ${ftitle}`);

  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(fdesc, LEFT_M + 10, curY + 16, { width: CONTENT_W - 20, lineGap: 1.4 });

  curY += cardH + 5;
});

curY += 4;

curY = drawSectionHeader(curY, '2. Backend & Database File Purpose Breakdown', 'SERVER & STORAGE ENGINES', C.red);

const beExplain = [
  ['backend-server/api/*.routes.js', 'Domain-Separated REST API Controllers', '5 route files handling endpoints: voter.routes.js (/register, /login, /vote), admin.routes.js (/stats, /voters), candidate.routes.js, election.routes.js, and audit.routes.js.'],
  ['backend-server/checks/validation.js', 'Input Sanitization & Request Validation', 'Security middleware validating email formats, password complexity, OTP expiration, and request bodies before they reach business logic or database queries.'],
  ['backend-server/helpers/email.js & cipher.js', 'Gmail SMTP Mailer & SHA-256 Hashing', 'email.js connects via Gmail SMTP (port 587) to automate 6-digit OTP delivery. cipher.js computes tamper-proof SHA-256 ballot hashes and encrypts voter IDs via Caesar cipher.'],
  ['backend-server/app.js & server.js', 'Express Server Configuration & Port Binding', 'Configures Express middleware (CORS, JSON parser), mounts /api router, serves production dist/ static files, and binds HTTP listener to port 3000.'],
  ['database/models/*.schema.js', 'Mongoose NoSQL Schema Definitions', 'Defines data models: voter.schema.js (voter credentials, OTP & hasVoted flags), admin.schema.js (ADM role access), candidate.schema.js, and election.schema.js.'],
  ['database/connection.js, index.js, data.json', 'Database Watchdog & Resilient Disk Fallback', 'connection.js auto-detects MongoDB availability. If offline, index.js seamlessly redirects CRUD queries to local database/data.json, ensuring 100% demo uptime.']
];

beExplain.forEach(([fname, ftitle, fdesc]) => {
  const cardH = 37;
  doc.roundedRect(LEFT_M, curY, CONTENT_W, cardH, 3).fill(C.cardBg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, cardH, 3).stroke();
  doc.rect(LEFT_M, curY + 3, 3, cardH - 6).fill(C.red);

  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(7.8)
     .text(fname + '  ', LEFT_M + 10, curY + 5, { continued: true });
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.5)
     .text(`—  ${ftitle}`);

  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(fdesc, LEFT_M + 10, curY + 16, { width: CONTENT_W - 20, lineGap: 1.4 });

  curY += cardH + 5;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 6: TECHNOLOGY STACK (LANGUAGES, FRONTEND & BACKEND)
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('05 | Languages, Frontend & Backend Specification', 6, 8);

curY = 54;

curY = drawSectionHeader(curY, '1. Programming & Markup Languages', 'FOUNDATION STACK', C.primary);

const langs = [
  { name: 'JavaScript (ES6+)', type: 'Full-Stack Runtime Language', desc: 'Primary programming language used across both frontend (React) and backend (Node.js). Leverages modern ES6+ features including Promises, async/await, arrow functions, object destructuring, and ES modules on the client alongside CommonJS on the server.', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'JSX', type: 'React UI Syntax Extension', desc: 'Declarative XML-like syntax extension for JavaScript that defines React component hierarchies. Compiles down to optimized React.createElement() calls via Vite and esbuild, combining HTML layout expressiveness with full JavaScript logic.', color: '#0284c7', bg: '#f0f9ff' },
  { name: 'CSS3 (Custom Vanilla)', type: 'Styling & Design System', desc: 'Engineered entirely in index.css without third-party CSS utility frameworks like Tailwind. Utilizes CSS Custom Properties (variables), backdrop-filter blur effects for glassmorphism, flexbox/grid layouts, smooth transition curves, and media query breakpoints.', color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'HTML5', type: 'Application Shell & Metadata', desc: 'Defines the single-page application shell (index.html). Provides semantic meta tags, mobile viewport optimization, Google Fonts preconnect links, and Progressive Web App manifest associations.', color: '#ea580c', bg: '#fff7ed' },
  { name: 'JSON', type: 'Data Interchange & Storage', desc: 'Standard data exchange format across REST endpoints. Additionally powers local persistent storage (database/data.json), package configuration (package.json), and PWA metadata (manifest.json).', color: '#059669', bg: '#f0fdf4' }
];

langs.forEach((l) => {
  const cardH = 34;
  doc.roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).fill(l.bg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).stroke();
  doc.rect(LEFT_M, curY + 4, 3.5, cardH - 8).fill(l.color);

  doc.fillColor(l.color).font('Helvetica-Bold').fontSize(8.5)
     .text(l.name, LEFT_M + 12, curY + 6);
  doc.fillColor(C.textMuted).font('Helvetica').fontSize(7.5)
     .text(l.type, LEFT_M + 150, curY + 6.5);

  doc.fillColor(C.text).font('Helvetica').fontSize(7.5)
     .text(l.desc, LEFT_M + 12, curY + 18, { width: CONTENT_W - 24, lineGap: 1.5 });

  curY += cardH + 6;
});

curY += 8;

curY = drawSectionHeader(curY, '2. Frontend Frameworks & Client Technologies', 'CLIENT SUBSYSTEM', C.accent);

const feTech = [
  ['React 19', 'Core UI component framework using functional components, state management (useState), side-effects (useEffect), and mutable refs (useRef) in a Single-Page Application (SPA) architecture.'],
  ['Vite 8', 'Next-generation frontend tooling offering instant dev-server startup, lightning-fast Hot Module Replacement (HMR), and highly optimized production Rollup/esbuild bundling.'],
  ['Lucide React', 'Modern, ultra-clean SVG icon package providing crisp, scalable iconography (Vote, Shield, CheckCircle, Settings, LogOut) with zero performance impact.'],
  ['Accessibility Engine', 'Comprehensive keyboard accessibility, focus trapping in modal dialogs, and dynamic font scale preferences managed via SettingsModal.'],
  ['HTML5 Canvas Confetti', 'Custom physics animation in helpers/confetti.js rendering 60 FPS celebratory particle physics during ballot confirmation without external library dependencies.'],
  ['PWA (Service Worker)', 'sw.js provides intelligent offline asset caching and rapid reload speeds, paired with manifest.json for full "Add to Home Screen" mobile installation support.']
];

feTech.forEach(([tech, detail], fi) => {
  const rowH = 25;
  const isAlt = fi % 2 === 1;
  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? C.cardBg : C.white);
  doc.strokeColor(C.border).lineWidth(0.6).rect(LEFT_M, curY, CONTENT_W, rowH).stroke();

  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(8)
     .text(tech, LEFT_M + 8, curY + 7, { width: 120 });
  doc.fillColor(C.text).font('Helvetica').fontSize(7.5)
     .text(detail, LEFT_M + 130, curY + 5, { width: CONTENT_W - 138, lineGap: 1.5 });

  curY += rowH;
});

curY += 12;

curY = drawSectionHeader(curY, '3. Backend Server Technologies & Runtime', 'SERVER SUBSYSTEM', C.red);

const beTech = [
  ['Node.js v24', 'Asynchronous, non-blocking V8 event-driven runtime handling concurrent HTTP requests and managing database input/output pipelines.'],
  ['Express.js 4', 'Industry-standard web framework providing structured routing, JSON body-parsing middleware, CORS management, and static bundle delivery.'],
  ['Nodemailer 9', 'SMTP mail transmission library configured for Gmail STARTTLS (port 587) to automate the dispatch of 6-digit OTP verification security tokens.'],
  ['dotenv 17', 'Environment variable manager isolating secrets (MONGO_URI, EMAIL_USER, EMAIL_PASS) into .env, preventing credential leakage in git history.'],
  ['Built-in Crypto', 'Node.js native cryptographic engine generating secure 256-bit SHA-256 ballot hashes for tamper-proof vote verification.'],
  ['Checks Middleware', 'Dedicated validation layer (checks/validation.js) sanitizing email syntax, credential lengths, and request payloads before route execution.']
];

beTech.forEach(([tech, detail], bi) => {
  const rowH = 25;
  const isAlt = bi % 2 === 1;
  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? C.redBg : C.white);
  doc.strokeColor(C.border).lineWidth(0.6).rect(LEFT_M, curY, CONTENT_W, rowH).stroke();

  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(8)
     .text(tech, LEFT_M + 8, curY + 7, { width: 120 });
  doc.fillColor(C.text).font('Helvetica').fontSize(7.5)
     .text(detail, LEFT_M + 130, curY + 5, { width: CONTENT_W - 138, lineGap: 1.5 });

  curY += rowH;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 7: DATABASE ARCHITECTURE, FAILOVER & SECURITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('06 | Database Architecture & Security Engine', 7, 8);

curY = 54;

curY = drawSectionHeader(curY, '1. Database Architecture & Mongoose Schemas', 'PERSISTENCE ENGINE', C.emerald);

const schemas = [
  {
    name: 'voter.schema.js',
    coll: 'voters Collection',
    fields: 'voterID (encrypted), name, email, password, isVerified, otp, otpExpires, hasVoted, votedAt',
    desc: 'Tracks voter lifecycle from unverified registration through OTP activation and ballot cast status.'
  },
  {
    name: 'admin.schema.js',
    coll: 'admins Collection',
    fields: 'adminID (must start with ADM-), password, role ("superadmin"), createdAt',
    desc: 'Controls administrative access. ADM-9999 master maintenance accounts are filtered from general lists.'
  },
  {
    name: 'candidate.schema.js',
    coll: 'candidates Collection',
    fields: 'name (String), party (String), symbol (Emblem string), electionId (Ref), voteCount (Number)',
    desc: 'Stores registered candidates linked to elections. Vote counts update in real-time as ballots are sealed.'
  },
  {
    name: 'election.schema.js',
    coll: 'elections Collection',
    fields: 'title, description, startDate, endDate, status ("active" | "upcoming" | "closed")',
    desc: 'Manages election schedules and voting windows. Only active elections accept vote submissions.'
  }
];

schemas.forEach((s) => {
  const cardH = 44;
  doc.roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).fill(C.cardBg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, cardH, 4).stroke();
  doc.rect(LEFT_M, curY + 4, 3, cardH - 8).fill(C.emerald);

  doc.fillColor(C.emerald).font('Helvetica-Bold').fontSize(8.5)
     .text(s.name, LEFT_M + 10, curY + 6);
  doc.fillColor(C.textMuted).font('Helvetica-Bold').fontSize(7.5)
     .text(s.coll, LEFT_M + 140, curY + 6.5);

  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.3)
     .text('Fields: ', LEFT_M + 10, curY + 18, { continued: true });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7.3)
     .text(s.fields, { width: CONTENT_W - 20 });

  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.3)
     .text('Purpose: ', LEFT_M + 10, curY + 29, { continued: true });
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7.3)
     .text(s.desc, { width: CONTENT_W - 20 });

  curY += cardH + 7;
});

curY += 6;

curY = drawSectionHeader(curY, '2. High-Availability Resilient Failover Engine', 'ZERO-CRASH TOLERANCE', C.primary);

doc.roundedRect(LEFT_M, curY, CONTENT_W, 64, 4).fill(C.blueBg);
doc.strokeColor(C.accent).lineWidth(0.8).roundedRect(LEFT_M, curY, CONTENT_W, 64, 4).stroke();

doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(8.5)
   .text('AUTOMATIC DATABASE WATCHDOG & LOCAL FALLBACK STORE', LEFT_M + 12, curY + 8);

doc.fillColor(C.text).font('Helvetica').fontSize(8)
   .text('VotePulse features an intelligent auto-detecting database watchdog in database/connection.js. At application startup, the system attempts a connection to the primary MongoDB service (mongodb://127.0.0.1:27017/votepulse). If MongoDB is offline or connection fails (ECONNREFUSED), the database layer automatically falls back to an in-memory repository backed by atomic disk persistence in database/data.json. This ensures the application remains 100% operational during offline presentations, defense evaluations, or server disruptions.',
         LEFT_M + 12, curY + 22, { width: CONTENT_W - 24, lineGap: 1.8 });

curY += 76;

curY = drawSectionHeader(curY, '3. Comprehensive Security & Cryptography Matrix', 'SECURITY ARCHITECTURE', C.red);

const securityItems = [
  ['6-Digit Email OTP', 'Nodemailer dispatches single-use OTPs with 10-minute expiration to prevent fake or sybil registrations.'],
  ['SHA-256 Ballot Sealing', 'Each ballot is sealed with a unique 256-bit cryptographic hash returned to the voter as an audit receipt.'],
  ['Reversible Voter Cipher', 'Voter IDs are obfuscated via reversible substitution cipher in cipher.js before being stored on disk.'],
  ['One-Vote Enforcement', 'Strict database validation checks hasVoted flags; second vote attempts trigger 403 Forbidden.'],
  ['Master Admin Privacy', 'Admin accounts with IDs beginning ADM-9999 are excluded from voter lists to prevent credential harvesting.'],
  ['Strict Input Validation', 'Request payloads pass through checks/validation.js to protect against SQL/NoSQL injection and payload overflow.']
];

const secW = (CONTENT_W - 12) / 2;
securityItems.forEach((sec, si) => {
  const row = Math.floor(si / 2);
  const col = si % 2;
  const sx = LEFT_M + col * (secW + 12);
  const sy = curY + row * 40;

  doc.roundedRect(sx, sy, secW, 35, 4).fill(C.cardBg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(sx, sy, secW, 35, 4).stroke();
  doc.rect(sx, sy + 3, 2.5, 29).fill(C.red);

  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(8)
     .text(sec[0], sx + 8, sy + 5);
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(7.2)
     .text(sec[1], sx + 8, sy + 16, { width: secW - 14, lineGap: 1.3 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 8: TOOLS, DEPENDENCIES & REFERENCE TABLE
// ═══════════════════════════════════════════════════════════════════════════════
addContentPage('07 | Development Tools & Package Reference', 8, 8);

curY = 54;

curY = drawSectionHeader(curY, '1. Development Environment & Tooling Ecosystem', 'DEVELOPMENT TOOLCHAIN', C.primary);

const tools = [
  { name: 'VS Code', role: 'Primary Code Editor', desc: 'Used for source editing, JSX highlighting, and Git workflow.' },
  { name: 'npm 10+', role: 'Package Manager', desc: 'Automates dependency installs, build scripts, and execution triggers.' },
  { name: 'Git & GitHub', role: 'Version Control', desc: 'Tracks code modifications with .env protection via .gitignore.' },
  { name: 'MongoDB Compass', role: 'Database GUI', desc: 'Visual inspection tool to query collections, schemas, and live votes.' },
  { name: 'Chrome DevTools', role: 'Testing & Profiling', desc: 'Inspects DOM hierarchy, network payloads, application storage, and console logs.' },
  { name: 'start-server.bat', role: 'Windows Launcher', desc: 'One-click Windows batch script for automated startup without CLI.' }
];

const toolW = (CONTENT_W - 16) / 3;
tools.forEach((tl, ti) => {
  const row = Math.floor(ti / 3);
  const col = ti % 3;
  const tx = LEFT_M + col * (toolW + 8);
  const ty = curY + row * 44;

  doc.roundedRect(tx, ty, toolW, 38, 4).fill(C.cardBg);
  doc.strokeColor(C.border).lineWidth(0.8).roundedRect(tx, ty, toolW, 38, 4).stroke();

  doc.fillColor(C.primary).font('Helvetica-Bold').fontSize(8)
     .text(tl.name, tx + 6, ty + 5);
  doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(6.8)
     .text(tl.role, tx + 6, ty + 15);
  doc.fillColor(C.textSecondary).font('Helvetica').fontSize(6.8)
     .text(tl.desc, tx + 6, ty + 24, { width: toolW - 12 });
});

curY += 98;

curY = drawSectionHeader(curY, '2. Complete npm Packages & Dependencies (package.json)', 'DEPENDENCY AUDIT', C.accent);

const pkgs = [
  ['react', '^19.2.8', 'dependency', 'Core declarative UI library powering the modular component tree'],
  ['react-dom', '^19.2.8', 'dependency', 'Browser DOM rendering engine and event system adapter for React'],
  ['express', '^4.19.2', 'dependency', 'High-performance web application framework powering REST API server'],
  ['mongoose', '^9.9.3', 'dependency', 'Asynchronous MongoDB Object Document Modeling library with schema validation'],
  ['nodemailer', '^9.0.5', 'dependency', 'Enterprise email transmission library delivering Gmail SMTP OTPs'],
  ['cors', '^2.8.5', 'dependency', 'Enables secure Cross-Origin Resource Sharing across Vite and Express'],
  ['dotenv', '^17.4.2', 'dependency', 'Injects environment secrets from .env file into process.env at startup'],
  ['lucide-react', '^1.32.0', 'dependency', 'Lightweight, modern SVG icon library for seamless interface visuals'],
  ['vite', '^8.2.1', 'devDependency', 'Next-generation ultra-fast frontend build tool and development server'],
  ['@vitejs/plugin-react', '^6.0.5', 'devDependency', 'Official Vite plugin enabling React fast refresh and JSX compilation'],
  ['esbuild', '^0.28.2', 'devDependency', 'High-speed JavaScript and TypeScript bundler backing Vite builds'],
  ['pdfkit', '^0.20.2', 'devDependency', 'Declarative programmatic PDF generation engine creating this report']
];

// Table Header
const tCols = [105, 55, 75, 276.28];
const tX = [LEFT_M, LEFT_M + 105, LEFT_M + 160, LEFT_M + 235];

doc.rect(LEFT_M, curY, CONTENT_W, 16).fill(C.primary);
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(7.5);
doc.text('PACKAGE NAME', tX[0] + 6, curY + 4.5);
doc.text('VERSION', tX[1] + 4, curY + 4.5);
doc.text('TYPE', tX[2] + 4, curY + 4.5);
doc.text('ROLE & ARCHITECTURAL PURPOSE', tX[3] + 4, curY + 4.5);

curY += 16;

pkgs.forEach((pkg, pi) => {
  const rowH = 15.2;
  const isAlt = pi % 2 === 1;
  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? '#f8fafc' : C.white);
  doc.strokeColor(C.border).lineWidth(0.5).rect(LEFT_M, curY, CONTENT_W, rowH).stroke();

  doc.fillColor(C.primary).font('Helvetica-Bold').fontSize(7.2)
     .text(pkg[0], tX[0] + 6, curY + 3.8);
  doc.fillColor(C.textMuted).font('Helvetica').fontSize(7)
     .text(pkg[1], tX[1] + 4, curY + 4);

  const isDev = pkg[2] === 'devDependency';
  doc.fillColor(isDev ? C.orange : C.emerald).font('Helvetica-Bold').fontSize(6.8)
     .text(pkg[2], tX[2] + 4, curY + 4);

  doc.fillColor(C.text).font('Helvetica').fontSize(7)
     .text(pkg[3], tX[3] + 4, curY + 4, { width: tCols[3] - 8 });

  curY += rowH;
});

curY += 12;

curY = drawSectionHeader(curY, '3. Execution Commands & Operational Scripts', 'NPM COMMAND REFERENCE', C.primary);

const scripts = [
  ['npm start', 'Starts the production server on port 3000 (delegates to server.js -> backend-server/app.js)'],
  ['npm run dev', 'Launches Vite development server with Hot Module Replacement on port 5173'],
  ['npm run build', 'Executes Vite production build, outputting optimized bundles to dist/ directory'],
  ['start-server.bat', 'Windows batch executable for one-click server launch without manual command entry']
];

scripts.forEach(([cmd, desc], si) => {
  const rowH = 18;
  const isAlt = si % 2 === 1;
  doc.rect(LEFT_M, curY, CONTENT_W, rowH).fill(isAlt ? C.cardBg : C.white);
  doc.strokeColor(C.border).lineWidth(0.6).rect(LEFT_M, curY, CONTENT_W, rowH).stroke();

  doc.roundedRect(LEFT_M + 6, curY + 3, 84, 12, 2).fill(C.primary);
  doc.fillColor(C.white).font('Courier-Bold').fontSize(7)
     .text(cmd, LEFT_M + 6, curY + 5, { width: 84, align: 'center' });

  doc.fillColor(C.text).font('Helvetica').fontSize(7.5)
     .text(desc, LEFT_M + 100, curY + 5, { width: CONTENT_W - 108 });

  curY += rowH;
});

curY += 14;

// Section 4: Final Sign-off Box
doc.roundedRect(LEFT_M, curY, CONTENT_W, 46, 5).fill(C.primary);
doc.fillColor(C.white).font('Helvetica-Bold').fontSize(10)
   .text('VotePulse E-Voting Platform — Architecture Specification v2.3', LEFT_M, curY + 9, { width: CONTENT_W, align: 'center' });
doc.fillColor(C.accentLight).font('Helvetica').fontSize(8)
   .text('Verified Compliant with Minor Project Architectural & Engineering Guidelines', LEFT_M, curY + 23, { width: CONTENT_W, align: 'center' });
doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
   .text('Document Generated: September 2026  •  Department of Computer Science & Engineering', LEFT_M, curY + 34, { width: CONTENT_W, align: 'center' });

// ─── Finish Document ──────────────────────────────────────────────────────────
doc.end();
console.log('✅ PDF generated successfully: docs/VotePulse_Project_Structure.pdf');
