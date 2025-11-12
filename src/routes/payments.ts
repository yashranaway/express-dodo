import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';
import { getEnvVar } from '../utils/env';

const router = Router();
const client = new DodoPayments({ bearerToken: getEnvVar('DODO_PAYMENTS_API_KEY') });

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      billing,
      customer,
      product_cart,
      return_url,
      metadata,
      allowed_payment_method_types,
      discount_code,
      show_saved_payment_methods,
      tax_id,
    } = req.body;

    if (!billing || !customer || !product_cart) {
      res.status(400).json({ error: 'billing, customer, and product_cart are required' });
      return;
    }

    const payment = await client.payments.create({
      billing,
      customer,
      product_cart,
      payment_link: true,
      return_url,
      metadata,
      allowed_payment_method_types,
      discount_code,
      show_saved_payment_methods,
      tax_id,
    });

    res.json(payment);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
});

export default router;


