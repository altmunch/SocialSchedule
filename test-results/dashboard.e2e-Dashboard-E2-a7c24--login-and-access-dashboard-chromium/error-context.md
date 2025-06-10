# Test info

- Name: Dashboard E2E >> should login and access dashboard
- Location: C:\Users\Cheem\OneDrive\Coding\clipsCommerce\e2e\dashboard.e2e.spec.ts:9:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

    at C:\Users\Cheem\OneDrive\Coding\clipsCommerce\e2e\dashboard.e2e.spec.ts:12:16
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "Page Not Found" [level=2]
- paragraph: Oops! The page you're looking for doesn't exist or has been moved.
- link "Go to Homepage":
  - /url: /
- link "Contact Support":
  - /url: /contact
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 15.3.2 (stale) Webpack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 15.3.2 (stale) Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - link "Go to related documentation":
    - /url: https://nextjs.org/docs/messages/module-not-found
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Module not found: Can't resolve 'unfetch'"
  - img
  - text: ./node_modules/isomorphic-unfetch/index.js (7:1)
  - button "Open in editor":
    - img
  - text: "Module not found: Can't resolve 'unfetch' 5 | global.fetch || 6 | (typeof process == \"undefined\" > 7 | ? r(require(\"unfetch\")) | ^ 8 | : function (url, opts) { 9 | if (typeof url === \"string\" || url instanceof URL) { 10 | url = String(url).replace(/^\\/\\//g, \"https://\");"
  - link "https://nextjs.org/docs/messages/module-not-found":
    - /url: https://nextjs.org/docs/messages/module-not-found
  - text: "Import trace for requested module:"
  - link "./node_modules/huggingface/dist/index.cjs":
    - text: ./node_modules/huggingface/dist/index.cjs
    - img
  - link "./src/app/workflows/reports/TextSummaryEngine.ts":
    - text: ./src/app/workflows/reports/TextSummaryEngine.ts
    - img
  - link "./src/app/workflows/reports/ReportsAnalysisService.ts":
    - text: ./src/app/workflows/reports/ReportsAnalysisService.ts
    - img
  - link "./src/app/dashboard/page.tsx":
    - text: ./src/app/dashboard/page.tsx
    - img
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Dashboard E2E', () => {
   4 |   test('should redirect to login if not authenticated', async ({ page }) => {
   5 |     await page.goto('/dashboard');
   6 |     await expect(page).toHaveURL(/.*sign-in/);
   7 |   });
   8 |
   9 |   test('should login and access dashboard', async ({ page }) => {
  10 |     // Simulate login (update selectors as needed for your login form)
  11 |     await page.goto('/auth/sign-in');
> 12 |     await page.fill('input[type="email"]', 'testuser@example.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  13 |     await page.fill('input[type="password"]', 'testpassword');
  14 |     await page.click('button:has-text("Sign In")');
  15 |     await expect(page).toHaveURL(/.*dashboard/);
  16 |     await expect(page.getByText(/Choose your workflow/i)).toBeVisible();
  17 |   });
  18 |
  19 |   test('should navigate to Scan and perform scan', async ({ page }) => {
  20 |     // Assume already logged in from previous test or use a beforeEach
  21 |     await page.goto('/dashboard/scan');
  22 |     await page.fill('input#niche', 'fitness');
  23 |     await page.click('button:has-text("Start Scan")');
  24 |     await expect(page.getByText(/Scan Completed/i)).toBeVisible({ timeout: 10000 });
  25 |     await expect(page.getByText(/High-Performing Hooks/i)).toBeVisible();
  26 |   });
  27 |
  28 |   test('should navigate to Accelerate and see video columns', async ({ page }) => {
  29 |     await page.goto('/dashboard/accelerate');
  30 |     await expect(page.getByText(/To Do \/ Uploaded/i)).toBeVisible();
  31 |     await expect(page.getByText(/Processing/i)).toBeVisible();
  32 |     await expect(page.getByText(/Review & Edit/i)).toBeVisible();
  33 |     await expect(page.getByText(/Ready to Post/i)).toBeVisible();
  34 |   });
  35 |
  36 |   test('should navigate to Blitz, Cycle, Profile, Settings, Subscription', async ({ page }) => {
  37 |     const routes = [
  38 |       '/dashboard/blitz',
  39 |       '/dashboard/cycle',
  40 |       '/dashboard/profile',
  41 |       '/dashboard/settings',
  42 |       '/dashboard/subscription',
  43 |     ];
  44 |     for (const route of routes) {
  45 |       await page.goto(route);
  46 |       await expect(page.locator('h1, h2')).toBeVisible();
  47 |     }
  48 |   });
  49 |
  50 |   test('should handle scan error for missing input', async ({ page }) => {
  51 |     await page.goto('/dashboard/scan');
  52 |     await page.fill('input#niche', '');
  53 |     await page.click('button:has-text("Start Scan")');
  54 |     await expect(page.getByText(/Please enter a niche to scan/i)).toBeVisible();
  55 |   });
  56 |
  57 |   // Add more tests for connect/disconnect, onboarding, etc. as needed
  58 | }); 
```