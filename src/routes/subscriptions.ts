import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { createSubscriptionSchema } from '../schemas/subscriptions';
import { logger } from '../utils/logger';
import DodoClient from '../utils/dodo-client';

const router = Router();

router.post('/',
  validateRequest(createSubscriptionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        billing,
        customer,
        product_cart,
        return_url,
        metadata,
        discount_code,
        show_saved_payment_methods,
        trial_period_days,
      } = req.body;

      const sub = await DodoClient.checkoutSessions.create({
        billing_address: billing.address,
        customer,
        product_cart,
        return_url,
        metadata,
        discount_code,
        show_saved_payment_methods,
        subscription_data: {
          trial_period_days,
        },
        confirm: true,
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