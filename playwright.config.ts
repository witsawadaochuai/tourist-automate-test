import { defineConfig, devices } from '@playwright/test';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cross-platform Chrome executable detection
 */
function getChromePath(): string | undefined {
  const platform = os.platform();

  const chromePaths: Record<string, string[]> = {
    win32: [
      path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      path.join(os.homedir(), 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
    ],
    linux: [
      '/opt/google/chrome/chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ],
  };

  const paths = chromePaths[platform] || [];
  for (const chromePath of paths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  // Return undefined to let Playwright use its bundled browser
  return undefined;
}

/**
 * Cross-platform Chrome user data directory
 */
function getChromeUserDataDir(): string {
  const platform = os.platform();
  const home = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(process.env.LOCALAPPDATA || home, 'Google', 'Chrome', 'User Data');
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'Google', 'Chrome');
    case 'linux':
    default:
      return path.join(home, '.config', 'google-chrome');
  }
}

/**
 * Cross-platform test profile directory
 */
function getTestProfileDir(): string {
  const platform = os.platform();
  const home = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(process.env.LOCALAPPDATA || home, 'playwright-chrome-profile');
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'playwright-chrome-profile');
    case 'linux':
    default:
      return path.join(home, '.config', 'playwright-chrome-profile');
  }
}

const chromePath = getChromePath();
const chromeUserDataDir = getChromeUserDataDir();
const testProfileDir = getTestProfileDir();
const storageStatePath = path.resolve(__dirname, 'test/.auth/storageState.json');

// Platform-specific launch args
const getLaunchArgs = (): string[] => {
  const args: string[] = [];

  // Linux-specific sandbox flags
  if (os.platform() === 'linux') {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  return args;
};

const projects = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
      launchOptions: {
        ...(chromePath && { executablePath: chromePath }),
        args: getLaunchArgs(),
      },
    },
  },
];

if (process.env.RUN_CHROME_PROFILES === '1') {
  projects.push(
    // Headed mode with YOUR Chrome profile (REQUIRES closing Chrome first)
    // Use: RUN_CHROME_PROFILES=1 npx playwright test --project=chrome-headed
    {
      name: 'chrome-headed',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: false,
        userDataDir: chromeUserDataDir,
        launchOptions: {
          ...(chromePath && { executablePath: chromePath }),
          args: getLaunchArgs(),
          slowMo: 500, // Slow down actions for visibility
        },
      },
    },
    // Headed mode with TEST profile (can run while Chrome is open)
    // First run: npm run setup:profile (copies your Chrome profile)
    // Then use: RUN_CHROME_PROFILES=1 npx playwright test --project=chrome-test
    {
      name: 'chrome-test',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: false,
        userDataDir: testProfileDir,
        launchOptions: {
          ...(chromePath && { executablePath: chromePath }),
          args: getLaunchArgs(),
          slowMo: 500,
        },
      },
    },
  );
}

export default defineConfig({
  globalSetup: './global-setup',
  testDir: './test',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'test-reports/html' }],
    ['json', { outputFile: 'test-reports/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'https://backoffice-wallet-dev.inception.asia',
    storageState: storageStatePath,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  projects,
  outputDir: 'test-results/',
  timeout: 120000,
});
