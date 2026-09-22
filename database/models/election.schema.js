/**
 * Election Document Schema Definition
 * Represents an election event in VotePulse.
 */
const ElectionSchema = {
  election_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['General', 'Student Council', 'Corporate', 'Departmental', 'Local Council'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'paused'],
    default: 'active',
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
};

module.exports = ElectionSchema;
