import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      body: Buffer | string | Record<string, unknown>;
    }
  }
}

