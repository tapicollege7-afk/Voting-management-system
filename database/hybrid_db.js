const sqliteDb = require('./sqlite_db');
const mongoDb = require('./mongo_db');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../utils/cipher');

class HybridDatabaseManager {
  constructor() {
    this.isMongoActive = false;
  }

  async init() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri || process.env.DB_TYPE === 'mongodb' || process.env.USE_HYBRID === 'true') {
      try {
        await mongoDb.connect(mongoUri);
        this.isMongoActive = true;
        console.log("⚡ [HYBRID DB ENGINE INITIALIZED]");
        console.log("   ├─ SQL (SQLite) Engine   -> User Auth, Elections & Candidate Master Schemas");
        console.log("   └─ NoSQL (MongoDB) Engine -> High-Throughput Votes, Cryptographic Seals & OTP Tokens");
      } catch (err) {
        console.warn("⚠️ MongoDB offline or unreachable. Hybrid manager running in Unified SQL Mode.");
        this.isMongoActive = false;
      }
    } else {
      console.log("⚡ [HYBRID DB ENGINE READY] Operating in Unified SQL Mode (Set MONGODB_URI to enable SQL + NoSQL Hybrid Mode).");
    }
  }

  // ─── SQL DOMAIN: User Authentication & Accounts ───────────────────────────
  async findUserByVoterId(voter_id) {
    // Relational User Lookup via SQL
    const user = await sqliteDb.findUserByVoterId(voter_id);
    if (user) return user;
    if (this.isMongoActive) {
      return await mongoDb.findUserByVoterId(voter_id);
    }
    return null;
  }

  async createUser(userData) {
    // Write primary user record to SQL engine for ACID safety
    const user = await sqliteDb.createUser(userData);
    if (this.isMongoActive) {
      try {
        await mongoDb.createUser(userData);
      } catch (e) {
        // Ignore duplicate notice if synced
      }
    }
    return user;
  }

  verifyUserPassword(user, plainPassword) {
    return sqliteDb.verifyUserPassword(user, plainPassword);
  }

  async getAllVoters() {
    return await sqliteDb.getAllVoters();
  }

  // ─── SQL DOMAIN: Election & Candidate Master Data ────────────────────────
  async getElections() {
    return await sqliteDb.getElections();
  }

  async createElection(data) {
    const elec = await sqliteDb.createElection(data);
    if (this.isMongoActive) {
      try { await mongoDb.createElection(data); } catch (e) {}
    }
    return elec;
  }

  async updateElectionStatus(id, status) {
    const updated = await sqliteDb.updateElectionStatus(id, status);
    if (this.isMongoActive) {
      try { await mongoDb.updateElectionStatus(id, status); } catch (e) {}
    }
    return updated;
  }

  async getCandidates(election_id) {
    return await sqliteDb.getCandidates(election_id);
  }

  async createCandidate(data) {
    const cand = await sqliteDb.createCandidate(data);
    if (this.isMongoActive) {
      try { await mongoDb.createCandidate(data); } catch (e) {}
    }
    return cand;
  }

  // ─── NoSQL DOMAIN: High-Speed OTP Tokens ─────────────────────────────────
  async createGmailToken(voter_id, email) {
    if (this.isMongoActive) {
      return await mongoDb.createGmailToken(voter_id, email);
    }
    return await sqliteDb.createGmailToken(voter_id, email);
  }

  async createMobileToken(voter_id, phone) {
    if (this.isMongoActive) {
      return await mongoDb.createMobileToken(voter_id, phone);
    }
    return await sqliteDb.createMobileToken(voter_id, phone);
  }

  async verifyGmailToken(voter_id, token_code) {
    if (this.isMongoActive) {
      const res = await mongoDb.verifyGmailToken(voter_id, token_code);
      if (res) return true;
    }
    return await sqliteDb.verifyGmailToken(voter_id, token_code);
  }

  async verifyMobileToken(voter_id, token_code) {
    return await this.verifyGmailToken(voter_id, token_code);
  }

  // ─── NoSQL DOMAIN: Ultra-Fast Vote Stream & Cryptographic Sealing ─────────
  async hasVoted(election_id, voter_id) {
    if (this.isMongoActive) {
      const votedNoSQL = await mongoDb.hasVoted(election_id, voter_id);
      if (votedNoSQL) return true;
    }
    return await sqliteDb.hasVoted(election_id, voter_id);
  }

  async getVoteDetails(election_id, voter_id) {
    if (this.isMongoActive) {
      const details = await mongoDb.getVoteDetails(election_id, voter_id);
      if (details && details.has_voted) return details;
    }
    return await sqliteDb.getVoteDetails(election_id, voter_id);
  }

  async castVote(election_id, voter_id, candidate_id) {
    // 1. Ingest vote using NoSQL for max write throughput when MongoDB is active
    let voteRecord;
    if (this.isMongoActive) {
      voteRecord = await mongoDb.castVote(election_id, voter_id, candidate_id);
      // Sync vote to SQL engine asynchronously
      try {
        await sqliteDb.castVote(election_id, voter_id, candidate_id);
      } catch (e) {
        // Vote registered in NoSQL stream
      }
    } else {
      voteRecord = await sqliteDb.castVote(election_id, voter_id, candidate_id);
    }
    return voteRecord;
  }

  async auditBallotByHash(searchHash) {
    // Fast audit lookup via NoSQL index, fallback to SQL
    if (this.isMongoActive) {
      const result = await mongoDb.auditBallotByHash(searchHash);
      if (result) return result;
    }
    return await sqliteDb.auditBallotByHash(searchHash);
  }

  async deleteUser(voter_id) {
    if (!voter_id) throw new Error("Voter ID is required for deletion.");
    const clean = voter_id.trim();
    if (clean.toUpperCase() === 'ADM-9999') {
      throw new Error("System Primary Administrator (ADM-9999) cannot be deleted.");
    }
    const sqlRes = await sqliteDb.deleteUser(clean);
    if (this.isMongoActive) {
      try {
        await mongoDb.deleteUser(clean);
      } catch (e) {}
    }
    return sqlRes;
  }

  async getDatabaseMetadata() {
    const sqlMeta = await sqliteDb.getDatabaseMetadata();
    if (this.isMongoActive) {
      try {
        const mongoMeta = await mongoDb.getDatabaseMetadata();
        return {
          mode: 'HYBRID (SQL + NoSQL)',
          sql_engine: sqlMeta,
          nosql_engine: mongoMeta,
          active: true
        };
      } catch (e) {}
    }
    return {
      mode: 'SQL (SQLite Engine)',
      sql_engine: sqlMeta,
      nosql_engine: { engine: 'MongoDB (Inactive - Set MONGODB_URI to enable)', active: false },
      active: false
    };
  }

  async getStats() {
    const sqlStats = await sqliteDb.getStats();
    if (this.isMongoActive) {
      try {
        const mongoStats = await mongoDb.getStats();
        return {
          total_voters: Math.max(sqlStats.total_voters, mongoStats.total_voters),
          total_elections: Math.max(sqlStats.total_elections, mongoStats.total_elections),
          active_elections: Math.max(sqlStats.active_elections, mongoStats.active_elections),
          total_candidates: Math.max(sqlStats.total_candidates, mongoStats.total_candidates),
          total_votes_cast: Math.max(sqlStats.total_votes_cast, mongoStats.total_votes_cast),
          mode: 'HYBRID (SQL + NoSQL)'
        };
      } catch (e) {}
    }
    return { ...sqlStats, mode: 'SQL (SQLite)' };
  }
}

const hybridInstance = new HybridDatabaseManager();
hybridInstance.init();

module.exports = hybridInstance;
