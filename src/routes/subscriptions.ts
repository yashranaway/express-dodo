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

    logger.info('Subscription created', { subscriptionId: sub.subscription_id });
    res.json(sub);
  } catch (err) {
    logger.error('Subscription creation failed', { error: err });
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = err instanceof Error && 'statusCode' in err ? (err.statusCode as number) : 400;
    res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;


