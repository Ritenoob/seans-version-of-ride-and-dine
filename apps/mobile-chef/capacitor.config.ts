import type { CapacitorConfig } from '@capacitor/cli';

declare const process: { env: Record<string, string | undefined> };

const serverUrl = process.env.CAP_SERVER_URL || 'http://192.168.100.133:3002';

const config: CapacitorConfig = {
  appId: 'com.ridendine.chef',
  appName: 'Ride & Dine Chef',
  webDir: 'dist',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: true,
      }
    : undefined,
};

export default config;
