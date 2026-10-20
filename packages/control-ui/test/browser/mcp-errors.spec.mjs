import { test, expect } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readDecisionUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';
import { evidencePath } from './server-fixture.mjs';
let server, origin, temporary;
const registry = JSON.parse(readFileSync(new URL('../../../../plugins/agdf/meta/agdf-interaction-locales.json', import.meta.url), 'utf8'));
test.beforeAll(async () => {
  temporary = mkdtempSync(join(tmpdir(), 'agdf-decision-browser-'));
  await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
    lib: { entry: new URL('./decision-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' },
    target: 'es2022', minify: false } });
  const html = readDecisionUiBuild().files['decision.html'], host = readFileSync(join(temporary, 'host.js'));
  server = createServer((req, res) => {
    const content = req.url === '/decision.html' ? html : req.url === '/host.js' ? host
      : Buffer.from('<!doctype html><html><body style="margin:0"><iframe style="width:100%;height:900px;border:0" title="Synthetic decision"></iframe><script type="module" src="/host.js"></script></body></html>');
    res.writeHead(200, { 'content-type': req.url === '/host.js' ? 'text/javascript' : 'text/html' }); res.end(content);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = 'http://127.0.0.1:' + server.address().port;
});
test.afterAll(async () => { await new Promise(resolve => server?.close(resolve)); rmSync(temporary, { recursive: true, force: true }); });
for (const locale of ['en', 'de']) for (const [mode, message] of [
  ['stale_revision', 'sourceChanged'], ['session_expired', 'expired'], ['permission_denied', 'denied'], ['uncertain', 'uncertain'], ['accepted', 'uncertain'],
]) test(`MCP error channel retains safe decision feedback: ${locale}/${mode}`, async ({ page }) => {
  const l = registry.locales[locale].decisionCard;
  await page.goto(origin); const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('button', { name: registry.locales.en.decisionCard.approve, exact: true })).toBeVisible();
  await page.evaluate(async ({ locale, mode }) => { window.decisionHarness.mode('error_' + mode); await window.decisionHarness.emit(locale); }, { locale, mode });
  await frame.getByRole('button', { name: l.approve, exact: true }).click();
  await expect(frame.getByText(l[message], { exact: true })).toBeVisible();
  if (mode !== 'permission_denied') await expect(frame.getByRole('button', { name: l.approve, exact: true })).toBeDisabled();
  await page.screenshot({ path: evidencePath(`mcp-error-${locale}-${mode}.png`), fullPage: true });
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action').length)).toBe(1);
  expect(await page.evaluate(() => window.decisionHarness.messages.length)).toBe(0);
});

test('late MCP error cannot attach to a replacement decision (synthetic SDK host)', async ({ page }) => {
  await page.goto(origin); const frame = page.frameLocator('iframe'), l = registry.locales.en.decisionCard;
  await expect(frame.getByRole('button', { name: l.approve, exact: true })).toBeVisible();
  await page.evaluate(() => window.decisionHarness.mode('error_pending'));
  await frame.getByRole('button', { name: l.approve, exact: true }).click();
  await expect(frame.getByText(l.pending, { exact: true })).toBeVisible();
  await page.evaluate(async () => { await window.decisionHarness.emit('en'); window.decisionHarness.release(); });
  await expect(frame.getByRole('button', { name: l.approve, exact: true })).toBeEnabled();
  await expect(frame.getByText(l.uncertain, { exact: true })).toHaveCount(0);
  await expect(frame.getByText(l.confirmed, { exact: true })).toHaveCount(0);
});
