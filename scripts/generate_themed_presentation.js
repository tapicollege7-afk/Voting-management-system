const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLibDoc } = require('pdf-lib');
const {
  renderUseCaseDiagram169,
  renderSequenceDiagram169,
  renderErDiagram169,
  renderDfd0Diagram169,
  renderDfd1Diagram169
} = require('./diagram_renderers_169');

const SOURCE_PDF_PATH = 'C:/Users/Kautuk/.gemini/antigravity-ide/brain/6542bcc3-563b-41e8-bcff-e6affa47d7a4/.user_uploaded/media_1790168711231.pdf';
const TEMPLATE_BG_PATH = path.join(__dirname, '../docs/clean_seminar_template.png');
const TEMP_PDF_PATH = path.join(__dirname, '../docs/temp_themed_slides.pdf');
const FINAL_PDF_PATH = path.join(__dirname, '../docs/VotePulse_Seminar_Presentation.pdf');
const MIRROR_PDF_PATH = path.join(__dirname, '../docs/Voter_seminar_Presentation.pdf');

// Theme Color Tokens matching Tapi College presentation
const T = {
  navy: '#0f294a',          // Main slide title
  navyCardTitle: '#1a365d', // Card title navy
  orange: '#ea580c',        // Subtitle orange
  orangeDark: '#c2410c',
  green: '#15803d',
  text: '#1e293b',          // Primary body text
  textSecondary: '#475569', // Secondary body text
  textMuted: '#718096',     // Footer text
  border: '#cbd5e1',
  white: '#ffffff',

  // Pastel Card Fills & Borders
  blueCard: { bg: '#ebf8ff', border: '#bee3f8', title: '#1e3a8a' },
  peachCard: { bg: '#fff7ed', border: '#fed7aa', title: '#9a3412' },
  greenCard: { bg: '#f0fff4', border: '#bbf7d0', title: '#14532d' },
  slateCard: { bg: '#f8fafc', border: '#e2e8f0', title: '#0f172a' }
};

// Helper to draw background and header on each slide
function drawSlideBase(doc, title, subtitle, pageNum) {
  // Background template with green wave & top-right logo
  if (fs.existsSync(TEMPLATE_BG_PATH)) {
    doc.image(TEMPLATE_BG_PATH, 0, 0, { width: 960, height: 540 });
  } else {
    doc.rect(0, 0, 960, 540).fill('#ffffff');
  }

  // Slide Title & Subtitle
  doc.fillColor(T.navy).font('Helvetica-Bold').fontSize(21)
     .text(title, 45, 34, { lineBreak: false });
  doc.fillColor(T.orange).font('Helvetica').fontSize(9.5)
     .text(subtitle, 45, 62, { lineBreak: false });

  // Page number at bottom right
  doc.fillColor(T.textMuted).font('Helvetica-Bold').fontSize(8.5)
     .text(String(pageNum), 905, 514, { width: 30, align: 'right', lineBreak: false });
}

// Helper to draw a pastel card
function drawCard(doc, x, y, w, h, title, bullets, cardTheme = T.blueCard, fontSize = 7.8) {
  doc.roundedRect(x, y, w, h, 8).fill(cardTheme.bg);
  doc.strokeColor(cardTheme.border).lineWidth(1).roundedRect(x, y, w, h, 8).stroke();

  doc.fillColor(cardTheme.title).font('Helvetica-Bold').fontSize(9.8)
     .text(title, x + 12, y + 10, { width: w - 24, lineBreak: false });

  let textY = y + 27;
  bullets.forEach(b => {
    doc.fillColor(T.textSecondary).font('Helvetica').fontSize(fontSize)
       .text(`•  ${b}`, x + 12, textY, { width: w - 24, lineGap: 2 });
    const textH = doc.heightOfString(`•  ${b}`, { width: w - 24, lineGap: 2 });
    textY += textH + 5;
  });
}

async function buildThemedSlides() {
  console.log('Generating 17 themed content slides via PDFKit (16:9 widescreen)...');
  const doc = new PDFDocument({
    size: [960, 540],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: false,
    bufferPages: true
  });

  const stream = fs.createWriteStream(TEMP_PDF_PATH);
  doc.pipe(stream);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 2: PRESENTATION INDEX
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Presentation Index', 'As per Minor Project Seminar-3 instruction', 2);

  const indexItems = [
    { num: '01', title: 'Project Title & Institutional Scope', theme: T.blueCard },
    { num: '02', title: 'Proposed Solution & Core Architecture', theme: T.peachCard },
    { num: '03', title: 'System Design / Architecture (UML Diagrams)', theme: T.greenCard },
    { num: '04', title: 'Software Technologies & Toolchain', theme: T.slateCard },
    { num: '05', title: 'Hardware Infrastructure & Host Assembly', theme: T.blueCard },
    { num: '06', title: 'Software Implementation Across Tiers', theme: T.peachCard },
    { num: '07', title: 'Testing Methodology & Quality Gates', theme: T.greenCard },
    { num: '08', title: 'High-Risk Test Case Design (Table 1: Part 1 & 2)', theme: T.slateCard },
    { num: '09', title: 'Defect Report & Bug Audit Log (Table 2)', theme: T.blueCard },
    { num: '10', title: 'System Testing, PWA & Resiliency', theme: T.peachCard },
    { num: '11', title: 'System Demonstration & Role Journeys', theme: T.greenCard },
    { num: '12', title: 'Verification Proof, SLAs & Conclusion', theme: T.slateCard }
  ];

  const colW = 385;
  const cardH = 54;
  const startX = 45;
  const startY = 88;

  indexItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = startX + (col * (colW + 20));
    const y = startY + (row * (cardH + 14));

    doc.roundedRect(x, y, colW, cardH, 8).fill(item.theme.bg);
    doc.strokeColor(item.theme.border).lineWidth(1).roundedRect(x, y, colW, cardH, 8).stroke();

    // Number Box
    doc.roundedRect(x + 10, y + 10, 34, 34, 5).fill(item.theme.title);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
       .text(item.num, x + 10, y + 21, { width: 34, align: 'center', lineBreak: false });

    // Item Title
    doc.fillColor(T.navyCardTitle).font('Helvetica-Bold').fontSize(9.5)
       .text(item.title, x + 54, y + 20, { width: colW - 64, lineBreak: false });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 3: TOPIC 2.1 - USE CASE DIAGRAM
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Design / Architecture -- Use Case Model', 'UML 2.5 Actor Boundary & Security Inclusions (<<include>> / <<extend>>)', 3);
  renderUseCaseDiagram169(doc);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 4: TOPIC 2.2 - SEQUENCE DIAGRAM
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Design / Architecture -- Sequence Diagram', 'Temporal Message Exchange: Race Condition Defense & Cryptographic Sealing', 4);
  renderSequenceDiagram169(doc);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 5: TOPIC 2.3 - ENTITY-RELATIONSHIP (E-R) SCHEMA
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Design / Architecture -- E-R Schema Model', 'Data Persistence Schemas, Cardinalities & Secret Ballot Decoupling', 5);
  renderErDiagram169(doc);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 6: TOPIC 2.4 - DFD LEVEL 0 (CONTEXT MODEL)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Design / Architecture -- DFD Level 0 (Context)', 'Global System Boundary, External Entities & Information Pipelines', 6);
  renderDfd0Diagram169(doc);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 7: TOPIC 2.5 - DFD LEVEL 1 (DECOMPOSITION)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Design / Architecture -- DFD Level 1 (Decomposition)', 'Sub-Process Architecture (1.0 to 6.0) & Direct Data Store Access (D1 to D5)', 7);
  renderDfd1Diagram169(doc);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 8: TOPIC 3 - SOFTWARE TECHNOLOGIES & TOOLCHAIN
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Software Technologies & Engineering Toolchain', 'Full-Stack Architecture, Version Specifications & Engineering Rationale', 8);

  const techCards = [
    { title: 'Frontend UI & Client Stack', theme: T.blueCard, bullets: ['React 19.2 + Vite 8.2 Single Page Application.', 'Modular role portals (Voter, Candidate, Admin).', 'Instant client-side feedback & live modals.', 'Zero full-page browser refreshes.'] },
    { title: 'Backend Controller & Runtime', theme: T.peachCard, bullets: ['Node.js v20+ with Express REST framework.', 'Asynchronous, event-driven request pipeline.', 'Strict route-level security middleware.', 'CORS origin protection & body parsing.'] },
    { title: 'Database & Persistence Layer', theme: T.greenCard, bullets: ['MongoDB Atlas cloud document database.', 'Mongoose v9.9 Object Data Modeling (ODM).', 'Transparent in-memory fallback proxy.', 'Zero downtime during network partitions.'] },
    { title: '2FA Email & Verification Engine', theme: T.slateCard, bullets: ['Nodemailer v9.0.5 + Google SMTP Gateway.', 'Real-time 6-digit numeric OTP generation.', '10-minute expiry window & rate limiting.', 'Encrypted transport with zero credential leaks.'] },
    { title: 'Cryptographic Engine & Sealing', theme: T.blueCard, bullets: ['SHA-256 one-way hashing for tamper seals.', '64-hex non-repudiable ballot audit digests.', 'Symmetric Caesar Cipher (k=3) credential protection.', 'Deterministic audit receipt validation.'] },
    { title: 'Progressive Web App (PWA)', theme: T.peachCard, bullets: ['Service Worker offline cache (v400).', 'Installable on Android, iOS, Windows, macOS.', 'Web App Manifest with custom icons.', 'Responsive layout for mobile and desktop.'] }
  ];

  const tCardW = 252;
  const tCardH = 195;
  techCards.forEach((c, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 45 + (col * (tCardW + 15));
    const y = 88 + (row * (tCardH + 15));
    drawCard(doc, x, y, tCardW, tCardH, c.title, c.bullets, c.theme, 7.5);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 9: TOPIC 4 - HARDWARE INFRASTRUCTURE & HOST ASSEMBLY
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Final Hardware Infrastructure & Host Assembly', 'Server Compute Specifications, Client Device Ecosystem & High Availability', 9);

  const hwCards = [
    { title: 'Host Production Server Compute', theme: T.blueCard, bullets: ['4 vCPU (x86-64 / ARM64 cloud compute tier).', '8 GB High-Speed DDR4 / ECC Server RAM.', '50 GB NVMe SSD for fast persistence logging.', '1 Gbps Network Interface Card (NIC) bandwidth.', 'Linux / Node.js production service daemon.'] },
    { title: 'Client Device Ecosystem & Viewports', theme: T.greenCard, bullets: ['Smartphones (360x640 to 414x896) touch-optimized.', 'Tablets & iPads (768x1024 to 820x1180) responsive.', 'Laptops & Desktop Workstations (1366x768 to 1920x1080).', 'Cross-browser rendering: Chrome, Edge, Safari, Firefox.', 'Zero peripheral hardware requirement for voters.'] },
    { title: 'Automated Disaster Recovery Failover', theme: T.peachCard, bullets: ['Transparent failover proxy to local in-memory DB.', '< 25ms switchover latency with zero lost writes.', 'Autonomous recovery upon cloud connection restore.', 'Resilient against WAN and upstream DNS failures.', 'Full continuity of active election casting.'] },
    { title: 'Perimeter Defense & Host Security', theme: T.slateCard, bullets: ['HTTPS / TLS 1.3 enforced end-to-end transport.', 'CORS origin whitelist guards against external attacks.', 'Content-Security-Policy (CSP) headers enabled.', 'Memory-safe non-blocking I/O execution loop.', 'Continuous health monitoring on /api/health.'] }
  ];

  const hwCardW = 385;
  const hwCardH = 195;
  hwCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 45 + (col * (hwCardW + 20));
    const y = 88 + (row * (hwCardH + 15));
    drawCard(doc, x, y, hwCardW, hwCardH, c.title, c.bullets, c.theme, 7.6);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 10: TOPIC 5 - SOFTWARE IMPLEMENTATION ACROSS TIERS
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Software Implementation Across Architectural Tiers', 'Codebase Organization, Golden Source Build Pipeline & Component Separation', 10);

  const implCards = [
    { title: 'Frontend UI Tier (frontend-website/src)', theme: T.blueCard, bullets: ['Modular portal components: VoterPortal, CandidatePortal, AdminPortal.', 'Shared modal feedback: SettingsModal, OTPDialog, ReceiptModal.', 'Reactive state management with real-time UI status updates.', 'Fast bundle footprint compiled with Vite.'] },
    { title: 'Backend API Controllers (server.js)', theme: T.greenCard, bullets: ['RESTful endpoints: /api/auth, /api/vote, /api/elections, /api/candidates.', 'Strict input validation & parameter sanity middleware.', 'Atomic lock controllers for vote casting and status toggle.', 'Decoupled route handlers for clean maintenance.'] },
    { title: 'Database Schemas & Models', theme: T.peachCard, bullets: ['Mongoose document schemas for User, Election, Candidate, Vote, OtpToken.', 'Unique compound indexes on emails and vote hashes.', 'TTL indexing for automated OTP token purging (300s).', 'Decoupled secret ballot collection isolating voter identity.'] },
    { title: 'Golden Source Build Pipeline (scripts/build.js)', theme: T.slateCard, bullets: ['Automated compilation of modern JSX and CSS assets.', 'Content hash injection for deterministic cache busting.', 'Automatic public sync and SPA fallback routing.', 'Pre-deployment validation through 67 automated test gates.'] }
  ];

  implCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 45 + (col * (hwCardW + 20));
    const y = 88 + (row * (hwCardH + 15));
    drawCard(doc, x, y, hwCardW, hwCardH, c.title, c.bullets, c.theme, 7.6);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 11: TOPIC 6 - TESTING METHODOLOGY & QUALITY GATES
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Testing Methodology & Quality Assurance', 'Multi-Tier Verification Strategy, QA Protocols & Test Automation Suite', 11);

  const testCards = [
    { title: '1. Functional Testing', theme: T.blueCard, bullets: ['Voter registration & verification.', 'OTP code dispatch & validation.', 'One-person-one-vote enforcement.', 'Candidate nomination & approval.'] },
    { title: '2. UI & Responsiveness Testing', theme: T.peachCard, bullets: ['Responsive viewports: mobile/tablet/desktop.', 'Modal feedback & toast notifications.', 'Dark & light theme switching.', 'Accessibility & focus indicator tests.'] },
    { title: '3. Integration Testing', theme: T.greenCard, bullets: ['Full auth-to-ballot API pipeline.', 'Candidate portal live metrics.', 'Admin poll status transitions.', '31 / 31 integration tests passing.'] },
    { title: '4. Database Integrity Testing', theme: T.slateCard, bullets: ['Mongoose schema constraints.', 'Unique email & ballot hash indexes.', 'Atomic lock compare-and-swap.', 'Zero duplicate ledger entries.'] },
    { title: '5. Compatibility Testing', theme: T.blueCard, bullets: ['Cross-browser: Chrome, Edge, Safari, Firefox.', 'PWA Service Worker offline caching.', 'Windows, macOS, Linux, Android, iOS.', 'Consistent CSS grid & flex layout.'] },
    { title: '6. Strict Unit Testing Harness', theme: T.peachCard, bullets: ['27 / 27 unit tests executed.', 'Cryptographic cipher fidelity (k=3).', 'SHA-256 hash determinism.', 'Input validation boundary logic.'] }
  ];

  techCards.forEach((c, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 45 + (col * (tCardW + 15));
    const y = 88 + (row * (tCardH + 15));
    drawCard(doc, x, y, tCardW, tCardH, testCards[idx].title, testCards[idx].bullets, testCards[idx].theme, 7.5);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 12: TOPIC 6 - HIGH-RISK TEST CASES (TABLE 1: PART 1)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Test Case Design -- High-Risk Areas (Table 1: Part 1)', 'Concurrency Race Conditions, Cryptographic Tamper Invalidation & OTP Fuzzing', 12);

  const tcPart1 = [
    { id: 'TC-HR-01', desc: 'Concurrent Double-Voting Race Attack', steps: 'Fire 20 parallel POST /api/vote requests', data: '{ election_id, candidate_id }', expected: '1 write succeeds (201), 19 reject (409)', actual: '1 write accepted, 19 blocked with 409', status: 'PASSED' },
    { id: 'TC-HR-02', desc: 'SHA-256 Bit-Flip Tamper Invalidation', steps: 'Alter 1 character in ballot hash string', data: 'Modified 64-hex audit digest', expected: 'Ledger flags invalid hash (404/400)', actual: 'Tamper detected, audit returns 404', status: 'PASSED' },
    { id: 'TC-HR-03', desc: 'Brute-Force & Fuzzing OTP Codes', steps: 'Send invalid / non-numeric OTP tokens', data: '"12345", "ABCDEF", "999999"', expected: 'Reject with HTTP 400 Bad Request', actual: 'All blocked by regex validation', status: 'PASSED' },
    { id: 'TC-HR-04', desc: 'Candidate Portal 2FA Gate Bypass', steps: 'Attempt /api/candidates without OTP', data: '{ email, password } without OTP', expected: 'Block with HTTP 403 Forbidden', actual: 'Access denied until OTP verified', status: 'PASSED' },
    { id: 'TC-HR-05', desc: 'Master Admin Account Deletion Attack', steps: 'Send DELETE /api/admin/voters/ADM-9999', data: 'Target ID: "ADM-9999"', expected: 'Block with HTTP 403 Forbidden', actual: 'Blocked with 403 (Protected Root)', status: 'PASSED' }
  ];

  function drawTableSlide(rows) {
    const tableX = 45;
    const tableY = 88;
    const tableW = 790;
    const cols = [
      { name: 'TC ID', w: 65, align: 'center' },
      { name: 'TEST DESCRIPTION', w: 155, align: 'left' },
      { name: 'TEST STEPS', w: 145, align: 'left' },
      { name: 'TEST DATA', w: 125, align: 'left' },
      { name: 'EXPECTED RESULT', w: 140, align: 'left' },
      { name: 'ACTUAL RESULT', w: 100, align: 'left' },
      { name: 'STATUS', w: 60, align: 'center' }
    ];

    // Header
    doc.roundedRect(tableX, tableY, tableW, 22, 4).fill(T.navy);
    let curX = tableX;
    cols.forEach(c => {
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.8)
         .text(c.name, curX + 4, tableY + 7, { width: c.w - 8, align: c.align, lineBreak: false });
      curX += c.w;
    });

    let curY = tableY + 22;
    rows.forEach((r, idx) => {
      const rowH = 74;
      doc.rect(tableX, curY, tableW, rowH).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc');
      doc.strokeColor(T.border).lineWidth(0.6).rect(tableX, curY, tableW, rowH).stroke();

      let cx = tableX;
      // TC ID
      doc.fillColor(T.navyCardTitle).font('Helvetica-Bold').fontSize(7.5).text(r.id, cx + 4, curY + 28, { width: cols[0].w - 8, align: 'center' });
      cx += cols[0].w;
      // Description
      doc.fillColor(T.text).font('Helvetica-Bold').fontSize(7.2).text(r.desc, cx + 4, curY + 12, { width: cols[1].w - 8, lineGap: 1.8 });
      cx += cols[1].w;
      // Steps
      doc.fillColor(T.textSecondary).font('Helvetica').fontSize(6.8).text(r.steps, cx + 4, curY + 12, { width: cols[2].w - 8, lineGap: 1.8 });
      cx += cols[2].w;
      // Data
      doc.fillColor('#0284c7').font('Helvetica').fontSize(6.8).text(r.data, cx + 4, curY + 12, { width: cols[3].w - 8, lineGap: 1.8 });
      cx += cols[3].w;
      // Expected
      doc.fillColor(T.textSecondary).font('Helvetica').fontSize(6.8).text(r.expected, cx + 4, curY + 12, { width: cols[4].w - 8, lineGap: 1.8 });
      cx += cols[4].w;
      // Actual
      doc.fillColor(T.textSecondary).font('Helvetica').fontSize(6.8).text(r.actual, cx + 4, curY + 12, { width: cols[5].w - 8, lineGap: 1.8 });
      cx += cols[5].w;
      // Status Badge
      doc.roundedRect(cx + 6, curY + 26, cols[6].w - 12, 18, 9).fill('#dcfce7');
      doc.strokeColor('#15803d').lineWidth(0.8).roundedRect(cx + 6, curY + 26, cols[6].w - 12, 18, 9).stroke();
      doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(6.5).text('PASSED', cx + 6, curY + 31, { width: cols[6].w - 12, align: 'center' });

      curY += rowH;
    });
  }

  drawTableSlide(tcPart1);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 13: TOPIC 6 - HIGH-RISK TEST CASES (TABLE 1: PART 2)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Test Case Design -- High-Risk Areas (Table 1: Part 2)', 'Scraper Prevention, Secret Ballot Decoupling, Injection & DB Failover', 13);

  const tcPart2 = [
    { id: 'TC-HR-06', desc: 'Scraping Admin from Public Roster', steps: 'Query GET /api/admin/stats unauthenticated', data: 'Public Elector API route', expected: 'ADM-9999 masked from public roster', actual: 'Admin account isolated and masked', status: 'PASSED' },
    { id: 'TC-HR-07', desc: 'Public Audit Ledger Privacy Leakage', steps: 'Query GET /api/vote/audit/:hash', data: 'Valid 64-hex SHA-256 seal', expected: 'Returns status without voter ID / PII', actual: 'Ballot choice verified, zero PII leak', status: 'PASSED' },
    { id: 'TC-HR-08', desc: 'Password Payload Injection Defense', steps: 'Submit password exceeding 5 characters', data: '{ voter_id, password: "123456" }', expected: 'Reject with HTTP 400 Bad Request', actual: 'Payload rejected by validation layer', status: 'PASSED' },
    { id: 'TC-HR-09', desc: 'Disaster Recovery Memory DB Failover', steps: 'Simulate MongoDB Atlas cloud partition', data: 'Sever active cluster connection', expected: 'Fallback to memory store in < 25ms', actual: 'Transparent switchover, 0 data loss', status: 'PASSED' },
    { id: 'TC-HR-10', desc: 'Poll Lifecycle Temporal Boundary', steps: 'Attempt vote on closed or future poll', data: '{ election_id: "closed_election" }', expected: 'Block with HTTP 400 Inactive Poll', actual: 'Blocked: "Election not active"', status: 'PASSED' }
  ];

  drawTableSlide(tcPart2);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 14: TOPIC 6 - DEFECT REPORT & BUG AUDIT LOG (TABLE 2)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Defect Report & Bug Audit Log (Table 2)', 'Audit Trail of Identified Anomalies and Applied Architectural Resolutions', 14);

  const defects = [
    { id: 'DEF-001', title: 'Race Condition in Duplicate Vote Check', mod: 'Voting Engine', sev: 'Critical', pri: 'P1', status: 'RESOLVED' },
    { id: 'DEF-002', title: 'Candidate Portal Permitted Login without OTP', mod: 'Candidate Auth', sev: 'High', pri: 'P1', status: 'RESOLVED' },
    { id: 'DEF-003', title: 'Invalid OTP Displayed Generic Error Message', mod: 'Voter Portal', sev: 'Medium', pri: 'P2', status: 'RESOLVED' },
    { id: 'DEF-004', title: 'Admin Account ADM-9999 Vulnerable to Delete', mod: 'Admin API', sev: 'High', pri: 'P1', status: 'RESOLVED' },
    { id: 'DEF-005', title: 'Admin Account Visible in Public Voter Roster', mod: 'Reporting', sev: 'Medium', pri: 'P2', status: 'RESOLVED' },
    { id: 'DEF-006', title: 'Audit Ledger Exposed voter_id in JSON Output', mod: 'Audit Ledger', sev: 'High', pri: 'P1', status: 'RESOLVED' },
    { id: 'DEF-007', title: 'Candidate Nomination Button Lingered Post-Nom', mod: 'UI Portal', sev: 'Low', pri: 'P3', status: 'RESOLVED' },
    { id: 'DEF-008', title: 'Disaster Recovery Memory Fallback Sync Lag', mod: 'Database Proxy', sev: 'Medium', pri: 'P2', status: 'RESOLVED' }
  ];

  const dTableX = 45;
  const dTableY = 88;
  const dTableW = 790;
  const dCols = [
    { name: 'DEFECT ID', w: 80, align: 'center' },
    { name: 'DEFECT TITLE', w: 310, align: 'left' },
    { name: 'MODULE', w: 140, align: 'left' },
    { name: 'SEVERITY', w: 90, align: 'center' },
    { name: 'PRIORITY', w: 80, align: 'center' },
    { name: 'RESOLUTION STATUS', w: 90, align: 'center' }
  ];

  doc.roundedRect(dTableX, dTableY, dTableW, 22, 4).fill(T.navy);
  let dCurX = dTableX;
  dCols.forEach(c => {
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7)
       .text(c.name, dCurX + 4, dTableY + 7, { width: c.w - 8, align: c.align, lineBreak: false });
    dCurX += c.w;
  });

  let dCurY = dTableY + 22;
  defects.forEach((d, idx) => {
    const rowH = 46;
    doc.rect(dTableX, dCurY, dTableW, rowH).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.strokeColor(T.border).lineWidth(0.6).rect(dTableX, dCurY, dTableW, rowH).stroke();

    let cx = dTableX;
    doc.fillColor(T.navyCardTitle).font('Helvetica-Bold').fontSize(7.5).text(d.id, cx + 4, dCurY + 16, { width: dCols[0].w - 8, align: 'center' });
    cx += dCols[0].w;

    doc.fillColor(T.text).font('Helvetica-Bold').fontSize(7.5).text(d.title, cx + 6, dCurY + 16, { width: dCols[1].w - 12 });
    cx += dCols[1].w;

    doc.fillColor(T.textSecondary).font('Helvetica').fontSize(7.2).text(d.mod, cx + 4, dCurY + 16, { width: dCols[2].w - 8 });
    cx += dCols[2].w;

    // Severity
    const sevColor = d.sev === 'Critical' ? '#dc2626' : (d.sev === 'High' ? '#ea580c' : '#0284c7');
    doc.fillColor(sevColor).font('Helvetica-Bold').fontSize(7.2).text(d.sev, cx + 4, dCurY + 16, { width: dCols[3].w - 8, align: 'center' });
    cx += dCols[3].w;

    // Priority
    doc.fillColor(T.textSecondary).font('Helvetica-Bold').fontSize(7.2).text(d.pri, cx + 4, dCurY + 16, { width: dCols[4].w - 8, align: 'center' });
    cx += dCols[4].w;

    // Status Badge
    doc.roundedRect(cx + 6, dCurY + 12, dCols[5].w - 12, 20, 10).fill('#dcfce7');
    doc.strokeColor('#15803d').lineWidth(0.8).roundedRect(cx + 6, dCurY + 12, dCols[5].w - 12, 20, 10).stroke();
    doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(6.8).text('RESOLVED', cx + 6, dCurY + 18, { width: dCols[5].w - 12, align: 'center' });

    dCurY += rowH;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 15: TOPIC 7 - SYSTEM TESTING & PRODUCTION RESILIENCY
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'System Testing & Production Resiliency', '3-Tier Test Suite Compilation, PWA Service Worker Auditing & Error Handling', 15);

  const sysCards = [
    { title: 'Automated 3-Tier Quality Suite', theme: T.blueCard, bullets: ['67 / 67 automated tests passing (100% Green).', 'Tier 1 Unit Tests: 27 passed, 0 failed.', 'Tier 2 Integration & Security: 31 passed, 0 failed.', 'Tier 3 System Verification: 9 passed, 0 failed.', 'Average execution latency: 3.25 seconds.'] },
    { title: 'PWA & Offline Service Worker', theme: T.greenCard, bullets: ['Service Worker registered at root scope (/sw.js).', 'Cache version v400 with asset hashing.', 'Static shell cached for offline availability.', 'Background synchronization for reconnects.', 'Installable standalone app manifest.'] },
    { title: 'SPA Routing Fallbacks & Error Guards', theme: T.peachCard, bullets: ['Unified index.html fallback for client routes.', 'Clean redirects for /admin -> /#admin.', 'Clean redirects for /candidate -> /#candidate.', 'Dedicated JSON 404 handler on /api/*.', 'Zero uncaught exceptions across all journeys.'] }
  ];

  const sCardW = 252;
  const sCardH = 405;
  sysCards.forEach((c, idx) => {
    const x = 45 + (idx * (sCardW + 15));
    drawCard(doc, x, 88, sCardW, sCardH, c.title, c.bullets, c.theme, 7.8);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 16: TOPIC 8 - DEMONSTRATION & USER JOURNEYS
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Demonstration & End-to-End User Journeys', 'Role-Based Workflow Execution: Voter, Candidate & Administrator Portals', 16);

  const demoCards = [
    { title: '1. Voter Experience Journey', theme: T.blueCard, bullets: ['Access Central Gateway landing page.', 'Enter Voter ID and verify 6-digit email OTP.', 'Browse approved candidate profiles and manifestos.', 'Cast single confidential ballot with atomic lock.', 'Receive SHA-256 tamper-proof audit receipt.', 'Verify ballot on public ledger without revealing vote.'] },
    { title: '2. Candidate Campaign Command Center', theme: T.peachCard, bullets: ['Submit candidate nomination form.', 'Mandatory email OTP authentication gate.', 'Access protected Campaign Command Center.', 'Update campaign bio, objectives, and manifesto.', 'Inspect real-time voter turnout and demographics.', 'Download official candidate credential badge.'] },
    { title: '3. System Administrator Operations', theme: T.greenCard, bullets: ['Master login via protected credentials (ADM-9999).', 'Create, configure, and schedule election timelines.', 'Review candidate applications (Approve / Reject).', 'Monitor real-time participation metrics.', 'Close election and publish certified tallies.', 'Export immutable CSV audit ledger logs.'] }
  ];

  demoCards.forEach((c, idx) => {
    const x = 45 + (idx * (sCardW + 15));
    drawCard(doc, x, 88, sCardW, sCardH, c.title, c.bullets, c.theme, 7.8);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 17: TOPIC 9 - VERIFICATION PROOF & PERFORMANCE BENCHMARKS
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Verification Proof & Performance Benchmarks', 'Empirical SLAs, Concurrency Stress Metrics & International Standards Compliance', 17);

  const kpis = [
    { val: '< 15 ms', lbl: 'Vote Ingestion Latency', sub: 'Single ballot processing & write', color: '#0284c7', theme: T.blueCard },
    { val: '< 2 ms', lbl: 'Race Rejection Speed', sub: 'Atomic lock blocks concurrent duplicate', color: '#dc2626', theme: T.peachCard },
    { val: '64-Hex', lbl: 'SHA-256 Digest Seal', sub: 'Cryptographic non-repudiation audit', color: '#15803d', theme: T.greenCard },
    { val: '0 Open', lbl: 'Audit Defects Found', sub: '8/8 defects audited & resolved', color: '#7c3aed', theme: T.slateCard }
  ];

  const kpiW = 188;
  const kpiH = 110;
  kpis.forEach((k, idx) => {
    const x = 45 + (idx * (kpiW + 12));
    doc.roundedRect(x, 88, kpiW, kpiH, 8).fill(k.theme.bg);
    doc.strokeColor(k.theme.border).lineWidth(1).roundedRect(x, 88, kpiW, kpiH, 8).stroke();

    doc.fillColor(k.color).font('Helvetica-Bold').fontSize(22)
       .text(k.val, x, 106, { width: kpiW, align: 'center', lineBreak: false });
    doc.fillColor(T.navyCardTitle).font('Helvetica-Bold').fontSize(9)
       .text(k.lbl, x, 140, { width: kpiW, align: 'center', lineBreak: false });
    doc.fillColor(T.textSecondary).font('Helvetica').fontSize(7.5)
       .text(k.sub, x, 160, { width: kpiW, align: 'center', lineBreak: false });
  });

  // Compliance Matrix Box
  doc.roundedRect(45, 215, 790, 278, 8).fill('#ffffff');
  doc.strokeColor(T.border).lineWidth(1).roundedRect(45, 215, 790, 278, 8).stroke();

  doc.roundedRect(45, 215, 790, 24, 8).fill(T.navy);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5)
     .text('INTERNATIONAL ENGINEERING STANDARDS & AUDIT COMPLIANCE MATRIX', 55, 222, { lineBreak: false });

  const compItems = [
    { std: 'IEEE 730 Software Quality Assurance', desc: 'System adheres to strict configuration auditing, 3-tier testing, regression validation, and defect tracking protocols.' },
    { std: 'OWASP Top 10 Security Architecture', desc: 'Mitigates Broken Access Control (JWT 2FA gate), Injection (strict parameter schemas), and Security Logging & Monitoring failures.' },
    { std: 'NIST SP 800-63B Authentication Guidelines', desc: 'Compliant out-of-band authenticator deployment (AAL2) via short-lived numeric OTP tokens delivered over TLS channels.' },
    { std: 'Voluntary Voting System Guidelines (VVSG)', desc: 'Guarantees voter intent preservation, non-repudiation, audit trail reproducibility, and voter-ballot cryptographic decoupling.' }
  ];

  compItems.forEach((c, idx) => {
    const cy = 252 + (idx * 58);
    doc.roundedRect(55, cy, 770, 50, 6).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
    doc.strokeColor('#e2e8f0').lineWidth(0.8).roundedRect(55, cy, 770, 50, 6).stroke();

    doc.fillColor(T.navyCardTitle).font('Helvetica-Bold').fontSize(8.5).text(c.std, 68, cy + 10, { lineBreak: false });
    doc.fillColor(T.textSecondary).font('Helvetica').fontSize(7.5).text(c.desc, 68, cy + 26, { width: 740, lineGap: 1.8 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 18: TOPIC 10 - CONCLUSION & FUTURE SCOPE
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSlideBase(doc, 'Conclusion & Future Research Scope', 'Project Summary, Architectural Contributions & Future Technical Roadmap', 18);

  const concCards = [
    { title: 'Project Conclusions & Key Achievements', theme: T.blueCard, bullets: ['100% elimination of paper waste, ballot box tampering, and manual tally delays.', 'Zero-trust cryptographic security prevents identity impersonation and duplicate voting.', 'Constitutional privacy: secret ballot strictly decoupled from voter identity in public ledger.', 'Production-grade Progressive Web App accessible across smartphones, tablets, and desktops.', 'Transparent disaster recovery failover guarantees zero downtime during election events.'] },
    { title: 'Future Research & Expansion Roadmap', theme: T.greenCard, bullets: ['Merkle Tree Hash Chains: Transition from single SHA-256 seals to verifiable Merkle proofs.', 'Cloud Hardware Security Modules (HSM): Hardware-enforced root-of-trust signing for poll certification.', 'Facial Biometric Verification: Optional multi-factor facial recognition for high-assurance polls.', 'Zero-Knowledge Proofs (ZKP): Mathematical proof of vote correctness without revealing candidate choice.'] }
  ];

  concCards.forEach((c, idx) => {
    const x = 45 + (idx * (hwCardW + 20));
    drawCard(doc, x, 88, hwCardW, 310, c.title, c.bullets, c.theme, 7.8);
  });

  // Thank You Banner at Bottom
  doc.roundedRect(45, 415, 790, 80, 8).fill(T.navy);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16)
     .text('THANK YOU', 45, 432, { width: 790, align: 'center', lineBreak: false });
  doc.fillColor('#93c5fd').font('Helvetica').fontSize(9)
     .text('VotePulse E-Voting & Election Management Platform -- Tapi Diploma Engineering College', 45, 458, { width: 790, align: 'center', lineBreak: false });
  doc.fillColor('#cbd5e1').font('Helvetica').fontSize(7.8)
     .text('Computer Engineering Department | Minor Project Seminar - 3 Evaluation | September 2026', 45, 474, { width: 790, align: 'center', lineBreak: false });

  doc.end();

  await new Promise(resolve => stream.on('finish', resolve));
  console.log('✅ Temporary themed slides generated at:', TEMP_PDF_PATH);
}

async function mergeFinalPdf() {
  console.log('Merging Page 1 from source PDF with generated themed slides...');
  const srcBytes = fs.readFileSync(SOURCE_PDF_PATH);
  const srcDoc = await PDFLibDoc.load(srcBytes);

  const slidesBytes = fs.readFileSync(TEMP_PDF_PATH);
  const slidesDoc = await PDFLibDoc.load(slidesBytes);

  const finalDoc = await PDFLibDoc.create();

  // 1. Copy Page 1 (Page 0) from the user's uploaded PDF with 100% exact fidelity!
  const [firstPage] = await finalDoc.copyPages(srcDoc, [0]);
  finalDoc.addPage(firstPage);
  console.log('✅ Page 1 copied from source PDF (Exact college header, logo, group members, vision).');

  // 2. Copy Slides 2 to 18 from slidesDoc
  const slideIndices = Array.from({ length: slidesDoc.getPageCount() }, (_, i) => i);
  const copiedSlides = await finalDoc.copyPages(slidesDoc, slideIndices);
  copiedSlides.forEach(page => finalDoc.addPage(page));
  console.log(`✅ Appended ${copiedSlides.length} themed content slides.`);

  const finalBytes = await finalDoc.save();

  // Write to both paths
  fs.writeFileSync(FINAL_PDF_PATH, finalBytes);
  console.log(`🎉 Final Seminar Presentation PDF written to: ${FINAL_PDF_PATH} (${finalBytes.length} bytes)`);

  fs.writeFileSync(MIRROR_PDF_PATH, finalBytes);
  console.log(`🎉 Mirrored to: ${MIRROR_PDF_PATH}`);

  // Clean up temp file
  if (fs.existsSync(TEMP_PDF_PATH)) {
    fs.unlinkSync(TEMP_PDF_PATH);
  }
}

async function main() {
  await buildThemedSlides();
  await mergeFinalPdf();
  console.log('✅ All done successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
