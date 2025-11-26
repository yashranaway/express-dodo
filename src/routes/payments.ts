import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { createPaymentSchema } from '../schemas/payments';
import { logger } from '../utils/logger';
import DodoClient from '../utils/dodo-client';

const router = Router();

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

    const payment = await DodoClient.checkoutSessions.create({
      billing_address: billing.address,
      customer,
      product_cart,
      return_url,
      metadata,
      allowed_payment_method_types,
      discount_code,
      show_saved_payment_methods,
      confirm: true,
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


