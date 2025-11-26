import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { mockPaymentPayload } from './helpers';

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

import paymentsRouter from '../src/routes/payments';

const app = express();
app.use(cors());
app.use('/api/payments', express.json());
app.use('/api/payments', paymentsRouter);

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments', () => {
    it('should create a payment successfully', async () => {
      const mockResponse = {
        session_id: 'cs_123',
        checkout_url: 'https://checkout.dodo.com/cs_123',
      };

      mockCreateCheckoutSession.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/payments')
        .send(mockPaymentPayload)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          billing_address: mockPaymentPayload.billing.address,
          customer: mockPaymentPayload.customer,
          product_cart: mockPaymentPayload.product_cart,
          confirm: false,
        })
      );
    });

    it('should return 400 if billing is missing', async () => {
      const { billing, ...payloadWithoutBilling } = mockPaymentPayload;

      const response = await request(app)
        .post('/api/payments')
        .send(payloadWithoutBilling)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 if customer is missing', async () => {
      const { customer, ...payloadWithoutCustomer } = mockPaymentPayload;

      const response = await request(app)
        .post('/api/payments')
        .send(payloadWithoutCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 if product_cart is missing', async () => {
      const { product_cart, ...payloadWithoutCart } = mockPaymentPayload;

      const response = await request(app)
        .post('/api/payments')
        .send(payloadWithoutCart)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should handle optional fields', async () => {
      const payloadWithOptionalFields = {
        ...mockPaymentPayload,
        metadata: { order_id: '123' },
        return_url: 'https://example.com/custom-return',
        discount_code: 'DISCOUNT10',
      };

      const mockResponse = {
        session_id: 'cs_123',
        checkout_url: 'https://checkout.dodo.com/cs_123',
      };

      mockCreateCheckoutSession.mockResolvedValue(mockResponse);

      await request(app)
        .post('/api/payments')
        .send(payloadWithOptionalFields)
        .expect(200);

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { order_id: '123' },
          return_url: 'https://example.com/custom-return',
          discount_code: 'DISCOUNT10',
        })
      );
    });

    it('should return 400 if DodoPayments API throws an error', async () => {
      const errorMessage = 'Invalid payment data';
      mockCreateCheckoutSession.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/payments')
        .send(mockPaymentPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(errorMessage);
    });
  });
});

