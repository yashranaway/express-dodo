# Express + MongoDB (Dodo Payments) – Boilerplate

Minimal TypeScript starter for building with Express, MongoDB, and Dodo Payments.

## Quick start

```bash
# Install deps
npm install

# Configure env
cp .env.example .env
# Fill in your values inside .env
```

```bash
# Run in dev (ts-node)
npm run dev

# Or build and run
npm run build && npm start
```

## Environment

- DODO_PAYMENTS_API_KEY – Dodo Payments API key
- DODO_WEBHOOK_SECRET – Webhook signing secret
- MONGODB_URI – MongoDB connection string
- PORT – Server port (default 3000)

## Endpoints

- POST /api/payments – Create one-time payment link
- POST /api/subscriptions – Create subscription link
- POST /webhooks/dodo – Webhook receiver (raw body, verified via standardwebhooks)

## Scripts

- npm run dev – Start in dev with ts-node
- npm run build – TypeScript compile to dist/
- npm start – Run compiled server
