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
      tax_id,
    } = req.body;

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

    logger.info('Payment created', { paymentId: payment.payment_id });
    res.json(payment);
  } catch (err) {
    logger.error('Payment creation failed', { error: err });
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = err instanceof Error && 'statusCode' in err ? (err.statusCode as number) : 400;
    res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;


