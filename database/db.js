const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../utils/cipher');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize Supabase Client (if SUPABASE_URL and SUPABASE_KEY are provided in env)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sample-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sample_anon_key';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class Database {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = {
        users: [
          {
            id: 'usr_admin',
            voter_id: 'ADM-9999',
            name: 'System Administrator',
            email: 'admin@votepulse.org',
            phone: '+1 555-0199',
            role: 'admin',
            password_hash: sha256Hash('admin123'),
            created_at: new Date().toISOString()
          }
        ],
        elections: [],
        candidates: [],
        votes: [],
        gmail_tokens: []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  }

  load() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return { users: [], elections: [], candidates: [], votes: [], gmail_tokens: [] };
    }
  }

  save(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  // User Auth & Hashing
  findUserByVoterId(voter_id) {
    const db = this.load();
    return db.users.find(u => 
      u.voter_id.toLowerCase() === voter_id.toLowerCase() || 
      u.email.toLowerCase() === voter_id.toLowerCase()
    );
  }

  createUser(userData) {
    const db = this.load();
    if (this.findUserByVoterId(userData.voter_id)) {
      throw new Error("Voter ID or Email already registered!");
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
    db.users.push(newUser);
    this.save(db);
    return newUser;
  }

  verifyUserPassword(user, plainPassword) {
    const hash = sha256Hash(plainPassword);
    return user.password_hash === hash || user.password_hash === plainPassword;
  }

  // Real Gmail Token Management
  createGmailToken(voter_id, email) {
    const db = this.load();
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const record = {
      id: 'tok_' + Date.now(),
      voter_id,
      email,
      token_code,
      expires_at,
      verified: false,
      created_at: new Date().toISOString()
    };

    if (!db.gmail_tokens) db.gmail_tokens = [];
    db.gmail_tokens.push(record);
    this.save(db);
    return record;
  }

  verifyGmailToken(voter_id, token_code) {
    const db = this.load();
    if (!db.gmail_tokens) return false;

    const record = db.gmail_tokens.find(t => 
      t.voter_id.toLowerCase() === voter_id.toLowerCase() && 
      t.token_code === token_code &&
      !t.verified &&
      new Date(t.expires_at) > new Date()
    );

    if (record) {
      record.verified = true;
      this.save(db);
      return true;
    }
    return false;
  }

  // Elections
  getElections() {
    const db = this.load();
    return db.elections;
  }

  createElection(electionData) {
    const db = this.load();
    const newElection = {
      id: electionData.id || 'elec_' + Date.now(),
      title: electionData.title,
      category: electionData.category || 'General Poll',
      description: electionData.description || '',
      status: electionData.status || 'active',
      created_at: new Date().toISOString()
    };
    db.elections.push(newElection);
    this.save(db);
    return newElection;
  }

  updateElectionStatus(id, status) {
    const db = this.load();
    const elec = db.elections.find(e => e.id === id);
    if (elec) {
      elec.status = status;
      this.save(db);
      return elec;
    }
    return null;
  }

  // Candidates
  getCandidates(election_id) {
    const db = this.load();
    if (election_id) {
      return db.candidates.filter(c => c.election_id === election_id);
    }
    return db.candidates;
  }

  createCandidate(candData) {
    const db = this.load();
    const newCandidate = {
      id: candData.id || 'cand_' + Date.now(),
      election_id: candData.election_id,
      name: candData.name,
      department: candData.department || candData.party || 'General',
      party: candData.party || candData.department || 'Independent',
      manifesto: candData.manifesto || '',
      photo_url: candData.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      vote_count: 0
    };
    db.candidates.push(newCandidate);
    this.save(db);
    return newCandidate;
  }

  // Votes & Cryptographic Caesar Cipher Sealing
  hasVoted(election_id, voter_id) {
    const db = this.load();
    return db.votes.some(v => v.election_id === election_id && v.voter_id.toLowerCase() === voter_id.toLowerCase());
  }

  getVoteDetails(election_id, voter_id) {
    const db = this.load();
    const vote = db.votes.find(v => v.election_id === election_id && v.voter_id.toLowerCase() === voter_id.toLowerCase());
    if (!vote) return { has_voted: false };

    const candidate = db.candidates.find(c => c.id === vote.candidate_id);
    return {
      has_voted: true,
      candidate_id: vote.candidate_id,
      candidate_name: candidate ? candidate.name : (vote.candidate_name || 'Selected Candidate'),
      candidate_party: candidate ? (candidate.party || candidate.department) : 'Official Candidate',
      timestamp: vote.timestamp,
      receipt_id: vote.id,
      caesar_hash: vote.caesar_hash,
      sha256_hash: vote.sha256_hash
    };
  }

  castVote(election_id, voter_id, candidate_id) {
    const db = this.load();
    
    if (this.hasVoted(election_id, voter_id)) {
      throw new Error("You have already voted in this election!");
    }

    const candidate = db.candidates.find(c => c.id === candidate_id && c.election_id === election_id);
    if (!candidate) {
      throw new Error("Invalid candidate selected for this election.");
    }

    const rawReceiptString = `${voter_id}_${election_id}_${candidate_id}_${Date.now()}`;
    
    // Caesar Cipher Encryption & SHA-256 Sealing
    const caesar_hash = caesarCipherEncrypt(rawReceiptString, 3);
    const sha256_seal = sha256Hash(rawReceiptString);

    const voteRecord = {
      id: 'vt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      election_id,
      voter_id,
      candidate_id,
      candidate_name: candidate.name,
      caesar_hash,
      sha256_hash: sha256_seal,
      timestamp: new Date().toISOString()
    };

    db.votes.push(voteRecord);
    candidate.vote_count = (candidate.vote_count || 0) + 1;

    this.save(db);
    return voteRecord;
  }

  // Public Cryptographic Audit Tool Query
  auditBallotByHash(searchHash) {
    const db = this.load();
    const cleanHash = searchHash.trim();

    const vote = db.votes.find(v => 
      v.caesar_hash === cleanHash || 
      v.sha256_hash === cleanHash || 
      v.id === cleanHash
    );

    if (!vote) return null;

    const election = db.elections.find(e => e.id === vote.election_id);
    const decryptedString = caesarCipherDecrypt(vote.caesar_hash, 3);

    return {
      verified: true,
      receipt_id: vote.id,
      election_title: election ? election.title : vote.election_id,
      voter_id_masked: vote.voter_id.substring(0, 3) + '***',
      candidate_name: vote.candidate_name,
      timestamp: vote.timestamp,
      caesar_encrypted_hash: vote.caesar_hash,
      sha256_seal: vote.sha256_hash,
      decrypted_verification: decryptedString
    };
  }

  getStats() {
    const db = this.load();
    const totalVotes = db.votes.length + db.candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
    return {
      total_voters: db.users.filter(u => u.role === 'voter').length,
      total_elections: db.elections.length,
      active_elections: db.elections.filter(e => e.status === 'active').length,
      total_candidates: db.candidates.length,
      total_votes_cast: totalVotes
    };
  }
}

module.exports = new Database();
