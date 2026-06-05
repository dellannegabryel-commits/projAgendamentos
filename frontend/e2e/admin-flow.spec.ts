import { test, expect, type Page } from '@playwright/test';

const ADMIN_NAME = 'Admin E2E';
const ADMIN_EMAIL = `e2e-${Date.now()}@agendafacil.com`;
const ADMIN_PASSWORD = 'e2e-test-password-123';

async function setupFirstAdmin(page: Page) {
  await page.goto('/admin/login');

  await page.waitForURL(/\/admin\/(login|setup)/, { timeout: 10_000 });
  if (page.url().includes('/admin/login') && !page.url().includes('setup')) {
    const status = await page.request.get('/api/auth/status');
    const body = await status.json();
    if (body.hasAdmin) {
      test.skip(true, 'Já existe admin cadastrado neste ambiente');
    }
  }

  await page.goto('/admin/setup');
  await page.getByLabel(/nome/i).fill(ADMIN_NAME);
  await page.getByLabel(/e-mail/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/^senha$/i).fill(ADMIN_PASSWORD);
  await page.getByLabel(/confirmar senha/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /criar conta/i }).click();

  await page.waitForURL((u) => new URL(u).pathname === '/admin', { timeout: 15_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10_000 });
}

test.describe('Fluxo admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('setup inicial cria admin e redireciona para dashboard', async ({ page }) => {
    await setupFirstAdmin(page);
  });

  test('login funciona após setup', async ({ page }) => {
    await setupFirstAdmin(page);

    await page.goto('/admin/login');
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie = 'agendafacil_token=; path=/; max-age=0';
    });
    await page.goto('/admin/login');

    await page.getByLabel(/e-mail/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/senha/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /entrar/i }).click();

    await page.waitForURL((u) => new URL(u).pathname === '/admin', { timeout: 10_000 });
    await page.waitForLoadState('networkidle', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10_000 });
  });

  test('login rejeita credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/e-mail/i).fill('inexistente@agendafacil.com');
    await page.getByLabel(/senha/i).fill('senha-errada');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5_000 });
    await expect(page.getByText(/inválid/i).first()).toBeVisible({ timeout: 5_000 });
    const token = await page.evaluate(() => localStorage.getItem('@agendafacil:token'));
    expect(token).toBeNull();
  });

  test('admin acessa páginas de CRUD após login', async ({ page }) => {
    await setupFirstAdmin(page);

    const links = ['/admin', '/admin/categorias', '/admin/profissionais', '/admin/horarios'];
    for (const path of links) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
    }
  });
});
