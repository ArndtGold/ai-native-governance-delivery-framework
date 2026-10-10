import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './test/browser', timeout: 60_000, workers: 1,
  use: { browserName: 'chromium', headless: true, trace: 'off' },
  reporter: [['list'], ['json', { outputFile: join(process.platform === 'darwin' ? '/private/tmp' : tmpdir(), 'agdf-cockpit-browser-report.json') }]] });
