import { test, expect } from '@playwright/test';

test.describe('Setup inicial e login', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      try { localStorage.clear(); } catch {}
    }).catch(() => {});
  });

  test('landing page carrega com CTA de agendamento', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Agenda/);
    const cta = page.getByRole('link', { name: /agendar/i }).first();
    await expect(cta).toBeVisible();
  });

  test('rota /agendamento renderiza o wizard', async ({ page }) => {
    await page.goto('/agendamento');
    await expect(page.getByRole('heading', { name: /agendar|horário|profissional/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('login verifica status e exibe link esqueci senha', async ({ page }) => {
    await page.goto('/admin/login');

    const forgotLink = page.getByRole('link', { name: /esqueci minha senha/i });
    await expect(forgotLink).toBeVisible({ timeout: 10_000 });
  });

  test('esqueci minha senha exibe formulário de email', async ({ page }) => {
    await page.goto('/admin/forgot-password');
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    const submit = page.getByRole('button', { name: /enviar/i });
    await expect(submit).toBeVisible();
  });

  test('reset-password sem token mostra estado de link inválido', async ({ page }) => {
    await page.goto('/admin/reset-password');
    await expect(page.getByText(/link inválido|token/i).first()).toBeVisible({ timeout: 5_000 });
  });
});
