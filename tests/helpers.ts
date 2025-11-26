export const mockPaymentPayload = {
  "billing": {
    "address": {
      "city": "San Francisco",
      "country": "US",
      "state": "CA",
      "street": "123 Main St",
      "zipcode": "94102"
    }
  },
  "customer": {
    "email": "test@example.com",
    "name": "Test User"
  },
  "product_cart": [
    {
      "amount": 1000,
      "product_id": "prod_123",
      "quantity": 1
    }
  ],
  "return_url": "https://example.com/return"
}

export const mockSubscriptionPayload = {
  "billing": {
    "address": {
      "city": "San Francisco",
      "country": "US",
      "state": "CA",
      "street": "123 Main St",
      "zipcode": "94102"
    }
  },
  "customer": {
    "email": "test@example.com",
    "name": "Test User"
  },
  "product_cart": [
    {
      "amount": 1000,
      "product_id": "prod_123",
      "quantity": 1
    }
  ],
  "return_url": "https://example.com/return"
};

import {
  SubscriptionActiveData,
  SubscriptionOnHoldData,
  PaymentSucceededData,
  PaymentFailedData,
} from '../src/types/webhooks';

type WebhookData =
  | SubscriptionActiveData
  | SubscriptionOnHoldData
  | PaymentSucceededData
  | PaymentFailedData
  | Record<string, unknown>;

export const mockWebhookPayload = (eventType: string, data: WebhookData) => ({
  type: eventType,
  data,
  timestamp: Date.now(),
});

