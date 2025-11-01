import { connectDB } from '../src/db/client';
import mongoose from 'mongoose';

// Load environment variables
require('dotenv').config();

beforeAll(async () => {
  // Connect to test database
  const testDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dodo-test';
  await connectDB(testDbUri);
});

afterAll(async () => {
  // Clean up: close database connection
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean up collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

