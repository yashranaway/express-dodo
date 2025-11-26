import DodoPayments from "dodopayments";
import { getEnvVar } from "./env";

const mode = getEnvVar('DODO_ENVIRONMENT');
if (mode !== 'live_mode' && mode !== 'test_mode') {
    throw new Error('DODO_ENVIRONMENT must be either live_mode or test_mode');
}

const DodoClient = new DodoPayments({
    bearerToken: getEnvVar('DODO_PAYMENTS_API_KEY'),
    environment: mode,
    webhookKey: getEnvVar('DODO_WEBHOOK_SECRET'),
});

export default DodoClient;