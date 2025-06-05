import { AuthSDK } from '@southguild/auth-node-sdk';

let sdkInstance: AuthSDK | null = null;

export function initializeSDK(apiToken: string, tenantId: string) {
  sdkInstance = new AuthSDK({
    tenantId,
    apiToken, // comes from login
    timeout: 5000,
    debug: true,
  });
}

export function getSDK(): AuthSDK {
  if (!sdkInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() after login.');
  }
  return sdkInstance;
}
