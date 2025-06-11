import { OpenFgaSDK } from '@southguild/auth-node-sdk';

const STORE_ID = process.env.OPENFGA_STORE_ID;

if (!STORE_ID) {
  throw new Error('OPENFGA_STORE_ID environment variable is required');
}

// Initialize the OpenFGA SDK instance
const fgaSdk = new OpenFgaSDK({
  store_id: process.env.OPEN_FGA_STORE_ID ?? '', // 
  retry_params: {
    max_retry: 3,
    min_wait_in_ms: 100,
  },
});

export default fgaSdk;
