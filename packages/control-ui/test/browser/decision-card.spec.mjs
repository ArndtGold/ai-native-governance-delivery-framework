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
for (const locale of Object.keys(registry.locales)) test(`Busy host queue: ${locale}, survives the tool deadline and delivers once after idle (synthetic SDK host)`, async ({ page }) => {
  await page.clock.install(); await page.goto(origin); const frame = page.frameLocator('iframe'), l = registry.locales[locale].decisionCard;
  await expect(frame.getByRole('button', { name: registry.locales.en.decisionCard.approve, exact: true })).toBeVisible();
  await page.evaluate(async locale => { window.decisionHarness.mode('continue_busy'); await window.decisionHarness.emit(locale); }, locale);
  await frame.getByRole('button', { name: l.approve, exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.decisionHarness.messages.length)).toBe(1);
  await expect(frame.getByText(l.nextWaiting, { exact: true })).toBeVisible();
  await page.clock.runFor(11_000);
  await expect(frame.getByText(l.nextWaiting, { exact: true })).toBeVisible();
  await expect(frame.getByText(l.nextUnavailable, { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.arguments.operation === 'close'))).toHaveLength(1);
  await page.evaluate(() => window.decisionHarness.releaseMessage());
  await expect(frame.getByText(l.nextRequested, { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.decisionHarness.calls.filter(c => c.arguments.operation === 'close').length)).toBe(2);
  await page.clock.runFor(31 * 60_000);
  await expect(frame.getByText(l.confirmed, { exact: true })).toBeVisible();
  await expect(frame.getByText(l.expired, { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.decisionHarness.messages.length)).toBe(1);
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action').length)).toBe(1);
});
for (const locale of Object.keys(registry.locales)) for (const mode of ['continue_agent', 'continue_human', 'continue_stale', 'continue_unknown'])
  test(`Post-approval continuation: ${locale}/${mode}, no second click (synthetic SDK host)`, async ({ page }) => {
    const l = registry.locales[locale].decisionCard;
    await page.goto(origin); const frame = page.frameLocator('iframe');
    await expect(frame.getByRole('button', { name: registry.locales.en.decisionCard.approve, exact: true })).toBeVisible();
    await page.evaluate(async ({ locale, mode }) => { window.decisionHarness.mode(mode); await window.decisionHarness.emit(locale); }, { locale, mode });
    expect(await page.evaluate(() => window.decisionHarness.messages)).toHaveLength(0);
    const approve = frame.getByRole('button', { name: l.approve, exact: true }); await approve.focus(); await page.keyboard.press('Space');
    await expect(frame.getByText(l.confirmed, { exact: true })).toBeVisible();
    await expect(frame.getByText(['continue_stale', 'continue_unknown'].includes(mode) ? l.nextUnavailable : l.nextRequested, { exact: true })).toBeVisible();
    await expect(frame.getByRole('button', { name: l.nextStep, exact: true })).toHaveCount(0);
    await expect(frame.getByRole('button', { name: l.approve, exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.arguments.operation === 'close').length))
      .toBe(['continue_stale', 'continue_unknown'].includes(mode) ? 1 : 2); // First bootstrap replacement closes the initial view; successful handoff closes its own view.
    const messages = await page.evaluate(() => window.decisionHarness.messages);
    expect(messages).toHaveLength(mode === 'continue_stale' ? 0 : 1);
    if (messages.length) {
      expect(messages[0].content[0].text).not.toContain('Redispatch');
      expect(messages[0].content[0].text).not.toContain('synthetic-run');
      const contexts = await page.evaluate(() => window.decisionHarness.contexts);
      expect(contexts).toHaveLength(1);
      expect(contexts[0].structuredContent.agdf_continuation.run_id).toBe('synthetic-run');
      expect(contexts[0].structuredContent.agdf_continuation.authorizes).toBe(false);
      expect(contexts[0].structuredContent.agdf_continuation.instruction).toContain('never execute a human next_operation automatically');
      expect(messages[0].content[0].text).not.toContain('Approval:');
    }
    await frame.getByText(l.sources, { exact: true }).click();
    if (!['continue_stale', 'continue_unknown'].includes(mode)) {
      await frame.getByRole('button', { name: l.openDocument, exact: true }).click();
      await expect(frame.getByRole('heading', { name: `${l.documentTitle} · SD` })).toBeVisible();
      expect(await page.evaluate(() => window.decisionHarness.calls.at(-1).arguments.operation)).toBe('presentation-document');
      await frame.getByRole('button', { name: l.back, exact: true }).click();
    }
    expect(await page.evaluate(() => window.decisionHarness.messages)).toHaveLength(messages.length);
    expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action'))).toHaveLength(1);
  });
for (const action of ['removeFrame', 'navigateFrame']) test(`SDK close: ${action === 'removeFrame' ? 'browser iframe removal fallback' : 'host teardown before navigation'} (synthetic host)`, async ({ page }) => {
  await page.goto(origin);
  await expect(page.frameLocator('iframe').getByRole('button', { name: registry.locales.en.decisionCard.approve, exact: true })).toBeVisible();
  await page.evaluate(operation => window.decisionHarness[operation](), action);
  await expect.poll(() => page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_cockpit_read' && c.arguments.operation === 'close'))).toHaveLength(1);
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action'))).toHaveLength(0);
});
for (const locale of Object.keys(registry.locales)) test(`Actual built resource + SDK bridge: ${locale} rendering/keyboard/read/recovery/teardown (synthetic host)`, async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const l = registry.locales[locale].decisionCard;
  await page.goto(origin); const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('button', { name: registry.locales.en.decisionCard.approve, exact: true })).toBeVisible();
  await page.evaluate(lc => window.decisionHarness.emit(lc), locale);
  await expect(frame.getByRole('button', { name: l.approve, exact: true })).toBeVisible();
  await expect(frame.getByRole('heading', { name: 'Source-bound decision heading', exact: true })).toBeVisible();
  await expect(frame.getByText('Proposal: Synthetic source-authored proposal.', { exact: true })).toBeVisible();
  await expect(frame.getByText(registry.locales[locale].statusCard.allowedAfter, { exact: true })).toBeVisible();
  await expect(frame.getByText('Full intended change.', { exact: true })).not.toBeVisible();
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action'))).toHaveLength(0);
  await page.evaluate(lc => window.decisionHarness.emit(lc, 'available', true), locale);
  await expect(frame.getByText(l.machineComparison, { exact: true })).toBeVisible();
  await expect(frame.getByText(l.documentChanged, { exact: true })).toBeVisible();
  await frame.getByText(l.sources, { exact: true }).click();
  await expect(frame.getByText('Full intended change.', { exact: true })).toBeVisible();
  await frame.getByText(l.previousDocument, { exact: true }).click();
  await expect(frame.getByText('Actual complete previous source.', { exact: true })).toBeVisible();
  await frame.getByText(l.previousDocument, { exact: true }).click();
  await frame.getByText(l.sources, { exact: true }).click();
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action'))).toHaveLength(0);
  const open = frame.getByRole('button', { name: l.openDocument, exact: true }); await open.focus(); await page.keyboard.press('Enter');
  await expect(frame.getByRole('heading', { name: `${l.documentTitle} · SD` })).toBeFocused();
  await expect(frame.getByText('Complete readable content.', { exact: false }).first()).toBeVisible();
  await frame.getByRole('button', { name: l.back, exact: true }).click(); await expect(open).toBeFocused();
  for (const width of [380, 1100]) {
    await page.setViewportSize({ width, height: 950 });
    await expect.poll(() => page.frames()[1].evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await open.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    await page.frames()[1].evaluate(() => { window.scrollTo(0, document.documentElement.scrollHeight); window.scrollTo(0, 0); });
    await expect(frame.getByRole('status')).toHaveText(l.notSaved);
    await page.screenshot({ path: evidencePath(`decision-${locale}-${width}-undecided.png`), fullPage: true });
  }
  await expect(frame.getByRole('textbox')).toHaveCount(0);
  await expect(frame.getByRole('button', {name:l.request_change,exact:true})).toHaveCount(0);
  await expect(frame.getByRole('button', {name:l.reject,exact:true})).toHaveCount(0);
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action'))).toHaveLength(0);
  for (const [mode, text] of [['pending', l.pending], ['uncertain', l.uncertain], ['stale_revision', l.sourceChanged],
    ['session_expired', l.expired], ['presentation_version_decided', l.alreadyDecided], ['permission_denied', l.denied]]) {
    await page.evaluate(async ({ locale, mode }) => { window.decisionHarness.mode(mode); await window.decisionHarness.emit(locale); }, { locale, mode });
    await expect(frame.getByRole('status')).toHaveText(l.notSaved);
    const action = frame.getByRole('button', { name: l.approve, exact: true }); await action.focus(); await page.keyboard.press('Space');
    await expect(frame.getByText(text, { exact: true })).toBeVisible();
    await page.screenshot({ path: evidencePath(`decision-${locale}-${mode}.png`), fullPage: true });
    if (mode === 'pending') { await page.evaluate(() => window.decisionHarness.release()); await expect(frame.getByText(l.confirmed, { exact: true })).toBeVisible(); }
    if (mode === 'uncertain') {
      await frame.getByRole('button', { name: l.checkOperation, exact: true }).click(); await expect(frame.getByText(l.uncertain, { exact: true })).toBeVisible();
      const previous = await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action').at(-1).arguments);
      await page.evaluate(() => window.decisionHarness.mode('accepted')); await frame.getByRole('button', { name: l.retryOriginal, exact: true }).click();
      await expect(frame.getByText(l.confirmed, { exact: true })).toBeVisible();
      expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_decision_action').at(-1).arguments)).toEqual(previous);
    }
  }
  await page.evaluate(lc => window.decisionHarness.emit(lc, 'not_qualified'), locale);
  await expect(frame.getByText(l.notQualified, { exact: true })).toBeVisible();
  await expect(frame.getByRole('button', { name: l.approve, exact: true })).toHaveCount(0);
  await expect(frame.getByText(l.chatApprovalHint.replace('{gate}', 'SD'), { exact: true })).toBeVisible();
  await page.evaluate(() => window.decisionHarness.teardown());
  await expect(frame.getByRole('button', { name: l.approve, exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.decisionHarness.calls.filter(c => c.name === 'agdf_cockpit_read' && c.arguments.operation === 'close').length)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  writeFileSync(evidencePath(`decision-browser-${locale}.json`), JSON.stringify({ evidence_class: 'built_resource_synthetic_sdk_host',
    locale, resource: readDecisionUiBuild().manifest, screenshots: `decision-${locale}-*.png`, native_qualified: false }, null, 2));
});
