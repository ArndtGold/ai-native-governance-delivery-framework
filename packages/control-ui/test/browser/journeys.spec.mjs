import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { startControlServer } from '../../server/service.mjs';
import { fixture } from '../../../core/test/control-cockpit-fixtures.js';

function hashes(root) {
  const data = {};
  const visit = dir => { for (const name of fs.readdirSync(dir)) { const path = join(dir, name), stats = fs.lstatSync(path); data[path.slice(root.length)] = stats.isDirectory() ? 'directory' : createHash('sha256').update(fs.readFileSync(path)).digest('hex'); if (stats.isDirectory()) visit(path); } };
  visit(join(root, '.agdf/control')); return data;
}
async function openSession(page, service) {
  await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', '/#' + secret); }, { secret: service.secret, origin: service.origin });
  await page.goto(service.origin);
  await expect(page.getByRole('heading', { name: 'Runs im Repository' })).toBeVisible({ timeout: 12_000 });
  expect(new URL(page.url()).hash).toBe('');
}
test('SCN-003/007/028/031: real repository, pointer + keyboard, focus, source fidelity and unchanged bytes', async ({ page }) => {
  const root = resolve(import.meta.dirname, '../../../..'), before = hashes(root), service = await startControlServer({ dir: root });
  const remote = [], errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('request', request => { if (!request.url().startsWith(service.origin)) remote.push(request.url()); expect(request.url()).not.toContain(service.secret); });
  try {
    await openSession(page, service); await page.screenshot({ path: '/private/tmp/agdf-cockpit-overview.png', fullPage: true });
    await page.getByRole('searchbox').fill('agdf-control-cockpit-20261005-01'); await page.getByRole('button', { name: 'agdf-control-cockpit-20261005-01', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Run verstehen' })).toBeFocused(); await expect(page.getByRole('heading', { name: 'Aktueller Kontrollstatus' })).toBeVisible();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-detail.png', fullPage: true });
    const document = page.locator('.resources button').filter({ hasText: /\/UR\.md/ }); await document.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Dokument lesen' })).toBeFocused(); await expect(page.locator('article.document')).toContainText('Local read-only AGDF control cockpit');
    const expectedSource = fs.readFileSync(join(root, '.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md'), 'utf8'); expect(expectedSource).toContain('Local read-only AGDF control cockpit');
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-document.png', fullPage: true });
    await page.getByRole('button', { name: '← Zurück', exact: true }).click(); await expect(document).toBeFocused();
    await page.getByRole('button', { name: '← Zurück', exact: true }).click(); await expect(page.getByRole('button', { name: 'agdf-control-cockpit-20261005-01', exact: true })).toBeFocused();
    // Complete the entire journey with each input method, including the return controls.
    for (const keyboard of [false, true]) {
      const activate = async button => { if (keyboard) { await button.focus(); await page.keyboard.press('Enter'); } else await button.click(); };
      await activate(page.getByRole('button', { name: 'agdf-control-cockpit-20261005-01', exact: true }));
      await expect(page.getByRole('heading', { name: 'Run verstehen' })).toBeFocused();
      await activate(document); await expect(page.getByRole('heading', { name: 'Dokument lesen' })).toBeFocused();
      await activate(page.getByRole('button', { name: '← Zurück', exact: true })); await expect(document).toBeFocused();
      await activate(page.getByRole('button', { name: '← Zurück', exact: true }));
      await expect(page.getByRole('button', { name: 'agdf-control-cockpit-20261005-01', exact: true })).toBeFocused();
    }
    await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: '/private/tmp/agdf-cockpit-mobile.png' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]); expect(remote).toEqual([]); expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  } finally { await service.close(); expect(hashes(root)).toEqual(before); }
});
test('SCN-005/010/012/028: visible invalid run, persisted discrepancy, missing and unsupported documents', async ({ page }) => {
  const f = fixture();
  fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
  fs.unlinkSync(join(f.root, f.documentPath));
  const service = await startControlServer({ dir: f.root });
  try {
    await openSession(page, service); await expect(page.getByText('Teilweise verfügbar', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'broken', exact: true }).click(); await expect(page.getByText('Dieser Run ist ungültig. Die Quelldaten außerhalb des Cockpits prüfen.')).toBeVisible();
    await page.getByRole('button', { name: '← Zurück', exact: true }).click();
    await page.getByRole('button', { name: 'fixture-a', exact: true }).click();
    await expect(page.getByText('Die gespeicherte Angabe weicht von der Core-Auswertung ab. Beide Quellen sind getrennt dargestellt; die Core-Auswertung bestimmt den Kontrollstatus.')).toBeVisible();
    await expect(page.getByText('QA', { exact: true })).toBeVisible(); await expect(page.getByText('UAT', { exact: true })).toBeVisible();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click(); await expect(page.getByText('Das registrierte Dokument fehlt. Quelle prüfen und erneut laden.')).toBeVisible();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-missing.png' });
    fs.writeFileSync(join(f.root, f.documentPath), Buffer.from([255]));
    await page.getByRole('button', { name: 'Neu laden', exact: true }).click(); await expect(page.getByText('Dieses Dokument kann nicht als UTF-8-Markdown, JSON oder Text angezeigt werden.')).toBeVisible();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-unsupported.png' });
  } finally { await service.close(); f.close(); }
});
test('SCN-009/014/018/024: hostile document, stale reload, retry and removed selection', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, f.documentPath), '# Hostile document\n\nOriginal 日本語.\n\n<script>window.pwned=true</script>\n\n![remote](https://evil.invalid/img)\n\n[foreign](https://evil.invalid)\n');
  const service = await startControlServer({ dir: f.root }), remote = []; page.on('request', r => { if (!r.url().startsWith(service.origin)) remote.push(r.url()); });
  try {
    await openSession(page, service); await page.getByRole('button', { name: 'fixture-a', exact: true }).click(); await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click();
    await expect(page.locator('article.document')).toContainText('Original 日本語'); expect(await page.evaluate(() => window.pwned)).toBeUndefined(); expect(await page.locator('article.document img,article.document iframe,article.document script,article.document a').count()).toBe(0);
    fs.writeFileSync(join(f.root, f.documentPath), '# Updated document\nNew content');
    await expect(page.getByText('Vorheriger Datenstand · Diese Ansicht ist keine aktuelle Auswertung.')).toBeVisible({ timeout: 12_000 }); await expect(page.locator('article.document')).toContainText('Hostile document');
    await page.getByRole('button', { name: 'Neu laden', exact: true }).click(); await expect(page.locator('article.document')).toContainText('Updated document'); await expect(page.getByText('Vorheriger Datenstand · Diese Ansicht ist keine aktuelle Auswertung.')).toHaveCount(0);
    let fail = true; await page.route('**/api/snapshot', route => { if (fail) { fail = false; return route.abort(); } return route.continue(); });
    await page.getByRole('button', { name: 'Neu laden', exact: true }).click(); await expect(page.getByRole('button', { name: 'Wiederholen' })).toBeVisible(); await page.getByRole('button', { name: 'Wiederholen' }).click(); await expect(page.locator('article.document')).toContainText('Updated document');
    fs.rmSync(join(f.root, '.agdf/control/runs/fixture-a'), { recursive: true }); await page.getByRole('button', { name: 'Neu laden', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Run-Übersicht' })).toBeVisible(); await expect(page.getByText(/Der ausgewählte Run ist nicht mehr vorhanden/)).toBeVisible(); expect(remote).toEqual([]);
  } finally { await service.close(); f.close(); }
});
