import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Add retry for local development too
  workers: process.env.CI ? 1 : 3, // Reduce workers to prevent resource issues
  reporter: 'html',
  use: {
    baseURL: 'https://frontendui-librarysystem.onrender.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    // Add navigation timeout
    navigationTimeout: 60000,
    // Add action timeout
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Add browser args for stability
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
        },
      },
    },
  ],

  timeout: 45000, // Increase timeout for stability
  expect: {
    timeout: 10000, // Increase expect timeout
  },
});
