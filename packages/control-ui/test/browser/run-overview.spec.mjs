import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { sealRunState } from '../../../core/lib/control-state/run-seal.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

for (const compact of [false, true]) for (const width of [390, 1440]) {
  test(`Run inventory, history, legacy and retry ${compact ? 'compact' : 'desktop'} ${width}`, async ({ page }) => {
    const f = fixture(), legacy = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
    const objective = 'Runs direkt finden und Quellen nachvollziehbar vergleichen';
    const state = fs.readFileSync(f.runPath, 'utf8').replace(/(## Objective\s*\n)[\s\S]*?(?=\n## |$)/u, `$1${objective}\n`);
    fs.writeFileSync(f.runPath, sealRunState(f.root, state));
    fs.rmSync(legacy, { force: true });
    fs.mkdirSync(join(f.root, '.agdf/control/runs/BAD NAME'));
    const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
    const requests = [];
    page.on('request', r => { const url = new URL(r.url()); if (url.pathname.startsWith('/api/')) requests.push(url.pathname + url.search); });
    try {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(compact ? `${service.origin}/card.html#${service.secret}` : service.startupURL);
      await expect(page.getByRole('region', { name: 'Run-Liste' })).toBeVisible();
      const title = page.getByRole('button', { name: objective, exact: true });
      await expect(title).toBeVisible();
      await expect(page.getByText(/Bestand eingeschränkt lesbar/)).toBeVisible();
      const invalid = page.locator('.undertaking').filter({ hasText: 'BAD NAME' }).getByRole('button');
      await expect(invalid).toBeDisabled();
      await expect(page.getByText(/Gespeicherte Orientierung/)).toBeVisible();
      const search = page.getByRole('searchbox');
      await search.focus(); await page.keyboard.type('absent');
      await expect(page.getByText(/Keine passenden Runs/)).toBeVisible();
      await search.fill('fixture-a'); await expect(title).toBeVisible();
      expect(requests.some(path => path.startsWith('/api/backlog-titles'))).toBe(false);
      await page.getByRole('button', { name: /^Historie / }).click();
      await expect(page.locator('.undertaking-list')).toContainText('completed');
      await page.getByRole('button', { name: /^Aktiv / }).click();
      await title.focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('button', { name: 'Alle Vorhaben', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).click();
      await expect(title).toBeVisible();
      await page.screenshot({ path: evidencePath(`runs-${compact ? 'compact' : 'desktop'}-${width}.png`), fullPage: true });
      let fail = true;
      await page.route('**/api/snapshot', async route => fail ? route.abort() : route.continue());
      await page.getByRole('button', { name: 'Neu laden', exact: true }).click();
      const retry = page.getByRole('button', { name: compact ? /Wiederholen/ : 'Wiederholen', exact: !compact });
      await expect(retry).toBeVisible();
      await expect(title).toBeVisible(); await expect(title).toBeDisabled();
      fail = false; await retry.click();
      await expect(title).toBeEnabled();
      await page.getByRole('button', { name: 'Legacy-Backlog', exact: true }).click();
      await expect(page.getByText(/backlog_missing|Backlog.*nicht|Backlog.*fehlt/i)).toBeVisible();
      await page.screenshot({ path: evidencePath(`legacy-missing-${compact ? 'compact' : 'desktop'}-${width}.png`), fullPage: true });
      await page.getByRole('button', { name: compact ? /^Runs$/ : /Run-Übersicht$/ }).click();
      await expect(title).toBeVisible();
      expect(treeBytes(f.root)).toEqual(before);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    } finally { await service.close(); f.close(); }
  });
}

for (const compact of [false, true]) test(`unsupported envelope is visible ${compact ? 'compact' : 'desktop'}`, async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/snapshot', async route => {
      const response = await route.fetch(), body = await response.json();
      await route.fulfill({ response, json: { ...body, schema_version: '1' } });
    });
    await page.goto(compact ? `${service.origin}/card.html#${service.secret}` : service.startupURL);
    await expect(page.getByText('Die Antwort des Dienstes passt nicht zum erwarteten Datenstand. Neu laden oder den Dienst erneut starten.')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Run-Liste' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Wiederholen/ }).first()).toBeEnabled();
    await page.screenshot({ path: evidencePath(`unsupported-envelope-${compact ? 'compact' : 'desktop'}.png`), fullPage: true });
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});
