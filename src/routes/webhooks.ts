import { Router, Request, Response } from 'express';
import express from 'express';
import { Subscription, Payment } from '../db/models';
import DodoPayments from 'dodopayments';
import { WebhookEvent } from '../types/webhooks';
import { getEnvVar } from '../utils/env';

const router = Router();

const client = new DodoPayments({
  bearerToken: getEnvVar('DODO_PAYMENTS_API_KEY'),
  webhookKey: getEnvVar('DODO_WEBHOOK_SECRET'),
});

router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookId = req.headers['webhook-id'];
    const webhookSignature = req.headers['webhook-signature'];
    const webhookTimestamp = req.headers['webhook-timestamp'];

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      res.status(400).json({ error: 'Missing required webhook headers' });
      return;
    }

    const body = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body || {});
    const event = client.webhooks.unwrap(body, {
      headers: {
        'webhook-id': String(webhookId),
        'webhook-signature': String(webhookSignature),
        'webhook-timestamp': String(webhookTimestamp),
      },
    }) as WebhookEvent;

    switch (event.type) {
      case 'subscription.active': {
        const data = event.data;
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
        const data = event.data;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          { status: 'on_hold' }
        );
        break;
      }
      case 'payment.succeeded': {
        const p = event.data;
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
        const p = event.data;
        await Payment.updateOne(
          { paymentId: p.payment_id },
          { status: 'failed' }
        );
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;


