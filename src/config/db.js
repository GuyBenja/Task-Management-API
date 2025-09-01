const mongoose = require('mongoose');

async function connectDB(uri)
{
  if (!uri) throw new Error('MONGODB_CONNECTION_STRING missing');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = { connectDB };