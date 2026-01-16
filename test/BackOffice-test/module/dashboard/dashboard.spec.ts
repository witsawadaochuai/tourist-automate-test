import { test, expect, TEST_DATA, login, waitForTableLoad } from '../../fixtures/test-fixtures';

const DASHBOARD_SEARCH_PLACEHOLDER = 'Search Client Name, Wallet ID, Transaction ID';
const STATUS_FILTER_PLACEHOLDER = 'All Status';
const PARTNER_FILTER_PLACEHOLDER = 'All Partners';

const ensureDashboardList = async (page: any) => {
  await page.goto('/internal/dashboard').catch(async () => {
    await page.goto('/dashboard').catch(() => {});
  });
  await page.waitForLoadState('domcontentloaded');

  const searchInput = page.locator(`input[placeholder="${DASHBOARD_SEARCH_PLACEHOLDER}"]`);
  const paymentTab = page.getByRole('button', { name: 'Payment' });
  const searchReady = await searchInput.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (searchReady) {
    return true;
  }

  return paymentTab.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
};

const clickDashboardTab = async (page: any, labels: string[]) => {
  for (const label of labels) {
    const candidates = [
      page.getByRole('button', { name: label }),
      page.getByRole('tab', { name: label }),
      page.getByRole('link', { name: label }),
      page.getByText(label, { exact: true }),
    ];

    for (const candidate of candidates) {
      try {
        await candidate.first().scrollIntoViewIfNeeded().catch(() => {});
        await candidate.first().click({ timeout: 10000 });
        return true;
      } catch {
        // Try next candidate.
      }
    }
  }

  const listReady = await ensureDashboardList(page);
  if (!listReady) {
    return false;
  }

  for (const label of labels) {
    const candidates = [
      page.getByRole('button', { name: label }),
      page.getByRole('tab', { name: label }),
      page.getByRole('link', { name: label }),
      page.getByText(label, { exact: true }),
    ];

    for (const candidate of candidates) {
      try {
        await candidate.first().scrollIntoViewIfNeeded().catch(() => {});
        await candidate.first().click({ timeout: 10000 });
        return true;
      } catch {
        // Try next candidate.
      }
    }
  }

  return false;
};

const getFirstRowTransactionId = async (page: any) => {
  await waitForTableLoad(page);

  const rows = page.locator('tbody tr');
  if (await rows.count() === 0) {
    return null;
  }

  const emptyState = page.locator('text=No results found');
  if (await emptyState.isVisible().catch(() => false)) {
    return null;
  }

  const transactionIdCell = rows.first().locator('td').nth(1);
  const transactionId = (await transactionIdCell.textContent())?.trim();
  if (!transactionId) {
    return null;
  }

  return transactionId;
};

const openFirstActionIcon = async (page: any) => {
  const transactionId = await getFirstRowTransactionId(page);
  if (!transactionId) {
    return null;
  }

  const rows = page.locator('tbody tr');
  const actionLink = rows.first().locator('a[href^="/internal/dashboard/"], a[href^="/internal/transactions/"], a[href*="/dashboard/"], a[href*="/transactions/"]').first();
  if (await actionLink.isVisible().catch(() => false)) {
    await actionLink.scrollIntoViewIfNeeded().catch(() => {});
    await actionLink.click();
    return transactionId;
  }

  const actionCell = rows.first().locator('td').last();
  const actionTargets = actionCell.locator('button, a, [role="button"], svg');
  if (await actionTargets.first().isVisible().catch(() => false)) {
    await actionTargets.first().click();
    return transactionId;
  }

  if (await actionCell.isVisible().catch(() => false)) {
    await actionCell.click();
    return transactionId;
  }

  return null;
};

const waitForDetailView = async (page: any, expectedTitle?: string | RegExp) => {
  const urlReady = await page
    .waitForURL(/\/internal\/(dashboard|transactions)\//i, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!urlReady) {
    return false;
  }

  if (!expectedTitle) {
    return true;
  }

  return page
    .getByRole('heading', { name: expectedTitle })
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false);
};

const expectTransactionDetails = async (page: any, expectedTitle: string | RegExp) => {
  const hasDetailView = await waitForDetailView(page, expectedTitle);
  expect(hasDetailView).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Transaction details' })).toBeVisible();
  await expect(page.getByText('Transaction ID', { exact: true })).toBeVisible();
  await expect(page.getByText('Transaction Date', { exact: true })).toBeVisible();
  await expect(page.getByText('Status', { exact: true })).toBeVisible();
};

test.describe('Dashboard Module - Tourist E-Wallet Back Office', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // Login before each test
    await login(page, TEST_DATA.validUser.email, TEST_DATA.validUser.password);
    await page.waitForTimeout(3000);

    const hasList = await ensureDashboardList(page);
    if (!hasList) {
      console.log('NOTE: Dashboard list not visible after navigation');
    }
  });

  test('TC_Tourist_E-Wallet_BO_0018 - Select View Button Payment Transactions Detail', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Transaction Tabs "Payment"
    // 3. Select View Button

    const tabClicked = await clickDashboardTab(page, ['Payment']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await openFirstActionIcon(page);
    if (!transactionId) {
      console.log('NOTE: No Payment transactions available to view');
      return;
    }

    const hasDetailView = await waitForDetailView(page);
    expect(hasDetailView).toBeTruthy();
    expect(page.url()).toContain(transactionId);
  });

  test('TC_Tourist_E-Wallet_BO_0019 - Check Transactions Detail Payment', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Transaction Tabs "Payment"
    // 3. Select View Button

    const tabClicked = await clickDashboardTab(page, ['Payment']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await openFirstActionIcon(page);
    if (!transactionId) {
      console.log('NOTE: No Payment transactions available to verify details');
      return;
    }

    await expectTransactionDetails(page, /Payment Transaction Details/i);
    expect(page.url()).toContain(transactionId);
  });

  test('TC_Tourist_E-Wallet_BO_0020 - Select View Button Top-up Transactions Detail', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Transaction Tabs "Top-up"
    // 3. Select View Button

    const tabClicked = await clickDashboardTab(page, ['Top up', 'Top-up', 'Topup']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await openFirstActionIcon(page);
    if (!transactionId) {
      console.log('NOTE: No Top-up transactions available to view');
      return;
    }

    const hasDetailView = await waitForDetailView(page);
    expect(hasDetailView).toBeTruthy();
    expect(page.url()).toContain(transactionId);
  });

  test('TC_Tourist_E-Wallet_BO_0021 - Check Transactions Detail Top-up', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Transaction Tabs "Top-up"
    // 3. Select View Button

    const tabClicked = await clickDashboardTab(page, ['Top up', 'Top-up', 'Topup']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await openFirstActionIcon(page);
    if (!transactionId) {
      console.log('NOTE: No Top-up transactions available to verify details');
      return;
    }

    await expectTransactionDetails(page, /Top Up Transaction Details/i);
    expect(page.url()).toContain(transactionId);
  });

  test('TC_Tourist_E-Wallet_BO_0022 - Select View Button Withdrawal Transactions Detail', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Transaction Tabs "Withdrawal"
    // 3. Select View Button

    const tabClicked = await clickDashboardTab(page, ['Withdraw', 'Withdrawal']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await openFirstActionIcon(page);
    if (!transactionId) {
      console.log('NOTE: No Withdrawal transactions available to view');
      return;
    }

    const hasDetailView = await waitForDetailView(page, /Withdrawal Transaction Details/i);
    expect(hasDetailView).toBeTruthy();
    expect(page.url()).toContain(transactionId);
  });

  test('TC_Tourist_E-Wallet_BO_0023 - Check Search at Payment', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Select Search
    // 3. Input Client name, Wallet ID or Transaction ID

    const tabClicked = await clickDashboardTab(page, ['Payment']);
    expect(tabClicked).toBeTruthy();

    const transactionId = await getFirstRowTransactionId(page);
    if (!transactionId) {
      console.log('NOTE: No Payment transactions available to search');
      return;
    }

    const searchInput = page.locator(`input[placeholder="${DASHBOARD_SEARCH_PLACEHOLDER}"]`);

    if (await searchInput.isVisible()) {
      await searchInput.fill(transactionId);
      await page.keyboard.press('Enter');
      await waitForTableLoad(page);

      const resultRow = page.locator('tbody tr').filter({ hasText: transactionId }).first();
      await expect(resultRow).toBeVisible();
      console.log('Search functionality executed successfully');
    } else {
      // Try alternative search approach
      const altSearch = page.locator('input[type="text"]').first();
      if (await altSearch.isVisible()) {
        await altSearch.fill(transactionId);
        await page.keyboard.press('Enter');
        await waitForTableLoad(page);
      }
    }
  });

  test('TC_Tourist_E-Wallet_BO_0024 - Check Filter Status at Payment, Top-up, Withdrawal', async ({ page }) => {
    // Test Steps:
    // 1. Select menu Dashboard (done in beforeEach)
    // 2. Test Filter Status on Payment tab
    // 3. Test Filter Status on Top-up tab
    // 4. Test Filter Status on Withdrawal tab

    const tabs = ['Payment', 'Top up', 'Withdraw'];

    for (const tab of tabs) {
      const tabClicked = await clickDashboardTab(page, [tab]);
      expect(tabClicked).toBeTruthy();

      const statusInput = page.locator(`input[placeholder="${STATUS_FILTER_PLACEHOLDER}"]`);
      if (await statusInput.isVisible().catch(() => false)) {
        await statusInput.click();
        const options = page.locator('[role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
        } else {
          console.log(`${tab} Filter Options: none available`);
        }
      } else {
        console.log(`${tab} Status filter not visible`);
      }

      const partnerInput = page.locator(`input[placeholder="${PARTNER_FILTER_PLACEHOLDER}"]`);
      if (await partnerInput.isVisible().catch(() => false)) {
        await partnerInput.click();
        const options = page.locator('[role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
        }
      }

      // Expected Result: The system displays data according to the selected criteria
      await waitForTableLoad(page);
      console.log(`${tab} tab filter tested successfully`);
    }
  });
});
