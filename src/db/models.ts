import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, index: true },
  email: String,
  name: String,
});

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, index: true },
  status: String,
  amount: Number,
  currency: String,
  customerId: String,
  metadata: {},
});

const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, index: true },
  status: String,
  productId: String,
  customerId: String,
  currentPeriodEnd: Date,
  metadata: {},
});

export const Customer = mongoose.model('Customer', CustomerSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);


