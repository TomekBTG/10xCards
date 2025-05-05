import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration for Playwright E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record browser viewport size
    viewport: { width: 1280, height: 720 },
    
    // Record video only when tests fail
    video: 'on-first-retry',
    
    // Enable screenshots on failure 
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run build -- --mode test && npm run preview -- --mode test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 