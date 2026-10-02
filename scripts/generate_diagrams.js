const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const DIAGRAMS_DIR = path.join(__dirname, '../docs/diagrams');
if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USE CASE DIAGRAM SVG
// ─────────────────────────────────────────────────────────────────────────────
const useCaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 780" width="100%" height="100%" style="background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Title Banner -->
  <rect x="30" y="20" width="1040" height="50" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="30" y="20" width="6" height="50" rx="3" fill="url(#headerGrad)"/>
  <text x="50" y="52" fill="#ffffff" font-size="20" font-weight="bold">VOTEPULSE: USE CASE ARCHITECTURAL MODEL</text>
  <text x="1050" y="52" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="end">UML 2.5 STANDARD SPECIFICATION</text>

  <!-- System Boundary Box -->
  <rect x="250" y="90" width="600" height="660" rx="12" fill="#1e293b" fill-opacity="0.8" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,4" filter="url(#shadow)"/>
  <rect x="250" y="90" width="600" height="34" rx="12" fill="#1e293b"/>
  <text x="550" y="113" fill="#60a5fa" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">SYSTEM BOUNDARY: VOTEPULSE E-VOTING CORE PLATFORM</text>

  <!-- ================= ACTORS (LEFT) ================= -->
  <!-- Actor 1: Voter -->
  <g transform="translate(110, 160)">
    <circle cx="30" cy="20" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="30" y1="36" x2="30" y2="76" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="6" y1="52" x2="54" y2="52" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="10" y2="115" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="50" y2="115" stroke="#38bdf8" stroke-width="2.5"/>
    <rect x="-10" y="125" width="80" height="24" rx="4" fill="#0284c7"/>
    <text x="30" y="141" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">VOTER</text>
  </g>

  <!-- Actor 2: Candidate -->
  <g transform="translate(110, 470)">
    <circle cx="30" cy="20" r="16" fill="#1e293b" stroke="#a855f7" stroke-width="2.5"/>
    <line x1="30" y1="36" x2="30" y2="76" stroke="#a855f7" stroke-width="2.5"/>
    <line x1="6" y1="52" x2="54" y2="52" stroke="#a855f7" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="10" y2="115" stroke="#a855f7" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="50" y2="115" stroke="#a855f7" stroke-width="2.5"/>
    <rect x="-15" y="125" width="90" height="24" rx="4" fill="#7c3aed"/>
    <text x="30" y="141" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">CANDIDATE</text>
  </g>

  <!-- ================= ACTORS (RIGHT) ================= -->
  <!-- Actor 3: System Administrator -->
  <g transform="translate(930, 200)">
    <circle cx="30" cy="20" r="16" fill="#1e293b" stroke="#10b981" stroke-width="2.5"/>
    <line x1="30" y1="36" x2="30" y2="76" stroke="#10b981" stroke-width="2.5"/>
    <line x1="6" y1="52" x2="54" y2="52" stroke="#10b981" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="10" y2="115" stroke="#10b981" stroke-width="2.5"/>
    <line x1="30" y1="76" x2="50" y2="115" stroke="#10b981" stroke-width="2.5"/>
    <rect x="-30" y="125" width="120" height="24" rx="4" fill="#059669"/>
    <text x="30" y="141" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">SYSTEM ADMIN</text>
  </g>

  <!-- Actor 4: External Google SMTP Service -->
  <g transform="translate(915, 500)">
    <rect x="-20" y="20" width="100" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="30" y="45" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">&lt;&lt;Service&gt;&gt;</text>
    <text x="30" y="65" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Google SMTP</text>
    <text x="30" y="78" fill="#94a3b8" font-size="9" text-anchor="middle">Mail Dispatch</text>
  </g>

  <!-- ================= USE CASES (OVALS) ================= -->
  <!-- UC 1: Register Account -->
  <g transform="translate(300, 150)">
    <ellipse cx="90" cy="22" rx="85" ry="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="90" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC1: Register Account</text>
  </g>

  <!-- UC 2: 2FA Email OTP Verification -->
  <g transform="translate(560, 175)">
    <ellipse cx="105" cy="24" rx="100" ry="24" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="105" y="28" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">&lt;&lt;include&gt;&gt; UC2: 2FA Email OTP</text>
  </g>

  <!-- UC 3: Authenticate & Login -->
  <g transform="translate(300, 225)">
    <ellipse cx="90" cy="22" rx="85" ry="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="90" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC3: Authenticate &amp; Login</text>
  </g>

  <!-- UC 4: Explore Active Polls & Manifestos -->
  <g transform="translate(300, 300)">
    <ellipse cx="90" cy="22" rx="85" ry="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="90" y="26" fill="#f8fafc" font-size="10.5" font-weight="bold" text-anchor="middle">UC4: Review Manifestos</text>
  </g>

  <!-- UC 5: Cast Single Ballot -->
  <g transform="translate(300, 375)">
    <ellipse cx="90" cy="24" rx="85" ry="24" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
    <text x="90" y="29" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">UC5: Cast Single Ballot</text>
  </g>

  <!-- UC 6: Cryptographic Sealing & Receipt -->
  <g transform="translate(560, 375)">
    <ellipse cx="105" cy="24" rx="100" ry="24" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
    <text x="105" y="29" fill="#6ee7b7" font-size="11" font-weight="bold" text-anchor="middle">&lt;&lt;include&gt;&gt; UC6: SHA-256 Seal</text>
  </g>

  <!-- UC 7: Candidate Self-Nomination -->
  <g transform="translate(300, 480)">
    <ellipse cx="90" cy="22" rx="85" ry="22" fill="#0f172a" stroke="#a855f7" stroke-width="1.8"/>
    <text x="90" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC7: Submit Nomination</text>
  </g>

  <!-- UC 8: Campaign Command Center -->
  <g transform="translate(300, 550)">
    <ellipse cx="90" cy="22" rx="85" ry="22" fill="#0f172a" stroke="#a855f7" stroke-width="1.8"/>
    <text x="90" y="26" fill="#f8fafc" font-size="10.5" font-weight="bold" text-anchor="middle">UC8: Command Center</text>
  </g>

  <!-- UC 9: Manage Elections Lifecycle -->
  <g transform="translate(580, 260)">
    <ellipse cx="95" cy="22" rx="90" ry="22" fill="#0f172a" stroke="#10b981" stroke-width="1.8"/>
    <text x="95" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC9: Manage Polls (Lifecycle)</text>
  </g>

  <!-- UC 10: Inspect Analytics & Live Tally -->
  <g transform="translate(580, 500)">
    <ellipse cx="95" cy="22" rx="90" ry="22" fill="#0f172a" stroke="#10b981" stroke-width="1.8"/>
    <text x="95" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC10: Live Analytics Tally</text>
  </g>

  <!-- UC 11: Export Verified Audit CSV -->
  <g transform="translate(580, 575)">
    <ellipse cx="95" cy="22" rx="90" ry="22" fill="#0f172a" stroke="#10b981" stroke-width="1.8"/>
    <text x="95" y="26" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">UC11: Export Audit CSV</text>
  </g>

  <!-- UC 12: Public Audit Verification -->
  <g transform="translate(440, 660)">
    <ellipse cx="105" cy="22" rx="100" ry="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="105" y="26" fill="#f8fafc" font-size="10.5" font-weight="bold" text-anchor="middle">UC12: Public Audit Verification</text>
  </g>

  <!-- ================= CONNECTORS ================= -->
  <!-- Voter to Use Cases -->
  <line x1="170" y1="210" x2="300" y2="172" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="170" y1="210" x2="300" y2="247" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="170" y1="210" x2="300" y2="322" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="170" y1="210" x2="300" y2="399" stroke="#38bdf8" stroke-width="2"/>
  <line x1="170" y1="210" x2="440" y2="682" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,3"/>

  <!-- Candidate to Use Cases -->
  <line x1="170" y1="520" x2="300" y2="502" stroke="#a855f7" stroke-width="1.5"/>
  <line x1="170" y1="520" x2="300" y2="572" stroke="#a855f7" stroke-width="1.5"/>

  <!-- Admin to Use Cases -->
  <line x1="930" y1="260" x2="770" y2="282" stroke="#10b981" stroke-width="1.5"/>
  <line x1="930" y1="260" x2="770" y2="522" stroke="#10b981" stroke-width="1.5"/>
  <line x1="930" y1="260" x2="770" y2="597" stroke="#10b981" stroke-width="1.5"/>

  <!-- Include Relationships (Dashed with arrow) -->
  <line x1="470" y1="172" x2="560" y2="192" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,4"/>
  <line x1="470" y1="247" x2="560" y2="205" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,4"/>
  <line x1="470" y1="502" x2="580" y2="215" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="5,4"/>
  <line x1="470" y1="572" x2="590" y2="218" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="5,4"/>
  <line x1="470" y1="399" x2="560" y2="399" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4"/>

  <!-- Google SMTP to UC2 -->
  <line x1="915" y1="530" x2="760" y2="215" stroke="#f59e0b" stroke-width="1.5"/>
</svg>`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, 'use_case_diagram.svg'), useCaseSvg);
console.log('✅ Generated: docs/diagrams/use_case_diagram.svg');

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEQUENCE DIAGRAM SVG
// ─────────────────────────────────────────────────────────────────────────────
const sequenceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 760" width="100%" height="100%" style="background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
    </marker>
    <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
    <marker id="arrowPurple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="30" y="20" width="1040" height="48" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="30" y="20" width="6" height="48" rx="3" fill="#38bdf8"/>
  <text x="50" y="50" fill="#ffffff" font-size="18" font-weight="bold">VOTEPULSE: END-TO-END SECURE BALLOT CASTING SEQUENCE DIAGRAM</text>
  <text x="1050" y="50" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">CONCURRENCY &amp; CRYPTOGRAPHIC SEAL FLOW</text>

  <!-- Lifeline Headers -->
  <!-- 1. Voter Client -->
  <rect x="40" y="90" width="120" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="100" y="115" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Voter (PWA Client)</text>
  <line x1="100" y1="130" x2="100" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- 2. React Portal -->
  <rect x="220" y="90" width="130" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="285" y="115" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">VoterPortal (React)</text>
  <line x1="285" y1="130" x2="285" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- 3. Express REST API -->
  <rect x="420" y="90" width="130" height="40" rx="6" fill="#1e293b" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="485" y="115" fill="#60a5fa" font-size="12" font-weight="bold" text-anchor="middle">Express Server (/api)</text>
  <line x1="485" y1="130" x2="485" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- 4. Security Middleware -->
  <rect x="610" y="90" width="130" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="675" y="115" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">Security Middleware</text>
  <line x1="675" y1="130" x2="675" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- 5. Cipher & Hash Engine -->
  <rect x="790" y="90" width="130" height="40" rx="6" fill="#1e293b" stroke="#c084fc" stroke-width="1.5"/>
  <text x="855" y="115" fill="#c084fc" font-size="12" font-weight="bold" text-anchor="middle">Crypto / Hash Engine</text>
  <line x1="855" y1="130" x2="855" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- 6. Database Layer -->
  <rect x="960" y="90" width="110" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="1015" y="115" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">Database / Memory</text>
  <line x1="1015" y1="130" x2="1015" y2="720" stroke="#334155" stroke-dasharray="4,4"/>

  <!-- Activations -->
  <rect x="95" y="150" width="10" height="540" fill="#334155"/>
  <rect x="280" y="155" width="10" height="520" fill="#334155"/>
  <rect x="480" y="210" width="10" height="440" fill="#3b82f6"/>
  <rect x="670" y="240" width="10" height="150" fill="#f59e0b"/>
  <rect x="850" y="440" width="10" height="90" fill="#a855f7"/>
  <rect x="1010" y="320" width="10" height="270" fill="#10b981"/>

  <!-- Step 1: User clicks vote -->
  <line x1="105" y1="170" x2="280" y2="170" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#arrow)"/>
  <text x="190" y="163" fill="#e2e8f0" font-size="10.5" text-anchor="middle">1. Select Candidate &amp; Confirm Vote</text>

  <!-- Step 2: HTTP POST /api/vote -->
  <line x1="290" y1="215" x2="480" y2="215" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="385" y="208" fill="#38bdf8" font-size="10.5" font-weight="bold" text-anchor="middle">2. POST /api/vote {election_id, voter_id, candidate_id}</text>

  <!-- Step 3: Validate input schema -->
  <line x1="490" y1="245" x2="670" y2="245" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arrow)"/>
  <text x="580" y="238" fill="#f59e0b" font-size="10.5" text-anchor="middle">3. validateVoteCast(req.body)</text>

  <!-- Step 4: Check election active status -->
  <line x1="680" y1="280" x2="1010" y2="280" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="845" y="273" fill="#cbd5e1" font-size="10" text-anchor="middle">4. Check Election.status === 'Active'</text>

  <!-- Step 5: Pre-write ledger check -->
  <line x1="680" y1="330" x2="1010" y2="330" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arrow)"/>
  <text x="845" y="323" fill="#f59e0b" font-size="10.5" font-weight="bold" text-anchor="middle">5. Check user.has_voted &amp; Lock Voter Status</text>

  <!-- Alt Fragment: Double Vote Conflict -->
  <rect x="440" y="355" width="600" height="65" rx="4" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,2"/>
  <text x="450" y="372" fill="#ef4444" font-size="9.5" font-weight="bold">[ALT: If already voted (Race Condition Attempt)]</text>
  <line x1="480" y1="400" x2="290" y2="400" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrowRed)"/>
  <text x="385" y="394" fill="#fca5a5" font-size="10" font-weight="bold" text-anchor="middle">HTTP 400 Bad Request {already_voted: true}</text>

  <!-- Step 6: Invoke Hash Engine -->
  <line x1="490" y1="450" x2="850" y2="450" stroke="#c084fc" stroke-width="1.8" marker-end="url(#arrowPurple)"/>
  <text x="670" y="443" fill="#c084fc" font-size="10.5" font-weight="bold" text-anchor="middle">6. sha256Hash(ballotPayload) &amp; caesarCipherEncrypt(raw, 3)</text>

  <!-- Step 7: Return cryptographic seal -->
  <line x1="850" y1="510" x2="490" y2="510" stroke="#c084fc" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrowPurple)"/>
  <text x="670" y="503" fill="#c084fc" font-size="10" text-anchor="middle">7. Return {sha256_seal, caesar_hash, receipt_id}</text>

  <!-- Step 8: Persist Vote -->
  <line x1="490" y1="550" x2="1010" y2="550" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <text x="750" y="543" fill="#10b981" font-size="10.5" font-weight="bold" text-anchor="middle">8. Persist Vote Record &amp; Set voter.has_voted = true</text>

  <!-- Step 9: HTTP 201 Success -->
  <line x1="480" y1="610" x2="290" y2="610" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <text x="385" y="603" fill="#10b981" font-size="10.5" font-weight="bold" text-anchor="middle">9. HTTP 201 Created {success: true, vote: {receipt_id, sha256_seal}}</text>

  <!-- Step 10: Render Receipt -->
  <line x1="280" y1="650" x2="105" y2="650" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#arrow)"/>
  <text x="190" y="643" fill="#e2e8f0" font-size="10.5" text-anchor="middle">10. Display Verified Receipt &amp; Lock Ballot</text>
</svg>`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, 'sequence_diagram.svg'), sequenceSvg);
console.log('✅ Generated: docs/diagrams/sequence_diagram.svg');

// ─────────────────────────────────────────────────────────────────────────────
// 3. ENTITY-RELATIONSHIP (ER) DIAGRAM SVG
// ─────────────────────────────────────────────────────────────────────────────
const erSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 760" width="100%" height="100%" style="background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <defs>
    <filter id="erShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Title Banner -->
  <rect x="30" y="20" width="1040" height="48" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="30" y="20" width="6" height="48" rx="3" fill="#10b981"/>
  <text x="50" y="50" fill="#ffffff" font-size="18" font-weight="bold">VOTEPULSE: ENTITY-RELATIONSHIP (ER) SCHEMA ARCHITECTURE</text>
  <text x="1050" y="50" fill="#10b981" font-size="12" font-weight="bold" text-anchor="end">MONGOOSE DATA MODELS &amp; SECRET BALLOT RELATIONS</text>

  <!-- ================= ENTITY 1: USER ================= -->
  <g transform="translate(60, 110)" filter="url(#erShadow)">
    <rect x="0" y="0" width="220" height="230" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <rect x="0" y="0" width="220" height="32" rx="6" fill="#0284c7"/>
    <text x="110" y="21" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">USER (Voter / Admin)</text>
    
    <text x="12" y="54" fill="#38bdf8" font-size="10.5" font-weight="bold">PK voter_id</text><text x="95" y="54" fill="#94a3b8" font-size="10">: String (Required)</text>
    <text x="12" y="76" fill="#ffffff" font-size="10.5">name</text><text x="60" y="76" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="98" fill="#ffffff" font-size="10.5">email</text><text x="60" y="98" fill="#94a3b8" font-size="10">: String (Unique)</text>
    <text x="12" y="120" fill="#ffffff" font-size="10.5">phone</text><text x="60" y="120" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="142" fill="#ffffff" font-size="10.5">password_hash</text><text x="100" y="142" fill="#94a3b8" font-size="10">: SHA-256</text>
    <text x="12" y="164" fill="#ffffff" font-size="10.5">role</text><text x="60" y="164" fill="#94a3b8" font-size="10">: 'voter' | 'admin'</text>
    <text x="12" y="186" fill="#ef4444" font-size="10.5" font-weight="bold">has_voted</text><text x="80" y="186" fill="#94a3b8" font-size="10">: Boolean (Default: false)</text>
    <text x="12" y="208" fill="#ffffff" font-size="10.5">created_at</text><text x="80" y="208" fill="#94a3b8" font-size="10">: Date</text>
  </g>

  <!-- ================= ENTITY 2: OTP_TOKEN ================= -->
  <g transform="translate(60, 460)" filter="url(#erShadow)">
    <rect x="0" y="0" width="220" height="170" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <rect x="0" y="0" width="220" height="32" rx="6" fill="#d97706"/>
    <text x="110" y="21" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">OTP_TOKEN (2FA)</text>

    <text x="12" y="54" fill="#f59e0b" font-size="10.5" font-weight="bold">PK token_id</text><text x="95" y="54" fill="#94a3b8" font-size="10">: ObjectId</text>
    <text x="12" y="76" fill="#38bdf8" font-size="10.5" font-weight="bold">FK voter_id</text><text x="95" y="76" fill="#94a3b8" font-size="10">: String -> User</text>
    <text x="12" y="98" fill="#ffffff" font-size="10.5">token_code</text><text x="80" y="98" fill="#94a3b8" font-size="10">: String (6-Digits)</text>
    <text x="12" y="120" fill="#ffffff" font-size="10.5">expires_at</text><text x="80" y="120" fill="#94a3b8" font-size="10">: Date (10-min TTL)</text>
    <text x="12" y="142" fill="#ffffff" font-size="10.5">is_used</text><text x="80" y="142" fill="#94a3b8" font-size="10">: Boolean (Single-use)</text>
  </g>

  <!-- ================= ENTITY 3: ELECTION ================= -->
  <g transform="translate(440, 110)" filter="url(#erShadow)">
    <rect x="0" y="0" width="220" height="230" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <rect x="0" y="0" width="220" height="32" rx="6" fill="#2563eb"/>
    <text x="110" y="21" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">ELECTION</text>

    <text x="12" y="54" fill="#60a5fa" font-size="10.5" font-weight="bold">PK election_id</text><text x="100" y="54" fill="#94a3b8" font-size="10">: String (e.g. 101)</text>
    <text x="12" y="76" fill="#ffffff" font-size="10.5">title</text><text x="60" y="76" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="98" fill="#ffffff" font-size="10.5">description</text><text x="80" y="98" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="120" fill="#ffffff" font-size="10.5">status</text><text x="60" y="120" fill="#94a3b8" font-size="10">: 'Active' | 'Closed'</text>
    <text x="12" y="142" fill="#ffffff" font-size="10.5">start_date</text><text x="80" y="142" fill="#94a3b8" font-size="10">: Date</text>
    <text x="12" y="164" fill="#ffffff" font-size="10.5">end_date</text><text x="80" y="164" fill="#94a3b8" font-size="10">: Date</text>
    <text x="12" y="186" fill="#ffffff" font-size="10.5">total_votes</text><text x="80" y="186" fill="#94a3b8" font-size="10">: Number</text>
    <text x="12" y="208" fill="#ffffff" font-size="10.5">created_at</text><text x="80" y="208" fill="#94a3b8" font-size="10">: Date</text>
  </g>

  <!-- ================= ENTITY 4: CANDIDATE ================= -->
  <g transform="translate(800, 110)" filter="url(#erShadow)">
    <rect x="0" y="0" width="230" height="230" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
    <rect x="0" y="0" width="230" height="32" rx="6" fill="#7c3aed"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">CANDIDATE</text>

    <text x="12" y="54" fill="#c084fc" font-size="10.5" font-weight="bold">PK candidate_id</text><text x="115" y="54" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="76" fill="#60a5fa" font-size="10.5" font-weight="bold">FK election_id</text><text x="100" y="76" fill="#94a3b8" font-size="10">: String -> Election</text>
    <text x="12" y="98" fill="#ffffff" font-size="10.5">name</text><text x="60" y="98" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="120" fill="#ffffff" font-size="10.5">party</text><text x="60" y="120" fill="#94a3b8" font-size="10">: String (Affiliation)</text>
    <text x="12" y="142" fill="#ffffff" font-size="10.5">email</text><text x="60" y="142" fill="#94a3b8" font-size="10">: String (Verified)</text>
    <text x="12" y="164" fill="#ffffff" font-size="10.5">manifesto</text><text x="80" y="164" fill="#94a3b8" font-size="10">: String</text>
    <text x="12" y="186" fill="#ffffff" font-size="10.5">votes_count</text><text x="85" y="186" fill="#94a3b8" font-size="10">: Number (Tally)</text>
    <text x="12" y="208" fill="#ffffff" font-size="10.5">created_at</text><text x="80" y="208" fill="#94a3b8" font-size="10">: Date</text>
  </g>

  <!-- ================= ENTITY 5: VOTE (DECOUPLED AUDIT LEDGER) ================= -->
  <g transform="translate(440, 460)" filter="url(#erShadow)">
    <rect x="0" y="0" width="260" height="210" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <rect x="0" y="0" width="260" height="32" rx="6" fill="#059669"/>
    <text x="130" y="21" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">VOTE (Audit Ledger Seal)</text>

    <text x="12" y="54" fill="#34d399" font-size="10.5" font-weight="bold">PK vote_id</text><text x="95" y="54" fill="#94a3b8" font-size="10">: ObjectId</text>
    <text x="12" y="76" fill="#60a5fa" font-size="10.5" font-weight="bold">FK election_id</text><text x="100" y="76" fill="#94a3b8" font-size="10">: String -> Election</text>
    <text x="12" y="98" fill="#c084fc" font-size="10.5" font-weight="bold">FK candidate_id</text><text x="110" y="98" fill="#94a3b8" font-size="10">: String -> Candidate</text>
    <text x="12" y="120" fill="#ffffff" font-size="10.5">sha256_seal</text><text x="95" y="120" fill="#94a3b8" font-size="10">: String (64-Hex)</text>
    <text x="12" y="142" fill="#ffffff" font-size="10.5">caesar_hash</text><text x="95" y="142" fill="#94a3b8" font-size="10">: String (Key=3)</text>
    <text x="12" y="164" fill="#ffffff" font-size="10.5">receipt_id</text><text x="95" y="164" fill="#94a3b8" font-size="10">: String (RCT-xxxx)</text>
    <text x="12" y="186" fill="#ffffff" font-size="10.5">timestamp</text><text x="95" y="186" fill="#94a3b8" font-size="10">: Date / Epoch ms</text>
    
    <!-- Secret Ballot Privacy Callout -->
    <rect x="5" y="193" width="250" height="15" fill="#0f172a"/>
    <text x="130" y="204" fill="#f59e0b" font-size="8.5" font-weight="bold" text-anchor="middle">* voter_id STRICTLY EXCLUDED (SECRET BALLOT)</text>
  </g>

  <!-- ================= RELATIONSHIP LINES & CARDINALITY ================= -->
  <!-- User to OTP_Token (1 : N) -->
  <line x1="170" y1="340" x2="170" y2="460" stroke="#f59e0b" stroke-width="2"/>
  <text x="180" y="360" fill="#f59e0b" font-size="12" font-weight="bold">1</text>
  <text x="180" y="445" fill="#f59e0b" font-size="12" font-weight="bold">N</text>

  <!-- Election to Candidate (1 : N) -->
  <line x1="660" y1="220" x2="800" y2="220" stroke="#3b82f6" stroke-width="2"/>
  <text x="675" y="210" fill="#60a5fa" font-size="12" font-weight="bold">1</text>
  <text x="785" y="210" fill="#60a5fa" font-size="12" font-weight="bold">N</text>

  <!-- Election to Vote (1 : N) -->
  <line x1="550" y1="340" x2="550" y2="460" stroke="#10b981" stroke-width="2"/>
  <text x="560" y="360" fill="#34d399" font-size="12" font-weight="bold">1</text>
  <text x="560" y="445" fill="#34d399" font-size="12" font-weight="bold">N</text>

  <!-- Candidate to Vote (1 : N) -->
  <path d="M 850 340 L 850 540 L 700 540" fill="none" stroke="#a855f7" stroke-width="2"/>
  <text x="860" y="360" fill="#c084fc" font-size="12" font-weight="bold">1</text>
  <text x="720" y="530" fill="#c084fc" font-size="12" font-weight="bold">N</text>

  <!-- User Participation Lock Line (Abstract 1 : 1 Election Link) -->
  <path d="M 280 220 L 440 220" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,4"/>
  <text x="360" y="210" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">has_voted Flag</text>
</svg>`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, 'er_diagram.svg'), erSvg);
console.log('✅ Generated: docs/diagrams/er_diagram.svg');

// ─────────────────────────────────────────────────────────────────────────────
// 4. DATA FLOW DIAGRAM (DFD) LEVEL 0 SVG
// ─────────────────────────────────────────────────────────────────────────────
const dfd0Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" width="100%" height="100%" style="background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <defs>
    <marker id="dfdArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="dfdArrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="dfdArrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="30" y="20" width="1040" height="48" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="30" y="20" width="6" height="48" rx="3" fill="#f59e0b"/>
  <text x="50" y="50" fill="#ffffff" font-size="18" font-weight="bold">DATA FLOW DIAGRAM (DFD) LEVEL 0: CONTEXT MODEL</text>
  <text x="1050" y="50" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="end">SYSTEM BOUNDARY &amp; EXTERNAL ENTITY INTERACTIONS</text>

  <!-- Central Process: 0.0 VotePulse Core System -->
  <g transform="translate(420, 240)">
    <circle cx="130" cy="130" r="120" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
    <circle cx="130" cy="130" r="112" fill="#0f172a" stroke="#60a5fa" stroke-width="1"/>
    <text x="130" y="105" fill="#60a5fa" font-size="13" font-weight="bold" text-anchor="middle">PROCESS 0.0</text>
    <text x="130" y="130" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">VOTEPULSE</text>
    <text x="130" y="152" fill="#e2e8f0" font-size="12" text-anchor="middle">E-Voting Management</text>
    <text x="130" y="170" fill="#94a3b8" font-size="11" text-anchor="middle">&amp; Security System</text>
  </g>

  <!-- External Entity 1: Voter (Left) -->
  <g transform="translate(60, 290)">
    <rect x="0" y="0" width="140" height="80" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="70" y="35" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">EXTERNAL ENTITY</text>
    <text x="70" y="58" fill="#ffffff" font-size="15" font-weight="bold" text-anchor="middle">VOTER</text>
  </g>

  <!-- External Entity 2: Candidate (Bottom Left) -->
  <g transform="translate(180, 550)">
    <rect x="0" y="0" width="160" height="80" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
    <text x="80" y="35" fill="#c084fc" font-size="13" font-weight="bold" text-anchor="middle">EXTERNAL ENTITY</text>
    <text x="80" y="58" fill="#ffffff" font-size="15" font-weight="bold" text-anchor="middle">CANDIDATE</text>
  </g>

  <!-- External Entity 3: System Administrator (Right) -->
  <g transform="translate(890, 290)">
    <rect x="0" y="0" width="160" height="80" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="80" y="35" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">EXTERNAL ENTITY</text>
    <text x="80" y="58" fill="#ffffff" font-size="15" font-weight="bold" text-anchor="middle">SYSTEM ADMIN</text>
  </g>

  <!-- External Entity 4: Google SMTP Gateway (Top) -->
  <g transform="translate(470, 95)">
    <rect x="0" y="0" width="160" height="70" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="80" y="30" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">EXTERNAL SERVICE</text>
    <text x="80" y="50" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">Google SMTP API</text>
  </g>

  <!-- Data Flows: Voter <-> System -->
  <path d="M 200 315 L 430 315" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#dfdArrow)"/>
  <text x="315" y="305" fill="#e2e8f0" font-size="9.5" text-anchor="middle">Credentials, 6-Digit OTP, Ballot Choice</text>

  <path d="M 430 355 L 200 355" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#dfdArrow)"/>
  <text x="315" y="372" fill="#38bdf8" font-size="9.5" text-anchor="middle">Poll Manifestos, Sealed Ballot Receipt</text>

  <!-- Data Flows: Candidate <-> System -->
  <path d="M 340 570 L 470 450" fill="none" stroke="#a855f7" stroke-width="1.8" marker-end="url(#dfdArrow)"/>
  <text x="360" y="495" fill="#c084fc" font-size="9.5" text-anchor="middle">Nomination Details, Manifesto Updates</text>

  <path d="M 510 470 L 340 600" fill="none" stroke="#a855f7" stroke-width="1.8" marker-end="url(#dfdArrow)"/>
  <text x="440" y="565" fill="#c084fc" font-size="9.5" text-anchor="middle">Official Ticket, Live Turnout Analytics</text>

  <!-- Data Flows: System <-> Admin -->
  <path d="M 890 315 L 670 315" fill="none" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfdArrowGreen)"/>
  <text x="780" y="305" fill="#e2e8f0" font-size="9.5" text-anchor="middle">Master Auth, Poll Controls, State Toggles</text>

  <path d="M 670 355 L 890 355" fill="none" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfdArrowGreen)"/>
  <text x="780" y="372" fill="#34d399" font-size="9.5" text-anchor="middle">Live Election Metrics, Verified CSV Export</text>

  <!-- Data Flows: System <-> Google SMTP -->
  <path d="M 525 240 L 525 165" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#dfdArrowAmber)"/>
  <text x="440" y="200" fill="#f59e0b" font-size="9.5" text-anchor="end">OTP Payload &amp; Recipient</text>

  <path d="M 575 165 L 575 240" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#dfdArrowAmber)"/>
  <text x="590" y="200" fill="#f59e0b" font-size="9.5" text-anchor="start">Delivery Confirmation</text>
</svg>`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, 'dfd_level_0.svg'), dfd0Svg);
console.log('✅ Generated: docs/diagrams/dfd_level_0.svg');

// ─────────────────────────────────────────────────────────────────────────────
// 5. DATA FLOW DIAGRAM (DFD) LEVEL 1 SVG
// ─────────────────────────────────────────────────────────────────────────────
const dfd1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 760" width="100%" height="100%" style="background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <defs>
    <marker id="dfd1Arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="dfd1Green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
    </marker>
    <marker id="dfd1Amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="30" y="20" width="1040" height="48" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <rect x="30" y="20" width="6" height="48" rx="3" fill="#38bdf8"/>
  <text x="50" y="50" fill="#ffffff" font-size="18" font-weight="bold">DATA FLOW DIAGRAM (DFD) LEVEL 1: DETAILED PROCESS DECOMPOSITION</text>
  <text x="1050" y="50" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">PROCESSES, DATA FLOWS &amp; DATA STORES</text>

  <!-- ================= PROCESSES (CIRCLES) ================= -->
  <!-- Process 1.0: Auth & 2FA Engine -->
  <g transform="translate(180, 140)">
    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="50" y="42" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">1.0</text>
    <text x="50" y="58" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">Auth &amp; 2FA</text>
    <text x="50" y="70" fill="#94a3b8" font-size="8.5" text-anchor="middle">Engine</text>
  </g>

  <!-- Process 2.0: Election Lifecycle -->
  <g transform="translate(800, 140)">
    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="50" y="42" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">2.0</text>
    <text x="50" y="58" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">Election</text>
    <text x="50" y="70" fill="#94a3b8" font-size="8.5" text-anchor="middle">Lifecycle</text>
  </g>

  <!-- Process 3.0: Candidate Nomination -->
  <g transform="translate(180, 360)">
    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
    <text x="50" y="42" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">3.0</text>
    <text x="50" y="58" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">Candidate</text>
    <text x="50" y="70" fill="#94a3b8" font-size="8.5" text-anchor="middle">Nomination</text>
  </g>

  <!-- Process 4.0: Atomic Single-Vote Engine -->
  <g transform="translate(500, 360)">
    <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#ef4444" stroke-width="2.5"/>
    <text x="50" y="40" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">4.0</text>
    <text x="50" y="56" fill="#ffffff" font-size="10.5" font-weight="bold" text-anchor="middle">Atomic Vote</text>
    <text x="50" y="70" fill="#fca5a5" font-size="9" text-anchor="middle">Engine</text>
  </g>

  <!-- Process 5.0: Cryptographic Sealing -->
  <g transform="translate(500, 580)">
    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="50" y="42" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">5.0</text>
    <text x="50" y="58" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">Crypto Seal</text>
    <text x="50" y="70" fill="#94a3b8" font-size="8.5" text-anchor="middle">&amp; Receipt</text>
  </g>

  <!-- Process 6.0: Live Tally & CSV Export -->
  <g transform="translate(800, 580)">
    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="50" y="42" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">6.0</text>
    <text x="50" y="58" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">Live Tally</text>
    <text x="50" y="70" fill="#94a3b8" font-size="8.5" text-anchor="middle">&amp; Export</text>
  </g>

  <!-- ================= DATA STORES (PARALLEL LINES) ================= -->
  <!-- D1: Users Store -->
  <g transform="translate(480, 150)">
    <line x1="0" y1="0" x2="140" y2="0" stroke="#60a5fa" stroke-width="2"/>
    <line x1="0" y1="40" x2="140" y2="40" stroke="#60a5fa" stroke-width="2"/>
    <rect x="0" y="0" width="140" height="40" fill="#1e293b" fill-opacity="0.6"/>
    <text x="15" y="25" fill="#38bdf8" font-size="10" font-weight="bold">D1</text>
    <text x="40" y="25" fill="#ffffff" font-size="11">Users &amp; Electors</text>
  </g>

  <!-- D2: OTP Store -->
  <g transform="translate(50, 240)">
    <line x1="0" y1="0" x2="120" y2="0" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="36" x2="120" y2="36" stroke="#f59e0b" stroke-width="2"/>
    <rect x="0" y="0" width="120" height="36" fill="#1e293b" fill-opacity="0.6"/>
    <text x="12" y="23" fill="#f59e0b" font-size="10" font-weight="bold">D2</text>
    <text x="35" y="23" fill="#ffffff" font-size="10.5">OTP Tokens</text>
  </g>

  <!-- D3: Elections Store -->
  <g transform="translate(800, 290)">
    <line x1="0" y1="0" x2="140" y2="0" stroke="#10b981" stroke-width="2"/>
    <line x1="0" y1="36" x2="140" y2="36" stroke="#10b981" stroke-width="2"/>
    <rect x="0" y="0" width="140" height="36" fill="#1e293b" fill-opacity="0.6"/>
    <text x="15" y="23" fill="#34d399" font-size="10" font-weight="bold">D3</text>
    <text x="40" y="23" fill="#ffffff" font-size="11">Elections Store</text>
  </g>

  <!-- D4: Candidates Store -->
  <g transform="translate(280, 480)">
    <line x1="0" y1="0" x2="130" y2="0" stroke="#a855f7" stroke-width="2"/>
    <line x1="0" y1="36" x2="130" y2="36" stroke="#a855f7" stroke-width="2"/>
    <rect x="0" y="0" width="130" height="36" fill="#1e293b" fill-opacity="0.6"/>
    <text x="15" y="23" fill="#c084fc" font-size="10" font-weight="bold">D4</text>
    <text x="40" y="23" fill="#ffffff" font-size="10.5">Candidates</text>
  </g>

  <!-- D5: Votes Store (Audit Ledger) -->
  <g transform="translate(680, 480)">
    <line x1="0" y1="0" x2="140" y2="0" stroke="#38bdf8" stroke-width="2"/>
    <line x1="0" y1="40" x2="140" y2="40" stroke="#38bdf8" stroke-width="2"/>
    <rect x="0" y="0" width="140" height="40" fill="#1e293b" fill-opacity="0.6"/>
    <text x="15" y="25" fill="#38bdf8" font-size="10" font-weight="bold">D5</text>
    <text x="40" y="25" fill="#ffffff" font-size="10.5">Sealed Vote Ledger</text>
  </g>

  <!-- ================= EXTERNAL ENTITIES ================= -->
  <!-- Voter -->
  <rect x="40" y="150" width="90" height="50" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="85" y="180" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">VOTER</text>

  <!-- Admin -->
  <rect x="970" y="150" width="90" height="50" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.8"/>
  <text x="1015" y="180" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">ADMIN</text>

  <!-- ================= FLOW PIPELINES ================= -->
  <!-- Voter to 1.0 -->
  <line x1="130" y1="175" x2="180" y2="175" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#dfd1Arrow)"/>
  <!-- 1.0 to D1 -->
  <line x1="270" y1="170" x2="480" y2="170" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#dfd1Arrow)"/>
  <!-- 1.0 to D2 -->
  <line x1="200" y1="230" x2="140" y2="245" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#dfd1Amber)"/>
  
  <!-- Admin to 2.0 -->
  <line x1="970" y1="175" x2="890" y2="175" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfd1Green)"/>
  <!-- 2.0 to D3 -->
  <line x1="850" y1="230" x2="850" y2="290" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfd1Green)"/>

  <!-- Voter to 4.0 (Ballot) -->
  <path d="M 85 200 L 85 410 L 500 410" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#dfd1Arrow)"/>
  <text x="250" y="402" fill="#fca5a5" font-size="9.5">Cast Ballot Payload (election_id, cand_id)</text>

  <!-- 4.0 to D1 (Check has_voted lock) -->
  <line x1="550" y1="360" x2="550" y2="190" stroke="#ef4444" stroke-width="1.8" marker-end="url(#dfd1Arrow)"/>
  <text x="560" y="270" fill="#fca5a5" font-size="9">Lock has_voted</text>

  <!-- 4.0 to 5.0 (Seal) -->
  <line x1="550" y1="460" x2="550" y2="580" stroke="#38bdf8" stroke-width="2" marker-end="url(#dfd1Arrow)"/>
  <text x="560" y="520" fill="#38bdf8" font-size="9.5">Raw Ballot</text>

  <!-- 5.0 to D5 (Persist Seal) -->
  <path d="M 590 610 L 730 610 L 730 520" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#dfd1Arrow)"/>
  <text x="645" y="602" fill="#38bdf8" font-size="9">Save SHA-256 Seal</text>

  <!-- D5 to 6.0 (Tally) -->
  <line x1="770" y1="520" x2="820" y2="580" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfd1Green)"/>

  <!-- 6.0 to Admin (Export) -->
  <path d="M 890 625 L 1015 625 L 1015 200" fill="none" stroke="#10b981" stroke-width="1.8" marker-end="url(#dfd1Green)"/>
  <text x="960" y="615" fill="#34d399" font-size="9.5">CSV Report</text>
</svg>`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, 'dfd_level_1.svg'), dfd1Svg);
console.log('✅ Generated: docs/diagrams/dfd_level_1.svg');

// ─────────────────────────────────────────────────────────────────────────────
// 6. COMPILE DEDICATED PDF: VotePulse_Architectural_Diagrams.pdf
// ─────────────────────────────────────────────────────────────────────────────
async function generateDiagramsPdf() {
  const PDF_OUTPUT = path.join(__dirname, '../docs/VotePulse_Architectural_Diagrams.pdf');

  const pdfDoc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 25, bottom: 25, left: 36, right: 36 },
    autoFirstPage: false,
    bufferPages: true
  });

  const pdfStream = fs.createWriteStream(PDF_OUTPUT);
  pdfDoc.pipe(pdfStream);

  const diagramsList = [
    { title: 'Use Case Architectural Diagram', category: 'UML 2.5 Specification', file: 'use_case_diagram.svg', desc: 'Models all actor relationships (Voter, Candidate, Administrator, Google SMTP) and 12 core system use cases with <<include>> relationships.' },
    { title: 'Sequence Diagram: Ballot Casting & Sealing', category: 'Dynamic Interaction Model', file: 'sequence_diagram.svg', desc: 'Details temporal message exchange between Voter, React PWA, Express REST API, Security Middleware, Crypto Engine, and MongoDB persistence.' },
    { title: 'Entity-Relationship (ER) Schema Architecture', category: 'Data Modeling & Persistence', file: 'er_diagram.svg', desc: 'Specifies Mongoose document schemas, primary keys, foreign keys, 1:N cardinalities, and the decoupled secret ballot audit architecture.' },
    { title: 'Data Flow Diagram (DFD) Level 0: Context Model', category: 'Context-Level Data Flow', file: 'dfd_level_0.svg', desc: 'High-level contextual model capturing all inbound and outbound data flows between external entities and Process 0.0 (VotePulse E-Voting System).' },
    { title: 'Data Flow Diagram (DFD) Level 1: Process Decomposition', category: 'Detailed Data Flow Model', file: 'dfd_level_1.svg', desc: 'Decomposes core functionality into 6 discrete processes (1.0 to 6.0) communicating across 5 data stores (D1 to D5).' }
  ];

  const {
    renderUseCaseDiagram,
    renderSequenceDiagram,
    renderErDiagram,
    renderDfd0Diagram,
    renderDfd1Diagram
  } = require('./diagram_renderers');

  diagramsList.forEach((d, idx) => {
    pdfDoc.addPage();

    // Top Header Banner
    pdfDoc.rect(36, 14, 769.89, 44).fill('#0f172a');
    pdfDoc.rect(36, 14, 5, 44).fill('#2563eb');

    pdfDoc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13)
       .text(`DIAGRAM ${idx + 1}: ${d.title.toUpperCase()}`, 52, 23, { lineBreak: false });

    pdfDoc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8.5)
       .text(d.category.toUpperCase(), 52, 40, { lineBreak: false });

    pdfDoc.fillColor('#94a3b8').font('Helvetica').fontSize(8)
       .text('VOTEPULSE E-VOTING SYSTEM -- ARCHITECTURAL SPECIFICATION', 36, 27, { width: 755, align: 'right', lineBreak: false });

    // Render actual diagram
    if (idx === 0) renderUseCaseDiagram(pdfDoc);
    else if (idx === 1) renderSequenceDiagram(pdfDoc);
    else if (idx === 2) renderErDiagram(pdfDoc);
    else if (idx === 3) renderDfd0Diagram(pdfDoc);
    else if (idx === 4) renderDfd1Diagram(pdfDoc);

    // Footer
    pdfDoc.rect(36, 565, 769.89, 0.75).fill('#cbd5e1');
    pdfDoc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
       .text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING -- MINOR PROJECT SEMINAR 3', 36, 574, { lineBreak: false });
    pdfDoc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5)
       .text(`Page ${idx + 1} of ${diagramsList.length}`, 36, 574, { width: 769.89, align: 'right', lineBreak: false });
  });

  pdfDoc.end();
  console.log(`✅ Architectural Diagrams PDF created at: ${PDF_OUTPUT}`);
}

generateDiagramsPdf().catch(err => console.error(err));
