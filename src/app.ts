import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/client';
import paymentsRouter from './routes/payments';
import subsRouter from './routes/subscriptions';
import webhooksRouter from './routes/webhooks';

const app = express();
app.use(cors());
// Only parse JSON for API routes; do not parse JSON for the webhook path
app.use('/api', express.json());

async function bootstrap() {
  await connectDB(process.env.MONGODB_URI!);

  app.use('/api/payments', paymentsRouter);
  app.use('/api/subscriptions', subsRouter);
  app.use('/webhooks/dodo', webhooksRouter);

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server listening on :${port}`));
}

bootstrap();


