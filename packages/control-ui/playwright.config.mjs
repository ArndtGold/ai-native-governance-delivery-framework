import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './test/browser', timeout: 60_000, workers: 1,
  use: { browserName: 'chromium', headless: true, trace: 'off' },
  reporter: [['list'], ['json', { outputFile: '/private/tmp/agdf-cockpit-browser-report.json' }]] });
