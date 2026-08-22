const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../utils/cipher');

const DB_PATH = path.join(__dirname, 'votepulse.sqlite');

// Initialize SQLite Connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Error initializing SQLite database:", err.message);
  } else {
    console.log("⚡ SQLite Database Engine connected successfully:", DB_PATH);
  }
});

// Initialize Schema Tables
db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    voter_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'voter',
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);

  // Elections Table
  db.run(`CREATE TABLE IF NOT EXISTS elections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General Poll',
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL
  )`);

  // Candidates Table
  db.run(`CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    election_id TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    party TEXT,
    manifesto TEXT,
    photo_url TEXT,
    vote_count INTEGER DEFAULT 0
  )`);

  // Votes Table (Caesar Cipher + SHA-256 Sealing)
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    election_id TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    caesar_hash TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )`);

  // Gmail Verification Tokens Table
  db.run(`CREATE TABLE IF NOT EXISTS gmail_tokens (
    id TEXT PRIMARY KEY,
    voter_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token_code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`);

  // Seed Default Admin User if not exists
  const adminPassHash = sha256Hash('admin123');
  db.run(`INSERT OR IGNORE INTO users (id, voter_id, name, email, phone, role, password_hash, created_at)
          VALUES ('usr_admin', 'ADM-9999', 'System Administrator', 'admin@votepulse.org', '+1 555-0199', 'admin', ?, ?)`,
          [adminPassHash, new Date().toISOString()]);
});

// Helper Promise wrappers for SQLite async operations
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      err ? reject(err) : resolve(this);
    });
  });
}

class SQLiteDatabase {
  // Find User by Voter ID or Email
  async findUserByVoterId(voter_id) {
    if (!voter_id) return null;
    const clean = voter_id.toLowerCase().trim();
    return await dbGet(`SELECT * FROM users WHERE LOWER(voter_id) = ? OR LOWER(email) = ?`, [clean, clean]);
  }

  // Create User
  async createUser(userData) {
    const existing = await this.findUserByVoterId(userData.voter_id);
    if (existing) {
      throw new Error("Voter ID or Email is already registered!");
    }
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      voter_id: userData.voter_id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'voter',
      password_hash: sha256Hash(userData.password),
      created_at: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO users (id, voter_id, name, email, phone, role, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.voter_id, newUser.name, newUser.email, newUser.phone, newUser.role, newUser.password_hash, newUser.created_at]
    );

    return newUser;
  }

  verifyUserPassword(user, plainPassword) {
    const hash = sha256Hash(plainPassword);
    return user.password_hash === hash || user.password_hash === plainPassword;
  }

  // Gmail Token Generator & Verifier
  async createGmailToken(voter_id, email) {
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const record = {
      id: 'tok_' + Date.now(),
      voter_id,
      email,
      token_code,
      expires_at,
      verified: 0,
      created_at: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO gmail_tokens (id, voter_id, email, token_code, expires_at, verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.voter_id, record.email, record.token_code, record.expires_at, 0, record.created_at]
    );

    return record;
  }

  async createMobileToken(voter_id, phone) {
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const record = {
      id: 'tok_' + Date.now(),
      voter_id,
      email: phone || '',
      token_code,
      expires_at,
      verified: 0,
      created_at: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO gmail_tokens (id, voter_id, email, token_code, expires_at, verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.voter_id, record.email, record.token_code, record.expires_at, 0, record.created_at]
    );

    return record;
  }

  async verifyGmailToken(voter_id, token_code) {
    const cleanVoter = voter_id.toLowerCase().trim();
    const row = await dbGet(
      `SELECT * FROM gmail_tokens 
       WHERE LOWER(voter_id) = ? AND token_code = ? AND verified = 0`,
      [cleanVoter, token_code.trim()]
    );

    if (row && new Date(row.expires_at) > new Date()) {
      await dbRun(`UPDATE gmail_tokens SET verified = 1 WHERE id = ?`, [row.id]);
      return true;
    }
    return false;
  }

  async verifyMobileToken(voter_id, token_code) {
    return await this.verifyGmailToken(voter_id, token_code);
  }

  // Elections
  async getElections() {
    return await dbAll(`SELECT * FROM elections ORDER BY created_at DESC`);
  }

  async createElection(data) {
    const newElec = {
      id: data.id || 'elec_' + Date.now(),
      title: data.title,
      category: data.category || 'General Poll',
      description: data.description || '',
      status: data.status || 'active',
      created_at: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO elections (id, title, category, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newElec.id, newElec.title, newElec.category, newElec.description, newElec.status, newElec.created_at]
    );

    return newElec;
  }

  async updateElectionStatus(id, status) {
    await dbRun(`UPDATE elections SET status = ? WHERE id = ?`, [status, id]);
    return await dbGet(`SELECT * FROM elections WHERE id = ?`, [id]);
  }

  // Candidates
  async getCandidates(election_id) {
    if (election_id) {
      return await dbAll(`SELECT * FROM candidates WHERE election_id = ?`, [election_id]);
    }
    return await dbAll(`SELECT * FROM candidates`);
  }

  async createCandidate(data) {
    const newCand = {
      id: data.id || 'cand_' + Date.now(),
      election_id: data.election_id,
      name: data.name,
      department: data.department || data.party || 'General',
      party: data.party || data.department || 'Independent',
      manifesto: data.manifesto || '',
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      vote_count: 0
    };

    await dbRun(
      `INSERT INTO candidates (id, election_id, name, department, party, manifesto, photo_url, vote_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newCand.id, newCand.election_id, newCand.name, newCand.department, newCand.party, newCand.manifesto, newCand.photo_url, 0]
    );

    return newCand;
  }

  // Votes & Caesar Cipher Sealing
  async hasVoted(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();
    const row = await dbGet(
      `SELECT * FROM votes WHERE election_id = ? AND LOWER(voter_id) = ?`,
      [election_id, clean]
    );
    return !!row;
  }

  async getVoteDetails(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();
    const vote = await dbGet(
      `SELECT * FROM votes WHERE election_id = ? AND LOWER(voter_id) = ?`,
      [election_id, clean]
    );

    if (!vote) return { has_voted: false };

    const cand = await dbGet(`SELECT * FROM candidates WHERE id = ?`, [vote.candidate_id]);

    return {
      has_voted: true,
      candidate_id: vote.candidate_id,
      candidate_name: cand ? cand.name : vote.candidate_name,
      candidate_party: cand ? (cand.party || cand.department) : 'Official Candidate',
      timestamp: vote.timestamp,
      receipt_id: vote.id,
      caesar_hash: vote.caesar_hash,
      sha256_hash: vote.sha256_hash
    };
  }

  async castVote(election_id, voter_id, candidate_id) {
    const cleanVoter = voter_id.toUpperCase().trim();
    const voted = await this.hasVoted(election_id, cleanVoter);
    if (voted) {
      throw new Error("You have already voted in this election!");
    }

    const candidate = await dbGet(`SELECT * FROM candidates WHERE id = ? AND election_id = ?`, [candidate_id, election_id]);
    if (!candidate) {
      throw new Error("Invalid candidate selected for this election.");
    }

    const rawStr = `${cleanVoter}_${election_id}_${candidate_id}_${Date.now()}`;
    const caesar_hash = caesarCipherEncrypt(rawStr, 3);
    const sha256_seal = sha256Hash(rawStr);

    const voteRecord = {
      id: 'vt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      election_id,
      voter_id: cleanVoter,
      candidate_id,
      candidate_name: candidate.name,
      caesar_hash,
      sha256_hash: sha256_seal,
      timestamp: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO votes (id, election_id, voter_id, candidate_id, candidate_name, caesar_hash, sha256_hash, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [voteRecord.id, voteRecord.election_id, voteRecord.voter_id, voteRecord.candidate_id, voteRecord.candidate_name, voteRecord.caesar_hash, voteRecord.sha256_hash, voteRecord.timestamp]
    );

    await dbRun(`UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?`, [candidate_id]);

    return voteRecord;
  }

  async auditBallotByHash(searchHash) {
    const clean = searchHash.trim();
    const vote = await dbGet(
      `SELECT * FROM votes WHERE caesar_hash = ? OR sha256_hash = ? OR id = ?`,
      [clean, clean, clean]
    );

    if (!vote) return null;

    const election = await dbGet(`SELECT * FROM elections WHERE id = ?`, [vote.election_id]);
    const decrypted = caesarCipherDecrypt(vote.caesar_hash, 3);

    return {
      verified: true,
      receipt_id: vote.id,
      election_title: election ? election.title : vote.election_id,
      voter_id_masked: vote.voter_id.substring(0, 3) + '***',
      candidate_name: vote.candidate_name,
      timestamp: vote.timestamp,
      caesar_encrypted_hash: vote.caesar_hash,
      sha256_seal: vote.sha256_hash,
      decrypted_verification: decrypted
    };
  }

  // Get all voters (for Admin Dashboard)
  async getAllVoters() {
    return await dbAll(`SELECT id, voter_id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC`);
  }

  async getStats() {
    const voters = await dbGet(`SELECT COUNT(*) as cnt FROM users WHERE role = 'voter'`);
    const elections = await dbGet(`SELECT COUNT(*) as cnt FROM elections`);
    const activeElecs = await dbGet(`SELECT COUNT(*) as cnt FROM elections WHERE status = 'active'`);
    const cands = await dbGet(`SELECT COUNT(*) as cnt FROM candidates`);
    const votes = await dbGet(`SELECT COUNT(*) as cnt FROM votes`);

    return {
      total_voters: voters ? voters.cnt : 0,
      total_elections: elections ? elections.cnt : 0,
      active_elections: activeElecs ? activeElecs.cnt : 0,
      total_candidates: cands ? cands.cnt : 0,
      total_votes_cast: votes ? votes.cnt : 0
    };
  }
}

module.exports = new SQLiteDatabase();
