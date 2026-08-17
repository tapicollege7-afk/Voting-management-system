const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

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
            password_hash: 'admin123',
            created_at: new Date().toISOString()
          }
        ],
        elections: [],
        candidates: [],
        votes: [],
        otps: []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  }

  load() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return { users: [], elections: [], candidates: [], votes: [], otps: [] };
    }
  }

  save(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  // Users & Auth
  findUserByVoterId(voter_id) {
    const db = this.load();
    return db.users.find(u => u.voter_id.toLowerCase() === voter_id.toLowerCase() || u.email.toLowerCase() === voter_id.toLowerCase());
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
      password_hash: userData.password,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    this.save(db);
    return newUser;
  }

  // OTP Management
  generateOTP(voter_id, email, phone) {
    const db = this.load();
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const otpRecord = {
      id: 'otp_' + Date.now(),
      voter_id,
      email,
      phone,
      otp_code,
      expires_at,
      verified: false,
      created_at: new Date().toISOString()
    };

    db.otps.push(otpRecord);
    this.save(db);
    return otpRecord;
  }

  verifyOTP(voter_id, otp_code) {
    const db = this.load();
    const record = db.otps.find(o => 
      o.voter_id.toLowerCase() === voter_id.toLowerCase() && 
      o.otp_code === otp_code &&
      !o.verified &&
      new Date(o.expires_at) > new Date()
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

  getElectionById(id) {
    const db = this.load();
    return db.elections.find(e => e.id === id);
  }

  createElection(electionData) {
    const db = this.load();
    if (db.elections.find(e => e.id === electionData.id)) {
      throw new Error("Election ID already exists.");
    }

    const newElection = {
      id: electionData.id || 'elec_' + Date.now(),
      title: electionData.title,
      category: electionData.category || 'General Poll',
      description: electionData.description || '',
      start_date: electionData.start_date || new Date().toISOString(),
      end_date: electionData.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
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

  // Votes & Voted Candidate Tracking
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
      candidate_party: candidate ? (candidate.party || candidate.department) : 'Official Ballot',
      timestamp: vote.timestamp,
      receipt_id: vote.id
    };
  }

  castVote(election_id, voter_id, candidate_id, ip_address = '127.0.0.1') {
    const db = this.load();
    
    if (this.hasVoted(election_id, voter_id)) {
      throw new Error("You have already voted in this election!");
    }

    const candidate = db.candidates.find(c => c.id === candidate_id && c.election_id === election_id);
    if (!candidate) {
      throw new Error("Invalid candidate selected for this election.");
    }

    const voteRecord = {
      id: 'vt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      election_id,
      voter_id,
      candidate_id,
      candidate_name: candidate.name,
      timestamp: new Date().toISOString(),
      ip_address
    };

    db.votes.push(voteRecord);
    candidate.vote_count = (candidate.vote_count || 0) + 1;

    this.save(db);
    return voteRecord;
  }

  getVotes(election_id) {
    const db = this.load();
    if (election_id) {
      return db.votes.filter(v => v.election_id === election_id);
    }
    return db.votes;
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
