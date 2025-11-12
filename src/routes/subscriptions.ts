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
      product_id,
      quantity,
      return_url,
      metadata,
      discount_code,
      show_saved_payment_methods,
      tax_id,
      trial_period_days,
    } = req.body;

    if (!billing || !customer || !product_id || !quantity) {
      res.status(400).json({ error: 'billing, customer, product_id, and quantity are required' });
      return;
    }

    const sub = await client.subscriptions.create({
      billing,
      customer,
      product_id,
      quantity,
      payment_link: true,
      return_url,
      metadata,
      discount_code,
      show_saved_payment_methods,
      tax_id,
      trial_period_days,
    });

    res.json(sub);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
});

export default router;


