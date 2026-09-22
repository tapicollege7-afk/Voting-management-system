/**
 * Admin Console Schema & Privileges
 * Represents administrative accounts and privilege definitions.
 */
const AdminSchema = {
  admin_id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: 'ADM-9999'
  },
  name: {
    type: String,
    required: true,
    default: 'System Administrator'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  permissions: {
    type: [String],
    default: [
      'create_election',
      'update_election_status',
      'delete_election',
      'add_candidate',
      'delete_candidate',
      'manage_voters',
      'delete_voter',
      'view_analytics',
      'purge_database'
    ]
  },
  created_at: {
    type: Date,
    default: Date.now
  }
};

module.exports = AdminSchema;
