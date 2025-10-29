import { Router } from 'express';
import { raw } from 'express';
import { Subscription, Payment } from '../db/models';
import { Webhook, type WebhookUnbrandedRequiredHeaders } from 'standardwebhooks';

const router = Router();

// Use Standard Webhooks with your secret
const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET as string);

// Use raw body for signature verification (must not be pre-parsed by express.json())
router.post('/', raw({ type: '*/*' }), async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');

    const headers: WebhookUnbrandedRequiredHeaders = {
      'webhook-id': (req.header('webhook-id') || '') as string,
      'webhook-signature': (req.header('webhook-signature') || '') as string,
      'webhook-timestamp': (req.header('webhook-timestamp') || '') as string,
    };

    await webhook.verify(rawBody, headers);

    const payload = JSON.parse(rawBody) as {
      type: string;
      data: any;
    };

    switch (payload.type) {
      case 'subscription.active': {
        const data = payload.data;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          {
            subscriptionId: data.subscription_id,
            status: 'active',
            productId: data.product_id,
            customerId: data.customer?.customer_id,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
            metadata: data.metadata || {},
          },
          { upsert: true }
        );
        break;
      }
      case 'subscription.on_hold': {
        const data = payload.data;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          { status: 'on_hold' }
        );
        break;
      }
      case 'payment.succeeded': {
        const p = payload.data;
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
        const p = payload.data;
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
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;


