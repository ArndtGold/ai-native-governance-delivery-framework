import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { approvalFixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { upsertTableRow } from '../../../core/lib/control-state/run-state-edits.js';
import { sealRunState } from '../../../core/lib/control-state/run-seal.js';
import { startControlServer } from './server-fixture.mjs';

const evidence = resolve('../../.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/evidence/browser');
fs.mkdirSync(evidence, { recursive: true });
const gates = ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'];
async function fixture(count = 4, long = false) {
  const f = await approvalFixture();
  if (f.approve().outcome !== 'approved') throw Error('Canonical fixture UR approval failed');
  // Additional recorded facts are deliberately unverified fixture inputs. They do not
  // certify historical versions or authorize delivery, and stay outside app-only windows.
  let state = fs.readFileSync(f.runPath, 'utf8');
  for (const [i, gate] of gates.entries()) {
    const original = gate === 'UR' ? 'Original owner/date/path sha256:1234; <script>window.approvalPwned=true</script> ' + (long ? 'Langer Originalnachweis 日本語 '.repeat(50) : '') : '';
    state = upsertTableRow(state, 'Approvals', 0, gate, [gate, i < count ? 'approved' : 'missing', original]);
    if (i < Math.min(count, 4) && gate !== 'UR') {
      const path = `.agdf/control/artefacts/fixture-a/${gate}.md`;
      fs.writeFileSync(join(f.root, path), `# ${gate}: Current fixture\n\nCurrent ${gate} document.\n`);
      state = upsertTableRow(state, 'Artefacts', 0, gate, [gate, path, 'approved', 'Disposable current resource']);
    }
  }
  fs.writeFileSync(f.runPath, sealRunState(f.root, state));
  return f;
}
async function open(page, service, pathname) {
  await page.addInitScript(({ secret, origin, pathname }) => { if (location.origin === origin) history.replaceState(null, '', pathname + '#' + secret); }, { secret: service.secret, origin: service.origin, pathname });
  await page.goto(service.origin + pathname);
  await page.locator('.run-link[data-focus-id="fixture-a"]').click();
  await page.locator('.work-step-approvals > summary').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.work-step-approvals')).toHaveAttribute('open');
}

test('SCN-001/002/005: zero and later-gate counts, deliberate original limitations and unavailable versions render truthfully', async ({ page }) => {
  for (const count of [0, 6]) {
    const f = await fixture(count), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
    try {
      await open(page, service, '/');
      await expect(page.locator('.work-step-approvals > summary')).toHaveText(`Dokumentierte Freigaben · ${count}`);
      await expect(page.locator('.documented-approval-row')).toHaveCount(count);
      if (!count) await expect(page.getByText('Keine Freigaben dokumentiert.')).toBeVisible();
      else {
        await expect(page.locator('.documented-approval-evidence[open]')).toHaveCount(0);
        await page.getByLabel('Dokumentiert: Anforderungen', { exact: true }).focus(); await page.keyboard.press('Enter');
        await expect(page.locator('.documented-approval-evidence').first()).toContainText('Keine bestätigte Identität verfügbar.');
        await expect(page.locator('.documented-approval-evidence').first()).toContainText('sha256:1234');
        expect(await page.evaluate(() => window.approvalPwned)).toBeUndefined();
        await expect(page.getByText('Aktuelle Fassung nicht verfügbar.', { exact: true })).toHaveCount(2);
        await expect(page.getByRole('button', { name: /^Freigegebene Fassung ansehen/ })).toHaveCount(0);
      }
      await page.screenshot({ path: join(evidence, `count-${count}.png`), fullPage: true });
      expect(treeBytes(f.root)).toEqual(before);
    } finally { await page.close(); await service.close(); f.close(); }
    // A fresh Page is supplied by the browser context after the previous isolated target.
    if (count === 0) page = await page.context().newPage();
  }
});

test('SCN-007/008/010/011: same built compact/expanded rows preserve keyboard, disclosure, focus, wrapping and scroll across widths', async ({ page }) => {
  const f = await fixture(4, true), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const requests = [], observations = [];
  page.on('request', r => { if (r.url().includes('/api/')) requests.push({ method: r.method(), path: new URL(r.url()).pathname }); });
  try {
    for (const pathname of ['/card.html', '/']) {
      await page.setViewportSize({ width: 1280, height: 900 }); await open(page, service, pathname);
      await page.screenshot({ path: join(evidence, `${pathname === '/' ? 'expanded' : 'compact'}-four-closed.png`), fullPage: true });
      const disclosure = page.getByLabel('Dokumentiert: Anforderungen', { exact: true });
      await disclosure.focus(); await page.keyboard.press('Enter');
      await expect(disclosure.locator('..')).toHaveAttribute('open');
      await disclosure.evaluate(el => { window.approvalDisclosureNode = el; });
      for (const width of [1280, 360, 1280]) {
        let viewport = width; const target = width === 1280 ? 960 : 320;
        for (let attempt = 0; attempt < 12; attempt++) {
          await page.setViewportSize({ width: viewport, height: 900 });
          const actual = await page.locator('.documented-approvals-list').evaluate(el => el.clientWidth);
          if (Math.abs(actual - target) <= 1) break;
          viewport += target - actual;
        }
        await expect(disclosure).toBeFocused();
        expect(await disclosure.evaluate(el => window.approvalDisclosureNode === el)).toBe(true);
        await expect(disclosure.locator('..')).toHaveAttribute('open');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const measured = await page.locator('.documented-approvals-list').evaluate(el => ({ width: el.clientWidth, columns: getComputedStyle(el.querySelector('li')).gridTemplateColumns, rows: el.children.length }));
        observations.push({ pathname, viewport, requestedContainerWidth: target, ...measured });
        expect(Math.abs(measured.width - target)).toBeLessThanOrEqual(1);
        expect(measured.rows).toBe(4);
        if (width === 1280) expect(measured.columns.split(' ')).toHaveLength(3); else expect(measured.columns.split(' ')).toHaveLength(1);
        const controls = await page.locator('.documented-approval-evidence > summary, .documented-approval-source button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
        expect(controls.every(height => height >= 44)).toBe(true);
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.evaluate(() => scrollTo(0, 0));
        await expect(disclosure).toBeFocused();
        await page.screenshot({ path: join(evidence, `${pathname === '/' ? 'expanded' : 'compact'}-${width}-long.png`), fullPage: true });
      }
      await disclosure.focus(); await page.keyboard.press('Enter'); await expect(disclosure.locator('..')).not.toHaveAttribute('open');
      await page.keyboard.press('Tab');
      const current = page.getByRole('button', { name: /^Aktuelle Fassung ansehen: Anforderungen ·/ });
      await expect(current).toBeFocused();
      const received = page.waitForResponse(r => r.url().includes('/api/documents/') && r.ok());
      await page.keyboard.press('Enter');
      expect((await (await received).json()).data.document.content).toBe(fs.readFileSync(join(f.root, f.documentPath), 'utf8'));
      await expect(page.locator('.document-reading')).toBeVisible();
      await page.getByText('Originaldokument lesen', { exact: true }).click();
      await expect(page.locator('article.document')).toContainText('Keep provenance and human approval separate.');
      await page.getByRole('button', { name: 'Dokument schließen', exact: true }).click(); await expect(current).toBeFocused();
      await page.getByRole('button', { name: /Neu laden|Aktualisieren/ }).click();
      await expect(page.locator('.documented-approval-row')).toHaveCount(4);
      expect(treeBytes(f.root)).toEqual(before);
    }
    expect(requests.some(r => r.path.includes('draft-check') || /approve|dispatch|write/.test(r.path))).toBe(false);
    fs.writeFileSync(join(evidence, 'measurements.json'), JSON.stringify({ observations, requests, native_host: 'not observed; actual browser build only' }, null, 2));
  } finally { await page.close(); await service.close(); f.close(); }
});

test('SCN-003/004/009: changed/moved current source retains honest wording, freshness, explicit reload and read-only retry', async ({ page }) => {
  const f = await fixture(), service = await startControlServer({ dir: f.root });
  try {
    await open(page, service, '/');
    const original = '# UR: Changed current source\n\nThe current content has changed.\n';
    fs.writeFileSync(join(f.root, f.documentPath), original);
    const moved = '.agdf/control/artefacts/fixture-a/moved-UR.md'; fs.renameSync(join(f.root, f.documentPath), join(f.root, moved)); f.register('UR', moved);
    await page.getByRole('button', { name: /Neu laden|Aktualisieren/ }).click();
    const overview = page.locator('.work-step-approvals');
    if (!await overview.evaluate(el => el.open)) await overview.locator(':scope > summary').click();
    const current = page.getByRole('button', { name: /^Aktuelle Fassung ansehen: Anforderungen ·/ });
    await expect(current).toHaveAccessibleName(/moved-UR.md/);
    const before = treeBytes(f.root);
    await page.route('**/api/documents/**', route => route.abort());
    await current.click(); await expect(page.getByRole('button', { name: 'Wiederholen', exact: true })).toBeVisible();
    await page.unroute('**/api/documents/**');
    const received = page.waitForResponse(r => r.url().includes('/api/documents/') && r.ok());
    await page.getByRole('button', { name: 'Wiederholen', exact: true }).click();
    expect((await (await received).json()).data.document.content).toBe(original);
    await expect(page.locator('.document-reading')).toBeVisible(); await page.getByText('Originaldokument lesen', { exact: true }).click();
    await expect(page.locator('article.document')).toContainText('The current content has changed.');
    await page.getByRole('button', { name: 'Dokument schließen', exact: true }).click();
    await expect(current).toBeFocused(); await expect(page.getByRole('button', { name: /^Freigegebene Fassung ansehen/ })).toHaveCount(0);
    expect(treeBytes(f.root)).toEqual(before);
    await page.screenshot({ path: join(evidence, 'changed-current.png'), fullPage: true });
  } finally { await page.close(); await service.close(); f.close(); }
});
