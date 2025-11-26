import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1),
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

const productCartItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive().optional(),
});

export const createPaymentSchema = z.object({
  billing: billingSchema,
  customer: customerSchema,
  product_cart: z.array(productCartItemSchema).min(1),
  return_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  allowed_payment_method_types: z.array(z.string()).optional(),
  discount_code: z.string().optional(),
  show_saved_payment_methods: z.boolean().optional()
});

