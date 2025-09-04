const mongoose = require('mongoose');

// Keep a cached connection to avoid reconnecting in tests/dev
let cached = null;

/**
 * Connect to MongoDB (respects NODE_ENV)
 * - test: uses `MONGODB_CONNECTION_STRING_TEST`
 * - other: uses `MONGODB_CONNECTION_STRING`
 * Returns the active mongoose connection.
 */
async function connectDB() {
  if (cached) return cached;

  const uri =
    process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_CONNECTION_STRING_TEST
      : process.env.MONGODB_CONNECTION_STRING;

  if (!uri) throw new Error('Missing MongoDB URI');

  await mongoose.connect(uri);
  cached = mongoose.connection;
  return cached;
}

/**
 * Gracefully disconnect from MongoDB.
 * No-op if already disconnected.
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached = null;
  }
}

module.exports = { connectDB, disconnectDB };
