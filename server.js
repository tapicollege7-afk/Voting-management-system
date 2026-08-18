const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const { sendGmailVerificationCode } = require('./utils/email');
const { caesarCipherEncrypt, sha256Hash } = require('./utils/cipher');
const {
  validateVoterRegistration,
  validateVoteCast
} = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable browser caching for static files so changes appear instantly
const noCacheOptions = {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

// Serve Static React App & Public Assets
if (require('fs').existsSync(path.join(__dirname, 'dist'))) {
  app.use('/', express.static(path.join(__dirname, 'dist'), noCacheOptions));
}
app.use('/', express.static(path.join(__dirname, 'public'), noCacheOptions));

// --- REST API ENDPOINTS ---

// Health & System Info
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    system: 'VotePulse Secure Online Voting Engine',
    timestamp: new Date().toISOString(),
    stats: db.getStats()
  });
});

// Authentication: Register Voter
app.post('/api/auth/register', validateVoterRegistration, async (req, res) => {
  try {
    const { voter_id, name, email, phone, password } = req.body;
    
    const existing = db.findUserByVoterId(voter_id);
    if (existing) {
      return res.status(400).json({ success: false, message: "Voter ID or Email is already registered." });
    }

    const newUser = db.createUser({ voter_id, name, email, phone, password });
    const gmailToken = db.createGmailToken(newUser.voter_id, newUser.email);

    // Send real verification token to voter's Gmail address
    await sendGmailVerificationCode(newUser.email, newUser.voter_id, gmailToken.token_code);

    return res.status(201).json({
      success: true,
      message: `Registration initiated! Real-time verification token dispatched to ${newUser.email}.`,
      voter: {
        id: newUser.id,
        voter_id: newUser.voter_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      },
      token_preview: gmailToken.token_code
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Login Voter & Request Real Gmail Token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { voter_id, password } = req.body;
    if (!voter_id || !password) {
      return res.status(400).json({ success: false, message: "Voter ID and password are required." });
    }

    const user = db.findUserByVoterId(voter_id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Voter ID or credentials." });
    }

    if (!db.verifyUserPassword(user, password)) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const gmailToken = db.createGmailToken(user.voter_id, user.email);
    await sendGmailVerificationCode(user.email, user.voter_id, gmailToken.token_code);

    return res.json({
      success: true,
      message: `Credentials verified. Verification code sent to ${user.email}.`,
      user: {
        id: user.id,
        voter_id: user.voter_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token_preview: gmailToken.token_code
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Real Gmail Token Verification Endpoint
app.post('/api/auth/verify-gmail-token', (req, res) => {
  try {
    const { voter_id, token_code } = req.body;
    if (!voter_id || !token_code) {
      return res.status(400).json({ success: false, message: "Voter ID and verification token are required." });
    }

    const isValid = db.verifyGmailToken(voter_id, token_code);
    if (isValid) {
      return res.json({
        success: true,
        message: "Gmail verification successful. Access granted."
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token code."
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Get Elections List
app.get('/api/elections', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const elections = db.getElections();
    res.json({ success: true, elections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Create Election (Admin)
app.post('/api/elections', (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Election title and description are required." });
    }
    const newElection = db.createElection({ title, description, category });
    res.status(201).json({ success: true, message: "Election created successfully.", election: newElection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Update Status (Admin)
app.patch('/api/elections/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = db.updateElectionStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    res.json({ success: true, message: `Election status updated to '${status}'.`, election: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Get Candidates
app.get('/api/candidates', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.query;
    const candidates = db.getCandidates(election_id);
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Add Candidate (Admin)
app.post('/api/candidates', (req, res) => {
  try {
    const { election_id, name, department, manifesto, photo_url } = req.body;
    if (!election_id || !name) {
      return res.status(400).json({ success: false, message: "Election ID and candidate name are required." });
    }
    const newCandidate = db.createCandidate({ election_id, name, department, manifesto, photo_url });
    res.status(201).json({ success: true, message: "Candidate added successfully.", candidate: newCandidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Voter Voting Status
app.get('/api/voter/status/:voter_id/:election_id', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { voter_id, election_id } = req.params;
    const voteDetails = db.getVoteDetails(election_id, voter_id.toUpperCase());
    res.json({
      success: true,
      voter_id: voter_id.toUpperCase(),
      election_id,
      has_voted: voteDetails.has_voted,
      candidate_id: voteDetails.candidate_id || null,
      candidate_name: voteDetails.candidate_name || null,
      candidate_party: voteDetails.candidate_party || null,
      timestamp: voteDetails.timestamp || null,
      receipt_id: voteDetails.receipt_id || null,
      caesar_hash: voteDetails.caesar_hash || null,
      sha256_hash: voteDetails.sha256_hash || null,
      message: voteDetails.has_voted ? "You have already voted in this election." : "Voter is eligible to vote."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Voting Engine: Cast Vote (STRICT SINGLE-VOTE + CAESAR CIPHER SEALING)
app.post('/api/vote', validateVoteCast, (req, res) => {
  try {
    const { election_id, voter_id, candidate_id } = req.body;
    const cleanVoterId = voter_id.toUpperCase();

    if (db.hasVoted(election_id, cleanVoterId)) {
      return res.status(400).json({
        success: false,
        already_voted: true,
        message: "You have already voted in this election! Multiple voting is strictly prohibited by server-side verification."
      });
    }

    const voteRecord = db.castVote(election_id, cleanVoterId, candidate_id);

    return res.status(201).json({
      success: true,
      message: "🎉 Your vote has been securely cast and sealed with Caesar Cipher shift encryption & SHA-256 hash!",
      vote: {
        receipt_id: voteRecord.id,
        election_id: voteRecord.election_id,
        voter_id: voteRecord.voter_id,
        candidate_name: voteRecord.candidate_name,
        timestamp: voteRecord.timestamp,
        caesar_hash: voteRecord.caesar_hash,
        sha256_seal: voteRecord.sha256_hash
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Public Cryptographic Ballot Audit Query Endpoint
app.get('/api/vote/audit/:hash', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { hash } = req.params;
    const auditResult = db.auditBallotByHash(hash);

    if (auditResult) {
      res.json({ success: true, audit: auditResult });
    } else {
      res.status(404).json({ success: false, message: "No matching sealed ballot found for the provided cryptographic hash." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Metrics & Tally
app.get('/api/admin/stats', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = db.getStats();
    const elections = db.getElections();
    const candidates = db.getCandidates();
    const votes = db.getVotes();

    res.json({
      success: true,
      stats,
      elections,
      candidates,
      recent_votes: votes.slice(-10).reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Live Tally Breakdown
app.get('/api/admin/results/:election_id', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.params;
    const election = db.getElections().find(e => e.id === election_id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    const candidates = db.getCandidates(election_id);
    const totalVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

    const breakdown = candidates.map(c => {
      const count = c.vote_count || 0;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        candidate_id: c.id,
        name: c.name,
        department: c.department || c.party,
        vote_count: count,
        percentage
      };
    });

    res.json({
      success: true,
      election,
      total_votes_cast: totalVotes,
      candidates: breakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Catch-all API error handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Fallback for React SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (require('fs').existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (No Hardcoded Localhost)
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  VotePulse Secure E-Voting Server Running (Port ${PORT})`);
  console.log(`  Production Ready API & Static React SPA Active`);
  console.log(`===================================================`);
});
