const express = require('express');
const router = express.Router();
const db = require('../../database');
const {
  sendCandidateRegistrationTicket,
  sendGmailVerificationCode,
  sendCandidateLoginVerificationCode,
  sendCandidateApprovalDecisionEmail
} = require('../helpers/email');

// Global in-memory map for pending candidates waiting for OTP verification (Deferred DB creation)
global.pendingCandidates = global.pendingCandidates || new Map();

// Candidates: Get Candidates List (defaults to approved candidates for public/ballot, supports status filter)
router.get('/candidates', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id, status } = req.query;
    const filterStatus = status || 'approved';
    const candidates = await db.getCandidates(election_id || null, filterStatus);
    res.json({ success: true, candidates: candidates || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Candidate Nomination Registration (Direct without OTP, details emailed, status: pending admin approval)
const handleCandidateNomination = async (req, res) => {
  try {
    const { id, election_id, name, department, manifesto, photo_url, email, password } = req.body;
    if (!election_id || !name || !email) {
      return res.status(400).json({ success: false, message: "Election ID, candidate name, and email are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const candId = (id || `CAND-2026-${Math.floor(1000 + Math.random() * 9000)}`).trim();

    // Create candidate in database with 'pending' status waiting for administrator approval
    const newCandidate = await db.createCandidate({
      id: candId,
      election_id,
      name: name.trim(),
      department: (department || 'General').trim(),
      party: (department || 'General').trim(),
      manifesto: (manifesto || 'Official Campaign Manifesto').trim(),
      photo_url: photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=06b6d4&color=fff&size=300`,
      email: cleanEmail,
      password: password || 'cand123',
      status: 'pending'
    });

    // Dispatch Official Candidate Registration Ticket with all submitted details to their given email
    const elections = await db.getElections();
    const targetElec = (elections || []).find(e => e.id === election_id);
    await sendCandidateRegistrationTicket({
      email: cleanEmail,
      candidateId: newCandidate.id,
      name: newCandidate.name,
      password: password || 'cand123',
      party: newCandidate.department || newCandidate.party,
      manifesto: newCandidate.manifesto,
      electionTitle: targetElec ? targetElec.title : 'General Election 2026',
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: `🎉 Candidate nomination submitted! Registration details sent to ${cleanEmail}. Your candidacy is pending administrator approval.`,
      candidate: newCandidate,
      candidate_id: newCandidate.id,
      status: 'pending'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/candidates/nominate', handleCandidateNomination);
router.post('/candidates/register-otp', handleCandidateNomination);

// Candidates: Verify Candidate OTP (Maintained for backward compatibility)
router.post('/candidates/verify-otp', async (req, res) => {
  try {
    const { candidate_id, email, token_code } = req.body;
    const cleanKey = (candidate_id || email || '').trim().toLowerCase();
    const cleanCode = (token_code || '').trim();

    const pendingPayload = global.pendingCandidates ? global.pendingCandidates.get(cleanKey) : null;

    if (!pendingPayload || pendingPayload.token_code !== cleanCode) {
      return res.status(400).json({ success: false, message: "Invalid candidate verification code." });
    }

    const newCandidate = await db.createCandidate({
      id: pendingPayload.id,
      election_id: pendingPayload.election_id,
      name: pendingPayload.name,
      department: pendingPayload.department,
      manifesto: pendingPayload.manifesto,
      photo_url: pendingPayload.photo_url,
      email: pendingPayload.email,
      password: pendingPayload.password,
      status: 'pending'
    });

    global.pendingCandidates.delete(pendingPayload.id.toLowerCase());
    global.pendingCandidates.delete(pendingPayload.email);

    return res.status(201).json({
      success: true,
      message: `🎉 Candidate nomination verified and submitted!`,
      candidate: newCandidate
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Login (Direct check without OTP: if admin allows -> direct entry; if denied/pending -> "Please try again later")
router.post('/candidates/login', async (req, res) => {
  try {
    const { candidate_id, password } = req.body;
    if (!candidate_id || !password) {
      return res.status(400).json({ success: false, message: "Candidate ID and password are required." });
    }

    const query = candidate_id.trim().toLowerCase();
    // Search across all candidates regardless of status
    const allCandidates = await db.getCandidates(null, 'all');
    const found = (allCandidates || []).find(c =>
      c.id.toLowerCase() === query ||
      (c.email && c.email.toLowerCase() === query) ||
      c.name.toLowerCase() === query
    );

    if (!found) {
      return res.status(401).json({ success: false, message: "Candidate record not found." });
    }

    const enteredPass = password.trim();
    const expectedPass = found.password || 'cand123';
    if (enteredPass !== expectedPass) {
      return res.status(401).json({ success: false, message: "Incorrect candidate passcode." });
    }

    // Check Administrator Verification Status:
    // If admin allows -> candidate enters candidate home page
    // If admin denies or pending -> message shows "Please try again later"
    if (found.status === 'approved' || !found.status) {
      return res.json({
        success: true,
        direct: true,
        message: `Welcome Candidate ${found.name}!`,
        candidate: found
      });
    }

    // Denied or pending verification:
    return res.status(403).json({
      success: false,
      message: "Please try again later"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Verify Candidate Login OTP (Retained for automated test suite compatibility)
router.post('/candidates/verify-login-otp', async (req, res) => {
  try {
    const { candidate_id, token_code } = req.body;
    if (!candidate_id || !token_code) {
      return res.status(400).json({ success: false, message: "Candidate ID and OTP code are required." });
    }

    const cleanId = candidate_id.trim().toLowerCase();
    const cleanCode = token_code.trim();

    const pending = global.pendingCandidateLogins ? global.pendingCandidateLogins.get(cleanId) : null;
    if (!pending || pending.token_code !== cleanCode || Date.now() > pending.expires_at) {
      return res.status(400).json({ success: false, message: "Invalid or expired candidate verification code." });
    }

    global.pendingCandidateLogins.delete(cleanId);

    return res.json({
      success: true,
      message: `🎉 Candidate verified! Access granted.`,
      candidate: pending.candidate
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Admin Approve Candidate
router.post('/candidates/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Candidate ID is required." });

    const updated = await db.updateCandidateStatus(id, 'approved');
    if (!updated) return res.status(404).json({ success: false, message: "Candidate not found." });

    if (updated.email && /\S+@\S+\.\S+/.test(updated.email.trim())) {
      const elections = await db.getElections();
      const targetElec = (elections || []).find(e => e.id === updated.election_id);
      await sendCandidateApprovalDecisionEmail({
        email: updated.email.trim(),
        candidateId: updated.id,
        name: updated.name,
        party: updated.party || updated.department,
        electionTitle: targetElec ? targetElec.title : 'General Election 2026',
        approved: true
      });
    }

    return res.json({
      success: true,
      message: `Candidate ${updated.name} (${updated.id}) has been approved and added to ballot!`,
      candidate: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Admin Deny Candidate
router.post('/candidates/:id/deny', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Candidate ID is required." });

    const updated = await db.updateCandidateStatus(id, 'rejected');
    if (!updated) return res.status(404).json({ success: false, message: "Candidate not found." });

    if (updated.email && /\S+@\S+\.\S+/.test(updated.email.trim())) {
      const elections = await db.getElections();
      const targetElec = (elections || []).find(e => e.id === updated.election_id);
      await sendCandidateApprovalDecisionEmail({
        email: updated.email.trim(),
        candidateId: updated.id,
        name: updated.name,
        party: updated.party || updated.department,
        electionTitle: targetElec ? targetElec.title : 'General Election 2026',
        approved: false
      });
    }

    return res.json({
      success: true,
      message: `Candidate ${updated.name} (${updated.id}) nomination denied.`,
      candidate: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Direct Add / Register Candidate (Administrative & Seeding Engine)
router.post('/candidates', async (req, res) => {
  try {
    const { id, election_id, name, department, manifesto, photo_url, email, password } = req.body;
    if (!election_id || !name) {
      return res.status(400).json({ success: false, message: "Election ID and candidate name are required." });
    }
    const newCandidate = await db.createCandidate({ id, election_id, name, department, manifesto, photo_url, email, password });
    
    // Dispatch Official Candidate Credential Ticket via Email if email is present
    if (email && /\S+@\S+\.\S+/.test(email.trim())) {
      const elections = await db.getElections();
      const targetElec = (elections || []).find(e => e.id === election_id);
      await sendCandidateRegistrationTicket({
        email: email.trim(),
        candidateId: newCandidate.id,
        name: newCandidate.name,
        password: password || 'cand123',
        party: newCandidate.department,
        electionTitle: targetElec ? targetElec.title : 'General Election 2026'
      });
    }

    const ticket = {
      candidate_id: newCandidate.id,
      name: newCandidate.name,
      party: newCandidate.department,
      election_id: newCandidate.election_id,
      email: email || '',
      password: password || 'cand123',
      created_at: newCandidate.created_at || new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: `Candidate registered! Credential ticket dispatched to ${email || 'candidate profile'}.`,
      candidate: newCandidate,
      ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Delete Candidate
const handleDeleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Candidate ID is required." });
    }
    const result = await db.deleteCandidate(id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/candidates/:id', handleDeleteCandidate);
router.post('/candidates/:id/delete', handleDeleteCandidate);

module.exports = router;
