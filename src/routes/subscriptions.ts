import { Router } from 'express';
import DodoPayments from 'dodopayments';

const router = Router();
const client = new DodoPayments({ bearerToken: process.env.DODO_PAYMENTS_API_KEY });

router.post('/', async (req, res) => {
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
      return res.status(400).json({ error: 'billing, customer, product_id, and quantity are required' });
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;


