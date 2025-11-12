export interface WebhookCustomer {
  customer_id: string;
  email?: string;
  name?: string;
}

export interface SubscriptionActiveData {
  subscription_id: string;
  product_id: string;
  customer?: WebhookCustomer;
  current_period_end?: string | number;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionOnHoldData {
  subscription_id: string;
}

export interface PaymentSucceededData {
  payment_id: string;
  total_amount: number;
  currency: string;
  customer?: WebhookCustomer;
  metadata?: Record<string, unknown>;
}

export interface PaymentFailedData {
  payment_id: string;
}

export type WebhookEvent =
  | { type: 'subscription.active'; data: SubscriptionActiveData }
  | { type: 'subscription.on_hold'; data: SubscriptionOnHoldData }
  | { type: 'payment.succeeded'; data: PaymentSucceededData }
  | { type: 'payment.failed'; data: PaymentFailedData };
