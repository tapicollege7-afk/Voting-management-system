const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../backend-server/helpers/cipher');

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

// Disable Mongoose global query buffering so queries never hang for 10000ms if disconnected
mongoose.set('bufferCommands', false);

// Mongoose Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  voter_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'voter' },
  password_hash: { type: String, required: true },
  caesar_password: { type: String, default: '' },
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
  type: { type: String, default: 'login' },
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
    this.lastFileMtime = 0;

    // Resilient In-Memory Store when local mongod service is not running
    this.inMemoryStore = {
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
      tokens: []
    };

    if (fs.existsSync(DATA_FILE_PATH)) {
      this.loadDataFromJson();
    } else {
      // Create initial data file if none exists
      this.saveDataToJson();
    }
  }

  loadDataFromJson() {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (Array.isArray(parsed.users)) {
            // Keep at least the admin user
            const hasAdmin = parsed.users.some(u => (u.voter_id || '').toUpperCase() === 'ADM-9999');
            if (!hasAdmin) {
              parsed.users.unshift({
                id: 'usr_admin',
                voter_id: 'ADM-9999',
                name: 'System Administrator',
                email: 'admin@votepulse.org',
                phone: '+1 555-0199',
                role: 'admin',
                password_hash: sha256Hash('admin123'),
                created_at: new Date().toISOString()
              });
            }
            this.inMemoryStore.users = parsed.users;
          }
          if (Array.isArray(parsed.elections)) {
            this.inMemoryStore.elections = parsed.elections;
          }
          if (Array.isArray(parsed.candidates)) {
            this.inMemoryStore.candidates = parsed.candidates;
          }
          if (Array.isArray(parsed.votes)) {
            this.inMemoryStore.votes = parsed.votes;
          }
          if (Array.isArray(parsed.tokens || parsed.gmail_tokens)) {
            this.inMemoryStore.tokens = parsed.tokens || parsed.gmail_tokens;
          }

          // Only seed default elections/candidates if key was undefined/absent in data.json
          if (parsed.elections === undefined) {
            this.inMemoryStore.elections = [
              {
                id: '101',
                title: 'General Election 2026',
                category: 'General Poll',
                description: 'Official Annual General Election 2026',
                status: 'active',
                created_at: new Date().toISOString()
              }
            ];
          }
          if (parsed.candidates === undefined) {
            this.inMemoryStore.candidates = [];
          }
        }
        this.lastFileMtime = fs.statSync(DATA_FILE_PATH).mtimeMs;
      }
    } catch (err) {
      console.warn("Notice: could not load data.json:", err.message);
    }
  }

  checkReloadDataJson() {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const stat = fs.statSync(DATA_FILE_PATH);
        if (stat.mtimeMs > (this.lastFileMtime || 0)) {
          this.loadDataFromJson();
        }
      }
    } catch (e) {}
  }

  saveDataToJson() {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.inMemoryStore, null, 2), 'utf-8');
      if (fs.existsSync(DATA_FILE_PATH)) {
        this.lastFileMtime = fs.statSync(DATA_FILE_PATH).mtimeMs;
      }
    } catch (err) {
      console.warn("Notice: could not save data.json:", err.message);
    }
  }

  async connect(uri) {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/votepulse';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000, bufferCommands: false });
      this.isConnected = true;
      console.log(`===================================================`);
      console.log(`🍃 MongoDB Engine connected successfully!`);
      console.log(`   URI: ${mongoUri}`);
      console.log(`===================================================`);
      await this.seedDefaultData();
    } catch (err) {
      this.isConnected = false;
      console.warn(`⚠️ MongoDB Notice: ${err.message}. Running on Resilient Memory Store.`);
    }
  }

  async seedDefaultData() {
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

      const elecCount = await Election.countDocuments();
      if (elecCount === 0) {
        await Election.create([
          {
            id: '101',
            title: 'Student Council General Election 2026',
            category: 'General Poll',
            description: 'Official annual university student council presidential election.',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: '102',
            title: 'Department Representative Election 2026',
            category: 'Departmental',
            description: 'Departmental student leaders election across campus.',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ]);
      }

      const candCount = await Candidate.countDocuments();
      if (candCount === 0) {
        await Candidate.create([
          {
            id: 'cand_1',
            election_id: '101',
            name: 'Rahul Sharma',
            department: 'Computer Science',
            party: 'Tech Vision Alliance',
            manifesto: 'Digital Campus Infrastructure, 24/7 Coding Labs & AI Research Funding.',
            photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
            vote_count: 0
          },
          {
            id: 'cand_2',
            election_id: '101',
            name: 'Kholii Patel',
            department: 'Mechanical Eng.',
            party: 'Student Welfare Movement',
            manifesto: 'Subsidized Canteen Pricing, Improved Sports Facilities & Transport Services.',
            photo_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300',
            vote_count: 0
          },
          {
            id: 'cand_3',
            election_id: '101',
            name: 'Priya Verma',
            department: 'Electrical Eng.',
            party: 'Innovation & Progress',
            manifesto: 'Eco-Friendly Solar Campus, Gender Equality & Industry Placement Drive.',
            photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
            vote_count: 0
          }
        ]);
      }
    } catch (e) {
      console.warn("MongoDB seed notice:", e.message);
    }
  }

  async findUserByVoterId(voter_id) {
    if (!voter_id) return null;
    const clean = voter_id.toLowerCase().trim();
    const cleanNoDash = clean.replace(/[-\s]/g, '');
    const cleanDigits = clean.replace(/\D/g, '');

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const flexiblePattern = cleanNoDash.split('').join('-?');
        const conditions = [
          { voter_id: { $regex: new RegExp(`^${flexiblePattern}$`, 'i') } },
          { voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } },
          { email: { $regex: new RegExp(`^${clean}$`, 'i') } },
          { name: { $regex: new RegExp(`^${clean}$`, 'i') } }
        ];
        if (cleanDigits.length >= 7) {
          conditions.push({ phone: { $regex: new RegExp(cleanDigits) } });
        }
        return await User.findOne({ $or: conditions }).lean();
      } catch (err) {}
    }

    this.checkReloadDataJson();
    return this.inMemoryStore.users.find(u => {
      const uId = (u.voter_id || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      const uName = (u.name || '').toLowerCase().trim();
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');

      return (
        uId === clean ||
        uId.replace(/[-\s]/g, '') === cleanNoDash ||
        uEmail === clean ||
        uName === clean ||
        (cleanDigits.length >= 7 && uPhoneDigits.length >= 7 && (uPhoneDigits === cleanDigits || uPhoneDigits.includes(cleanDigits)))
      );
    }) || null;
  }

  async updateUserEmail(voter_id, email) {
    if (!voter_id || !email) return;
    const cleanVoterId = voter_id.trim();
    const cleanEmail = email.toLowerCase().trim();

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await User.updateOne(
          { voter_id: { $regex: new RegExp(`^${cleanVoterId}$`, 'i') } },
          { $set: { email: cleanEmail } }
        );
      } catch (err) {}
    }

    const memoryUser = this.inMemoryStore.users.find(u => u.voter_id.toLowerCase() === cleanVoterId.toLowerCase());
    if (memoryUser) {
      memoryUser.email = cleanEmail;
    }
    this.saveDataToJson();
  }

  async createUser(userData) {
    const emailClean = userData.email ? userData.email.toLowerCase().trim() : '';
    let finalVoterId = userData.voter_id ? userData.voter_id.trim() : '';

    if (!finalVoterId) {
      finalVoterId = `VOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        if (emailClean) {
          const emailExists = await User.findOne({ email: { $regex: new RegExp(`^${emailClean}$`, 'i') } });
          if (emailExists) {
            throw new Error("This email address is already registered! Please sign in.");
          }
        }

        let existingVoter = await User.findOne({ voter_id: { $regex: new RegExp(`^${finalVoterId}$`, 'i') } });
        let attempts = 0;
        while (existingVoter && attempts < 10) {
          finalVoterId = `VOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          existingVoter = await User.findOne({ voter_id: { $regex: new RegExp(`^${finalVoterId}$`, 'i') } });
          attempts++;
        }

        const newUser = new User({
          id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          voter_id: finalVoterId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role || 'voter',
          password_hash: sha256Hash(userData.password),
          caesar_password: caesarCipherEncrypt(userData.password || ''),
          created_at: new Date().toISOString()
        });

        await newUser.save();
        const obj = newUser.toObject();
        this.inMemoryStore.users.push(obj);
        this.saveDataToJson();
        return obj;
      } catch (err) {
        if (err.message.includes('registered')) throw err;
      }
    }

    // In-Memory Fallback
    if (emailClean) {
      const emailExists = this.inMemoryStore.users.find(u => u.email.toLowerCase() === emailClean);
      if (emailExists) {
        throw new Error("This email address is already registered! Please sign in.");
      }
    }

    let existingVoter = this.inMemoryStore.users.find(u => u.voter_id.toLowerCase() === finalVoterId.toLowerCase());
    let attempts = 0;
    while (existingVoter && attempts < 10) {
      finalVoterId = `VOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      existingVoter = this.inMemoryStore.users.find(u => u.voter_id.toLowerCase() === finalVoterId.toLowerCase());
      attempts++;
    }

    const newUserObj = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      voter_id: finalVoterId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'voter',
      password_hash: sha256Hash(userData.password),
      caesar_password: caesarCipherEncrypt(userData.password || ''),
      created_at: new Date().toISOString()
    };

    this.inMemoryStore.users.push(newUserObj);
    this.saveDataToJson();
    return newUserObj;
  }

  verifyUserPassword(user, plainPassword) {
    const hash = sha256Hash(plainPassword);
    return user.password_hash === hash || user.password_hash === plainPassword;
  }

  async createGmailToken(voter_id, email, tokenType = 'login') {
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const recordObj = {
      id: 'tok_' + Date.now(),
      voter_id,
      email,
      token_code,
      type: tokenType,
      expires_at,
      verified: 0,
      created_at: new Date().toISOString()
    };

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const record = new GmailToken(recordObj);
        await record.save();
        const obj = record.toObject();
        this.inMemoryStore.tokens.push(obj);
        this.saveDataToJson();
        return obj;
      } catch (err) {}
    }

    this.inMemoryStore.tokens.push(recordObj);
    this.saveDataToJson();
    return recordObj;
  }

  async createMobileToken(voter_id, phone) {
    return await this.createGmailToken(voter_id, phone);
  }

  async verifyGmailToken(voter_id, token_code) {
    const cleanVoter = voter_id.toLowerCase().trim();
    const cleanNoDash = cleanVoter.replace(/[-\s]/g, '');

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const token = await GmailToken.findOne({
          $or: [
            { voter_id: { $regex: new RegExp(`^${cleanVoter}$`, 'i') } },
            { email: { $regex: new RegExp(`^${cleanVoter}$`, 'i') } }
          ],
          token_code: token_code.trim(),
          verified: 0
        });

        if (token && new Date(token.expires_at) > new Date()) {
          token.verified = 1;
          await token.save();
          return { valid: true, type: token.type || 'login', email: token.email, voter_id: token.voter_id };
        }
      } catch (err) {}
    }

    const t = this.inMemoryStore.tokens.find(tok => 
      ((tok.voter_id || '').toLowerCase().trim() === cleanVoter ||
       (tok.voter_id || '').replace(/[-\s]/g, '').toLowerCase() === cleanNoDash ||
       (tok.email || '').toLowerCase().trim() === cleanVoter) && 
      tok.token_code === token_code.trim() && 
      tok.verified === 0
    );

    if (t && new Date(t.expires_at) > new Date()) {
      t.verified = 1;
      this.saveDataToJson();
      return { valid: true, type: t.type || 'login', email: t.email, voter_id: t.voter_id };
    }

    return false;
  }

  async verifyMobileToken(voter_id, token_code) {
    return await this.verifyGmailToken(voter_id, token_code);
  }

  async getElections() {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        return await Election.find().sort({ created_at: -1 }).lean();
      } catch (err) {}
    }
    this.checkReloadDataJson();
    return this.inMemoryStore.elections;
  }

  async createElection(data) {
    const newElecObj = {
      id: data.id || 'elec_' + Date.now(),
      title: data.title,
      category: data.category || 'General Poll',
      description: data.description || '',
      status: data.status || 'active',
      created_at: new Date().toISOString()
    };

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const newElec = new Election(newElecObj);
        await newElec.save();
        const obj = newElec.toObject();
        this.inMemoryStore.elections.push(obj);
        this.saveDataToJson();
        return obj;
      } catch (err) {}
    }

    this.inMemoryStore.elections.push(newElecObj);
    this.saveDataToJson();
    return newElecObj;
  }

  async updateElectionStatus(id, status) {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const res = await Election.findOneAndUpdate({ id }, { status }, { new: true }).lean();
        if (res) {
          const inMem = this.inMemoryStore.elections.find(item => item.id === id);
          if (inMem) inMem.status = status;
          this.saveDataToJson();
          return res;
        }
      } catch (err) {}
    }

    const e = this.inMemoryStore.elections.find(item => item.id === id);
    if (e) {
      e.status = status;
      this.saveDataToJson();
      return e;
    }
    return null;
  }

  async deleteElection(id) {
    if (!id) return { success: false, message: "Election ID is required." };

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await Election.deleteOne({ id });
        await Candidate.deleteMany({ election_id: id });
        await Vote.deleteMany({ election_id: id });
      } catch (err) {
        console.warn("MongoDB deleteElection error:", err.message);
      }
    }

    this.inMemoryStore.elections = this.inMemoryStore.elections.filter(item => item.id !== id);
    this.inMemoryStore.candidates = this.inMemoryStore.candidates.filter(item => item.election_id !== id);
    this.inMemoryStore.votes = this.inMemoryStore.votes.filter(item => item.election_id !== id);
    this.saveDataToJson();

    return { success: true, message: "Election deleted successfully." };
  }

  async getCandidates(election_id) {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        if (election_id) {
          return await Candidate.find({ election_id }).lean();
        }
        return await Candidate.find().lean();
      } catch (err) {}
    }

    this.checkReloadDataJson();
    if (election_id) {
      return this.inMemoryStore.candidates.filter(c => c.election_id === election_id);
    }
    return this.inMemoryStore.candidates;
  }

  async createCandidate(data) {
    const newCandObj = {
      id: data.id || 'cand_' + Date.now(),
      election_id: data.election_id,
      name: data.name,
      department: data.department || data.party || 'General',
      party: data.party || data.department || 'Independent',
      manifesto: data.manifesto || '',
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      email: data.email || '',
      password: data.password || 'cand123',
      created_at: new Date().toISOString(),
      vote_count: 0
    };

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const newCand = new Candidate(newCandObj);
        await newCand.save();
        const obj = newCand.toObject();
        this.inMemoryStore.candidates.push(obj);
        this.saveDataToJson();
        return obj;
      } catch (err) {}
    }

    this.inMemoryStore.candidates.push(newCandObj);
    this.saveDataToJson();
    return newCandObj;
  }

  async deleteCandidate(id) {
    if (!id) return { success: false, message: "Candidate ID is required." };

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await Candidate.deleteOne({ id });
        await Vote.deleteMany({ candidate_id: id });
      } catch (err) {
        console.warn("MongoDB deleteCandidate error:", err.message);
      }
    }

    this.inMemoryStore.candidates = this.inMemoryStore.candidates.filter(item => item.id !== id);
    this.inMemoryStore.votes = this.inMemoryStore.votes.filter(item => item.candidate_id !== id);
    this.saveDataToJson();

    return { success: true, message: "Candidate deleted successfully." };
  }

  async hasVoted(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findOne({
          election_id,
          voter_id: { $regex: new RegExp(`^${clean}$`, 'i') }
        }).lean();
        return !!vote;
      } catch (err) {}
    }

    return this.inMemoryStore.votes.some(v => v.election_id === election_id && v.voter_id.toLowerCase() === clean);
  }

  async getVoteDetails(election_id, voter_id) {
    const clean = voter_id.toLowerCase().trim();

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
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
      } catch (err) {}
    }

    const v = this.inMemoryStore.votes.find(vote => vote.election_id === election_id && vote.voter_id.toLowerCase() === clean);
    if (!v) return { has_voted: false };

    const c = this.inMemoryStore.candidates.find(cand => cand.id === v.candidate_id);
    return {
      has_voted: true,
      candidate_id: v.candidate_id,
      candidate_name: c ? c.name : v.candidate_name,
      candidate_party: c ? (c.party || c.department) : 'Official Candidate',
      timestamp: v.timestamp,
      receipt_id: v.id,
      caesar_hash: v.caesar_hash,
      sha256_hash: v.sha256_hash
    };
  }

  async castVote(election_id, voter_id, candidate_id) {
    const cleanVoter = voter_id.toUpperCase().trim();
    const voted = await this.hasVoted(election_id, cleanVoter);
    if (voted) {
      throw new Error("You have already voted in this election!");
    }

    const rawStr = `${cleanVoter}_${election_id}_${candidate_id}_${Date.now()}`;
    const caesar_hash = caesarCipherEncrypt(rawStr, 3);
    const sha256_seal = sha256Hash(rawStr);

    let candidateName = 'Selected Candidate';

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const candidate = await Candidate.findOne({ id: candidate_id, election_id });
        if (!candidate) {
          throw new Error("Invalid candidate selected for this election.");
        }
        candidateName = candidate.name;

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
        const obj = voteRecord.toObject();
        this.inMemoryStore.votes.push(obj);
        return obj;
      } catch (err) {
        if (err.message.includes('already voted') || err.message.includes('Invalid candidate')) throw err;
      }
    }

    const candInMemory = this.inMemoryStore.candidates.find(c => c.id === candidate_id);
    if (candInMemory) {
      candidateName = candInMemory.name;
      candInMemory.vote_count += 1;
    }

    const voteObj = {
      id: 'vt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      election_id,
      voter_id: cleanVoter,
      candidate_id,
      candidate_name: candidateName,
      caesar_hash,
      sha256_hash: sha256_seal,
      timestamp: new Date().toISOString()
    };

    this.inMemoryStore.votes.push(voteObj);
    this.saveDataToJson();
    return voteObj;
  }

  async auditBallotByHash(searchHash) {
    const clean = searchHash.trim();

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findOne({
          $or: [
            { caesar_hash: clean },
            { sha256_hash: clean },
            { id: clean }
          ]
        }).lean();

        if (vote) {
          const election = await Election.findOne({ id: vote.election_id }).lean();
          const decrypted = caesarCipherDecrypt(vote.caesar_hash, 3);

          return {
            verified: true,
            receipt_id: vote.id,
            election_id: vote.election_id,
            election_title: election ? election.title : vote.election_id,
            voter_id_masked: vote.voter_id.substring(0, 3) + '***',
            candidate_name: vote.candidate_name,
            timestamp: vote.timestamp,
            caesar_encrypted_hash: vote.caesar_hash,
            sha256_seal: vote.sha256_hash,
            sha256_hash: vote.sha256_hash,
            decrypted_verification: decrypted
          };
        }
      } catch (err) {}
    }

    const v = this.inMemoryStore.votes.find(vote => 
      vote.caesar_hash === clean || vote.sha256_hash === clean || vote.id === clean
    );

    if (!v) return null;

    const e = this.inMemoryStore.elections.find(elec => elec.id === v.election_id);
    const decrypted = caesarCipherDecrypt(v.caesar_hash, 3);

    return {
      verified: true,
      receipt_id: v.id,
      election_id: v.election_id,
      election_title: e ? e.title : v.election_id,
      voter_id_masked: v.voter_id.substring(0, 3) + '***',
      candidate_name: v.candidate_name,
      timestamp: v.timestamp,
      caesar_encrypted_hash: v.caesar_hash,
      sha256_seal: v.sha256_hash,
      sha256_hash: v.sha256_hash,
      decrypted_verification: decrypted
    };
  }

  async deleteUser(voter_id) {
    if (!voter_id) throw new Error("Voter ID is required for deletion.");
    const clean = voter_id.trim();
    if (clean.toUpperCase() === 'ADM-9999') {
      throw new Error("System Primary Administrator (ADM-9999) cannot be deleted.");
    }

    this.checkReloadDataJson();
    const user = await this.findUserByVoterId(clean);
    if (!user) throw new Error("User not found.");

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await User.deleteOne({ voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } });
        await GmailToken.deleteMany({ voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } });
        await Vote.deleteMany({ voter_id: { $regex: new RegExp(`^${clean}$`, 'i') } });
      } catch (err) {}
    }

    this.inMemoryStore.users = this.inMemoryStore.users.filter(u => (u.voter_id || '').toLowerCase() !== clean.toLowerCase());
    this.inMemoryStore.tokens = this.inMemoryStore.tokens.filter(t => (t.voter_id || '').toLowerCase() !== clean.toLowerCase());
    this.inMemoryStore.votes = this.inMemoryStore.votes.filter(v => (v.voter_id || '').toLowerCase() !== clean.toLowerCase());
    this.saveDataToJson();
    return { success: true, message: `User ${user.name} (${user.voter_id}) and associated records deleted permanently.` };
  }

  async deleteAllVoters() {
    this.checkReloadDataJson();
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await User.deleteMany({ role: { $ne: 'admin' }, voter_id: { $ne: 'ADM-9999' } });
        await GmailToken.deleteMany({});
        await Vote.deleteMany({});
      } catch (err) {}
    }

    this.inMemoryStore.users = this.inMemoryStore.users.filter(u => u.role === 'admin' || (u.voter_id || '').toUpperCase() === 'ADM-9999');
    this.inMemoryStore.tokens = [];
    this.inMemoryStore.votes = [];
    this.saveDataToJson();
    return { success: true, message: "All registered voters, ballots, and tokens deleted permanently." };
  }

  async deleteAllElections() {
    this.checkReloadDataJson();
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await Election.deleteMany({});
        await Candidate.deleteMany({});
        await Vote.deleteMany({});
      } catch (err) {}
    }

    this.inMemoryStore.elections = [];
    this.inMemoryStore.candidates = [];
    this.inMemoryStore.votes = [];
    this.saveDataToJson();
    return { success: true, message: "All elections, candidates, and votes deleted permanently." };
  }

  async purgeAllData() {
    this.checkReloadDataJson();
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        await Election.deleteMany({});
        await Candidate.deleteMany({});
        await Vote.deleteMany({});
        await GmailToken.deleteMany({});
        await User.deleteMany({ voter_id: { $ne: 'ADM-9999' } });
      } catch (err) {
        console.warn("MongoDB purge error:", err.message);
      }
    }

    const adminUser = this.inMemoryStore.users.find(u => (u.voter_id || '').toUpperCase() === 'ADM-9999') || {
      id: 'usr_admin',
      voter_id: 'ADM-9999',
      name: 'System Administrator',
      email: 'admin@votepulse.org',
      phone: '+1 555-0199',
      role: 'admin',
      password_hash: sha256Hash('admin123'),
      created_at: new Date().toISOString()
    };

    this.inMemoryStore = {
      users: [adminUser],
      elections: [],
      candidates: [],
      votes: [],
      tokens: []
    };

    this.saveDataToJson();
    return {
      success: true,
      message: "All data (elections, candidates, votes, tokens, and registered voters) has been permanently deleted from the database."
    };
  }

  async getDatabaseMetadata() {
    this.checkReloadDataJson();
    let usersCount = this.inMemoryStore.users.length;
    let votersCount = this.inMemoryStore.users.filter(u => u.role === 'voter').length;
    let adminsCount = this.inMemoryStore.users.filter(u => u.role === 'admin').length;
    let electionsCount = this.inMemoryStore.elections.length;
    let candidatesCount = this.inMemoryStore.candidates.length;
    let votesCount = this.inMemoryStore.votes.length;
    let tokensCount = this.inMemoryStore.tokens.length;

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        usersCount = await User.countDocuments();
        votersCount = await User.countDocuments({ role: 'voter' });
        adminsCount = await User.countDocuments({ role: 'admin' });
        electionsCount = await Election.countDocuments();
        candidatesCount = await Candidate.countDocuments();
        votesCount = await Vote.countDocuments();
        tokensCount = await GmailToken.countDocuments();
      } catch (err) {}
    }

    return {
      engine: this.isConnected ? 'MongoDB (Live Cluster Connected)' : 'MongoDB (Resilient Memory Engine)',
      connected: Boolean(this.isConnected),
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
    this.checkReloadDataJson();
    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        return await User.find(
          { role: { $ne: 'admin' }, voter_id: { $not: /^ADM-/i } },
          'id voter_id name email phone role is_verified created_at'
        ).sort({ created_at: -1 }).lean();
      } catch (err) {}
    }
    return this.inMemoryStore.users
      .filter(u => u.role !== 'admin' && !(u.voter_id || '').toUpperCase().startsWith('ADM-'))
      .map(u => ({
        id: u.id,
        voter_id: u.voter_id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_verified: u.is_verified !== undefined ? u.is_verified : 1,
        created_at: u.created_at
      }));
  }

  async getStats() {
    this.checkReloadDataJson();
    let total_voters = this.inMemoryStore.users.filter(u => u.role === 'voter' && !(u.voter_id || '').toUpperCase().startsWith('ADM-')).length;
    let total_elections = this.inMemoryStore.elections.length;
    let active_elections = this.inMemoryStore.elections.filter(e => e.status === 'active').length;
    let total_candidates = this.inMemoryStore.candidates.length;
    let total_votes_cast = this.inMemoryStore.votes.length;

    if (this.isConnected && mongoose.connection.readyState === 1) {
      try {
        total_voters = await User.countDocuments({ role: { $ne: 'admin' }, voter_id: { $not: /^ADM-/i } });
        total_elections = await Election.countDocuments();
        active_elections = await Election.countDocuments({ status: 'active' });
        total_candidates = await Candidate.countDocuments();
        total_votes_cast = await Vote.countDocuments();
      } catch (err) {}
    }

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
