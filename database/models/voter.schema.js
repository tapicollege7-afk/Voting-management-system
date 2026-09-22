/**
 * Voter Document Schema Definition
 * Represents a registered voter in the VotePulse system.
 */
const VoterSchema = {
  voter_id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  status: {
    type: String,
    enum: ['active', 'unverified', 'suspended'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
};

module.exports = VoterSchema;
