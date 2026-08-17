const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const {
  validateVoterRegistration,
  validateOTPRequest,
  validateOTPVerify,
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

// Serve Static Apps with No-Cache Headers
app.use('/', express.static(path.join(__dirname, 'public'), noCacheOptions));
app.use('/voter', express.static(path.join(__dirname, 'public', 'voter'), noCacheOptions));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), noCacheOptions));

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
app.post('/api/auth/register', validateVoterRegistration, (req, res) => {
  try {
    const { voter_id, name, email, phone, password } = req.body;
    
    const existing = db.findUserByVoterId(voter_id);
    if (existing) {
      return res.status(400).json({ success: false, message: "Voter ID or Email is already registered." });
    }

    const newUser = db.createUser({
      voter_id,
      name,
      email,
      phone,
      password,
      role: 'voter'
    });

    const otp = db.createOTP(newUser.voter_id, newUser.email, newUser.phone);

    return res.status(201).json({
      success: true,
      message: "Voter registered successfully. Please complete OTP verification.",
      voter: {
        id: newUser.id,
        voter_id: newUser.voter_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      otp_preview: otp.otp_code
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { voter_id, password } = req.body;
    if (!voter_id || !password) {
      return res.status(400).json({ success: false, message: "Voter ID and password are required." });
    }

    const user = db.findUserByVoterId(voter_id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Voter ID or credentials." });
    }

    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const otp = db.createOTP(user.voter_id, user.email, user.phone);

    return res.json({
      success: true,
      message: "Login credentials verified. OTP sent for real-time verification.",
      user: {
        id: user.id,
        voter_id: user.voter_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      otp_preview: otp.otp_code
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Real-Time OTP: Request New OTP
app.post('/api/otp/request', validateOTPRequest, (req, res) => {
  try {
    const { voter_id } = req.body;
    const user = db.findUserByVoterId(voter_id);

    const voterIdKey = user ? user.voter_id : voter_id.toUpperCase();
    const email = user ? user.email : 'voter@example.com';
    const phone = user ? user.phone : '';

    const otp = db.createOTP(voterIdKey, email, phone);

    return res.json({
      success: true,
      message: `Real-time OTP generated successfully for ${voterIdKey}.`,
      expires_in_seconds: 300,
      otp_preview: otp.otp_code
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Real-Time OTP: Verify OTP
app.post('/api/otp/verify', validateOTPVerify, (req, res) => {
  try {
    const { voter_id, otp_code } = req.body;
    const isValid = db.verifyOTP(voter_id.toUpperCase(), otp_code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP verification code. Please try requesting a new OTP."
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully. Authorization granted for voting.",
      verified: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Get All Elections
app.get('/api/elections', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const elections = db.getElections();
    res.json({ success: true, elections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Get Specific Election Details
app.get('/api/elections/:id', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const election = db.getElectionById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    const candidates = db.getCandidates(election.id);
    res.json({ success: true, election: { ...election, candidates } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Create Election (Admin)
app.post('/api/elections', (req, res) => {
  try {
    const { title, description, category, start_date, end_date } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Election title and description are required." });
    }
    const newElection = db.createElection({ title, description, category, start_date, end_date });
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

// Voter Voting Status: Check if Voter Has Voted in Specific Election
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
      message: voteDetails.has_voted ? "You have already voted in this election." : "Voter is eligible to vote."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Voting Engine: Cast Vote (STRICT SINGLE-VOTE ENFORCEMENT)
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

    const vote = db.castVote(election_id, cleanVoterId, candidate_id, req.ip);

    return res.status(201).json({
      success: true,
      message: "Your vote has been cast and securely recorded! Thank you for participating.",
      receipt: {
        vote_id: vote.id,
        timestamp: vote.timestamp,
        election_id: vote.election_id
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      already_voted: err.message.includes("already voted"),
      message: err.message
    });
  }
});

// Admin Stats & Live Results
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

// Admin Live Results Breakdown for Specific Election
app.get('/api/admin/results/:election_id', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.params;
    const election = db.getElectionById(election_id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    const candidates = db.getCandidates(election_id);
    const votes = db.getVotes(election_id);
    const totalVotes = candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);

    const breakdown = candidates.map(c => ({
      candidate_id: c.id,
      name: c.name,
      department: c.department,
      photo_url: c.photo_url,
      vote_count: c.vote_count || 0,
      percentage: totalVotes > 0 ? ((c.vote_count / totalVotes) * 100).toFixed(1) : "0.0"
    }));

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

// Catch-all handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Fallback for SPA routing
app.get('/voter/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'voter', 'index.html'));
});
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  VotePulse Secure Online Voting System Server Running `);
  console.log(`  Local Server: http://localhost:${PORT}`);
  console.log(`  - Gateway Hub:  http://localhost:${PORT}/`);
  console.log(`  - Voter Portal: http://localhost:${PORT}/voter/`);
  console.log(`  - Admin Portal: http://localhost:${PORT}/admin/`);
  console.log(`===================================================`);
});
