import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDB(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: 'dodo' });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error', { error });
    throw error;
  }
}


