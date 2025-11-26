import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { mockSubscriptionPayload } from './helpers';

const mockCreateCheckoutSession = jest.fn();
jest.mock('dodopayments', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkoutSessions: {
      create: mockCreateCheckoutSession,
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
        session_id: 'cs_123',
        checkout_url: 'https://checkout.dodo.com/cs_123',
      };

      mockCreateCheckoutSession.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/subscriptions')
        .send(mockSubscriptionPayload)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          billing_address: mockSubscriptionPayload.billing.address,
          customer: mockSubscriptionPayload.customer,
          product_cart: mockSubscriptionPayload.product_cart,
          confirm: false,
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

    it('should return 400 if product_cart is missing', async () => {
      const { product_cart, ...payloadWithoutProductCart } = mockSubscriptionPayload;

      const response = await request(app)
        .post('/api/subscriptions')
        .send(payloadWithoutProductCart)
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
        session_id: 'cs_123',
        checkout_url: 'https://checkout.dodo.com/cs_123',
      };

      mockCreateCheckoutSession.mockResolvedValue(mockResponse);

      await request(app)
        .post('/api/subscriptions')
        .send(payloadWithOptionalFields)
        .expect(200);

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { plan: 'premium' },
          return_url: 'https://example.com/custom-return',
          discount_code: 'DISCOUNT10',
          subscription_data: {
            trial_period_days: 7,
          },
        })
      );
    });

    it('should return 400 if DodoPayments API throws an error', async () => {
      const errorMessage = 'Invalid subscription data';
      mockCreateCheckoutSession.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/subscriptions')
        .send(mockSubscriptionPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(errorMessage);
    });
  });
});

