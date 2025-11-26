import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';
import { getEnvVar } from '../utils/env';
import { validateRequest } from '../middleware/validation';
import { createPaymentSchema } from '../schemas/payments';
import { logger } from '../utils/logger';

const router = Router();
const client = new DodoPayments({ bearerToken: getEnvVar('DODO_PAYMENTS_API_KEY') });

router.post('/', validateRequest(createPaymentSchema), async (req: Request, res: Response): Promise<void> => {
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
    } = req.body;

    const payment = await client.checkoutSessions.create({
      billing_address: billing,
      customer,
      product_cart,
      return_url,
      metadata,
      allowed_payment_method_types,
      discount_code,
      show_saved_payment_methods,
      confirm: false,
    });

    logger.info('Checkout session created', { sessionId: payment.session_id });
    res.json(payment);
  } catch (err) {
    logger.error('Checkout session creation failed', { error: err });
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = err instanceof Error && 'statusCode' in err ? (err.statusCode as number) : 400;
    res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;


