# Repository Guidelines

## Project Structure and Module Organization
- `test/BackOffice-test/module/` contains Playwright specs grouped by feature (for example `test/BackOffice-test/module/client-management/client-management.spec.ts`).
- `test/BackOffice-test/fixtures/test-fixtures.ts` holds shared selectors, helpers, login, and the screenshot-on-pass hook.
- `playwright.config.ts` defines Playwright projects, base URL, and reporting.
- `test-results/` and `test-reports/` store run artifacts and the HTML report output.
- `test/BackOffice-test/BO/` stores screenshots captured on passing tests at `test/BackOffice-test/BO/<test-case-name>/pass-<project>.png`.
- `screenshots/` holds ad hoc captures.
- `All-Test-Case.md` and `Test_Case_Tourist_E-Wallet_V.0.0.2 - BO.csv` document test cases.

## Build, Test, and Development Commands
- `npm test` runs all tests on the default chromium project.
- `npm run test:headed` runs headed tests (chromium by default in config).
- `npm run test:gmail` runs the `chrome-test` project after setting up a profile.
- `npm run setup:profile` copies your Chrome profile for the `chrome-test` project.
- `npm run report` opens the HTML report in `test-reports/html`.
- To run only a spec: `npx playwright test test/BackOffice-test/module/client-management/client-management.spec.ts --project=chromium --headed`.
- To enable profile-based projects: `RUN_CHROME_PROFILES=1 npx playwright test --project=chrome-headed`.

## Coding Style and Naming Conventions
- TypeScript with 2-space indentation and semicolons; follow local file style.
- Prefer `getByRole` or scoped `locator` queries; keep selectors near the relevant UI block.
- Test titles follow `TC_Tourist_E-Wallet_BO_#### - <scenario>`.
- Spec files follow `test/<suite>/module/<area>/<area>.spec.ts`.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`).
- Prefer explicit waits on UI state over long `waitForTimeout`.
- Keep tests deterministic; clean up test data when creating or deleting limits.
- Passing tests auto-save screenshots under `test/BackOffice-test/BO/<test-case-name>/`.

## Commit and Pull Request Guidelines
- No git history is available in this workspace, so no local commit convention is defined.
- Use your team standard (short imperative subject; include ticket ID if required).
- PRs should include a summary, test evidence (report or screenshot), and any data setup notes.

## Security and Configuration Tips
- Test credentials and base URL live in `test/BackOffice-test/fixtures/test-fixtures.ts`.
- Avoid committing real secrets; prefer environment overrides if adding new credentials.
