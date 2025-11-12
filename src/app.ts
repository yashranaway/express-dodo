import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/client';
import paymentsRouter from './routes/payments';
import subsRouter from './routes/subscriptions';
import webhooksRouter from './routes/webhooks';
import { getEnvVarOptional } from './utils/env';

const app = express();
app.use(cors());
app.use('/api', express.json());

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
    app.listen(port, () => console.log(`Server listening on :${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();


