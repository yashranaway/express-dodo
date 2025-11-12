import { Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  status: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  metadata: Record<string, unknown>;
}

export interface ISubscription extends Document {
  subscriptionId: string;
  status: string;
  productId?: string;
  customerId?: string;
  currentPeriodEnd?: Date;
  metadata: Record<string, unknown>;
}

export interface ICustomer extends Document {
  customerId: string;
  email?: string;
  name?: string;
}

