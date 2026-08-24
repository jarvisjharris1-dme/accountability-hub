import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.accountableapp.accountable',
  appName: 'Accountable',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
