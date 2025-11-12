import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true, unique: true },
  email: { type: String, required: true },
  name: String,
});

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, index: true, unique: true },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
  },
  amount: { type: Number, min: 0 },
  currency: { type: String, length: 3 },
  customerId: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true, index: true, unique: true },
  status: {
    type: String,
    required: true,
    enum: ['active', 'on_hold', 'cancelled', 'expired'],
  },
  productId: { type: String, required: true },
  customerId: String,
  currentPeriodEnd: Date,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

export const Customer = mongoose.model('Customer', CustomerSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);


