const express = require('express');
const router = express.Router();
const db = require('../../database');
const { sendCandidateRegistrationTicket, sendGmailVerificationCode } = require('../helpers/email');

// Global in-memory map for pending candidates waiting for OTP verification (Deferred DB creation)
global.pendingCandidates = global.pendingCandidates || new Map();

// Candidates: Get Candidates List
router.get('/candidates', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.query;
    const candidates = await db.getCandidates(election_id || null);
    res.json({ success: true, candidates: candidates || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Request OTP Verification for Candidate Nomination
router.post('/candidates/register-otp', async (req, res) => {
  try {
    const { id, election_id, name, department, manifesto, photo_url, email, password } = req.body;
    if (!election_id || !name || !email) {
      return res.status(400).json({ success: false, message: "Election ID, candidate name, and email are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const candId = (id || `CAND-2026-${Math.floor(1000 + Math.random() * 9000)}`).trim();
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();

    const pendingPayload = {
      id: candId,
      election_id,
      name: name.trim(),
      email: cleanEmail,
      password: password || 'cand123',
      department: (department || 'General').trim(),
      manifesto: (manifesto || 'Official Campaign Manifesto').trim(),
      photo_url: photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=06b6d4&color=fff&size=300`,
      token_code,
      created_at: new Date().toISOString()
    };

    global.pendingCandidates.set(candId.toLowerCase(), pendingPayload);
    global.pendingCandidates.set(cleanEmail, pendingPayload);

    const emailResult = await sendGmailVerificationCode(cleanEmail, candId, token_code);

    return res.status(201).json({
      success: true,
      message: `Candidate verification code sent to ${cleanEmail}. Account created only after OTP verification.`,
      candidate_id: candId,
      token_code,
      email: cleanEmail,
      previewUrl: emailResult?.previewUrl
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Verify Candidate OTP & Confirm Nomination in Database
router.post('/candidates/verify-otp', async (req, res) => {
  try {
    const { candidate_id, email, token_code } = req.body;
    const cleanKey = (candidate_id || email || '').trim().toLowerCase();
    const cleanCode = (token_code || '').trim();

    const pendingPayload = global.pendingCandidates ? global.pendingCandidates.get(cleanKey) : null;

    if (!pendingPayload || pendingPayload.token_code !== cleanCode) {
      return res.status(400).json({ success: false, message: "Invalid candidate verification code." });
    }

    // Now save candidate to database
    const newCandidate = await db.createCandidate({
      id: pendingPayload.id,
      election_id: pendingPayload.election_id,
      name: pendingPayload.name,
      department: pendingPayload.department,
      manifesto: pendingPayload.manifesto,
      photo_url: pendingPayload.photo_url,
      email: pendingPayload.email,
      password: pendingPayload.password
    });

    // Remove from pending store
    global.pendingCandidates.delete(pendingPayload.id.toLowerCase());
    global.pendingCandidates.delete(pendingPayload.email);

    // Dispatch Official Candidate Credential Ticket via Email
    const elections = await db.getElections();
    const targetElec = (elections || []).find(e => e.id === pendingPayload.election_id);
    await sendCandidateRegistrationTicket({
      email: pendingPayload.email,
      candidateId: newCandidate.id,
      name: newCandidate.name,
      password: pendingPayload.password,
      party: newCandidate.department,
      electionTitle: targetElec ? targetElec.title : 'General Election 2026'
    });

    return res.status(201).json({
      success: true,
      message: `🎉 Candidate nomination verified and created in database!`,
      candidate: newCandidate
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Direct Add / Register Candidate
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
