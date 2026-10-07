import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from './server-fixture.mjs';
test('scoped HTTP reading preserves stored backlog, source navigation and Pages themes at four widths', async ({ page }) => {
  const f = fixture();
  fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), '# Master Backlog\n\n## Active Backlog\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | `fixture-a` | [framework-maintenance] Fixture document | In progress | [UR](artefacts/fixture-a/UR.md) | stored spec | stored next step |\n\n## Planned / Parking Lot\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const calls = []; page.on('request', r => { if (r.url().includes('/api/')) calls.push(new URL(r.url()).pathname + new URL(r.url()).search); });
  let committed, release;
  const titlesCommitted = new Promise(resolve => { committed = resolve; });
  const responseReleased = new Promise(resolve => { release = resolve; });
  await page.route('**/api/backlog-titles?*', async route => {
    const response = await route.fetch(); // Real server has replaced its capture.
    committed();
    await responseReleased;
    // Navigation deliberately aborts this old title response.
    await route.fulfill({ response }).catch(() => {});
  });
  try {
    await page.goto(service.startupURL); await expect(page.getByText('Gespeicherter Stand laut Backlog: In progress', { exact: true })).toBeVisible();
    expect(calls.filter(p => !p.startsWith('/api/backlog-titles'))).toEqual(['/api/snapshot']);
    expect(calls.filter(p => p.startsWith('/api/backlog-titles')).every(p => new URL('http://local' + p).searchParams.get('rows').split(',').length <= 12)).toBe(true);
    await titlesCommitted;
    await page.getByRole('button', { name: 'Fixture document' }).click();
    await expect(page.locator('.page-title h1')).toHaveText('Fixture document');
    release();
    await page.getByRole('button', { name: 'Stand des Vorhabens öffnen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Dokument schließen' })).toBeVisible();
    await expect(page.locator('.document-original')).not.toHaveAttribute('open');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
      for (const width of [320, 560, 800, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.document-reading')).toHaveCSS('background-color', theme === 'light' ? 'rgb(252, 252, 252)' : 'rgb(15, 23, 42)');
        await expect(page.locator('.document-reading .page-title h1')).toHaveCSS('font-family', 'Inter, system-ui, sans-serif');
        await page.screenshot({ path: `/private/tmp/agdf-scoped-${theme}-${width}.png`, fullPage: true });
      }
    }
    await page.getByRole('button', { name: 'Dokument schließen' }).click();
    await expect(page.getByRole('button', { name: 'Stand des Vorhabens öffnen', exact: true })).toBeFocused();
    const reads = calls.filter(p => !p.startsWith('/api/freshness') && !p.startsWith('/api/backlog-titles'));
    expect(reads.map(p => p.split('?')[0])).toEqual(['/api/snapshot', '/api/snapshot', reads[2].split('?')[0], '/api/runs/fixture-a']);
    expect(reads[1]).toBe('/api/snapshot?run_id=fixture-a');
    expect(reads[2]).toMatch(/^\/api\/documents\//);
    expect(new URL('http://local' + reads[2]).searchParams.get('snapshot')).toBeTruthy();
    expect(reads[2].split('snapshot=')[1]).not.toBe(reads[3].split('snapshot=')[1]);
    fs.writeFileSync('/private/tmp/cockpit-scoped-browser-calls-13.json', JSON.stringify(calls, null, 2));
  } finally { release(); await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
