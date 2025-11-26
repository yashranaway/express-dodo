// Set test env vars before imports (routes need them at module load)
if (!process.env.DODO_PAYMENTS_API_KEY) {
  process.env.DODO_PAYMENTS_API_KEY = 'test-api-key';
}
if (!process.env.DODO_WEBHOOK_SECRET) {
  process.env.DODO_WEBHOOK_SECRET = 'test-webhook-secret';
}
if (!process.env.DODO_ENVIRONMENT) {
  process.env.DODO_ENVIRONMENT = 'test_mode';
}

import { connectDB } from '../src/db/client';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

require('dotenv').config();

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri('dodo-test');
  process.env.MONGODB_URI = uri;
  await connectDB(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

