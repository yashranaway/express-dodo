import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { mockSubscriptionPayload } from './helpers';

const mockCreateSubscription = jest.fn();
jest.mock('dodopayments', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    subscriptions: {
      create: mockCreateSubscription,
    },
  })),
}));

import { Request, Response, NextFunction } from 'express';

jest.mock('../src/middleware/rateLimiter', () => ({
  apiRateLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  webhookRateLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import subscriptionsRouter from '../src/routes/subscriptions';

const app = express();
app.use(cors());
app.use('/api/subscriptions', express.json());
app.use('/api/subscriptions', subscriptionsRouter);

describe('Subscriptions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/subscriptions', () => {
    it('should create a subscription successfully', async () => {
      const mockResponse = {
        subscription_id: 'sub_123',
        status: 'pending',
        payment_link: 'https://pay.dodo.com/link_123',
      };

      mockCreateSubscription.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/subscriptions')
        .send(mockSubscriptionPayload)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCreateSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          billing: mockSubscriptionPayload.billing,
          customer: mockSubscriptionPayload.customer,
          product_id: mockSubscriptionPayload.product_id,
          quantity: mockSubscriptionPayload.quantity,
          payment_link: true,
        })
      );
    });

    it('should return 400 if billing is missing', async () => {
      const { billing, ...payloadWithoutBilling } = mockSubscriptionPayload;

      const response = await request(app)
        .post('/api/subscriptions')
        .send(payloadWithoutBilling)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 if customer is missing', async () => {
      const { customer, ...payloadWithoutCustomer } = mockSubscriptionPayload;

      const response = await request(app)
        .post('/api/subscriptions')
        .send(payloadWithoutCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 if product_id is missing', async () => {
      const { product_id, ...payloadWithoutProductId } = mockSubscriptionPayload;

      const response = await request(app)
        .post('/api/subscriptions')
        .send(payloadWithoutProductId)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 if quantity is missing', async () => {
      const { quantity, ...payloadWithoutQuantity } = mockSubscriptionPayload;

      const response = await request(app)
        .post('/api/subscriptions')
        .send(payloadWithoutQuantity)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should handle optional fields', async () => {
      const payloadWithOptionalFields = {
        ...mockSubscriptionPayload,
        metadata: { plan: 'premium' },
        return_url: 'https://example.com/custom-return',
        discount_code: 'DISCOUNT10',
        trial_period_days: 7,
      };

      const mockResponse = {
        subscription_id: 'sub_123',
        status: 'pending',
      };

      mockCreateSubscription.mockResolvedValue(mockResponse);

      await request(app)
        .post('/api/subscriptions')
        .send(payloadWithOptionalFields)
        .expect(200);

      expect(mockCreateSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { plan: 'premium' },
          return_url: 'https://example.com/custom-return',
          discount_code: 'DISCOUNT10',
          trial_period_days: 7,
        })
      );
    });

    it('should return 400 if DodoPayments API throws an error', async () => {
      const errorMessage = 'Invalid subscription data';
      mockCreateSubscription.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/subscriptions')
        .send(mockSubscriptionPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(errorMessage);
    });
  });
});

