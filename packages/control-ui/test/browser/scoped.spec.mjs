import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';
test('scoped HTTP reading preserves Run source navigation and Pages themes at four widths', async ({ page }) => {
  const f = fixture();
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const calls = []; page.on('request', r => { if (r.url().includes('/api/')) calls.push(new URL(r.url()).pathname + new URL(r.url()).search); });
  try {
    await page.goto(service.startupURL);
    await page.getByRole('button', { name: 'Fixture document' }).click();
    await expect(page.locator('.page-title').getByRole('heading', { name: 'Fixture document' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Dokumente', exact: true })).toBeVisible();
    const source = page.getByRole('button', { name: /: Anforderungen$/ });
    await source.click();
    await expect(page.getByRole('button', { name: /Zurück zur (Übersicht|Statuskarte)/ })).toBeVisible();
    await expect(page.getByRole('article', { name: 'Originaldokument' })).toContainText('Original source: ä, β, 日本語.');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
      for (const width of [320, 560, 800, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.document-reading')).toHaveCSS('background-color', theme === 'light' ? 'rgb(252, 252, 252)' : 'rgb(15, 23, 42)');
        await expect(page.getByRole('article', { name: 'Originaldokument' }).getByRole('heading', { level: 1 })).toHaveCSS('font-family', 'Inter, system-ui, sans-serif');
        await page.screenshot({ path: evidencePath(`agdf-scoped-${theme}-${width}.png`), fullPage: true });
      }
    }
    await page.getByRole('button', { name: /Zurück zur (Übersicht|Statuskarte)/ }).click();
    await expect(source).toBeFocused();
    const reads = calls.filter(path => /^\/api\/(?:snapshot|runs\/|documents\/)/.test(path)).map(path => new URL(path, service.origin));
    expect(reads.map(url => url.pathname)).toEqual(['/api/snapshot', '/api/runs/fixture-a', '/api/snapshot', expect.stringMatching(/^\/api\/documents\//), '/api/runs/fixture-a']);
    expect(reads[2].searchParams.get('run_id')).toBe('fixture-a');
    expect(reads[3].searchParams.get('snapshot')).toBeTruthy();
    expect(reads[4].searchParams.get('snapshot')).toBeTruthy();
    expect(reads[3].searchParams.get('snapshot')).not.toBe(reads[4].searchParams.get('snapshot'));
    fs.writeFileSync(evidencePath('cockpit-scoped-browser-calls-13.json'), JSON.stringify(calls, null, 2));
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
