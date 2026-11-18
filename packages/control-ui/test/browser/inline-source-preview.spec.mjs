import { test, expect } from '@playwright/test';
import { approvalFixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from './server-fixture.mjs';

test('the current registered source is shown with its check without changing the selected snapshot', async ({ page }) => {
  const f = await approvalFixture(), before = treeBytes(f.root), service = await startControlServer({ dir:f.root });
  const previews = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/preview/')) previews.push(request.url()); });
  try {
    await page.setViewportSize({ width:1440, height:1000 });
    await page.goto(service.startupURL);
    await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    const focus = page.getByRole('region', { name:'Aktuelle Fassung' });
    await expect(focus).toBeVisible();
    await expect(focus.locator('.source-preview')).toContainText('Fixture');
    await expect(focus.getByRole('region', { name:'Entwurfsprüfung' })).toBeVisible();
    await expect(focus.getByRole('button', { name:/Anforderungen/ })).toBeVisible();
    expect(previews).toHaveLength(1);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height:1000 });
      await expect(focus.locator('.source-preview')).toContainText('Fixture');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});
