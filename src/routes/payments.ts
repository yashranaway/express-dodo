import { Router } from 'express';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({ bearerToken: process.env.DODO_PAYMENTS_API_KEY });
const router = Router();

router.post('/', async (req, res) => {
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
      return res.status(400).json({ error: 'billing, customer, and product_cart are required' });
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;


