/**
 * Helper utilities for testing
 */

export const mockPaymentPayload = {
  billing: {
    address: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
  },
  customer: {
    email: 'test@example.com',
    name: 'Test User',
  },
  product_cart: [
    {
      product_id: 'prod_123',
      quantity: 1,
      price: 1000,
    },
  ],
  return_url: 'https://example.com/return',
};

export const mockSubscriptionPayload = {
  billing: {
    address: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
  },
  customer: {
    email: 'test@example.com',
    name: 'Test User',
  },
  product_id: 'prod_123',
  quantity: 1,
  return_url: 'https://example.com/return',
};

export const mockWebhookPayload = (eventType: string, data: any) => ({
  type: eventType,
  data,
  timestamp: Date.now(),
});

