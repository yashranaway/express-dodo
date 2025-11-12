# API Tests

This directory contains comprehensive tests for the Express Dodo API.

## Structure

- `setup.ts` - Test setup and teardown configuration
- `helpers.ts` - Reusable test utilities and mock data
- `payments.test.ts` - Tests for the payments API endpoint
- `subscriptions.test.ts` - Tests for the subscriptions API endpoint
- `webhooks.test.ts` - Tests for the webhooks endpoint

## Running Tests

### Install Dependencies

First, make sure all dependencies are installed:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Environment

Tests require a MongoDB instance. By default, tests connect to:
- `mongodb://localhost:27017/dodo-test`

You can override this by setting the `MONGODB_URI` environment variable.

### Setting Up Test Environment

1. Make sure MongoDB is running locally, or
2. Set `MONGODB_URI` in your environment or `.env` file to point to your test database

**Note:** Tests automatically clean up the database after each test run, so they won't affect your production data.

## Test Coverage

The test suite covers:

### Payments API (`/api/payments`)
- Successful payment creation
- Validation of required fields (billing, customer, product_cart)
- Handling of optional fields (metadata, return_url, discount_code, etc.)
- Error handling for invalid requests

### Subscriptions API (`/api/subscriptions`)
- Successful subscription creation
- Validation of required fields (billing, customer, product_id, quantity)
- Handling of optional fields (metadata, return_url, discount_code, trial_period_days, etc.)
- Error handling for invalid requests

### Webhooks API (`/webhooks/dodo`)
- Handling `subscription.active` events
- Handling `subscription.on_hold` events
- Handling `payment.succeeded` events
- Handling `payment.failed` events
- Ignoring unknown event types
- Error handling for invalid webhooks
- Database upsert operations

## Writing New Tests

When adding new tests:

1. Use the helper functions in `helpers.ts` for common mock data
2. Follow the existing test structure and naming conventions
3. Mock external dependencies (like DodoPayments SDK) to avoid making real API calls
4. Clean up any test data in `afterEach` hooks if needed (automatic cleanup is handled by `setup.ts`)

## Mocking

Tests mock external dependencies:
- `dodopayments` SDK - Payments, subscriptions API calls, and webhook verification

This ensures tests run quickly and don't make actual API calls or require API keys during testing.

