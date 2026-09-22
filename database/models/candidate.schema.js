/**
 * Candidate Document Schema Definition
 * Represents a running candidate associated with an election.
 */
const CandidateSchema = {
  candidate_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  election_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    default: 'General'
  },
  manifesto: {
    type: String,
    default: ''
  },
  photo_url: {
    type: String,
    default: ''
  },
  vote_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
};

module.exports = CandidateSchema;
