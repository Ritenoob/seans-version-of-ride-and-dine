import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
  },
  reporter: [['list']]
});
