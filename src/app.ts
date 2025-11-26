import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db/client';
import paymentsRouter from './routes/payments';
import subsRouter from './routes/subscriptions';
import webhooksRouter from './routes/webhooks';
import { getEnvVarOptional } from './utils/env';
import { logger } from './utils/logger';
import { apiRateLimiter, webhookRateLimiter } from './middleware/rateLimiter';

const app = express();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use('/api', express.json());
app.use('/api', apiRateLimiter);
app.use('/webhooks/dodo', webhookRateLimiter);

async function bootstrap() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await connectDB(mongoUri);

  app.use('/api/payments', paymentsRouter);
  app.use('/api/subscriptions', subsRouter);
  app.use('/webhooks/dodo', webhooksRouter);

    const port = Number(getEnvVarOptional('PORT', '3000'));
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Invalid PORT value. Must be between 1 and 65535');
    }

    const server = app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close().then(() => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();


