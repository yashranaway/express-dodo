import { z } from 'zod';

const addressSchema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().length(2),
});

const billingSchema = z.object({
  address: addressSchema,
});

const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export const createSubscriptionSchema = z.object({
  billing: billingSchema,
  customer: customerSchema,
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  return_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  discount_code: z.string().optional(),
  show_saved_payment_methods: z.boolean().optional(),
  tax_id: z.string().optional(),
  trial_period_days: z.number().int().nonnegative().optional(),
});

