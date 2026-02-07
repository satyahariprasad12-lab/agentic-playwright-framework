import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './src/tests',

  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',

        // If CI is true, run headless; otherwise, use your default false
        headless: process.env.CI ? true : false,

        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },

        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
      },
    },
  ],

  // Avoid opening the browser automatically on CI servers
  reporter: [['html', { open: process.env.CI ? 'never' : 'always' }]],
});
