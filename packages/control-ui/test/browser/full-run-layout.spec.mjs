import { test, expect } from '@playwright/test';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from './server-fixture.mjs';

test('full view keeps the selected Run and shows the summary and details together at wide and narrow widths', async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${service.origin}/card.html#${service.secret}`);
    await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    await page.getByRole('button', { name: 'Vorhaben öffnen', exact: true }).click();
    await expect(page.locator('.run-documents').first()).toBeVisible();
    await expect(page.locator('.work-step--condensed')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Ansicht' })).toHaveCount(0);
    await expect(page.locator('.breadcrumbs .run-figure')).toBeVisible();
    const runTitle = await page.locator('.page-title h1').textContent();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(page.locator('.page-title h1')).toHaveText(runTitle);
      await expect(page.locator('.run-documents').first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Nachweise', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const columns = await page.locator('.run-detail-grid').evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(width === 1440 ? 2 : 1);
    }
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
