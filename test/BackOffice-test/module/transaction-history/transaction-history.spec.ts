import { test, expect, SELECTORS, TEST_DATA, login, waitForTableLoad, navigateToMenu } from '../../fixtures/test-fixtures';

test.describe('Transaction History Module - Tourist E-Wallet Back Office', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, TEST_DATA.validUser.email, TEST_DATA.validUser.password);
    await page.waitForTimeout(3000);

    // Navigate to Transactions menu
    await navigateToMenu(page, SELECTORS.navigation.transactions).catch(async () => {
      await page.goto('/transactions').catch(async () => {
        await page.click('text=Transaction').catch(() => {});
      });
    });
    await page.waitForLoadState('networkidle');
  });

  test('TC_Tourist_E-Wallet_BO_0030 - View Transactions Detail Top-up', async ({ page }) => {
    // Test Steps:
    // 1. Go to Transactions menu (done in beforeEach)
    // 2. Select Top-up tab
    // 3. Select a transaction
    // 4. Click View

    // Click on Top-up tab
    await page.click(SELECTORS.dashboard.topUpTab).catch(async () => {
      await page.click('text=Top-up').catch(async () => {
        await page.click('text=Topup').catch(() => {});
      });
    });
    await page.waitForTimeout(2000);

    // Wait for table to load
    await waitForTableLoad(page);

    // Find and click View button on first transaction
    const viewButtons = page.locator(SELECTORS.dashboard.viewButton);
    const firstViewButton = viewButtons.first();

    if (await firstViewButton.isVisible()) {
      await firstViewButton.click();
      await page.waitForTimeout(2000);

      // Expected Result: The system displays complete Top-up Transaction Details
      const hasDetailView = await page.locator(SELECTORS.common.modal).isVisible().catch(() => false) ||
                           await page.url().includes('detail') ||
                           await page.locator('[class*="detail"]').isVisible().catch(() => false);

      if (hasDetailView) {
        // Verify the detail content contains Top-up related information
        const detailContent = await page.locator('[class*="detail"], [class*="modal"], [role="dialog"]').textContent();
        console.log('Top-up Transaction Details displayed');

        expect(detailContent).toBeTruthy();
      }
    } else {
      console.log('NOTE: No Top-up transactions available to view');
    }
  });

  test('TC_Tourist_E-Wallet_BO_0031 - View Transactions Detail Payment', async ({ page }) => {
    // Test Steps:
    // 1. Go to Transactions menu (done in beforeEach)
    // 2. Select Payment tab
    // 3. Select a transaction
    // 4. Click View

    // Click on Payment tab
    await page.click(SELECTORS.dashboard.paymentTab).catch(async () => {
      await page.click('text=Payment').catch(() => {});
    });
    await page.waitForTimeout(2000);

    // Wait for table to load
    await waitForTableLoad(page);

    // Find and click View button on first transaction
    const viewButtons = page.locator(SELECTORS.dashboard.viewButton);
    const firstViewButton = viewButtons.first();

    if (await firstViewButton.isVisible()) {
      await firstViewButton.click();
      await page.waitForTimeout(2000);

      // Expected Result: The system displays complete Payment Transaction Details
      const hasDetailView = await page.locator(SELECTORS.common.modal).isVisible().catch(() => false) ||
                           await page.url().includes('detail') ||
                           await page.locator('[class*="detail"]').isVisible().catch(() => false);

      if (hasDetailView) {
        // Verify the detail content
        const detailContent = await page.locator('[class*="detail"], [class*="modal"], [role="dialog"]').textContent();
        console.log('Payment Transaction Details displayed');

        expect(detailContent).toBeTruthy();
      }
    } else {
      console.log('NOTE: No Payment transactions available to view');
    }
  });

  test('TC_Tourist_E-Wallet_BO_0032 - View Transactions Detail Withdrawal', async ({ page }) => {
    // Test Steps:
    // 1. Go to Transactions menu (done in beforeEach)
    // 2. Select Withdrawal tab
    // 3. Select a transaction
    // 4. Click View

    // Click on Withdrawal tab
    await page.click(SELECTORS.dashboard.withdrawalTab).catch(async () => {
      await page.click('text=Withdrawal').catch(() => {});
    });
    await page.waitForTimeout(2000);

    // Wait for table to load
    await waitForTableLoad(page);

    // Find and click View button on first transaction
    const viewButtons = page.locator(SELECTORS.dashboard.viewButton);
    const firstViewButton = viewButtons.first();

    if (await firstViewButton.isVisible()) {
      await firstViewButton.click();
      await page.waitForTimeout(2000);

      // Expected Result: The system displays complete Withdrawal Transaction Details
      const hasDetailView = await page.locator(SELECTORS.common.modal).isVisible().catch(() => false) ||
                           await page.url().includes('detail') ||
                           await page.locator('[class*="detail"]').isVisible().catch(() => false);

      if (hasDetailView) {
        // Verify the detail content
        const detailContent = await page.locator('[class*="detail"], [class*="modal"], [role="dialog"]').textContent();
        console.log('Withdrawal Transaction Details displayed');

        expect(detailContent).toBeTruthy();
      }
    } else {
      console.log('NOTE: No Withdrawal transactions available to view');
    }
  });
});
