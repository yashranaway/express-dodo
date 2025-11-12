import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { mockPaymentPayload } from './helpers';

const mockCreatePayment = jest.fn();
jest.mock('dodopayments', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    payments: {
      create: mockCreatePayment,
    },
  })),
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
        payment_id: 'pay_123',
        status: 'pending',
        payment_link: 'https://pay.dodo.com/link_123',
      };

      mockCreatePayment.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/payments')
        .send(mockPaymentPayload)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          billing: mockPaymentPayload.billing,
          customer: mockPaymentPayload.customer,
          product_cart: mockPaymentPayload.product_cart,
          payment_link: true,
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
      expect(response.body.error).toContain('billing, customer, and product_cart are required');
    });

    it('should return 400 if customer is missing', async () => {
      const { customer, ...payloadWithoutCustomer } = mockPaymentPayload;

      const response = await request(app)
        .post('/api/payments')
        .send(payloadWithoutCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('billing, customer, and product_cart are required');
    });

    it('should return 400 if product_cart is missing', async () => {
      const { product_cart, ...payloadWithoutCart } = mockPaymentPayload;

      const response = await request(app)
        .post('/api/payments')
        .send(payloadWithoutCart)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('billing, customer, and product_cart are required');
    });

    it('should handle optional fields', async () => {
      const payloadWithOptionalFields = {
        ...mockPaymentPayload,
        metadata: { order_id: '123' },
        return_url: 'https://example.com/custom-return',
        discount_code: 'DISCOUNT10',
      };

      const mockResponse = {
        payment_id: 'pay_123',
        status: 'pending',
      };

      mockCreatePayment.mockResolvedValue(mockResponse);

      await request(app)
        .post('/api/payments')
        .send(payloadWithOptionalFields)
        .expect(200);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { order_id: '123' },
          return_url: 'https://example.com/custom-return',
          discount_code: 'DISCOUNT10',
        })
      );
    });

    it('should return 400 if DodoPayments API throws an error', async () => {
      const errorMessage = 'Invalid payment data';
      mockCreatePayment.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/payments')
        .send(mockPaymentPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(errorMessage);
    });
  });
});

