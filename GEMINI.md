# Tourist E-Wallet Back Office Automation

## Project Overview
This project is a **Playwright-based test automation framework** for the Tourist E-Wallet Back Office application (`https://backoffice-wallet-dev.inception.asia`). It covers end-to-end testing for authentication, dashboard, wallet management, client management, and other back-office operations.

## Key Resources

### Configuration
- **`playwright.config.ts`**: Main Playwright configuration. Defines projects (`chromium`, `chrome-headed`, `chrome-test`), base URL, and reporting settings.
- **`package.json`**: Project dependencies and scripts.

### Test Structure (`test/BackOffice-test/`)
- **`test/BackOffice-test/fixtures/test-fixtures.ts`**: **CRITICAL**. The single source of truth for:
    - **`SELECTORS`**: All CSS/XPath selectors organized by page.
    - **`TEST_DATA`**: Valid/invalid credentials and other static data.
    - **Helper Functions**: Reusable logic like `login`, `logout`, `navigateToMenu`.
- **`test/BackOffice-test/module/auth/`**: Login, password management tests.
- **`test/BackOffice-test/module/dashboard/`**: Dashboard viewing and navigation.
- **`test/BackOffice-test/module/wallet-management/`**: Wallet operations (freeze/unfreeze).
- **`test/BackOffice-test/module/client-management/`**: Client lifecycle and limits.
- **`test/BackOffice-test/module/kyc-management/`**: KYC review and processing.

### Documentation
- **`CLAUDE.md`**: Detailed developer guide and architecture overview.
- **`All-Test-Case.md`**: Human-readable list of test cases with their last known status (Passed/Failed).

## Setup & Execution

### Prerequisites
- Node.js installed.
- Dependencies installed: `npm install`

### Running Tests

| Command | Description |
| :--- | :--- |
| `npm test` | Run all tests in **headless** mode (Chromium). |
| `npm run test:headed` | Run tests in **headed** Chrome with your *current* profile (Close Chrome first!). |
| `npm run setup:profile` | Copies your Chrome profile to a test directory (Run once). |
| `npm run test:gmail` | Run tests in **headed** Chrome using the *copied* profile (Safe to run while Chrome is open). |
| `npm run report` | Open the HTML test report. |

### Running Specific Tests
```bash
# Run a specific file
npx playwright test test/BackOffice-test/module/auth/login.spec.ts

# Run a specific test case by name/grep
npx playwright test --grep "TC_Tourist_E-Wallet_BO_0001"

# Run with debug mode
npx playwright test test/BackOffice-test/module/auth/login.spec.ts --debug
```

## Architecture & Conventions

### Page Object Model (POM) via Fixtures
We do **not** use traditional class-based Page Objects. Instead, we use a **Fixture-based approach** defined in `test/BackOffice-test/fixtures/test-fixtures.ts`.

**When writing/editing tests:**
1.  **NEVER** hardcode selectors in spec files. Add them to `SELECTORS` in `test-fixtures.ts` first.
2.  **NEVER** hardcode credentials. Use `TEST_DATA` from `test-fixtures.ts`.
3.  **USE** the custom `authenticatedPage` fixture for tests requiring login.
4.  **USE** helper functions (`waitForTableLoad`, `navigateToMenu`) from fixtures to ensure stability.

**Example Pattern:**
```typescript
import { test, expect } from '../fixtures/test-fixtures'; // Import from local fixtures

test('TC_... - Example Test', async ({ authenticatedPage, selectors, testData }) => {
  // authenticatedPage is already logged in
  await authenticatedPage.click(selectors.dashboard.menuItem);
  await expect(authenticatedPage.locator(selectors.common.header)).toBeVisible();
});
```

## Test Data & Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin/User** | `ekkachai.n+1@enabridge.ai` | `P@ssw0rd1234` |
| **Forgot PW** | `nuttapong.w+1@enabridge.ai` | *(Reset via email)* |

**Base URL**: `https://backoffice-wallet-dev.inception.asia`

## Known Issues
See `All-Test-Case.md` or `CLAUDE.md` for specific defects. Common issues include:
- Password change flows missing "Old Password" field.
- Validation errors redirecting instead of showing inline messages.
- Specific KYC management actions failing.

## Directory Map
```text
/
├── test/
│   └── BackOffice-test/
│       ├── fixtures/       # Shared code, selectors, data
│       └── module/         # Feature specs grouped by module
├── test-reports/       # HTML reports
├── test-results/       # Artifacts (videos, traces)
├── playwright.config.ts
└── package.json
```
