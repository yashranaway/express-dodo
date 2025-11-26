import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';
import { getEnvVar } from '../utils/env';
import { validateRequest } from '../middleware/validation';
import { createSubscriptionSchema } from '../schemas/subscriptions';
import { logger } from '../utils/logger';

const router = Router();
const client = new DodoPayments({ bearerToken: getEnvVar('DODO_PAYMENTS_API_KEY') });

router.post('/', validateRequest(createSubscriptionSchema), async (req: Request, res: Response): Promise<void> => {
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

    const sub = await client.checkoutSessions.create({
      billing_address: billing,
      customer,
      product_cart: [{ product_id, quantity }],
      return_url,
      metadata,
      discount_code,
      show_saved_payment_methods,
      subscription_data: {
        trial_period_days,
      },
      confirm: false,
    });

    logger.info('Checkout session created', { sessionId: sub.session_id });
    res.json(sub);
  } catch (err) {
    logger.error('Checkout session creation failed', { error: err });
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = err instanceof Error && 'statusCode' in err ? (err.statusCode as number) : 400;
    res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;


