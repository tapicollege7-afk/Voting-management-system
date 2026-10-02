/**
 * VotePulse Native PDFKit Diagram Renderers (16:9 Widescreen: 960 x 540)
 * Scaled and styled for the Tapi Diploma Engineering College Theme.
 */

function drawArrow(doc, x1, y1, x2, y2, color = '#1a365d', width = 1.3, isDashed = false) {
  doc.save();
  if (isDashed) doc.dash(4, { space: 3 });
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
  if (isDashed) doc.undash();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 6;
  const a = Math.PI / 6.5;
  const p1 = [x2 - len * Math.cos(angle - a), y2 - len * Math.sin(angle - a)];
  const p2 = [x2 - len * Math.cos(angle + a), y2 - len * Math.sin(angle + a)];
  doc.polygon([x2, y2], p1, p2).fillColor(color).fill();
  doc.restore();
}

function drawActor(doc, cx, cy, label, color = '#0284c7') {
  doc.save();
  doc.circle(cx, cy, 10).strokeColor(color).lineWidth(1.8).stroke();
  doc.moveTo(cx, cy + 10).lineTo(cx, cy + 34).strokeColor(color).lineWidth(1.8).stroke();
  doc.moveTo(cx - 13, cy + 20).lineTo(cx + 13, cy + 20).strokeColor(color).lineWidth(1.8).stroke();
  doc.moveTo(cx, cy + 34).lineTo(cx - 10, cy + 56).strokeColor(color).lineWidth(1.8).stroke();
  doc.moveTo(cx, cy + 34).lineTo(cx + 10, cy + 56).strokeColor(color).lineWidth(1.8).stroke();

  const badgeW = Math.max(60, doc.widthOfString(label, { font: 'Helvetica-Bold', size: 7 }) + 12);
  const badgeX = cx - (badgeW / 2);
  const badgeY = cy + 62;
  doc.roundedRect(badgeX, badgeY, badgeW, 15, 3).fill(color);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7)
     .text(label, badgeX, badgeY + 3.5, { width: badgeW, align: 'center', lineBreak: false });
  doc.restore();
}

function drawUseCase(doc, cx, cy, rx, ry, id, title, color = '#0284c7', isDashed = false) {
  doc.save();
  if (isDashed) doc.dash(4, { space: 2 });
  doc.ellipse(cx, cy, rx, ry).fillColor('#ffffff').fill();
  doc.ellipse(cx, cy, rx, ry).strokeColor(color).lineWidth(1.3).stroke();
  if (isDashed) doc.undash();

  doc.fillColor(color).font('Helvetica-Bold').fontSize(6.5)
     .text(id, cx - rx, cy - 7, { width: rx * 2, align: 'center', lineBreak: false });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.8)
     .text(title, cx - rx + 3, cy + 1, { width: (rx * 2) - 6, align: 'center', lineBreak: false });
  doc.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USE CASE DIAGRAM (16:9)
// ─────────────────────────────────────────────────────────────────────────────
function renderUseCaseDiagram169(doc) {
  const startX = 45;
  const startY = 82;
  const W = 805;
  const H = 418;

  doc.roundedRect(startX, startY, W, H, 6).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 6).stroke();

  // System Boundary Box
  const bX = 185;
  const bY = 92;
  const bW = 445;
  const bH = 370;

  doc.roundedRect(bX, bY, bW, bH, 6).fill('#f8fafc');
  doc.save();
  doc.dash(5, { space: 3 });
  doc.strokeColor('#3b82f6').lineWidth(1.4).roundedRect(bX, bY, bW, bH, 6).stroke();
  doc.restore();

  // Header Ribbon
  doc.roundedRect(bX, bY, bW, 20, 5).fill('#1a365d');
  doc.fillColor('#60a5fa').font('Helvetica-Bold').fontSize(8)
     .text('SYSTEM BOUNDARY: VOTEPULSE E-VOTING CORE PLATFORM', bX, bY + 5.5, { width: bW, align: 'center', lineBreak: false });

  // Actors
  drawActor(doc, 110, 130, 'VOTER', '#0284c7');
  drawActor(doc, 110, 310, 'CANDIDATE', '#7c3aed');
  drawActor(doc, 700, 130, 'SYSTEM ADMIN', '#059669');

  // Google SMTP Service
  const sX = 650;
  const sY = 300;
  doc.roundedRect(sX, sY, 95, 50, 4).fill('#fffbeb');
  doc.strokeColor('#d97706').lineWidth(1.4).roundedRect(sX, sY, 95, 50, 4).stroke();
  doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(7).text('<<Service>>', sX, sY + 6, { width: 95, align: 'center' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('Google SMTP', sX, sY + 18, { width: 95, align: 'center' });
  doc.fillColor('#475569').font('Helvetica').fontSize(6.5).text('2FA OTP & Receipts', sX, sY + 31, { width: 95, align: 'center' });

  // Left Column Use Cases
  drawUseCase(doc, 290, 130, 85, 15, 'UC-01', 'Register Account', '#0284c7');
  drawUseCase(doc, 290, 170, 85, 15, 'UC-03', 'Authenticate & Login', '#0284c7');
  drawUseCase(doc, 290, 210, 85, 15, 'UC-04', 'Review Active Polls', '#0284c7');
  drawUseCase(doc, 290, 250, 85, 15, 'UC-05', 'Cast Anonymous Ballot', '#0284c7');
  drawUseCase(doc, 290, 290, 85, 15, 'UC-07', 'Verify Audit Hash', '#0284c7');
  drawUseCase(doc, 290, 335, 85, 15, 'UC-08', 'Apply for Nomination', '#7c3aed');
  drawUseCase(doc, 290, 375, 85, 15, 'UC-09', 'Command Center Access', '#7c3aed');
  drawUseCase(doc, 290, 415, 85, 15, 'UC-11', 'Approve Candidates', '#059669');

  // Right Column Use Cases
  drawUseCase(doc, 515, 130, 95, 15, '<<include>> UC-02', 'Verify 2FA Email OTP', '#d97706', true);
  drawUseCase(doc, 515, 250, 95, 15, '<<include>> UC-06', 'Generate SHA-256 Seal', '#059669', true);
  drawUseCase(doc, 515, 335, 85, 15, 'UC-10', 'Monitor Live Turnout', '#7c3aed');
  drawUseCase(doc, 515, 375, 85, 15, 'UC-12', 'Create & Schedule Poll', '#059669');
  drawUseCase(doc, 515, 415, 85, 15, 'UC-13', 'Audit Logs & Diagnostics', '#059669');

  // Associations (Voter)
  doc.save();
  doc.strokeColor('#38bdf8').lineWidth(1.1);
  doc.moveTo(140, 140).lineTo(205, 130).stroke();
  doc.moveTo(140, 150).lineTo(205, 170).stroke();
  doc.moveTo(140, 160).lineTo(205, 210).stroke();
  doc.moveTo(140, 170).lineTo(205, 250).stroke();
  doc.moveTo(140, 180).lineTo(205, 290).stroke();

  // Associations (Candidate)
  doc.strokeColor('#c084fc').lineWidth(1.1);
  doc.moveTo(140, 330).lineTo(205, 170).stroke();
  doc.moveTo(140, 340).lineTo(205, 335).stroke();
  doc.moveTo(140, 350).lineTo(205, 375).stroke();
  doc.moveTo(140, 360).lineTo(430, 335).stroke();

  // Associations (Admin)
  doc.strokeColor('#34d399').lineWidth(1.1);
  doc.moveTo(670, 140).lineTo(600, 375).stroke();
  doc.moveTo(670, 150).lineTo(375, 415).stroke();
  doc.moveTo(670, 160).lineTo(600, 415).stroke();
  doc.restore();

  // <<include>> lines
  drawArrow(doc, 375, 130, 420, 130, '#d97706', 1.2, true);
  drawArrow(doc, 375, 250, 420, 250, '#059669', 1.2, true);

  // SMTP Dispatch
  drawArrow(doc, 610, 130, 660, 300, '#d97706', 1.1, true);
  drawArrow(doc, 610, 250, 660, 315, '#059669', 1.1, true);

  // Security Guarantee Strip at bottom of boundary
  doc.roundedRect(bX + 10, bY + bH - 24, bW - 20, 18, 3).fill('#ecfdf5');
  doc.strokeColor('#059669').lineWidth(0.8).roundedRect(bX + 10, bY + bH - 24, bW - 20, 18, 3).stroke();
  doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(6.8)
     .text('SECURITY INVARIANTS: Mandatory 2FA OTP gate (UC-02) | Non-repudiable SHA-256 ballot receipting (UC-06) | Zero double voting.', bX + 12, bY + bH - 18, { width: bW - 24, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEQUENCE DIAGRAM (16:9)
// ─────────────────────────────────────────────────────────────────────────────
function renderSequenceDiagram169(doc) {
  const startX = 45;
  const startY = 82;
  const W = 805;
  const H = 418;

  doc.roundedRect(startX, startY, W, H, 6).fill('#0f172a');
  doc.strokeColor('#334155').lineWidth(1.2).roundedRect(startX, startY, W, H, 6).stroke();

  // Title inside banner
  doc.roundedRect(startX + 10, startY + 8, W - 20, 24, 4).fill('#1e293b');
  doc.rect(startX + 10, startY + 8, 4, 24).fill('#2563eb');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5)
     .text('VOTEPULSE: END-TO-END SECURE BALLOT CASTING SEQUENCE DIAGRAM', startX + 20, startY + 16, { lineBreak: false });
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(7)
     .text('CONCURRENCY & CRYPTOGRAPHIC SEAL FLOW', startX + 20, startY + 16.5, { width: W - 40, align: 'right', lineBreak: false });

  const participants = [
    { name: 'Voter (Client)', x: 100, color: '#38bdf8' },
    { name: 'VoterPortal (React)', x: 230, color: '#38bdf8' },
    { name: 'API Server (/api)', x: 360, color: '#38bdf8' },
    { name: 'Security Middleware', x: 495, color: '#f59e0b' },
    { name: 'Crypto Engine', x: 625, color: '#a855f7' },
    { name: 'Database / Ledger', x: 745, color: '#10b981' }
  ];

  const topY = startY + 40;
  const botY = startY + 380;

  participants.forEach(p => {
    const bw = 96;
    const bx = p.x - (bw / 2);
    doc.roundedRect(bx, topY, bw, 20, 3).fill('#1e293b');
    doc.strokeColor(p.color).lineWidth(1.4).roundedRect(bx, topY, bw, 20, 3).stroke();
    doc.fillColor(p.color).font('Helvetica-Bold').fontSize(6.8)
       .text(p.name, bx, topY + 6, { width: bw, align: 'center', lineBreak: false });

    doc.save();
    doc.dash(4, { space: 3 });
    doc.moveTo(p.x, topY + 20).lineTo(p.x, botY).strokeColor('#334155').lineWidth(1).stroke();
    doc.restore();
  });

  let curY = startY + 70;
  drawArrow(doc, 100, curY, 230, curY, '#38bdf8', 1.1);
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(6.5).text('1. Select Candidate & Confirm Vote', 105, curY - 8);

  curY += 24;
  drawArrow(doc, 230, curY, 360, curY, '#38bdf8', 1.3);
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(6.5).text('2. POST /api/vote (election_id, candidate_id) [Bearer JWT]', 235, curY - 8);

  curY += 24;
  drawArrow(doc, 360, curY, 495, curY, '#f59e0b', 1.2);
  doc.fillColor('#fbbf24').font('Helvetica-Bold').fontSize(6.5).text('3. validateVoteCast(req.body) & Token Check', 365, curY - 8);

  curY += 24;
  drawArrow(doc, 495, curY, 745, curY, '#f59e0b', 1.1);
  doc.fillColor('#fbbf24').font('Helvetica').fontSize(6.2).text('4. Check Election.status === "active"', 510, curY - 7);

  curY += 24;
  drawArrow(doc, 495, curY, 745, curY, '#f59e0b', 1.3);
  doc.fillColor('#f59e0b').font('Helvetica-Bold').fontSize(6.5).text('5. Atomic Check: findOneAndUpdate({has_voted: false})', 505, curY - 8);

  // [ALT: Duplicate Attempt Box]
  curY += 15;
  const altBoxY = curY;
  doc.save();
  doc.dash(4, { space: 2 });
  doc.roundedRect(300, altBoxY, 450, 40, 3).fill('#450a0a');
  doc.strokeColor('#ef4444').lineWidth(1.1).roundedRect(300, altBoxY, 450, 40, 3).stroke();
  doc.restore();

  doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(6.5).text('[ALT: If already voted (Race Condition Attempt)]', 310, altBoxY + 3);
  drawArrow(doc, 745, altBoxY + 18, 495, altBoxY + 18, '#ef4444', 1.1, true);
  doc.fillColor('#fca5a5').font('Helvetica').fontSize(6).text('Lock Denied (already_voted = true)', 520, altBoxY + 11);

  drawArrow(doc, 495, altBoxY + 31, 230, altBoxY + 31, '#ef4444', 1.1, true);
  doc.fillColor('#fca5a5').font('Helvetica-Bold').fontSize(6.2).text('HTTP 409 Conflict ("Duplicate ballot rejected")', 240, altBoxY + 24);

  curY = altBoxY + 48;
  drawArrow(doc, 360, curY, 625, curY, '#c084fc', 1.2);
  doc.fillColor('#c084fc').font('Helvetica-Bold').fontSize(6.5).text('6. sha256Hash(ballotPayload) & caesarCipherEncrypt(raw, 3)', 370, curY - 8);

  curY += 24;
  drawArrow(doc, 625, curY, 360, curY, '#c084fc', 1.1, true);
  doc.fillColor('#e9d5ff').font('Helvetica').fontSize(6.2).text('7. Return {sha256_seal, caesar_hash, receipt_id}', 390, curY - 7);

  curY += 24;
  drawArrow(doc, 360, curY, 745, curY, '#34d399', 1.3);
  doc.fillColor('#34d399').font('Helvetica-Bold').fontSize(6.5).text('8. Persist Vote (Decoupled voter_id) & Incr candidate.votes', 370, curY - 8);

  curY += 24;
  drawArrow(doc, 360, curY, 230, curY, '#38bdf8', 1.3, true);
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(6.5).text('9. HTTP 201 Created {success: true, receipt: "e3b0c44..."}', 240, curY - 8);

  curY += 24;
  drawArrow(doc, 230, curY, 100, curY, '#38bdf8', 1.1, true);
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(6.5).text('10. Display Verified Receipt Modal & Lock Ballot UI', 110, curY - 8);

  // Footer summary
  doc.roundedRect(startX + 10, startY + H - 26, W - 20, 20, 3).fill('#1e293b');
  doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(7)
     .text('ZERO-TOLERANCE RACE DEFENSE: Native MongoDB atomic locks reject concurrent duplicate votes in < 2ms.', startX + 15, startY + H - 20, { width: W - 30, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ENTITY-RELATIONSHIP (ER) DIAGRAM (16:9)
// ─────────────────────────────────────────────────────────────────────────────
function renderErDiagram169(doc) {
  const startX = 45;
  const startY = 82;
  const W = 805;
  const H = 418;

  doc.roundedRect(startX, startY, W, H, 6).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 6).stroke();

  function drawTable(x, y, w, h, title, color, fields) {
    doc.roundedRect(x, y, w, h, 4).fill('#ffffff');
    doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(x, y, w, h, 4).stroke();

    doc.roundedRect(x, y, w, 18, 4).fill(color);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5)
       .text(title, x + 6, y + 5, { lineBreak: false });

    fields.forEach((f, idx) => {
      const fy = y + 23 + (idx * 14.5);
      if (idx % 2 === 1) doc.rect(x + 1, fy - 2, w - 2, 14.5).fill('#f8fafc');

      if (f.key) {
        const kw = 14;
        const kc = f.key === 'PK' ? '#2563eb' : '#d97706';
        doc.roundedRect(x + 5, fy, kw, 10, 2).fill(kc);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(5.5)
           .text(f.key, x + 5, fy + 2, { width: kw, align: 'center', lineBreak: false });
      }

      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.5)
         .text(f.name, x + 24, fy + 1, { lineBreak: false });

      doc.fillColor('#64748b').font('Helvetica').fontSize(6.2)
         .text(f.type, x + 24, fy + 1, { width: w - 28, align: 'right', lineBreak: false });
    });
  }

  // Tables
  drawTable(55, 92, 225, 145, 'USER (Collection: users)', '#0284c7', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'name', type: 'String' },
    { key: '', name: 'email', type: 'String (Unique)' },
    { key: '', name: 'password_hash', type: 'String (Bcrypt)' },
    { key: '', name: 'role', type: 'Enum (voter|cand|admin)' },
    { key: '', name: 'is_verified', type: 'Boolean' },
    { key: '', name: 'has_voted_elections', type: 'Array<ObjectId>' },
    { key: '', name: 'created_at', type: 'Timestamp' }
  ]);

  drawTable(310, 92, 225, 132, 'ELECTION (Collection: elections)', '#059669', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'title', type: 'String' },
    { key: '', name: 'description', type: 'String' },
    { key: '', name: 'start_date', type: 'Timestamp' },
    { key: '', name: 'end_date', type: 'Timestamp' },
    { key: '', name: 'status', type: 'Enum (active|closed)' },
    { key: 'FK', name: 'created_by', type: 'ObjectId (User)' }
  ]);

  drawTable(565, 92, 230, 145, 'CANDIDATE (Collection: candidates)', '#7c3aed', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: 'FK', name: 'user_id', type: 'ObjectId (User)' },
    { key: 'FK', name: 'election_id', type: 'ObjectId (Election)' },
    { key: '', name: 'party_name', type: 'String' },
    { key: '', name: 'manifesto', type: 'String' },
    { key: '', name: 'symbol_url', type: 'String' },
    { key: '', name: 'approval_status', type: 'Enum (appr|pend)' },
    { key: '', name: 'vote_count', type: 'Number (Atomic)' }
  ]);

  drawTable(55, 255, 225, 118, 'OTP_TOKEN (Collection: otp_tokens)', '#d97706', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: '', name: 'email', type: 'String (Index)' },
    { key: '', name: 'otp_hash', type: 'String (Salted SHA)' },
    { key: '', name: 'purpose', type: 'Enum (reg|2fa|pwd)' },
    { key: '', name: 'expires_at', type: 'Timestamp (TTL 300s)' },
    { key: '', name: 'attempts', type: 'Number (Max 3)' }
  ]);

  drawTable(310, 245, 225, 145, 'VOTE (Collection: votes - Ledger)', '#0891b2', [
    { key: 'PK', name: '_id', type: 'ObjectId' },
    { key: 'FK', name: 'election_id', type: 'ObjectId (Election)' },
    { key: 'FK', name: 'candidate_id', type: 'ObjectId (Candidate)' },
    { key: '', name: 'vote_hash', type: 'String (SHA-256)' },
    { key: '', name: 'caesar_hash', type: 'String (Cipher k=3)' },
    { key: '', name: 'previous_hash', type: 'String (Chain)' },
    { key: '', name: 'cast_at', type: 'Timestamp' },
    { key: '', name: '* voter_id DECOUPLED', type: 'Strict Privacy' }
  ]);

  // Secret Ballot Card
  doc.roundedRect(565, 245, 230, 145, 4).fill('#ecfdf5');
  doc.strokeColor('#059669').lineWidth(1.1).roundedRect(565, 245, 230, 145, 4).stroke();

  doc.roundedRect(565, 245, 230, 18, 4).fill('#059669');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7)
     .text('SECRET BALLOT DECOUPLING', 565, 250, { width: 230, align: 'center', lineBreak: false });

  const decouplingNote = `CONSTITUTIONAL PRIVACY GUARANTEE:

1. Secret Ballot Integrity:
The VOTE collection contains ZERO foreign keys or pointers linking back to USER._id.

2. Double-Voting Prevention:
Voter participation is recorded solely in USER.has_voted_elections via an atomic lock.

3. Independent Public Auditability:
Voter receives an immutable SHA-256 receipt (vote_hash) for self-verification without revealing choice.`;

  doc.fillColor('#065f46').font('Helvetica').fontSize(6.5)
     .text(decouplingNote, 572, 270, { width: 216, lineGap: 1.6 });

  // Relationships
  drawArrow(doc, 280, 130, 310, 130, '#0284c7', 1.1);
  drawArrow(doc, 280, 155, 565, 155, '#7c3aed', 1.1);
  drawArrow(doc, 160, 237, 160, 255, '#d97706', 1.1);
  drawArrow(doc, 535, 130, 565, 130, '#059669', 1.1);
  drawArrow(doc, 420, 224, 420, 245, '#059669', 1.1);
  drawArrow(doc, 620, 237, 480, 245, '#7c3aed', 1.1);

  // Footer
  doc.roundedRect(startX + 10, startY + H - 24, W - 20, 18, 3).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(0.8).roundedRect(startX + 10, startY + H - 24, W - 20, 18, 3).stroke();
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(6.8)
     .text('KEYS: [PK] Primary Key | [FK] Foreign Key | TTL AUTO-EXPIRY: 300 SECONDS | CRYPTOGRAPHIC BALLOT ANONYMIZATION', startX + 15, startY + H - 18, { width: W - 30, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DFD LEVEL 0 (16:9)
// ─────────────────────────────────────────────────────────────────────────────
function renderDfd0Diagram169(doc) {
  const startX = 45;
  const startY = 82;
  const W = 805;
  const H = 418;

  doc.roundedRect(startX, startY, W, H, 6).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 6).stroke();

  const cX = startX + (W / 2);
  const cY = startY + 195;
  const cR = 68;

  doc.circle(cX, cY, cR).fill('#1e293b');
  doc.circle(cX, cY, cR).strokeColor('#2563eb').lineWidth(2.5).stroke();

  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(10)
     .text('0.0', cX - cR, cY - 36, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
     .text('VOTEPULSE CORE', cX - cR, cY - 22, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
     .text('E-VOTING & AUDIT', cX - cR, cY - 8, { width: cR * 2, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
     .text('MANAGEMENT SYSTEM', cX - cR, cY + 5, { width: cR * 2, align: 'center' });
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.8)
     .text('(Context Boundary)', cX - cR, cY + 20, { width: cR * 2, align: 'center' });

  function drawEntity(x, y, w, h, title, subtitle, color) {
    doc.roundedRect(x, y, w, h, 4).fill('#ffffff');
    doc.strokeColor(color).lineWidth(1.5).roundedRect(x, y, w, h, 4).stroke();
    doc.roundedRect(x, y, w, 16, 4).fill(color);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.2)
       .text(title, x, y + 4, { width: w, align: 'center', lineBreak: false });
    doc.fillColor('#475569').font('Helvetica').fontSize(6.5)
       .text(subtitle, x + 4, y + 21, { width: w - 8, align: 'center', lineBreak: false });
  }

  drawEntity(60, 100, 150, 48, 'VOTER (ELECTOR)', 'PWA Client / Mobile Web', '#0284c7');
  drawEntity(60, 290, 150, 48, 'CANDIDATE', 'Campaign Command Center', '#7c3aed');
  drawEntity(640, 100, 160, 48, 'SYSTEM ADMINISTRATOR', 'Master Console (ADM-9999)', '#059669');
  drawEntity(640, 290, 160, 48, 'GOOGLE SMTP GATEWAY', 'TLS Email Notification Hub', '#d97706');

  // Flows
  drawArrow(doc, 210, 115, cX - 60, cY - 40, '#0284c7', 1.2);
  doc.fillColor('#0284c7').font('Helvetica-Bold').fontSize(6.5).text('1. Credentials, 2FA OTP, Ballot Choice', 160, 95);

  drawArrow(doc, cX - 65, cY - 18, 210, 132, '#38bdf8', 1.2);
  doc.fillColor('#0369a1').font('Helvetica').fontSize(6.5).text('2. JWT Session, Candidates, SHA-256 Receipt', 165, 145);

  drawArrow(doc, 210, 305, cX - 60, cY + 30, '#7c3aed', 1.2);
  doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(6.5).text('3. Nomination Dossier & Manifesto Updates', 165, 290);

  drawArrow(doc, cX - 65, cY + 48, 210, 322, '#a855f7', 1.2);
  doc.fillColor('#6b21a8').font('Helvetica').fontSize(6.5).text('4. Approval Dossier, Real-time Turnout', 165, 340);

  drawArrow(doc, 640, 115, cX + 60, cY - 40, '#059669', 1.2);
  doc.fillColor('#059669').font('Helvetica-Bold').fontSize(6.5).text('5. Poll Config, Nominee Approvals', 505, 95);

  drawArrow(doc, cX + 65, cY - 18, 640, 132, '#10b981', 1.2);
  doc.fillColor('#047857').font('Helvetica').fontSize(6.5).text('6. Audit Trail Logs, Certified CSV', 510, 145);

  drawArrow(doc, cX + 60, cY + 30, 640, 305, '#d97706', 1.2);
  doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(6.5).text('7. 6-Digit OTP, Ballot Audit Receipts', 505, 290);

  drawArrow(doc, 640, 322, cX + 65, cY + 48, '#b45309', 1.2);
  doc.fillColor('#92400e').font('Helvetica').fontSize(6.5).text('8. SMTP TLS Delivery Acknowledgment', 510, 340);

  // Footer
  doc.roundedRect(startX + 10, startY + H - 26, W - 20, 20, 3).fill('#1e293b');
  doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(7)
     .text('DFD LEVEL 0 CONTEXT SPECIFICATION: All external boundary crossings protected by TLS 1.3 encryption & JWT authentication.', startX + 15, startY + H - 20, { width: W - 30, align: 'center', lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DFD LEVEL 1 (16:9)
// ─────────────────────────────────────────────────────────────────────────────
function renderDfd1Diagram169(doc) {
  const startX = 45;
  const startY = 82;
  const W = 805;
  const H = 418;

  doc.roundedRect(startX, startY, W, H, 6).fill('#ffffff');
  doc.strokeColor('#cbd5e1').lineWidth(1).roundedRect(startX, startY, W, H, 6).stroke();

  function drawProcess(cx, cy, id, title, color) {
    const r = 28;
    doc.circle(cx, cy, r).fill('#ffffff');
    doc.circle(cx, cy, r).strokeColor(color).lineWidth(1.6).stroke();
    doc.fillColor(color).font('Helvetica-Bold').fontSize(7)
       .text(id, cx - r, cy - 12, { width: r * 2, align: 'center' });
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6)
       .text(title, cx - r + 2, cy - 2, { width: (r * 2) - 4, align: 'center' });
  }

  function drawDataStore(x, y, w, h, id, title, color) {
    doc.rect(x, y, w, h).fill('#f8fafc');
    doc.moveTo(x, y).lineTo(x + w, y).strokeColor(color).lineWidth(1.4).stroke();
    doc.moveTo(x, y + h).lineTo(x + w, y + h).strokeColor(color).lineWidth(1.4).stroke();
    doc.fillColor(color).font('Helvetica-Bold').fontSize(7).text(id, x + 6, y + (h / 2) - 3.5);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.5).text(title, x + 24, y + (h / 2) - 3.5);
  }

  // 6 Processes
  drawProcess(145, 125, '1.0', 'Identity &\n2FA Engine', '#0284c7');
  drawProcess(400, 125, '2.0', 'Election Config\nLifecycle', '#059669');
  drawProcess(650, 125, '3.0', 'Candidate\nNomination', '#7c3aed');

  drawProcess(215, 320, '4.0', 'Atomic Voting\n& Lock Engine', '#dc2626');
  drawProcess(455, 320, '5.0', 'SHA-256 Crypto\nSealing Engine', '#0891b2');
  drawProcess(685, 320, '6.0', 'Live Tally &\nAudit Ledger', '#059669');

  // 5 Data Stores
  drawDataStore(55, 215, 140, 24, 'D1', 'Users & Auth Store', '#0284c7');
  drawDataStore(230, 215, 145, 24, 'D2', 'OTP Cache (TTL 300s)', '#d97706');
  drawDataStore(410, 215, 145, 24, 'D3', 'Election Catalog', '#059669');
  drawDataStore(585, 215, 145, 24, 'D4', 'Candidate Registry', '#7c3aed');
  drawDataStore(335, 390, 200, 24, 'D5', 'Sealed Vote Ledger (SHA-256)', '#0891b2');

  // Entities
  doc.roundedRect(45, 90, 55, 26, 3).fill('#0284c7');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7).text('VOTER', 45, 98, { width: 55, align: 'center' });

  doc.roundedRect(735, 90, 55, 26, 3).fill('#059669');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.8).text('ADMIN', 735, 98, { width: 55, align: 'center' });

  // Flows
  drawArrow(doc, 100, 103, 117, 115, '#0284c7', 1.1);
  drawArrow(doc, 135, 153, 115, 215, '#0284c7', 1.1);
  drawArrow(doc, 170, 145, 245, 215, '#d97706', 1.1);

  drawArrow(doc, 735, 103, 428, 120, '#059669', 1.1);
  drawArrow(doc, 408, 153, 435, 215, '#059669', 1.1);

  drawArrow(doc, 735, 108, 678, 118, '#7c3aed', 1.1);
  drawArrow(doc, 650, 153, 650, 215, '#7c3aed', 1.1);

  drawArrow(doc, 75, 116, 190, 298, '#dc2626', 1.3);
  doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(6).text('Cast Ballot Payload', 90, 245);

  drawArrow(doc, 195, 298, 140, 239, '#dc2626', 1.2);
  drawArrow(doc, 430, 239, 240, 298, '#059669', 1.1);
  drawArrow(doc, 605, 239, 245, 308, '#7c3aed', 1.1);

  drawArrow(doc, 243, 320, 427, 320, '#dc2626', 1.3);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.2).text('Raw Ballot Choice', 305, 310);

  drawArrow(doc, 455, 348, 435, 390, '#0891b2', 1.3);
  doc.fillColor('#0891b2').font('Helvetica-Bold').fontSize(6).text('Save SHA-256 Hash', 445, 368);

  drawArrow(doc, 480, 295, 605, 239, '#7c3aed', 1.1);
  drawArrow(doc, 535, 395, 665, 345, '#059669', 1.1);

  drawArrow(doc, 450, 295, 80, 116, '#0891b2', 1.1, true);
  doc.fillColor('#0891b2').font('Helvetica').fontSize(6).text('SHA-256 Receipt', 240, 175);

  drawArrow(doc, 705, 295, 755, 116, '#059669', 1.1);
  doc.fillColor('#059669').font('Helvetica').fontSize(6).text('Certified CSV', 720, 185);

  // Footer
  doc.roundedRect(startX + 10, startY + H - 24, W - 20, 18, 3).fill('#f8fafc');
  doc.strokeColor('#cbd5e1').lineWidth(0.8).roundedRect(startX + 10, startY + H - 24, W - 20, 18, 3).stroke();
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(6.8)
     .text('DFD LEVEL 1 SPECIFICATION: Decoupled process decomposition guarantees zero voter-to-ballot linkage in D5.', startX + 15, startY + H - 18, { width: W - 30, align: 'center', lineBreak: false });
}

module.exports = {
  renderUseCaseDiagram169,
  renderSequenceDiagram169,
  renderErDiagram169,
  renderDfd0Diagram169,
  renderDfd1Diagram169
};
