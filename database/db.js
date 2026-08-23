const sqliteDb = require('./sqlite_db');
const mongoDb = require('./mongo_db');

const useMongo = !!(process.env.MONGODB_URI || process.env.DB_TYPE === 'mongodb');

if (useMongo) {
  mongoDb.connect(process.env.MONGODB_URI).catch((err) => {
    console.warn("⚠️ MongoDB connection failed. Falling back to SQLite database engine.");
  });
}

module.exports = useMongo ? mongoDb : sqliteDb;
