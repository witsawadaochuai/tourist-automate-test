import { test as base, expect, Page, TestInfo } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';

// Test data configuration
export const TEST_DATA = {
  validUser: {
    email: 'ekkachai.n+1@enabridge.ai',
    password: 'P@ssw0rd1234',
    newPassword: 'NewP@ssw0rd123'
  },
  invalidUser: {
    email: 'ekkachai.n+1@enabridge.ai',
    password: 'WrongPass123'
  },
  invalidEmailFormat: {
    email: 'ekkachai.n+1enabridge.ai',
    password: 'P@ssw0rd1234'
  },
  unregisteredEmail: 'ekkachai@gmoil.ai',
  // Use this email for forgot password tests (your email)
  forgotPasswordEmail: 'nuttapong.w+1@enabridge.ai',
  baseURL: 'https://backoffice-wallet-dev.inception.asia'
};

// Page selectors
export const SELECTORS = {
  login: {
    emailInput: 'input[type="email"], input[name="email"], input[placeholder*="email" i]',
    passwordInput: 'input[type="password"], input[name="password"]',
    // Fixed: Button text is "Log in" (with space)
    loginButton: 'button:has-text("Log in")',
    forgotPasswordLink: 'a:has-text("Forgot password")',
    errorMessage: '.error, .alert-error, [class*="error"], [role="alert"]',
  },
  navigation: {
    dashboard: '[href*="dashboard"], a:has-text("Dashboard"), [data-menu="dashboard"]',
    walletManagement: '[href*="wallet"], a:has-text("Wallet"), [data-menu="wallet"]',
    transactions: '[href*="transaction"], a:has-text("Transaction"), [data-menu="transaction"]',
    kycManagement: '[href*="kyc"], a:has-text("KYC"), [data-menu="kyc"]',
    clientManagement: '[href*="client"], a:has-text("Client"), [data-menu="client"]',
    partner: '[href*="partner"], a:has-text("Partner"), [data-menu="partner"]',
    globalLimit: '[href*="global-limit"], a:has-text("Global Limit"), [data-menu="global-limit"]',
    internalUsers: '[href*="internal"], a:has-text("Internal"), [data-menu="internal"]',
    reports: '[href*="report"], a:has-text("Report"), [data-menu="report"]',
    signOut: 'button:has-text("Sign out"), button:has-text("Logout"), a:has-text("Sign out")',
    changePassword: 'button:has-text("Change password"), a:has-text("Change password")',
  },
  dashboard: {
    paymentTab: 'button:has-text("Payment"), [role="tab"]:has-text("Payment")',
    topUpTab: 'button:has-text("Top-up"), [role="tab"]:has-text("Top-up")',
    withdrawalTab: 'button:has-text("Withdrawal"), [role="tab"]:has-text("Withdrawal")',
    viewButton: 'button:has-text("View"), a:has-text("View")',
    searchInput: 'input[placeholder*="search" i], input[type="search"]',
    filterStatus: 'select[name="status"], [data-filter="status"]',
  },
  wallet: {
    viewButton: 'button:has-text("View"), a:has-text("View")',
    freezeButton: 'button:has-text("Freeze"), button:has-text("Unfreeze")',
    transactionHistory: 'button:has-text("Transaction History"), a:has-text("Transaction History")',
    auditLog: 'button:has-text("Audit Log"), a:has-text("Audit Log")',
  },
  kyc: {
    viewButton: 'button:has-text("View"), a:has-text("View")',
    approveButton: 'button:has-text("Approve")',
    rejectButton: 'button:has-text("Reject")',
    commentButton: 'button:has-text("Comment")',
    attachFile: 'input[type="file"]',
    activityTimeline: '[class*="timeline"], [class*="activity"]',
    complyAdvantage: 'button:has-text("Comply Advantage"), a:has-text("Comply Advantage")',
    amlo: 'button:has-text("AMLO"), a:has-text("AMLO")',
  },
  clientManagement: {
    createButton: 'button:has-text("Create")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    activateButton: 'button:has-text("Activate")',
    deactivateButton: 'button:has-text("Deactivate")',
    customLimitMenu: '[href*="custom-limit"], a:has-text("Custom Limit")',
    tagSelect: 'select[name="tag"], [data-field="tag"]',
    limitValueInput: 'input[name="limit"], input[placeholder*="limit" i]',
    saveButton: 'button:has-text("Save"), button[type="submit"]',
    confirmButton: 'button:has-text("Confirm"), button:has-text("Yes")',
  },
  partner: {
    createPartnerButton: 'button:has-text("Create Partner")',
    partnerTypeSelect: 'select[name="partnerType"], [data-field="partnerType"]',
    feeTypeSelect: 'select[name="feeType"], [data-field="feeType"]',
    feePayerSelect: 'select[name="feePayer"], [data-field="feePayer"]',
    walletTab: 'button:has-text("Wallet"), [role="tab"]:has-text("Wallet")',
    feeTab: 'button:has-text("Fee"), [role="tab"]:has-text("Fee")',
    topUpButton: 'button:has-text("Top-up")',
    globalFeeMenu: '[href*="global-fee"], a:has-text("Global Fee")',
    customFeeMenu: '[href*="custom-fee"], a:has-text("Custom Fee")',
    partnerUsersTab: 'button:has-text("Partner Users"), [role="tab"]:has-text("Partner Users")',
    generalInfoTab: 'button:has-text("General Info"), [role="tab"]:has-text("General Info")',
  },
  internalUser: {
    createButton: 'button:has-text("Create")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    roleSelect: 'select[name="role"], [data-field="role"]',
    statusBadge: '[class*="status"], [class*="badge"]',
  },
  reports: {
    botReport: '[href*="bot-report"], a:has-text("Bot Report")',
    paymentAccountingReport: '[href*="payment-accounting"], a:has-text("Payment Accounting")',
    settlementReport: '[href*="settlement"], a:has-text("Settlement")',
    downloadButton: 'button:has-text("Download"), button:has-text("Export")',
    generateButton: 'button:has-text("Generate")',
    datePickerStart: 'input[name="startDate"], [data-field="startDate"]',
    datePickerEnd: 'input[name="endDate"], [data-field="endDate"]',
  },
  common: {
    table: 'table, [role="table"]',
    tableRow: 'tbody tr, [role="row"]',
    modal: '[role="dialog"], .modal, [class*="modal"]',
    closeModal: 'button[aria-label="Close"], button:has-text("Close"), .modal-close',
    confirmDialog: '[role="alertdialog"], .confirm-dialog',
    loading: '.loading, [class*="loading"], [class*="spinner"]',
    toast: '[class*="toast"], [class*="notification"], [role="status"]',
  }
};

// Custom test fixture with login state
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill(SELECTORS.login.emailInput, TEST_DATA.validUser.email);
    await page.fill(SELECTORS.login.passwordInput, TEST_DATA.validUser.password);

    // Click login button
    await page.click(SELECTORS.login.loginButton);

    // Wait for navigation to complete
    await page.waitForURL(/.*(?:dashboard|home|main).*/i, { timeout: 30000 }).catch(() => {
      // If specific URL pattern doesn't match, just wait for load
      return page.waitForLoadState('networkidle');
    });

    await use(page);
  },
});

const sanitizePathSegment = (value: string) => value.replace(/[\\/:*?"<>|]/g, '_').trim();

const savePassedScreenshot = async (page: Page, testInfo: TestInfo) => {
  if (testInfo.status !== 'passed' || page.isClosed()) {
    return;
  }

  const testCaseName = sanitizePathSegment(testInfo.title || 'unknown-test');
  const projectName = sanitizePathSegment(testInfo.project.name || 'project');
  const targetDir = path.join(process.cwd(), 'test', 'BackOffice-test', 'BO', testCaseName);
  await fs.mkdir(targetDir, { recursive: true });
  const screenshotPath = path.join(targetDir, `pass-${projectName}.png`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
};

test.afterEach(async ({ page }, testInfo) => {
  await savePassedScreenshot(page, testInfo).catch(() => {});
});

// Helper functions
export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Wait for email input to be visible
  const emailInput = page.locator(SELECTORS.login.emailInput);
  await emailInput.waitFor({ state: 'visible', timeout: 30000 });

  // Fill credentials
  await emailInput.fill(email);
  await page.fill(SELECTORS.login.passwordInput, password);

  // Add delay before clicking login button
  await page.waitForTimeout(1000);

  // Click login button using getByRole for better reliability
  const loginButton = page.getByRole('button', { name: 'Log in' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Wait for Dashboard to appear instead of networkidle (dashboard has continuous activity)
  await page.waitForSelector('text=Dashboard', { timeout: 60000 });
}

export async function logout(page: Page) {
  // First click on the user profile/dropdown trigger to reveal the Sign out option
  const userProfileDropdown = page.locator('[class*="profile"], [class*="user-menu"], [class*="avatar"]').first();
  const dropdownButton = page.locator('button:near(:text("Ella Solis")), button:near(:text("Super Admin"))').first();

  // Try clicking the dropdown trigger first
  if (await dropdownButton.isVisible().catch(() => false)) {
    await dropdownButton.click();
    await page.waitForTimeout(500);
  } else if (await userProfileDropdown.isVisible().catch(() => false)) {
    await userProfileDropdown.click();
    await page.waitForTimeout(500);
  }

  // Now try to click the Sign out button
  const signOutButton = page.getByRole('button', { name: /sign out/i })
    .or(page.getByRole('menuitem', { name: /sign out/i }))
    .or(page.locator('text=Sign out'))
    .or(page.locator('text=Logout'));

  if (await signOutButton.isVisible().catch(() => false)) {
    await signOutButton.click();
  } else {
    // Try direct navigation to logout
    await page.goto('/logout').catch(() => {});
  }

  await page.waitForURL(/.*login.*/i, { timeout: 10000 }).catch(() => {
    return page.waitForLoadState('domcontentloaded');
  });
}

export async function navigateToMenu(page: Page, menuSelector: string) {
  await page.click(menuSelector);
  await page.waitForLoadState('networkidle');
}

export async function waitForTableLoad(page: Page) {
  await page.waitForSelector(SELECTORS.common.table, { timeout: 30000 });
  // Wait for any loading indicators to disappear
  await page.waitForSelector(SELECTORS.common.loading, { state: 'hidden', timeout: 30000 }).catch(() => {});
}

export async function clickViewButton(page: Page, rowIndex: number = 0) {
  const rows = page.locator(SELECTORS.common.tableRow);
  const viewButton = rows.nth(rowIndex).locator(SELECTORS.dashboard.viewButton);
  await viewButton.click();
}

export async function confirmDialog(page: Page) {
  const confirmButton = page.locator(SELECTORS.clientManagement.confirmButton);
  await confirmButton.click();
}

export async function closeModal(page: Page) {
  const closeButton = page.locator(SELECTORS.common.closeModal);
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

export async function waitForToast(page: Page) {
  await page.waitForSelector(SELECTORS.common.toast, { timeout: 10000 });
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  await page.screenshot({ path: `screenshots/${testName}-${Date.now()}.png`, fullPage: true });
}

export { expect };
