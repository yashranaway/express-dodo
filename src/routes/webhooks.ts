import { Router } from 'express';
import express from 'express';
import { Subscription, Payment } from '../db/models';
import { DodopaymentsHandler } from 'dodopayments-webhooks';
import {
  SubscriptionActiveData,
  SubscriptionOnHoldData,
  PaymentSucceededData,
  PaymentFailedData,
} from '../types/webhooks';

const router = Router();

// Initialize universal webhook handler
const handler = new DodopaymentsHandler({
  signing_key: process.env.DODO_WEBHOOK_SECRET as string,
});

// Parse JSON for this route (library expects JSON body/headers)
router.post('/', express.json(), async (req, res) => {
  try {
    // Let the handler verify and parse the event
    const event = await handler.handle(req);

    switch (event.type) {
      case 'subscription.active': {
        const data = event.data as SubscriptionActiveData;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          {
            subscriptionId: data.subscription_id,
            status: 'active',
            productId: data.product_id,
            customerId: data.customer?.customer_id,
            currentPeriodEnd: data.current_period_end
              ? new Date(data.current_period_end)
              : undefined,
            metadata: data.metadata || {},
          },
          { upsert: true }
        );
        break;
      }
      case 'subscription.on_hold': {
        const data = event.data as SubscriptionOnHoldData;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          { status: 'on_hold' }
        );
        break;
      }
      case 'payment.succeeded': {
        const p = event.data as PaymentSucceededData;
        await Payment.updateOne(
          { paymentId: p.payment_id },
          {
            paymentId: p.payment_id,
            status: 'succeeded',
            amount: p.total_amount,
            currency: p.currency,
            customerId: p.customer?.customer_id,
            metadata: p.metadata || {},
          },
          { upsert: true }
        );
        break;
      }
      case 'payment.failed': {
        const p = event.data as PaymentFailedData;
        await Payment.updateOne(
          { paymentId: p.payment_id },
          { status: 'failed' }
        );
        break;
      }
      default:
        // ignore unknown events
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    // If verification or processing fails, respond non-2xx to trigger retry
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;


