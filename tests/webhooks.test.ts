import request from 'supertest';
import express from 'express';
import { Subscription, Payment } from '../src/db/models';

// Mock the dodopayments-webhooks SDK before importing the router
const mockHandle = jest.fn();
jest.mock('dodopayments-webhooks', () => ({
  __esModule: true,
  DodopaymentsHandler: jest.fn().mockImplementation(() => ({
    handle: mockHandle,
  })),
}), { virtual: true });

import webhooksRouter from '../src/routes/webhooks';

const app = express();
app.use('/webhooks/dodo', express.json());
app.use('/webhooks/dodo', webhooksRouter);

describe('Webhooks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /webhooks/dodo', () => {
    it('should handle subscription.active event', async () => {
      const mockEvent = {
        type: 'subscription.active',
        data: {
          subscription_id: 'sub_123',
          product_id: 'prod_123',
          customer: { customer_id: 'cust_123' },
          current_period_end: '2024-12-31T23:59:59Z',
          metadata: { plan: 'premium' },
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify database update
      const subscription = await Subscription.findOne({ subscriptionId: 'sub_123' });
      expect(subscription).toBeTruthy();
      expect(subscription?.status).toBe('active');
      expect(subscription?.productId).toBe('prod_123');
      expect(subscription?.customerId).toBe('cust_123');
    });

    it('should handle subscription.on_hold event', async () => {
      // First create a subscription
      await Subscription.create({
        subscriptionId: 'sub_123',
        status: 'active',
        productId: 'prod_123',
      });

      const mockEvent = {
        type: 'subscription.on_hold',
        data: {
          subscription_id: 'sub_123',
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      // Verify status was updated
      const subscription = await Subscription.findOne({ subscriptionId: 'sub_123' });
      expect(subscription?.status).toBe('on_hold');
    });

    it('should handle payment.succeeded event', async () => {
      const mockEvent = {
        type: 'payment.succeeded',
        data: {
          payment_id: 'pay_123',
          total_amount: 10000,
          currency: 'USD',
          customer: { customer_id: 'cust_123' },
          metadata: { order_id: 'order_123' },
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      expect(response.body).toEqual({ received: true });

      // Verify database update
      const payment = await Payment.findOne({ paymentId: 'pay_123' });
      expect(payment).toBeTruthy();
      expect(payment?.status).toBe('succeeded');
      expect(payment?.amount).toBe(10000);
      expect(payment?.currency).toBe('USD');
      expect(payment?.customerId).toBe('cust_123');
    });

    it('should handle payment.failed event', async () => {
      // First create a payment
      await Payment.create({
        paymentId: 'pay_123',
        status: 'pending',
        amount: 1000,
      });

      const mockEvent = {
        type: 'payment.failed',
        data: {
          payment_id: 'pay_123',
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      // Verify status was updated
      const payment = await Payment.findOne({ paymentId: 'pay_123' });
      expect(payment?.status).toBe('failed');
    });

    it('should ignore unknown event types', async () => {
      const mockEvent = {
        type: 'unknown.event',
        data: {},
      };

      mockHandle.mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      expect(response.body).toEqual({ received: true });
    });

    it('should return 500 if handler throws an error', async () => {
      const errorMessage = 'Invalid signature';
      mockHandle.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(errorMessage);
    });

    it('should upsert subscription on subscription.active', async () => {
      // Create existing subscription
      await Subscription.create({
        subscriptionId: 'sub_123',
        status: 'on_hold',
        productId: 'prod_old',
      });

      const mockEvent = {
        type: 'subscription.active',
        data: {
          subscription_id: 'sub_123',
          product_id: 'prod_new',
          customer: { customer_id: 'cust_123' },
          current_period_end: '2024-12-31T23:59:59Z',
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      // Verify it was updated, not duplicated
      const subscriptions = await Subscription.find({ subscriptionId: 'sub_123' });
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].status).toBe('active');
      expect(subscriptions[0].productId).toBe('prod_new');
    });

    it('should upsert payment on payment.succeeded', async () => {
      // Create existing payment
      await Payment.create({
        paymentId: 'pay_123',
        status: 'pending',
        amount: 1000,
      });

      const mockEvent = {
        type: 'payment.succeeded',
        data: {
          payment_id: 'pay_123',
          total_amount: 2000,
          currency: 'USD',
          customer: { customer_id: 'cust_123' },
        },
      };

      mockHandle.mockResolvedValue(mockEvent);

      await request(app)
        .post('/webhooks/dodo')
        .send({})
        .expect(200);

      // Verify it was updated, not duplicated
      const payments = await Payment.find({ paymentId: 'pay_123' });
      expect(payments.length).toBe(1);
      expect(payments[0].status).toBe('succeeded');
      expect(payments[0].amount).toBe(2000);
    });
  });
});

