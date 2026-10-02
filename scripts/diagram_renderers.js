/**
 * VotePulse Native PDFKit Architectural Diagram Renderers
 * Draws high-resolution vector diagrams directly onto PDFKit document pages.
 */

// Helper to draw an arrow with clean arrowhead
function drawArrow(doc, x1, y1, x2, y2, color = '#2563eb', width = 1.4, isDashed = false) {
  doc.save();
  if (isDashed) {
    doc.dash(4, { space: 3 });
  }
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
  if (isDashed) {
    doc.undash();
  }

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 6.5;
  const a = Math.PI / 6.5;
  const p1 = [x2 - len * Math.cos(angle - a), y2 - len * Math.sin(angle - a)];
  const p2 = [x2 - len * Math.cos(angle + a), y2 - len * Math.sin(angle + a)];
  doc.polygon([x2, y2], p1, p2).fillColor(color).fill();
  doc.restore();
}

// Helper to draw an actor stick figure
function drawActor(doc, cx, cy, label, color = '#2563eb') {
  doc.save();
  // Head
  doc.circle(cx, cy, 12).strokeColor(color).lineWidth(2).stroke();
  // Spine
  doc.moveTo(cx, cy + 12).lineTo(cx, cy + 42).strokeColor(color).lineWidth(2).stroke();
  // Arms
  doc.moveTo(cx - 16, cy + 24).lineTo(cx + 16, cy + 24).strokeColor(color).lineWidth(2).stroke();
  // Legs
  doc.moveTo(cx, cy + 42).lineTo(cx - 12, cy + 68).strokeColor(color).lineWidth(2).stroke();
  doc.moveTo(cx, cy + 42).lineTo(cx + 12, cy + 68).strokeColor(color).lineWidth(2).stroke();

  // Name Badge
  const badgeW = Math.max(65, doc.widthOfString(label, { font: 'Helvetica-Bold', size: 7.5 }) + 14);
  const badgeX = cx - (badgeW / 2);
  const badgeY = cy + 74;
  doc.roundedRect(badgeX, badgeY, badgeW, 16, 3).fill(color);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5)
     .text(label, badgeX, badgeY + 4, { width: badgeW, align: 'center', lineBreak: false });
  doc.restore();
}

// Helper to draw a use case oval
function drawUseCase(doc, cx, cy, rx, ry, id, title, color = '#0284c7', isDashed = false) {
  doc.save();
  if (isDashed) {
    doc.dash(4, { space: 2.5 });
  }
  doc.ellipse(cx, cy, rx, ry).fillColor('#ffffff').fill();
  doc.ellipse(cx, cy, rx, ry).strokeColor(color).lineWidth(1.5).stroke();
  if (isDashed) {
    doc.undash();
  }

  doc.fillColor(color).font('Helvetica-Bold').fontSize(7)
     .text(id, cx - rx, cy - 8, { width: rx * 2, align: 'center', lineBreak: false });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7)
     .text(title, cx - rx + 4, cy + 1, { width: (rx * 2) - 8, align: 'center', lineBreak: false });
  doc.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USE CASE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
function renderUseCaseDiagram(doc) {
  const startX = 36;
  const startY = 66;
  const W = 769.89;
  const H = 485;

  // Background card
  doc.roundedRect(startX, startY, W, H, 5).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 5).stroke();

  // System Boundary Box
  const bX = 185;
  const bY = 76;
  const bW = 425;
  const bH = 430;

  doc.roundedRect(bX, bY, bW, bH, 6).fill('#f8fafc');
  doc.save();
  doc.dash(5, { space: 3 });
  doc.strokeColor('#3b82f6').lineWidth(1.6).roundedRect(bX, bY, bW, bH, 6).stroke();
  doc.restore();

  // Boundary Header Ribbon
  doc.roundedRect(bX, bY, bW, 22, 5).fill('#1e293b');
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8.5)
     .text('SYSTEM BOUNDARY: VOTEPULSE E-VOTING CORE PLATFORM', bX, bY + 6, { width: bW, align: 'center', lineBreak: false });

  // Actors
  drawActor(doc, 105, 125, 'VOTER', '#0284c7');
  drawActor(doc, 105, 335, 'CANDIDATE', '#7c3aed');
  drawActor(doc, 685, 125, 'SYSTEM ADMIN', '#059669');

  // External Service Box (Google SMTP)
  const sX = 635;
  const sY = 330;
  doc.roundedRect(sX, sY, 100, 55, 4).fill('#fffbeb');
  doc.strokeColor('#d97706').lineWidth(1.5).roundedRect(sX, sY, 100, 55, 4).stroke();
  doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(7.5).text('<<External Service>>', sX, sY + 8, { width: 100, align: 'center' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text('Google SMTP', sX, sY + 22, { width: 100, align: 'center' });
  doc.fillColor('#475569').font('Helvetica').fontSize(7).text('2FA OTP & Receipts', sX, sY + 36, { width: 100, align: 'center' });

  // Use Cases (Left Column inside boundary)
  drawUseCase(doc, 290, 120, 85, 17, 'UC-01', 'Register Account', '#0284c7');
  drawUseCase(doc, 290, 165, 85, 17, 'UC-03', 'Authenticate & Login', '#0284c7');
  drawUseCase(doc, 290, 210, 85, 17, 'UC-04', 'Review Active Polls', '#0284c7');
  drawUseCase(doc, 290, 255, 85, 17, 'UC-05', 'Cast Anonymous Ballot', '#0284c7');
  drawUseCase(doc, 290, 300, 85, 17, 'UC-07', 'Verify Audit Hash', '#0284c7');
  drawUseCase(doc, 290, 350, 85, 17, 'UC-08', 'Apply for Nomination', '#7c3aed');
  drawUseCase(doc, 290, 395, 85, 17, 'UC-09', 'Campaign Command Center', '#7c3aed');
  drawUseCase(doc, 290, 440, 85, 17, 'UC-11', 'Approve Candidates', '#059669');

  // Use Cases (Right Column inside boundary)
  drawUseCase(doc, 500, 120, 95, 17, '<<include>> UC-02', 'Verify 2FA Email OTP', '#d97706', true);
  drawUseCase(doc, 500, 255, 95, 17, '<<include>> UC-06', 'Generate SHA-256 Seal', '#059669', true);
  drawUseCase(doc, 500, 350, 85, 17, 'UC-10', 'Monitor Live Turnout', '#7c3aed');
  drawUseCase(doc, 500, 395, 85, 17, 'UC-12', 'Create & Schedule Poll', '#059669');
  drawUseCase(doc, 500, 440, 85, 17, 'UC-13', 'Audit Log & Diagnostics', '#059669');

  // Associations (Voter)
  doc.save();
  doc.strokeColor('#38bdf8').lineWidth(1.2);
  doc.moveTo(135, 140).lineTo(205, 120).stroke();
  doc.moveTo(135, 150).lineTo(205, 165).stroke();
  doc.moveTo(135, 160).lineTo(205, 210).stroke();
  doc.moveTo(135, 170).lineTo(205, 255).stroke();
  doc.moveTo(135, 180).lineTo(205, 300).stroke();

  // Associations (Candidate)
  doc.strokeColor('#c084fc').lineWidth(1.2);
  doc.moveTo(135, 360).lineTo(205, 165).stroke();
  doc.moveTo(135, 370).lineTo(205, 350).stroke();
  doc.moveTo(135, 380).lineTo(205, 395).stroke();
  doc.moveTo(135, 390).lineTo(415, 350).stroke();

  // Associations (Admin)
  doc.strokeColor('#34d399').lineWidth(1.2);
  doc.moveTo(655, 150).lineTo(585, 395).stroke();
  doc.moveTo(655, 160).lineTo(375, 440).stroke();
  doc.moveTo(655, 170).lineTo(585, 440).stroke();
  doc.restore();

  // <<include>> lines
  drawArrow(doc, 375, 120, 405, 120, '#d97706', 1.2, true);
  drawArrow(doc, 375, 255, 405, 255, '#059669', 1.2, true);

  // SMTP Dispatch Lines
  drawArrow(doc, 595, 120, 645, 330, '#d97706', 1.1, true);
  drawArrow(doc, 595, 255, 645, 345, '#059669', 1.1, true);

  // Security Guarantee Footer Strip
  doc.roundedRect(bX + 10, bY + bH - 32, bW - 20, 24, 3).fill('#ecfdf5');
  doc.strokeColor('#059669').lineWidth(1).roundedRect(bX + 10, bY + bH - 32, bW - 20, 24, 3).stroke();
  doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(7.2)
     .text('CORE SECURITY GUARANTEES: Mandatory 2FA OTP gate (UC-02) | Non-repudiable SHA-256 ballot receipting (UC-06) | Zero duplicate voting.', bX + 15, bY + bH - 24, { width: bW - 30, align: 'center', lineBreak: false });

  // Legend Card (Bottom Left)
  doc.roundedRect(startX + 12, startY + H - 55, 145, 45, 3).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(0.8).roundedRect(startX + 12, startY + H - 55, 145, 45, 3).stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7).text('DIAGRAM CONVENTIONS', startX + 16, startY + H - 50);
  doc.fillColor('#475569').font('Helvetica').fontSize(6.8)
     .text('• Solid Line: Direct Actor Association\n• Dashed Line + Arrow: <<include>>\n• Gold: 2FA Flow | Green: Crypto Seal', startX + 16, startY + H - 40, { lineGap: 1.5 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEQUENCE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
function renderSequenceDiagram(doc) {
  const startX = 36;
  const startY = 66;
  const W = 769.89;
  const H = 485;

  doc.roundedRect(startX, startY, W, H, 5).fill('#0f172a'); // Dark theme matching screenshot
  doc.strokeColor('#334155').lineWidth(1.5).roundedRect(startX, startY, W, H, 5).stroke();

  // Title Banner inside
  doc.roundedRect(startX + 12, startY + 10, W - 24, 28, 4).fill('#1e293b');
  doc.rect(startX + 12, startY + 10, 4, 28).fill('#2563eb');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
     .text('VOTEPULSE: END-TO-END SECURE BALLOT CASTING SEQUENCE DIAGRAM', startX + 24, startY + 19, { lineBreak: false });
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(7.5)
     .text('CONCURRENCY & CRYPTOGRAPHIC SEAL FLOW', startX + 24, startY + 20, { width: W - 48, align: 'right', lineBreak: false });

  // 6 Participants
  const participants = [
    { name: 'Voter (PWA Client)', x: 95, color: '#38bdf8' },
    { name: 'VoterPortal (React)', x: 220, color: '#38bdf8' },
    { name: 'Express Server (/api)', x: 350, color: '#38bdf8' },
    { name: 'Security Middleware', x: 480, color: '#f59e0b' },
    { name: 'Crypto / Hash Engine', x: 605, color: '#a855f7' },
    { name: 'Database / Memory', x: 725, color: '#10b981' }
  ];

  const topY = startY + 48;
  const botY = startY + 440;

  // Draw lifelines & top headers
  participants.forEach(p => {
    // Header box
    const bw = 100;
    const bx = p.x - (bw / 2);
    doc.roundedRect(bx, topY, bw, 22, 4).fill('#1e293b');
    doc.strokeColor(p.color).lineWidth(1.5).roundedRect(bx, topY, bw, 22, 4).stroke();
    doc.fillColor(p.color).font('Helvetica-Bold').fontSize(7.2)
       .text(p.name, bx, topY + 6.5, { width: bw, align: 'center', lineBreak: false });

    // Vertical dashed lifeline
    doc.save();
    doc.dash(4, { space: 3 });
    doc.moveTo(p.x, topY + 22).lineTo(p.x, botY).strokeColor('#334155').lineWidth(1).stroke();
    doc.restore();
  });

  // Activation bars on lifelines
  function drawBar(x, y1, y2, color) {
    doc.rect(x - 4, y1, 8, y2 - y1).fill(color);
  }

  drawBar(95, startY + 75, startY + 430, '#1e293b');
  drawBar(220, startY + 80, startY + 425, '#1e293b');
  drawBar(350, startY + 95, startY + 415, '#2563eb');
  drawBar(480, startY + 115, startY + 220, '#d97706');
  drawBar(605, startY + 250, startY + 310, '#7c3aed');
  drawBar(725, startY + 140, startY + 360, '#059669');

  // Messages
  let curY = startY + 80;
  // 1. Select Candidate
  drawArrow(doc, 95, curY, 220, curY, '#38bdf8', 1.2);
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(6.8).text('1. Select Candidate & Confirm Vote', 100, curY - 9);

  // 2. POST /api/vote
  curY += 28;
  drawArrow(doc, 220, curY, 350, curY, '#38bdf8', 1.4);
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(6.8).text('2. POST /api/vote (election_id, voter_id, candidate_id)', 225, curY - 9);

  // 3. validateVoteCast
  curY += 28;
  drawArrow(doc, 350, curY, 480, curY, '#f59e0b', 1.3);
  doc.fillColor('#fbbf24').font('Helvetica-Bold').fontSize(6.8).text('3. validateVoteCast(req.body) & Auth Token Check', 355, curY - 9);

  // 4. Check Election Status
  curY += 28;
  drawArrow(doc, 480, curY, 725, curY, '#f59e0b', 1.2);
  doc.fillColor('#fbbf24').font('Helvetica').fontSize(6.5).text('4. Check Election.status === "active"', 500, curY - 8);

  // 5. Atomic Lock Check
  curY += 28;
  drawArrow(doc, 480, curY, 725, curY, '#f59e0b', 1.4);
  doc.fillColor('#f59e0b').font('Helvetica-Bold').fontSize(6.8).text('5. Atomic Check: findOneAndUpdate({has_voted: false})', 495, curY - 9);

  // [ALT: Duplicate Attempt Box]
  curY += 18;
  const altBoxY = curY;
  doc.save();
  doc.dash(4, { space: 2 });
  doc.roundedRect(300, altBoxY, 435, 45, 3).fill('#450a0a');
  doc.strokeColor('#ef4444').lineWidth(1.2).roundedRect(300, altBoxY, 435, 45, 3).stroke();
  doc.restore();

  doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(6.8).text('[ALT: If already voted (Race Condition Attempt)]', 310, altBoxY + 4);
  drawArrow(doc, 725, altBoxY + 22, 480, altBoxY + 22, '#ef4444', 1.2, true);
  doc.fillColor('#fca5a5').font('Helvetica').fontSize(6.5).text('Lock Denied (0 modified, already_voted = true)', 510, altBoxY + 14);

  drawArrow(doc, 480, altBoxY + 36, 220, altBoxY + 36, '#ef4444', 1.2, true);
  doc.fillColor('#fca5a5').font('Helvetica-Bold').fontSize(6.5).text('HTTP 409 Conflict ("You have already voted in this election")', 230, altBoxY + 28);

  // 6. Crypto Sealing
  curY = altBoxY + 54;
  drawArrow(doc, 350, curY, 605, curY, '#c084fc', 1.3);
  doc.fillColor('#c084fc').font('Helvetica-Bold').fontSize(6.8).text('6. sha256Hash(ballotPayload) & caesarCipherEncrypt(raw, 3)', 360, curY - 9);

  // 7. Return Seal
  curY += 28;
  drawArrow(doc, 605, curY, 350, curY, '#c084fc', 1.2, true);
  doc.fillColor('#e9d5ff').font('Helvetica').fontSize(6.5).text('7. Return {sha256_seal, caesar_hash, receipt_id}', 380, curY - 8);

  // 8. Persist Vote Record
  curY += 28;
  drawArrow(doc, 350, curY, 725, curY, '#34d399', 1.4);
  doc.fillColor('#34d399').font('Helvetica-Bold').fontSize(6.8).text('8. Persist Vote (Decoupled voter_id) & Increment Candidate Tally', 360, curY - 9);

  // 9. HTTP 201 Created
  curY += 28;
  drawArrow(doc, 350, curY, 220, curY, '#38bdf8', 1.4, true);
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(6.8).text('9. HTTP 201 Created {success: true, receipt: "e3b0c44..."}', 230, curY - 9);

  // 10. Display Verified Receipt
  curY += 28;
  drawArrow(doc, 220, curY, 95, curY, '#38bdf8', 1.2, true);
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(6.8).text('10. Display Verified Receipt Modal & Lock Ballot UI', 105, curY - 9);

  // Bottom Security Summary Strip
  doc.roundedRect(startX + 12, startY + H - 34, W - 24, 24, 4).fill('#1e293b');
  doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(7.5)
     .text('ZERO-TOLERANCE RACE DEFENSE: Native MongoDB atomic locks reject concurrent double-vote attempts in < 2ms without table locking.', startX + 20, startY + H - 26, { width: W - 40, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ENTITY-RELATIONSHIP (ER) DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
function renderErDiagram(doc) {
  const startX = 36;
  const startY = 66;
  const W = 769.89;
  const H = 485;

  doc.roundedRect(startX, startY, W, H, 5).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 5).stroke();

  // Helper for Table Box
  function drawTable(x, y, w, h, title, color, fields) {
    doc.roundedRect(x, y, w, h, 4).fill('#ffffff');
    doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(x, y, w, h, 4).stroke();

    // Table Header
    doc.roundedRect(x, y, w, 20, 4).fill(color);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
       .text(title, x + 8, y + 5.5, { lineBreak: false });

    // Table Fields
    fields.forEach((f, idx) => {
      const fy = y + 26 + (idx * 16);
      if (idx % 2 === 1) {
        doc.rect(x + 1, fy - 2, w - 2, 16).fill('#f8fafc');
      }

      // Key Badge
      if (f.key) {
        const kw = f.key === 'PK' ? 16 : 16;
        const kc = f.key === 'PK' ? '#2563eb' : '#d97706';
        doc.roundedRect(x + 6, fy, kw, 11, 2).fill(kc);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6)
           .text(f.key, x + 6, fy + 2, { width: kw, align: 'center', lineBreak: false });
      }

      // Field Name
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7)
         .text(f.name, x + 28, fy + 1, { lineBreak: false });

      // Field Type
      doc.fillColor('#64748b').font('Helvetica').fontSize(6.8)
         .text(f.type, x + 28, fy + 1, { width: w - 34, align: 'right', lineBreak: false });
    });
  }

  // 1. USER TABLE
  drawTable(45, 80, 215, 175, 'USER (Collection: users)', '#0284c7', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'name', type: 'String' },
    { key: '', name: 'email', type: 'String (Unique)' },
    { key: '', name: 'password_hash', type: 'String (Bcrypt)' },
    { key: '', name: 'role', type: 'Enum (voter|cand|admin)' },
    { key: '', name: 'is_verified', type: 'Boolean' },
    { key: '', name: 'has_voted_elections', type: 'Array<ObjectId>' },
    { key: '', name: 'created_at', type: 'Timestamp' }
  ]);

  // 2. ELECTION TABLE
  drawTable(290, 80, 215, 160, 'ELECTION (Collection: elections)', '#059669', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'title', type: 'String' },
    { key: '', name: 'description', type: 'String' },
    { key: '', name: 'start_date', type: 'Timestamp' },
    { key: '', name: 'end_date', type: 'Timestamp' },
    { key: '', name: 'status', type: 'Enum (active|closed)' },
    { key: 'FK', name: 'created_by', type: 'ObjectId (User)' }
  ]);

  // 3. CANDIDATE TABLE
  drawTable(535, 80, 220, 175, 'CANDIDATE (Collection: candidates)', '#7c3aed', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: 'FK', name: 'user_id', type: 'ObjectId (User)' },
    { key: 'FK', name: 'election_id', type: 'ObjectId (Election)' },
    { key: '', name: 'party_name', type: 'String' },
    { key: '', name: 'manifesto', type: 'String' },
    { key: '', name: 'symbol_url', type: 'String' },
    { key: '', name: 'approval_status', type: 'Enum (appr|pend)' },
    { key: '', name: 'vote_count', type: 'Number (Atomic)' }
  ]);

  // 4. OTP TOKEN TABLE
  drawTable(45, 290, 215, 140, 'OTP_TOKEN (Collection: otp_tokens)', '#d97706', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'email', type: 'String (Index)' },
    { key: '', name: 'otp_hash', type: 'String (Salted SHA)' },
    { key: '', name: 'purpose', type: 'Enum (reg|2fa|pwd)' },
    { key: '', name: 'expires_at', type: 'Timestamp (TTL 300s)' },
    { key: '', name: 'attempts', type: 'Number (Max 3)' }
  ]);

  // 5. VOTE TABLE (SEALED AUDIT LEDGER)
  drawTable(290, 275, 215, 175, 'VOTE (Collection: votes - Ledger)', '#0891b2', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: 'FK', name: 'election_id', type: 'ObjectId (Election)' },
    { key: 'FK', name: 'candidate_id', type: 'ObjectId (Candidate)' },
    { key: '', name: 'vote_hash', type: 'String (SHA-256)' },
    { key: '', name: 'caesar_hash', type: 'String (Cipher k=3)' },
    { key: '', name: 'previous_hash', type: 'String (Chain)' },
    { key: '', name: 'cast_at', type: 'Timestamp' },
    { key: '', name: '* voter_id DECOUPLED', type: 'Strict Privacy' }
  ]);

  // Constitutional Secret Ballot Highlight Card (Right side)
  doc.roundedRect(535, 275, 220, 175, 4).fill('#ecfdf5');
  doc.strokeColor('#059669').lineWidth(1.2).roundedRect(535, 275, 220, 175, 4).stroke();

  doc.roundedRect(535, 275, 220, 22, 4).fill('#059669');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.8)
     .text('SECRET BALLOT DECOUPLING', 535, 281, { width: 220, align: 'center', lineBreak: false });

  const decouplingNote = `CONSTITUTIONAL PRIVACY GUARANTEE:

1. Secret Ballot Integrity:
The VOTE collection contains ZERO foreign keys or pointers linking back to USER._id.

2. Double-Voting Prevention:
A voter's participation is tracked solely in USER.has_voted_elections via an atomic lock.

3. Independent Public Auditability:
The voter receives an immutable SHA-256 receipt (vote_hash) enabling self-verification on the public ledger without revealing candidate choice.`;

  doc.fillColor('#065f46').font('Helvetica').fontSize(6.8)
     .text(decouplingNote, 543, 305, { width: 204, lineGap: 1.8 });

  // Relationship Lines & Cardinalities
  doc.save();
  // User -> Election
  drawArrow(doc, 260, 130, 290, 130, '#0284c7', 1.2);
  doc.fillColor('#0284c7').font('Helvetica-Bold').fontSize(6.5).text('1 : N (created_by)', 240, 120);

  // User -> Candidate
  drawArrow(doc, 260, 160, 535, 160, '#7c3aed', 1.2);
  doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(6.5).text('1 : 0..1 (user_id)', 370, 150);

  // User -> OTP
  drawArrow(doc, 150, 255, 150, 290, '#d97706', 1.2);
  doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(6.5).text('1 : N (email)', 155, 268);

  // Election -> Candidate
  drawArrow(doc, 505, 130, 535, 130, '#059669', 1.2);
  doc.fillColor('#059669').font('Helvetica-Bold').fontSize(6.5).text('1 : N', 510, 120);

  // Election -> Vote
  drawArrow(doc, 397, 240, 397, 275, '#059669', 1.2);
  doc.fillColor('#059669').font('Helvetica-Bold').fontSize(6.5).text('1 : N (election_id)', 402, 255);

  // Candidate -> Vote
  drawArrow(doc, 600, 255, 450, 275, '#7c3aed', 1.2);
  doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(6.5).text('1 : N (candidate_id)', 510, 260);
  doc.restore();

  // Footer Legend
  doc.roundedRect(startX + 10, startY + H - 28, W - 20, 20, 3).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(0.8).roundedRect(startX + 10, startY + H - 28, W - 20, 20, 3).stroke();
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(7)
     .text('PRIMARY KEYS: [PK] | FOREIGN KEYS: [FK] | TTL AUTO-EXPIRY: 300 SECONDS | CRYPTOGRAPHIC BALLOT ANONYMIZATION', startX + 15, startY + H - 22, { width: W - 30, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DATA FLOW DIAGRAM (DFD LEVEL 0 - CONTEXT MODEL)
// ─────────────────────────────────────────────────────────────────────────────
function renderDfd0Diagram(doc) {
  const startX = 36;
  const startY = 66;
  const W = 769.89;
  const H = 485;

  doc.roundedRect(startX, startY, W, H, 5).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 5).stroke();

  // Center Process Circle 0.0
  const cX = startX + (W / 2);
  const cY = startY + 225;
  const cR = 75;

  doc.circle(cX, cY, cR).fill('#1e293b');
  doc.circle(cX, cY, cR).strokeColor('#2563eb').lineWidth(3).stroke();

  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(11)
     .text('0.0', cX - cR, cY - 40, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
     .text('VOTEPULSE CORE', cX - cR, cY - 24, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
     .text('E-VOTING & AUDIT', cX - cR, cY - 9, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
     .text('MANAGEMENT SYSTEM', cX - cR, cY + 6, { width: cR * 2, align: 'center' });
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
     .text('(Context Boundary)', cX - cR, cY + 24, { width: cR * 2, align: 'center' });

  // 4 External Entities
  function drawEntity(x, y, w, h, title, subtitle, color) {
    doc.roundedRect(x, y, w, h, 4).fill('#ffffff');
    doc.strokeColor(color).lineWidth(1.8).roundedRect(x, y, w, h, 4).stroke();
    doc.roundedRect(x, y, w, 18, 4).fill(color);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
       .text(title, x, y + 4.5, { width: w, align: 'center', lineBreak: false });
    doc.fillColor('#475569').font('Helvetica').fontSize(7)
       .text(subtitle, x + 4, y + 24, { width: w - 8, align: 'center', lineBreak: false });
  }

  drawEntity(55, 110, 150, 52, 'VOTER (ELECTOR)', 'PWA Client / Mobile Web', '#0284c7');
  drawEntity(55, 340, 150, 52, 'CANDIDATE', 'Campaign Command Center', '#7c3aed');
  drawEntity(605, 110, 160, 52, 'SYSTEM ADMINISTRATOR', 'Master Console (ADM-9999)', '#059669');
  drawEntity(605, 340, 160, 52, 'GOOGLE SMTP GATEWAY', 'TLS Email Notification Hub', '#d97706');

  // Flows: Voter <-> Process 0.0
  drawArrow(doc, 205, 125, cX - 65, cY - 45, '#0284c7', 1.3);
  doc.fillColor('#0284c7').font('Helvetica-Bold').fontSize(6.8)
     .text('1. Credentials, 2FA OTP, Ballot Choice (Encrypted)', 150, 100);

  drawArrow(doc, cX - 70, cY - 20, 205, 145, '#38bdf8', 1.3);
  doc.fillColor('#0369a1').font('Helvetica').fontSize(6.8)
     .text('2. JWT Session, Candidate List, SHA-256 Receipt', 160, 165);

  // Flows: Candidate <-> Process 0.0
  drawArrow(doc, 205, 355, cX - 65, cY + 35, '#7c3aed', 1.3);
  doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(6.8)
     .text('3. Nomination Dossier & Manifesto Updates', 160, 335);

  drawArrow(doc, cX - 70, cY + 55, 205, 375, '#a855f7', 1.3);
  doc.fillColor('#6b21a8').font('Helvetica').fontSize(6.8)
     .text('4. Approval Dossier, Real-time Turnout Metrics', 160, 400);

  // Flows: Admin <-> Process 0.0
  drawArrow(doc, 605, 125, cX + 65, cY - 45, '#059669', 1.3);
  doc.fillColor('#059669').font('Helvetica-Bold').fontSize(6.8)
     .text('5. Poll Lifecycle Config, Nominee Approvals', 475, 100);

  drawArrow(doc, cX + 70, cY - 20, 605, 145, '#10b981', 1.3);
  doc.fillColor('#047857').font('Helvetica').fontSize(6.8)
     .text('6. Audit Trail Logs, Tamper Alerts, Certified CSV', 485, 165);

  // Flows: Process 0.0 <-> Google SMTP
  drawArrow(doc, cX + 65, cY + 35, 605, 355, '#d97706', 1.3);
  doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(6.8)
     .text('7. 6-Digit OTP Delivery, Ballot Audit Receipts', 485, 335);

  drawArrow(doc, 605, 375, cX + 70, cY + 55, '#b45309', 1.3);
  doc.fillColor('#92400e').font('Helvetica').fontSize(6.8)
     .text('8. SMTP TLS Handshake Status & Delivery Ack', 485, 400);

  // Footer Summary Strip
  doc.roundedRect(startX + 10, startY + H - 34, W - 20, 24, 4).fill('#1e293b');
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(7.5)
     .text('DFD LEVEL 0 ARCHITECTURE: Represents the black-box contextual model. All perimeter transmissions are encrypted via HTTPS / TLS 1.3.', startX + 20, startY + H - 26, { width: W - 40, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DATA FLOW DIAGRAM (DFD LEVEL 1 - DECOMPOSITION MODEL)
// ─────────────────────────────────────────────────────────────────────────────
function renderDfd1Diagram(doc) {
  const startX = 36;
  const startY = 66;
  const W = 769.89;
  const H = 485;

  doc.roundedRect(startX, startY, W, H, 5).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 5).stroke();

  // Helper to draw Process Circle
  function drawProcess(cx, cy, id, title, color) {
    const r = 32;
    doc.circle(cx, cy, r).fill('#ffffff');
    doc.circle(cx, cy, r).strokeColor(color).lineWidth(1.8).stroke();
    doc.fillColor(color).font('Helvetica-Bold').fontSize(7.5)
       .text(id, cx - r, cy - 14, { width: r * 2, align: 'center' });
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.5)
       .text(title, cx - r + 3, cy - 2, { width: (r * 2) - 6, align: 'center' });
  }

  // Helper to draw Data Store (Open-ended rectangle)
  function drawDataStore(x, y, w, h, id, title, color) {
    doc.rect(x, y, w, h).fill('#f8fafc');
    doc.moveTo(x, y).lineTo(x + w, y).strokeColor(color).lineWidth(1.5).stroke();
    doc.moveTo(x, y + h).lineTo(x + w, y + h).strokeColor(color).lineWidth(1.5).stroke();
    doc.fillColor(color).font('Helvetica-Bold').fontSize(7.5).text(id, x + 8, y + (h / 2) - 4);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7).text(title, x + 28, y + (h / 2) - 4);
  }

  // 6 Processes
  drawProcess(140, 130, '1.0', 'Identity &\n2FA Engine', '#0284c7');
  drawProcess(385, 130, '2.0', 'Election Config\nLifecycle', '#059669');
  drawProcess(630, 130, '3.0', 'Candidate\nNomination', '#7c3aed');

  drawProcess(210, 360, '4.0', 'Atomic Voting\n& Lock Engine', '#dc2626');
  drawProcess(450, 360, '5.0', 'SHA-256 Crypto\nSealing Engine', '#0891b2');
  drawProcess(670, 360, '6.0', 'Live Tally &\nAudit Ledger', '#059669');

  // 5 Data Stores
  drawDataStore(50, 235, 135, 26, 'D1', 'Users & Auth Store', '#0284c7');
  drawDataStore(215, 235, 140, 26, 'D2', 'OTP Cache (TTL)', '#d97706');
  drawDataStore(385, 235, 140, 26, 'D3', 'Election Catalog', '#059669');
  drawDataStore(555, 235, 140, 26, 'D4', 'Candidate Registry', '#7c3aed');
  drawDataStore(320, 440, 195, 28, 'D5', 'Sealed Vote Ledger (SHA-256)', '#0891b2');

  // External Entities
  doc.roundedRect(38, 75, 65, 30, 3).fill('#0284c7');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5).text('VOTER', 38, 85, { width: 65, align: 'center' });

  doc.roundedRect(705, 75, 65, 30, 3).fill('#059669');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.2).text('ADMIN', 705, 85, { width: 65, align: 'center' });

  // Flows
  // Voter -> 1.0
  drawArrow(doc, 103, 90, 115, 115, '#0284c7', 1.2);
  doc.fillColor('#0284c7').font('Helvetica').fontSize(6).text('Credentials & OTP', 65, 110);

  // 1.0 <-> D1
  drawArrow(doc, 130, 162, 110, 235, '#0284c7', 1.2);
  // 1.0 <-> D2
  drawArrow(doc, 165, 155, 240, 235, '#d97706', 1.2);

  // Admin -> 2.0
  drawArrow(doc, 705, 90, 417, 120, '#059669', 1.2);
  doc.fillColor('#059669').font('Helvetica').fontSize(6).text('Poll Parameters', 540, 95);

  // 2.0 -> D3
  drawArrow(doc, 395, 162, 420, 235, '#059669', 1.2);

  // Admin & Candidate -> 3.0
  drawArrow(doc, 705, 95, 660, 115, '#7c3aed', 1.2);
  // 3.0 <-> D4
  drawArrow(doc, 630, 162, 630, 235, '#7c3aed', 1.2);

  // Voter -> 4.0
  drawArrow(doc, 70, 105, 185, 335, '#dc2626', 1.4);
  doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(6.5).text('Cast Ballot Payload', 90, 275);

  // 4.0 <-> D1 (Lock has_voted)
  drawArrow(doc, 190, 335, 135, 261, '#dc2626', 1.3);
  doc.fillColor('#dc2626').font('Helvetica').fontSize(6).text('Lock has_voted', 140, 295);

  // D3 & D4 -> 4.0
  drawArrow(doc, 410, 261, 235, 335, '#059669', 1.1);
  drawArrow(doc, 570, 261, 240, 345, '#7c3aed', 1.1);

  // 4.0 -> 5.0 (Validated Ballot)
  drawArrow(doc, 242, 360, 418, 360, '#dc2626', 1.4);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.5).text('Raw Ballot Choice', 290, 350);

  // 5.0 -> D5 (Save Sealed Vote)
  drawArrow(doc, 435, 392, 410, 440, '#0891b2', 1.4);
  doc.fillColor('#0891b2').font('Helvetica-Bold').fontSize(6.5).text('Commit SHA-256 Hash', 420, 415);

  // 5.0 -> D4 (Increment candidate.vote_count)
  drawArrow(doc, 475, 335, 600, 261, '#7c3aed', 1.2);
  doc.fillColor('#7c3aed').font('Helvetica').fontSize(6).text('Increment Tally', 525, 305);

  // 5.0 -> Voter (Receipt)
  drawArrow(doc, 430, 345, 80, 105, '#0891b2', 1.2, true);
  doc.fillColor('#0891b2').font('Helvetica').fontSize(6).text('SHA-256 Receipt', 260, 200);

  // D5 -> 6.0 (Read Sealed Ledger)
  drawArrow(doc, 515, 445, 645, 385, '#059669', 1.2);

  // 6.0 -> Admin (Reports)
  drawArrow(doc, 680, 330, 730, 105, '#059669', 1.2);
  doc.fillColor('#059669').font('Helvetica').fontSize(6.5).text('Certified CSV', 705, 200);

  // Footer Summary Strip
  doc.roundedRect(startX + 10, startY + H - 28, W - 20, 20, 3).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(0.8).roundedRect(startX + 10, startY + H - 28, W - 20, 20, 3).stroke();
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(7)
     .text('DFD LEVEL 1 SPECIFICATION: Decoupled process decomposition ensures zero ballot trace to D1 and zero race conditions on D5.', startX + 15, startY + H - 22, { width: W - 30, align: 'center', lineBreak: false });
}

module.exports = {
  renderUseCaseDiagram,
  renderSequenceDiagram,
  renderErDiagram,
  renderDfd0Diagram,
  renderDfd1Diagram
};
