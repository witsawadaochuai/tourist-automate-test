import { chromium, type FullConfig } from '@playwright/test';
import * as path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageStatePath = path.resolve(__dirname, 'test/.auth/storageState.json');

async function globalSetup(config: FullConfig) {
  process.env.PW_SKIP_TEST_HOOKS = '1';
  const { login, TEST_DATA } = await import('./test/BackOffice-test/fixtures/test-fixtures');
  const project = config.projects.find((item) => item.name === 'chromium') ?? config.projects[0];
  const baseURL = (project?.use as { baseURL?: string })?.baseURL ?? TEST_DATA.baseURL;

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await login(page, TEST_DATA.validUser.email, TEST_DATA.validUser.password);

  await fs.mkdir(path.dirname(storageStatePath), { recursive: true });
  await context.storageState({ path: storageStatePath });

  await browser.close();
}

export default globalSetup;
