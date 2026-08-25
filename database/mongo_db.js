const mongoose = require('mongoose');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../utils/cipher');

// Mongoose Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  voter_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'voter' },
  password_hash: { type: String, required: true },
  created_at: { type: String, default: () => new Date().toISOString() }
});

const ElectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General Poll' },
  description: { type: String, default: '' },
  status: { type: String, default: 'active' },
  created_at: { type: String, default: () => new Date().toISOString() }
});

const CandidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  election_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  department: { type: String, default: 'General' },
  party: { type: String, default: 'Independent' },
  manifesto: { type: String, default: '' },
  photo_url: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300' },
  vote_count: { type: Number, default: 0 }
});

const VoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  election_id: { type: String, required: true, index: true },
  voter_id: { type: String, required: true, index: true },
  candidate_id: { type: String, required: true },
  candidate_name: { type: String, required: true },
  caesar_hash: { type: String, required: true },
  sha256_hash: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

const GmailTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  voter_id: { type: String, required: true, index: true },
  email: { type: String, required: true },
  token_code: { type: String, required: true },
  expires_at: { type: String, required: true },
  verified: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() }
});

const User = mongoose.model('User', UserSchema);
const Election = mongoose.model('Election', ElectionSchema);
const Candidate = mongoose.model('Candidate', CandidateSchema);
const Vote = mongoose.model('Vote', VoteSchema);
const GmailToken = mongoose.model('GmailToken', GmailTokenSchema);

class MongoDatabase {
  constructor() {
    this.isConnected = false;
  }

  async connect(uri) {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/votepulse';
    try {
      await mongoose.connect(mongoUri);
      this.isConnected = true;
      console.log(`🍃 MongoDB Engine connected successfully to ${mongoUri}`);
      await this.seedAdmin();
    } catch (err) {
      console.error(`❌ MongoDB Connection error:`, err.message);
      throw err;
    }
  }

  async seedAdmin() {
    try {
      const adminPassHash = sha256Hash('admin123');
      await User.findOneAndUpdate(
        { voter_id: 'ADM-9999' },
        {
          id: 'usr_admin',
          voter_id: 'ADM-9999',
          name: 'System Administrator',
          email: 'admin@votepulse.org',
          phone: '+1 555-0199',
          role: 'admin',
          password_hash: adminPassHash,
          created_at: new Date().toISOString()
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn("MongoDB admin seed notice:", e.message);
    }
  }

  async findUserByVoterId(voter_id) {
    if (!voter_id) return null;
    const clean = voter_id.toLowerCase().trim();
    return await User.findOne({
      $or: [
        { voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } },
        { email: { $regex: new RegExp(`^${clean}$`, 'i') } }
      ]
    }).lean();
  }

  async createUser(userData) {
    const existing = await this.findUserByVoterId(userData.voter_id);
    if (existing) {
      throw new Error("Voter ID or Email is already registered!");
    }
    const newUser = new User({
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      voter_id: userData.voter_id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'voter',
      password_hash: sha256Hash(userData.password),
      created_at: new Date().toISOString()
    });

    await newUser.save();
    return newUser.toObject();
  }

  verifyUserPassword(user, plainPassword) {
    const hash = sha256Hash(plainPassword);
    return user.password_hash === hash || user.password_hash === plainPassword;
  }

  async createGmailToken(voter_id, email) {
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const record = new GmailToken({
      id: 'tok_' + Date.now(),
      voter_id,
      email,
      token_code,
      expires_at,
      verified: 0,
      created_at: new Date().toISOString()
    });

    await record.save();
    return record.toObject();
  }

  async createMobileToken(voter_id, phone) {
    return await this.createGmailToken(voter_id, phone);
  }

  async verifyGmailToken(voter_id, token_code) {
    const cleanVoter = voter_id.toLowerCase().trim();
    const token = await GmailToken.findOne({
      voter_id: { $regex: new RegExp(`^${cleanVoter}$`, 'i') },
      token_code: token_code.trim(),
      verified: 0
    });

    if (token && new Date(token.expires_at) > new Date()) {
      token.verified = 1;
      await token.save();
      return true;
    }
    return false;
  }

  async verifyMobileToken(voter_id, token_code) {
    return await this.verifyGmailToken(voter_id, token_code);
  }

  async getElections() {
    return await Election.find().sort({ created_at: -1 }).lean();
  }

  async createElection(data) {
    const newElec = new Election({
      id: data.id || 'elec_' + Date.now(),
      title: data.title,
      category: data.category || 'General Poll',
      description: data.description || '',
      status: data.status || 'active',
      created_at: new Date().toISOString()
    });

    await newElec.save();
    return newElec.toObject();
  }

  async updateElectionStatus(id, status) {
    return await Election.findOneAndUpdate({ id }, { status }, { new: true }).lean();
  }

  async getCandidates(election_id) {
    if (election_id) {
      return await Candidate.find({ election_id }).lean();
    }
    return await Candidate.find().lean();
  }

  async createCandidate(data) {
    const newCand = new Candidate({
      id: data.id || 'cand_' + Date.now(),
      election_id: data.election_id,
      name: data.name,
      department: data.department || data.party || 'General',
      party: data.party || data.department || 'Independent',
      manifesto: data.manifesto || '',
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      vote_count: 0
    });

    await newCand.save();
    return newCand.toObject();
  }

  async hasVoted(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();
    const vote = await Vote.findOne({
      election_id,
      voter_id: { $regex: new RegExp(`^${clean}$`, 'i') }
    }).lean();
    return !!vote;
  }

  async getVoteDetails(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();
    const vote = await Vote.findOne({
      election_id,
      voter_id: { $regex: new RegExp(`^${clean}$`, 'i') }
    }).lean();

    if (!vote) return { has_voted: false };

    const cand = await Candidate.findOne({ id: vote.candidate_id }).lean();

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

    const candidate = await Candidate.findOne({ id: candidate_id, election_id });
    if (!candidate) {
      throw new Error("Invalid candidate selected for this election.");
    }

    const rawStr = `${cleanVoter}_${election_id}_${candidate_id}_${Date.now()}`;
    const caesar_hash = caesarCipherEncrypt(rawStr, 3);
    const sha256_seal = sha256Hash(rawStr);

    const voteRecord = new Vote({
      id: 'vt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      election_id,
      voter_id: cleanVoter,
      candidate_id,
      candidate_name: candidate.name,
      caesar_hash,
      sha256_hash: sha256_seal,
      timestamp: new Date().toISOString()
    });

    await voteRecord.save();
    candidate.vote_count += 1;
    await candidate.save();

    return voteRecord.toObject();
  }

  async auditBallotByHash(searchHash) {
    const clean = searchHash.trim();
    const vote = await Vote.findOne({
      $or: [
        { caesar_hash: clean },
        { sha256_hash: clean },
        { id: clean }
      ]
    }).lean();

    if (!vote) return null;

    const election = await Election.findOne({ id: vote.election_id }).lean();
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

  async deleteUser(voter_id) {
    if (!voter_id) throw new Error("Voter ID is required for deletion.");
    const clean = voter_id.trim();
    if (clean.toUpperCase() === 'ADM-9999') {
      throw new Error("System Primary Administrator (ADM-9999) cannot be deleted.");
    }
    const user = await this.findUserByVoterId(clean);
    if (!user) throw new Error("User not found.");

    await User.deleteOne({ voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } });
    await GmailToken.deleteMany({ voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } });
    return { success: true, message: `User ${user.name} (${user.voter_id}) deleted successfully.` };
  }

  async getDatabaseMetadata() {
    const usersCount = await User.countDocuments();
    const votersCount = await User.countDocuments({ role: 'voter' });
    const adminsCount = await User.countDocuments({ role: 'admin' });
    const electionsCount = await Election.countDocuments();
    const candidatesCount = await Candidate.countDocuments();
    const votesCount = await Vote.countDocuments();
    const tokensCount = await GmailToken.countDocuments();

    return {
      engine: 'MongoDB (NoSQL Document Store)',
      connection: mongoose.connection.name || 'votepulse',
      collections: {
        users: { total: usersCount, voters: votersCount, admins: adminsCount },
        elections: electionsCount,
        candidates: candidatesCount,
        votes: votesCount,
        gmail_tokens: tokensCount
      }
    };
  }

  async getAllVoters() {
    return await User.find({}, 'id voter_id name email phone role created_at').sort({ created_at: -1 }).lean();
  }

  async getStats() {
    const total_voters = await User.countDocuments({ role: 'voter' });
    const total_elections = await Election.countDocuments();
    const active_elections = await Election.countDocuments({ status: 'active' });
    const total_candidates = await Candidate.countDocuments();
    const total_votes_cast = await Vote.countDocuments();

    return {
      total_voters,
      total_elections,
      active_elections,
      total_candidates,
      total_votes_cast
    };
  }
}

module.exports = new MongoDatabase();
