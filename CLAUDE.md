# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Playwright-based test automation framework** for the Tourist E-Wallet Back Office application at `https://backoffice-wallet-dev.inception.asia`. The framework automates end-to-end testing for a financial back office system developed by Enabridge on the Inception Asia platform.

## Development Commands

```bash
# Run tests in headless Chrome (default)
npm test

# Run tests in visible Chrome for debugging (requires closing Chrome first)
npm run test:headed

# Run tests with a copied Chrome profile (can run while Chrome is open)
npm run setup:profile  # First: copies your Chrome profile
npm run test:gmail     # Then: run tests with the profile

# View HTML test reports
npm run report
```

## Running Individual Tests

```bash
# Run a specific test file
npx playwright test test/BackOffice-test/module/auth/login.spec.ts

# Run tests matching a pattern
npx playwright test --grep "TC_Tourist_E-Wallet_BO_0001"

# Run with specific project
npx playwright test test/BackOffice-test/module/auth/login.spec.ts --project=chrome-headed
```

## Architecture

### Test Organization

The framework uses a **page-object model** pattern with tests organized by business domain:

- `test/BackOffice-test/module/auth/` - Authentication (login, password management)
- `test/BackOffice-test/module/dashboard/` - Dashboard overview and navigation
- `test/BackOffice-test/module/wallet-management/` - Wallet operations, freeze/unfreeze
- `test/BackOffice-test/module/transaction-history/` - Transaction history and records
- `test/BackOffice-test/module/kyc-management/` - Customer verification and compliance
- `test/BackOffice-test/module/client-management/` - Client lifecycle and custom limits
- `test/BackOffice-test/module/partners/` - Partner setup and fee management
- `test/BackOffice-test/module/internal-users/` - Admin and internal staff management
- `test/BackOffice-test/module/reports/` - Operational reports
- `test/BackOffice-test/fixtures/test-fixtures.ts` - Shared test data, selectors, and helper functions

### Centralized Configuration

**`playwright.config.ts`** defines three browser projects:

- **chromium**: Headless mode (CI/CD friendly)
- **chrome-headed**: Visible Chrome with your original profile (requires closing Chrome)
- **chrome-test**: Visible Chrome with a copied test profile (allows parallel Chrome usage)

The config uses a local Chrome executable at `/opt/google/chrome/chrome` with sandbox disabled for Linux compatibility.

### Test Fixtures (`test/BackOffice-test/fixtures/test-fixtures.ts`)

This file is the **single source of truth** for:

1. **Test Data** (`TEST_DATA`) - Valid/invalid credentials, URLs, user emails
2. **Selectors** (`SELECTORS`) - All CSS selectors organized by page/feature
3. **Custom Fixtures** - `authenticatedPage` provides a pre-authenticated page object
4. **Helper Functions** - `login()`, `logout()`, `navigateToMenu()`, `waitForTableLoad()`, etc.

When writing new tests, always:
- Import from `../fixtures/test-fixtures`
- Use `SELECTORS` for element location
- Use `TEST_DATA` for credentials
- Use helper functions instead of duplicating logic

### Test Naming Convention

Tests follow the pattern: `TC_Tourist_E-Wallet_BO_XXXX - Description`

The test IDs correspond to entries in `All-Test-Case.md` and `Test_Case_Tourist_E-Wallet_V.0.0.2 - BO.csv`.

### Known Defects and Test Status

Several tests document known defects using `console.log('KNOWN DEFECT: ...')`. These include:
- Password change functionality missing "Old password" field
- Forgot password not validating email format properly
- Password mismatch errors redirecting instead of showing inline errors

When modifying tests, preserve these defect documentation comments.

## Browser Profile Management

The framework supports testing with your actual Chrome session (useful for Gmail 2FA):

1. `npm run setup:profile` - Copies `~/.config/google-chrome` to `~/.config/playwright-chrome-profile`
2. `npm run test:gmail` - Runs tests with the copied profile (Chrome can stay open)

The `chrome-headed` project uses your live profile and requires closing Chrome first.

## Test Data and Credentials

- Valid user: `ekkachai.n+1@enabridge.ai` / `P@ssw0rd1234`
- Forgot password email: `nuttapong.w+1@enabridge.ai`
- Test base URL: `https://backoffice-wallet-dev.inception.asia`

## Debugging Tips

- Use `--project=chrome-headed` for visible browser execution with `slowMo: 500`
- Screenshots are automatically captured on failure in `screenshots/`
- HTML reports are generated in `test-reports/html/`
- Video recordings are retained on failure in `test-results/`
- Use `page.waitForTimeout()` for explicit waits when handling async UI updates
- The Dashboard has continuous network activity - use specific selectors instead of `waitForLoadState('networkidle')`
