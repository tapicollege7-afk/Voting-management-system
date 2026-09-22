/**
 * VotePulse System Entrypoint
 * Delegates to: server/app.js (Express app)
 */
require('dotenv').config();
const { app, startServer } = require('./backend-server/app');

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
