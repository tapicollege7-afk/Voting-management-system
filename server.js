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
const INITIAL_PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable browser caching for static files
const noCacheOptions = {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

// ===== PWA CRITICAL: Service Worker must be served at root scope =====
// The SW file itself needs no-cache so browser always checks for updates
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  const swPath = path.join(__dirname, 'dist', 'sw.js');
  if (require('fs').existsSync(swPath)) {
    return res.sendFile(swPath);
  }
  res.sendFile(path.join(__dirname, 'sw.js'));
});

// Manifest must be at root scope for PWA install eligibility
app.get('/manifest.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'application/manifest+json');
  const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
  if (require('fs').existsSync(manifestPath)) {
    return res.sendFile(manifestPath);
  }
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve Static React App & Public Assets
if (require('fs').existsSync(path.join(__dirname, 'dist'))) {
  app.use('/', express.static(path.join(__dirname, 'dist'), noCacheOptions));
}
app.use('/', express.static(path.join(__dirname, 'public'), noCacheOptions));

// --- REST API ENDPOINTS ---

// Health & System Info
app.get('/api/health', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = await db.getStats();
    res.json({
      status: 'ok',
      system: 'VotePulse Secure Online Voting Engine',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Register Voter
app.post('/api/auth/register', validateVoterRegistration, async (req, res) => {
  try {
    const { voter_id, name, email, phone, password } = req.body;
    
    const existing = await db.findUserByVoterId(voter_id);
    if (existing) {
      return res.status(400).json({ success: false, message: "Voter ID, Email, or Phone is already registered." });
    }

    const newUser = await db.createUser({ voter_id, name, email, phone, password });
    const gmailToken = await db.createGmailToken(newUser.voter_id, newUser.email);

    // Send real verification email via Gmail / SMTP
    const emailResult = await sendGmailVerificationCode(newUser.email, newUser.voter_id, gmailToken.token_code);

    return res.status(201).json({
      success: true,
      message: `Registration initiated! Verification code dispatched to ${newUser.email}.`,
      token_code: gmailToken.token_code,
      previewUrl: emailResult?.previewUrl,
      voter: {
        id: newUser.id,
        voter_id: newUser.voter_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Login Voter & Request Real Gmail Verification Code
app.post('/api/auth/login', async (req, res) => {
  try {
    const { voter_id, password } = req.body;
    if (!voter_id || !password) {
      return res.status(400).json({ success: false, message: "Voter ID and password are required." });
    }

    const user = await db.findUserByVoterId(voter_id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Voter ID or credentials." });
    }

    if (!db.verifyUserPassword(user, password)) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const gmailToken = await db.createGmailToken(user.voter_id, user.email);

    // Send real verification email via Gmail / SMTP
    const emailResult = await sendGmailVerificationCode(user.email, user.voter_id, gmailToken.token_code);

    return res.json({
      success: true,
      message: `Credentials verified. Verification code sent to your Gmail (${user.email}).`,
      token_code: gmailToken.token_code,
      previewUrl: emailResult?.previewUrl,
      user: {
        id: user.id,
        voter_id: user.voter_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Real Gmail Token Verification Endpoint
app.post('/api/auth/verify-gmail-token', async (req, res) => {
  try {
    const { voter_id, token_code } = req.body;
    if (!voter_id || !token_code) {
      return res.status(400).json({ success: false, message: "Voter ID and verification token code are required." });
    }

    const isValid = await db.verifyGmailToken(voter_id, token_code);
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

// Mobile OTP Token Verification Endpoint Alias
app.post('/api/auth/verify-mobile-token', async (req, res) => {
  try {
    const { voter_id, token_code } = req.body;
    const isValid = await db.verifyGmailToken(voter_id, token_code);
    if (isValid) {
      return res.json({ success: true, message: "Verification successful. Access granted." });
    }
    return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Get Elections List
app.get('/api/elections', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const elections = await db.getElections();
    res.json({ success: true, elections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Create Election (Admin)
app.post('/api/elections', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Election title and description are required." });
    }
    const newElection = await db.createElection({ title, description, category });
    res.status(201).json({ success: true, message: "Election created successfully.", election: newElection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Update Status (Admin)
app.patch('/api/elections/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateElectionStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    res.json({ success: true, message: `Election status updated to '${status}'.`, election: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Get Candidates
app.get('/api/candidates', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.query;
    const candidates = await db.getCandidates(election_id);
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Candidates: Add Candidate (Admin)
app.post('/api/candidates', async (req, res) => {
  try {
    const { election_id, name, department, manifesto, photo_url } = req.body;
    if (!election_id || !name) {
      return res.status(400).json({ success: false, message: "Election ID and candidate name are required." });
    }
    const newCandidate = await db.createCandidate({ election_id, name, department, manifesto, photo_url });
    res.status(201).json({ success: true, message: "Candidate added successfully.", candidate: newCandidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Voter Voting Status
app.get('/api/voter/status/:voter_id/:election_id', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { voter_id, election_id } = req.params;
    const voteDetails = await db.getVoteDetails(election_id, voter_id.toUpperCase());
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
app.post('/api/vote', validateVoteCast, async (req, res) => {
  try {
    const { election_id, voter_id, candidate_id } = req.body;
    const cleanVoterId = voter_id.toUpperCase();

    const alreadyVoted = await db.hasVoted(election_id, cleanVoterId);
    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        already_voted: true,
        message: "You have already voted in this election! Multiple voting is strictly prohibited by server-side verification."
      });
    }

    const voteRecord = await db.castVote(election_id, cleanVoterId, candidate_id);

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
app.get('/api/vote/audit/:hash', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { hash } = req.params;
    const auditResult = await db.auditBallotByHash(hash);

    if (auditResult) {
      res.json({ success: true, audit: auditResult });
    } else {
      res.status(404).json({ success: false, message: "No matching sealed ballot found for the provided cryptographic hash." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Metrics & Tally (includes real voter list)
app.get('/api/admin/stats', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = await db.getStats();
    const elections = await db.getElections();
    const candidates = await db.getCandidates();
    const voters = await db.getAllVoters();

    res.json({
      success: true,
      stats,
      elections,
      candidates,
      voters
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete User (Voter or Admin) - Supports DELETE, POST, and GET
const handleDeleteUserRoute = async (req, res) => {
  try {
    const voter_id = req.params.voter_id || req.body?.voter_id || req.query?.voter_id;
    if (!voter_id) return res.status(400).json({ success: false, message: "Voter ID is required." });

    if (voter_id.toUpperCase() === 'ADM-9999') {
      return res.status(403).json({ success: false, message: "System Primary Administrator (ADM-9999) cannot be deleted." });
    }

    const result = await db.deleteUser(voter_id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

app.delete('/api/admin/users/:voter_id', handleDeleteUserRoute);
app.post('/api/admin/users/delete', handleDeleteUserRoute);
app.get('/api/admin/users/delete/:voter_id', handleDeleteUserRoute);

// Admin: Get Visual Database Engine Metadata & Health
app.get('/api/admin/db-info', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const metadata = await db.getDatabaseMetadata();
    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Live Tally Breakdown
app.get('/api/admin/results/:election_id', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.params;
    const elections = await db.getElections();
    const election = elections.find(e => e.id === election_id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    const candidates = await db.getCandidates(election_id);
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

// ─── Dedicated Admin Page (completely separate from voter SPA) ───────────────
app.get('/admin/index.html', (req, res) => {
  res.redirect('/');
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback for React SPA routing (voter portal)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path === '/admin' || req.path === '/admin.html') return next();
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (require('fs').existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Dynamic Port Selector (Automatically finds next free port if 3000/3001 are occupied)
function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(`===================================================`);
    console.log(`  VotePulse SQLite E-Voting Server Running (Port ${portToUse})`);
    console.log(`  Access online at: http://localhost:${portToUse}`);
    console.log(`===================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${portToUse} is occupied. Trying Port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error("Server startup error:", err);
    }
  });
}

startServer(INITIAL_PORT);
