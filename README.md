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
- POST /webhooks/dodo – Webhook receiver (verified via `dodopayments` SDK)

## Scripts

- npm run dev – Start in dev with ts-node
- npm run build – TypeScript compile to dist/
- npm start – Run compiled server
- npm test – Run tests
- npm run test:watch – Run tests in watch mode
- npm run test:coverage – Run tests with coverage report

## Testing

The project includes a comprehensive test suite using Jest and Supertest. Tests are located in the `tests/` directory.

To run tests:
```bash
npm test
```

Tests cover all API endpoints (payments, subscriptions, webhooks) and include:
- Request validation
- Error handling
- Database operations
- Webhook event processing

For more details, see [tests/README.md](tests/README.md).

**Note:** Tests require a MongoDB instance. By default, tests connect to `mongodb://localhost:27017/dodo-test`. You can override this by setting the `MONGODB_URI` environment variable.

## Webhook verification

This boilerplate uses the built-in webhook verification from the `dodopayments` SDK. The webhook route uses `express.raw()` to receive the raw body and verifies signatures using `client.webhooks.unwrap()`.

- Documentation: https://docs.dodopayments.com/developer-resources/webhooks#sdk-verification-recommended
