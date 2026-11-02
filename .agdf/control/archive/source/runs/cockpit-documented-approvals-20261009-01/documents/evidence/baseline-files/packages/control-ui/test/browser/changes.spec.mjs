import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';
const content = status => `# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | My undertaking | ${status} | | UR | Check evidence |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n`;
for (const theme of ['light', 'dark']) test(`actual ${theme} overview waits for deliberate reload after a file event`, async ({ page }) => {
  const f = fixture(), path = join(f.root, '.agdf/control/MASTER_BACKLOG.md'); fs.writeFileSync(path, content('Awaiting QA'));
  const service = await startControlServer({ dir: f.root });
  try {
    await page.goto(service.startupURL); await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting QA')).toBeVisible();
    await page.getByRole('searchbox').fill('My undertaking');
    await page.getByText('Gespeicherte Angaben und Quellen', { exact: true }).click();
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    await page.route('**/api/snapshot*', async route => { await hold; await route.continue(); });
    fs.writeFileSync(path + '.replacement', content('Awaiting UAT')); fs.renameSync(path + '.replacement', path);
    const deliberate=page.getByRole('button',{name:'Neuer Stand verfügbar · Aktualisieren'});
    await expect(deliberate).toBeEnabled({timeout:3000});
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting QA')).toBeVisible();
    await expect(page.getByRole('button',{name:'My undertaking'})).toBeDisabled();
    await deliberate.click();
    const refresh = page.getByRole('button', { name: 'Stand wird aktualisiert …' });
    await expect(refresh).toBeDisabled({ timeout: 3000 });
    await expect(refresh.locator('.refresh-update-dot')).toBeVisible();
    await expect(refresh).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(refresh.locator('.cockpit-icon')).toHaveCSS('animation-name', 'cockpit-refresh-spin');
    await expect(refresh.locator('.refresh-update-dot')).toHaveCSS('background-color', theme === 'light' ? 'rgb(37, 99, 235)' : 'rgb(96, 165, 250)');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(refresh.locator('.cockpit-icon')).toHaveCSS('animation-name', 'none');
    await page.setViewportSize({ width: 320, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: evidencePath(`cockpit-refresh-${theme}-320.png`) });
    release();
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting UAT')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.getByRole('searchbox')).toHaveValue('My undertaking');
    await expect(page.locator('.row-source')).not.toHaveAttribute('open', '');
    await expect(page.getByText('Veraltet', { exact: true })).toHaveCount(0);
  } finally { await service.close(); f.close(); }
});

for (const theme of ['light', 'dark']) test(`${theme} changed original uses the header dot until deliberate reload`, async ({ page }) => {
  const f = fixture(), path = join(f.root, f.documentPath);
  fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), content('Awaiting QA'));
  fs.writeFileSync(path, '# Before deliberate reload');
  const service = await startControlServer({ dir: f.root });
  try {
    await page.goto(service.startupURL);
    await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await page.getByRole('button', { name: 'My undertaking' }).click();
    await page.getByRole('button', { name: 'Details', exact: true }).click();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click();
    await page.getByText('Originaldokument lesen', { exact: true }).click();
    await expect(page.locator('article.document')).toContainText('Before deliberate reload');
    fs.writeFileSync(path + '.replacement', '# After deliberate reload'); fs.renameSync(path + '.replacement', path);
    const refresh = page.getByRole('button', { name: 'Quelle geändert · Neu laden' });
    await expect(refresh).toBeEnabled({ timeout: 3000 });
    await expect(page.locator('main footer')).toContainText('Neuer Stand verfügbar · Vorheriger Datenstand bleibt sichtbar');
    await expect(page.locator('article.document')).toContainText('Before deliberate reload');
    await expect(page.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toHaveCount(0);
    for (const width of [320, 800]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(refresh.locator('.refresh-update-dot')).toBeVisible();
      await expect(refresh).toHaveAttribute('title', 'Quelle geändert · Neu laden');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: evidencePath(`cockpit-source-change-${theme}-${width}.png`), fullPage: true });
    }
    await refresh.click();
    await page.getByText('Originaldokument lesen', { exact: true }).click();
    await expect(page.locator('article.document')).toContainText('After deliberate reload');
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.locator('main footer')).not.toContainText('Vorheriger Datenstand');
    await page.route('**/api/snapshot*', route => route.abort());
    await page.getByRole('button', { name: 'Neu laden', exact: true }).click();
    await expect(page.locator('.reading-feedback .notice strong')).toHaveText('Aktualisierung fehlgeschlagen');
    await expect(page.locator('.reading-feedback .notice')).toContainText('Vorheriger Datenstand bleibt sichtbar.');
    await expect(page.locator('main footer')).toContainText('Aktualisierung fehlgeschlagen · Vorheriger Datenstand bleibt sichtbar');
    await expect(page.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' })).toBeEnabled();
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.locator('article.document')).toContainText('After deliberate reload');
    await expect(page.getByText('Veraltet', { exact: true })).toHaveCount(0);
    await page.unroute('**/api/snapshot*');
    await page.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' }).click();
    await expect(page.getByRole('button', { name: 'Neu laden', exact: true })).toBeEnabled();
    await expect(page.locator('main footer')).not.toContainText('Aktualisierung fehlgeschlagen');
  } finally { await service.close(); f.close(); }
});
