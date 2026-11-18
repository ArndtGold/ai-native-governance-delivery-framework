import { test, expect } from '@playwright/test';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from './server-fixture.mjs';

for (const compact of [false, true]) test(`area menu keeps counts and clears filters (${compact ? 'compact' : 'desktop'})`, async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.setViewportSize({ width: compact ? 390 : 1280, height: 850 });
    await page.goto(compact ? `${service.origin}/card.html#${service.secret}` : service.startupURL);
    const area = page.getByRole('combobox', { name: 'Bestandsbereich' });
    await expect(area).toHaveText('Aktiv⌄');
    await page.getByRole('searchbox').fill('fixture-a');
    await area.focus(); await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('listbox', { name: 'Bestandsbereich' });
    await expect(menu.getByRole('option')).toHaveCount(4);
    await expect(menu.getByRole('option', { name: 'Aktiv 1 Vorhaben' })).toHaveAttribute('aria-selected', 'true');
    await menu.getByRole('option', { name: /Geplant/ }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(area).toContainText('Geplant');
    await area.click(); await expect(menu.getByRole('option', { name: /Archiv/ })).toBeVisible();
    await page.keyboard.press('Escape'); await expect(menu).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});
