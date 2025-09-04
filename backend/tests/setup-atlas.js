require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

jest.setTimeout(20000);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await disconnectDB();
});
