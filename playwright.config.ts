import { defineConfig, devices } from '@playwright/test';

// Helper to get environment variable with default
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.test.ts',
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 10000, // 10 seconds
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // 10 seconds
    navigationTimeout: 30000, // 30 seconds
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000, // 2 minutes
  },
});