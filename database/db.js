const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Clean Initial Seed Data (All dummy/example voter data cleared)
const initialData = {
  users: [
    {
      id: "usr_admin",
      voter_id: "ADM-9999",
      name: "System Administrator",
      email: "admin@votepulse.org",
      phone: "+1 555-0199",
      role: "admin",
      password_hash: "admin123",
      created_at: new Date().toISOString()
    }
  ],
  elections: [],
  candidates: [],
  votes: [],
  otps: []
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Overwrite database to ensure clean production slate as requested
    this.save(initialData);
  }

  load() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error loading DB, resetting to initial clean slate:", err);
      this.save(initialData);
      return initialData;
    }
  }

  save(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  // Users
  findUserByVoterId(voter_id) {
    const db = this.load();
    return db.users.find(u => u.voter_id.toUpperCase() === voter_id.toUpperCase() || u.email.toLowerCase() === voter_id.toLowerCase());
  }

  findUserById(id) {
    const db = this.load();
    return db.users.find(u => u.id === id);
  }

  createUser(userData) {
    const db = this.load();
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      voter_id: userData.voter_id.toUpperCase(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'voter',
      password_hash: userData.password || 'default123',
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    this.save(db);
    return newUser;
  }

  getUsers() {
    const db = this.load();
    return db.users;
  }

  // OTPs
  createOTP(voter_id, email, phone) {
    const db = this.load();
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

    db.otps = db.otps.map(o => {
      if (o.voter_id === voter_id) o.verified = true;
      return o;
    });

    const newOTP = {
      id: 'otp_' + Date.now(),
      voter_id,
      email,
      phone,
      otp_code,
      expires_at,
      verified: false,
      created_at: new Date().toISOString()
    };

    db.otps.push(newOTP);
    this.save(db);
    return newOTP;
  }

  verifyOTP(voter_id, otp_code) {
    const db = this.load();
    const record = db.otps.find(o => 
      o.voter_id === voter_id && 
      o.otp_code === otp_code && 
      !o.verified && 
      new Date(o.expires_at) > new Date()
    );

    if (!record) return false;

    record.verified = true;
    this.save(db);
    return true;
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
    const newElection = {
      id: 'elec_' + Date.now(),
      title: electionData.title,
      description: electionData.description,
      category: electionData.category || 'General',
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
      id: 'cand_' + Date.now(),
      election_id: candData.election_id,
      name: candData.name,
      department: candData.department || 'General',
      manifesto: candData.manifesto || '',
      photo_url: candData.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      vote_count: 0
    };
    db.candidates.push(newCandidate);
    this.save(db);
    return newCandidate;
  }

  // Votes (STRICT SINGLE-VOTE ENFORCEMENT)
  hasVoted(election_id, voter_id) {
    const db = this.load();
    return db.votes.some(v => v.election_id === election_id && v.voter_id === voter_id);
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
