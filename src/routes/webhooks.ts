import { Router, Request, Response } from 'express';
import express from 'express';
import { Subscription, Payment } from '../db/models';
import { WebhookEvent } from '../types/webhooks';
import { logger } from '../utils/logger';
import DodoClient from '../utils/dodo-client';

const router = Router();

router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookId = req.headers['webhook-id'];
    const webhookSignature = req.headers['webhook-signature'];
    const webhookTimestamp = req.headers['webhook-timestamp'];

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      logger.warn('Missing webhook headers', { headers: req.headers });
      res.status(400).json({ error: 'Missing required webhook headers' });
      return;
    }

    const body = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body || {});

    let event: WebhookEvent;
    try {
      event = DodoClient.webhooks.unwrap(body, {
        headers: {
          'webhook-id': String(webhookId),
          'webhook-signature': String(webhookSignature),
          'webhook-timestamp': String(webhookTimestamp),
        },
      }) as WebhookEvent;
    } catch (verifyError) {
      logger.error('Webhook signature verification failed', { error: verifyError, webhookId });
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    logger.info('Webhook received', { type: event.type, webhookId });

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
        logger.info('Subscription activated', { subscriptionId: data.subscription_id });
        break;
      }
      case 'subscription.on_hold': {
        const data = event.data;
        await Subscription.updateOne(
          { subscriptionId: data.subscription_id },
          { status: 'on_hold' }
        );
        logger.info('Subscription put on hold', { subscriptionId: data.subscription_id });
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
        logger.info('Payment succeeded', { paymentId: p.payment_id });
        break;
      }
      case 'payment.failed': {
        const p = event.data;
        await Payment.updateOne(
          { paymentId: p.payment_id },
          { status: 'failed' }
        );
        logger.info('Payment failed', { paymentId: p.payment_id });
        break;
      }
      default:
        logger.warn('Unknown webhook event type', { type: (event as { type: string }).type });
        break;
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing failed', { error: err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


