import { test, expect } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createTestRuntime } from '../../../mcp-server/test/runtime-fixture.js';
import { buildAgdfServer } from '../../../mcp-server/src/server.js';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { buildCompanionFixtures, replaceCompanionPrd } from '../../../core/test/fixtures/companion-fixtures.js';
import { currentFixture, currentRun } from '../../../core/test/fixtures/current-run.js';
import { createCockpitSessionService } from '../../../core/lib/control-inspect/cockpit-session.js';
import { COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, parseCockpitArguments } from '../../../core/lib/control-inspect/cockpit-contract.js';
import { readCockpitUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';
import { evidencePath } from './server-fixture.mjs';

for (const surface of ['inline', 'panel']) test(`built Codex Companion opens a registered PRD and restores the compact card from ${surface} (synthetic SDK host)`, async ({ page }) => {
  const cleanups = [], [fixture] = buildCompanionFixtures({ after: callback => cleanups.push(callback) }, ['F03']);
  const writer = currentFixture({ after: callback => cleanups.push(callback) }, { root: fixture.root, initialize: false });
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-companion-browser-'));
  const ui = readCockpitUiBuild(), session = createCockpitSessionService(fixture.root, { integrationSurface: 'codex' });
  const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition, i) => ({ name: definition.name, definition,
    parse: value => parseCockpitArguments(value, i === 0), execute: (value, signal) => i === 0 ? session.render(value) : session.read(value, signal) }));
  const runtime = { ...createTestRuntime(), mode: 'cockpit', definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2,
    ui: { uri: ui.manifest.uri, mimeType: ui.manifest.mime_type, limit: 4 * 1024 ** 2, directory: pathToFileURL(ui.root + '/') },
    trustedContext: { surface: 'codex', expectedVersion: 'synthetic-test', provenanceStatus: 'matched' },
    serialize: JSON.stringify, failure: session.failure, close: session.close };
  const sdkServer = buildAgdfServer({ runtime }), client = new Client({ name: 'synthetic-codex-companion', version: '1' }, {
    capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [ui.manifest.mime_type] } } },
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  let server;
  const before = treeBytes(fixture.root);
  try {
    await sdkServer.connect(b);
    await client.connect(a);
    const prepared = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: fixture.runId } });
    expect(prepared.isError).toBeUndefined();
    const displayCheck = prepared.structuredContent.next_action.call;
    expect(displayCheck.arguments.operation).toBe('display_status');
    const display = async () => (await client.callTool({ name: displayCheck.tool, arguments: displayCheck.arguments })).structuredContent.data.display;
    expect(await display()).toEqual({ state: 'pending', run_id: fixture.runId });
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./sdk-trace-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022' } });
    server = createServer(async (req, res) => {
      try {
        if (req.url === '/tool' && req.method === 'POST') {
          const chunks = [];
          for await (const data of req) chunks.push(data);
          const result = await client.callTool(JSON.parse(Buffer.concat(chunks).toString()));
          res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
        }
        if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
        res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html');
        res.end(req.url === '/cockpit.html' ? ui.files['cockpit.html'] : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
          : '<!doctype html><style>body{margin:0}iframe{display:block;width:100%;height:100vh;border:0}</style><iframe title="Synthetic Cockpit"></iframe><script type="module" src="/host.js"></script>');
      } catch { res.statusCode = 500; res.end('synthetic_tool_failed'); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await page.setViewportSize({ width: 360, height: 820 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      window.companionAudioStarts = 0;
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) {
        start.apply(this, args);
        window.companionAudioStarts++;
      };
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/?companion=${surface}`);
    const frame = page.frameLocator('iframe');
    const card = frame.getByRole('article', { name: 'Companion-Statuskarte' });
    const source = card.getByRole('button', { name: 'PRD-Entwurf öffnen' });
    await expect(card.getByText('Du bist dran')).toBeVisible();
    await expect(frame.getByText('Host-Verbindung prüfen', { exact: true })).toHaveCount(0);
    await expect.poll(display).toMatchObject({ state: 'ui_reported_visible', run_id: fixture.runId });
    await expect(frame.getByRole('button', { name: 'Alle Vorhaben', exact: true })).toHaveCount(0);
    await expect(card.getByRole('list', { name: 'Gate-Fortschritt' }).locator('[aria-current="step"]')).toContainText('PRD');
    expect(await card.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= el.ownerDocument.defaultView.innerWidth)).toBe(true);
    await page.screenshot({ path: evidencePath(`codex-companion-${surface}-360.png`), fullPage: true });
    const details = card.getByText('ⓘ Details', { exact: true });
    await details.focus(); await details.press('Enter');
    await expect(card.getByText('Wozu dieses Gate da ist')).toBeVisible();
    await expect(card.getByText('Datenstand und Prüfung', { exact: true })).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'Vorhaben öffnen' })).toHaveCount(0);
    const about = frame.getByRole('button', { name: 'Über das Cockpit' });
    await about.focus(); await about.press('Enter');
    await expect(frame.getByRole('dialog')).toBeVisible();
    await frame.getByRole('dialog').press('Escape');
    await expect(about).toBeFocused();
    const menu = frame.getByRole('button', { name: 'AGDF Companion', exact: true });
    const options = frame.getByRole('menu', { name: 'AGDF Companion' });
    const motion = options.getByRole('menuitemcheckbox', { name: 'Bewegung' });
    const sound = options.getByRole('menuitemcheckbox', { name: 'Hinweiston' });
    const starts = () => frame.locator('body').evaluate(() => window.companionAudioStarts);
    const section = frame.getByRole('region', { name: 'AGDF Cockpit', exact: true });
    await menu.focus();
    const sectionBeforeMenu = await section.boundingBox();
    await menu.press('Enter');
    await expect(motion).toBeFocused();
    await expect(motion).toHaveAttribute('aria-checked', 'true');
    await expect(sound).toHaveAttribute('aria-checked', 'false');
    const menuPosition = await options.boundingBox();
    const triggerPosition = await menu.boundingBox();
    expect(menuPosition.y + menuPosition.height).toBeLessThan(triggerPosition.y);
    expect((await section.boundingBox()).height).toBe(sectionBeforeMenu.height);
    await page.screenshot({ path: evidencePath(`codex-companion-menu-${surface}-360.png`), fullPage: true });
    await expect(frame.getByText('Bewegung ist durch die Anzeigeeinstellung reduziert.')).toBeVisible();
    await motion.press('Enter');
    await expect(menu).toBeFocused();
    await menu.press('ArrowUp');
    await expect(motion).toHaveAttribute('aria-checked', 'false');
    const info = options.getByRole('menuitem', { name: 'Über den Companion' });
    await expect(info).toBeFocused();
    await info.press('ArrowUp');
    const reload = options.getByRole('menuitem', { name: 'Neu lesen' });
    await expect(reload).toBeFocused();
    await reload.press('Escape');
    await expect(menu).toBeFocused();
    await expect(options).toBeHidden();
    await menu.press('ArrowUp');
    await info.press('Enter');
    await expect(frame.getByRole('heading', { name: 'Über den AGDF Companion' })).toBeFocused();
    await frame.getByRole('button', { name: 'Companion-Information schließen' }).click();
    await expect(menu).toBeFocused();
    await source.click();
    await expect(frame.getByRole('button', { name: 'Zurück zur Statuskarte' })).toBeVisible();
    await expect(frame.locator('.workspace--document')).toBeVisible();
    await expect(frame.getByRole('article', { name: 'Originaldokument' }).getByText('PRD: Synthetic saved filter', { exact: true })).toBeVisible();
    await frame.getByRole('button', { name: 'Zurück zur Statuskarte' }).click();
    await expect(source).toBeFocused();
    await menu.press('Enter');
    await expect(motion).toHaveAttribute('aria-checked', 'false');
    await motion.press('ArrowDown');
    await expect(sound).toBeFocused();
    await sound.press('Enter');
    await expect(menu).toBeFocused();
    expect(await starts()).toBe(0);
    await menu.press('Enter');
    await expect(sound).toHaveAttribute('aria-checked', 'true');
    await reload.click();
    await expect(source).toBeEnabled();
    expect(await starts()).toBe(0);
    expect(treeBytes(fixture.root)).toEqual(before);
    for (const [index, marker] of ['Boxenfunk B', 'Boxenfunk C'].entries()) {
      replaceCompanionPrd(writer, fixture.runId, marker);
      await expect.poll(starts, { timeout: 12_000 }).toBe(index + 1);
      await expect(card.getByText('Du bist dran')).toBeVisible();
      const afterUpdate = treeBytes(fixture.root);
      await source.click();
      await expect(frame.getByRole('article', { name: 'Originaldokument' }).getByText(`PRD: Synthetic saved filter ${marker}`, { exact: true })).toBeVisible();
      await frame.getByRole('button', { name: 'Zurück zur Statuskarte' }).click();
      await expect(source).toBeFocused();
      await menu.press('Enter');
      await expect(sound).toHaveAttribute('aria-checked', 'true');
      await reload.click();
      await expect(source).toBeEnabled();
      expect(await starts()).toBe(index + 1);
      expect(treeBytes(fixture.root)).toEqual(afterUpdate);
    }
    if (surface === 'panel') {
      expect(await page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'display-mode-request'))).toEqual([]);
    }
    await expect(frame.getByRole('navigation', { name: 'Aktive Runs' })).toHaveCount(0);
    currentRun(writer, 'Zweiter Test-Run');
    currentRun(writer, 'Dritter Test-Run');
    await menu.press('Enter');
    await reload.click();
    const navigation = frame.getByRole('navigation', { name: 'Aktive Runs' });
    await expect(navigation).toContainText('3 von 3');
    const nextRun = navigation.getByRole('button', { name: 'Nächster Run' });
    await expect(nextRun).toBeEnabled();
    await nextRun.click();
    await expect(navigation).toContainText('1 von 3');
    await expect(card.getByRole('heading', { name: 'Dritter Test-Run' })).toBeVisible();
    await expect(nextRun).toBeFocused();
    const time = frame.locator('.companion-footer time');
    for (const width of [520, 360, 320]) {
      await page.setViewportSize({ width, height: 820 });
      await expect(time).toBeVisible();
      const [menuBox, navBox, timeBox] = await Promise.all([menu.boundingBox(), navigation.boundingBox(), time.boundingBox()]);
      expect(await card.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= el.ownerDocument.defaultView.innerWidth)).toBe(true);
      expect(menuBox.x + menuBox.width).toBeLessThan(timeBox.x);
      if (width > 340) {
        expect(menuBox.x + menuBox.width).toBeLessThan(navBox.x);
        expect(navBox.x + navBox.width).toBeLessThan(timeBox.x);
        expect(Math.abs(menuBox.y - navBox.y)).toBeLessThan(2);
      } else {
        expect(navBox.y + navBox.height).toBeLessThanOrEqual(menuBox.y);
      }
    }
    await menu.press('Enter');
    await options.getByRole('menuitem', { name: 'Zurück zum Chat-Run' }).click();
    await expect(navigation).toContainText('3 von 3');
    await expect(source).toBeEnabled();
    expect(await starts()).toBe(2);
  } finally {
    const frame = await page.frameLocator('iframe').locator('body').innerText({ timeout: 1000 }).catch(() => null);
    writeFileSync(evidencePath(`codex-companion-${surface}-synthetic-host.txt`), frame ?? 'No visible iframe content');
    await sdkServer.closeAgdfRuntime();
    if (server) await new Promise(resolve => server.close(resolve));
    await client.close(); await sdkServer.close();
    for (const cleanup of cleanups.reverse()) await cleanup();
    rmSync(temporary, { recursive: true, force: true });
  }
});

for (const closeMode of ['accepted', 'ignored', 'deny-release']) test(`built Cockpit close: ${closeMode} (synthetic host)`, async ({ page }) => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-sdk-trace-browser-')), f = fixture(), before = treeBytes(f.root);
  const ui = readCockpitUiBuild(), session = createCockpitSessionService(f.root);
  const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition, i) => ({ name: definition.name, definition,
    parse: value => parseCockpitArguments(value, i === 0), execute: (value, signal) => i === 0 ? session.render(value) : session.read(value, signal) }));
  const runtime = { ...createTestRuntime(), mode: 'cockpit', definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2,
    ui: { uri: ui.manifest.uri, mimeType: ui.manifest.mime_type, limit: 4 * 1024 ** 2, directory: pathToFileURL(ui.root + '/') },
    trustedContext: { surface: 'codex', expectedVersion: 'synthetic-test', provenanceStatus: 'matched' },
    serialize: JSON.stringify, failure: session.failure, close: session.close };
  const sdkServer = buildAgdfServer({ runtime }), client = new Client({ name: 'synthetic-browser', version: '1' }, {
    capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [ui.manifest.mime_type] } } },
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  let server;
  const trace = [];
  page.on('console', message => { if (message.text().startsWith('AGDF_SDK_TRACE ')) trace.push(JSON.parse(message.text().slice(15))); });
  try {
    await sdkServer.connect(b); await client.connect(a);
    const prepared = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: 'fixture-a' } });
    const provider = prepared._meta['agdf/provider'];
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./sdk-trace-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022', minify: false } });
    server = createServer(async (req, res) => {
      try {
        if (req.url === '/tool' && req.method === 'POST') {
          const buffers = []; for await (const bytes of req) buffers.push(bytes);
          res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(await client.callTool(JSON.parse(Buffer.concat(buffers).toString())))); return;
        }
        if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
        const bytes = req.url === '/cockpit.html?diagnostics=1' ? ui.files['cockpit.html'] : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
          : '<!doctype html><iframe title="Synthetic Cockpit" style="width:100%;height:1400px"></iframe><script type="module" src="/host.js"></script>';
        res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html'); res.end(bytes);
      } catch { res.statusCode = 500; res.end('synthetic_tool_failed'); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await page.goto('http://127.0.0.1:' + server.address().port + '/?closeMode=' + closeMode);
    const frame = page.frameLocator('iframe');
    await frame.getByText('Host-Verbindung prüfen', { exact: true }).click();
    expect(trace).toHaveLength(0);
    await frame.getByRole('button', { name: 'SDK-Nachweis aufzeichnen' }).click();
    await expect(frame.getByLabel('SDK-Nachrichten dieser Ansicht')).toContainText('ui/initialize');
    await frame.getByRole('button', { name: 'Alle Vorhaben', exact: true }).first().click();
    await expect(frame.getByRole('region', { name: 'Vorhaben · Runs' })).toBeVisible();
    if (closeMode === 'accepted') {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await expect(frame.locator('button[data-focus-id="fixture-a"]')).toBeVisible();
        await page.screenshot({ path: evidencePath(`built-mcp-run-overview-${width}.png`), fullPage: true });
      }
      const lifecycle = frame.getByRole('combobox', { name: 'Lifecycle' });
      await lifecycle.click();
      await frame.getByRole('option', { name: 'Abgeschlossen' }).click();
      await expect(frame.locator('button[data-focus-id="fixture-completed"]')).toBeVisible();
      await lifecycle.click();
      await frame.getByRole('option', { name: 'Aktiv' }).click();
      await frame.getByRole('searchbox').fill('fixture-a');
    }
    await frame.locator('button[data-focus-id="fixture-a"]').click();
    await frame.getByRole('button', { name: 'Entwurf ansehen: Anforderungen', exact: true }).click();
    await expect(frame.getByRole('button', { name: /Zurück zur (Übersicht|Statuskarte)/ })).toBeVisible();
    await frame.getByRole('button', { name: 'Verknüpfter Kontext ansehen', exact: true }).click();
    await expect(frame.getByRole('button', { name: 'Kontext übergeben', exact: true })).toBeEnabled();
    await frame.getByRole('button', { name: 'Kontext übergeben', exact: true }).click();
    await expect(frame.getByText('Kontext vom Host bestätigt. Die Frage wurde noch nicht gesendet.', { exact: true })).toBeVisible();
    await frame.getByRole('button', { name: 'Sitzung beenden und Host schließen lassen', exact: true }).click();
    if (closeMode === 'deny-release') {
      await expect(frame.getByText('Die Bereinigung ist nicht bestätigt. Die Ansicht bleibt gesperrt; der Host wurde nicht um das Ausblenden gebeten.', { exact: true })).toBeVisible();
      expect(trace.some(row => row.direction === 'out' && row.message?.method === 'ui/notifications/request-teardown')).toBe(false);
      expect(trace.some(row => row.message?.params?.arguments?.operation === 'close')).toBe(false);
      expect(treeBytes(f.root)).toEqual(before);
      return;
    }
    await expect.poll(() => trace.some(row => row.direction === 'out' && row.message?.method === 'ui/notifications/request-teardown')).toBe(true);
    if (closeMode === 'accepted') {
      await expect.poll(() => trace.some(row => row.direction === 'in' && row.message?.method === 'ui/resource-teardown')).toBe(true);
      const teardown = trace.find(row => row.direction === 'in' && row.message?.method === 'ui/resource-teardown');
      await expect.poll(() => trace.some(row => row.direction === 'out' && row.message?.id === teardown.message.id && row.message?.result)).toBe(true);
    } else {
      await expect(frame.getByText('Kontextbereinigung und Sitzungsende sind bestätigt. Der Host kann diese Karte weiter anzeigen.', { exact: true })).toBeVisible();
      expect(trace.some(row => row.direction === 'in' && row.message?.method === 'ui/resource-teardown')).toBe(false);
    }
    const replies = trace.filter(row => row.direction === 'in' && row.message?.result?._meta?.['agdf/provider']);
    expect(replies.length).toBeGreaterThan(1);
    for (const row of replies) expect(row.message.result._meta['agdf/provider']).toEqual(provider);
    expect(replies.some(row => row.message.result.structuredContent?.data?.closed === true)).toBe(true);
    const closed = await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: prepared._meta.agdf_cockpit.session_id } });
    expect(closed.structuredContent.code).toBe('session_expired');
    const published = trace.filter(row => row.direction === 'out' && row.message?.method === 'ui/update-model-context');
    expect(published).toHaveLength(2);
    expect(published[0].message.params.structuredContent.context_id).toBeTruthy();
    expect(published[1].message.params.structuredContent.kind).toBe('agdf_cockpit_invalid_selection');
    const operations = trace.filter(row => row.direction === 'out' && row.message?.method === 'tools/call');
    const closing = operations.find(row => row.message.params.arguments?.operation === 'close');
    const completion = operations.find(row => row.message.params.arguments?.operation === 'complete_context_invalidation');
    expect(completion).toBeTruthy(); expect(closing).toBeTruthy();
    expect(completion.sequence).toBeLessThan(closing.sequence);
    expect(operations.filter(row => row.message.params.arguments?.operation === 'close')).toHaveLength(1);
    const hostRequest = trace.find(row => row.direction === 'out' && row.message?.method === 'ui/notifications/request-teardown');
    expect(closing.sequence).toBeLessThan(hostRequest.sequence);
    expect(await page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'context-ack').length)).toBe(2);
    expect(await page.evaluate(() => window.sdkTraceHarness.logs.length)).toBeGreaterThan(0);
    expect(treeBytes(f.root)).toEqual(before);
    writeFileSync(evidencePath(`cockpit-sdk-trace-browser-${closeMode}.json`), JSON.stringify({ evidence_class: 'built_ui_real_sdk_core_synthetic_host', native_qualified: false,
      authorizes: false, ui: ui.manifest, provider, trace }, null, 2));
  } finally {
    writeFileSync(evidencePath(`cockpit-sdk-trace-attempt-${closeMode}.json`), JSON.stringify({
      evidence_class: 'built_ui_real_sdk_core_synthetic_host_attempt', native_qualified: false, ui: ui.manifest, trace,
      host: await page.evaluate(() => window.sdkTraceHarness?.logs ?? []).catch(() => []),
      frame_text: await page.frameLocator('iframe').locator('body').innerText({ timeout: 1000 }).catch(() => null),
    }, null, 2));
    // The rejected-close case intentionally leaves its Core session open.
    // End the fixture before awaiting HTTP shutdown so long polls can finish.
    await sdkServer.closeAgdfRuntime();
    if (server) await new Promise(resolve => server.close(resolve));
    await client.close(); await sdkServer.close(); f.close(); rmSync(temporary, { recursive: true, force: true });
  }
});

test('MCP negative read retains correction; blocked run remains a successful view (synthetic SDK host)', async ({ page }) => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-mcp-error-browser-')), f = fixture(), before = treeBytes(f.root);
  f.register('PRD', '.agdf/control/artefacts/fixture-a/MISSING.md');
  const protectedBefore = treeBytes(f.root);
  const ui = readCockpitUiBuild(), session = createCockpitSessionService(f.root);
  let deny = false, server;
  const replies = [];
  const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition, i) => ({ name: definition.name, definition,
    parse: value => parseCockpitArguments(value, i === 0), execute: (value, signal) => deny && value.operation === 'document'
      ? session.failure('source_changed') : i === 0 ? session.render(value) : session.read(value, signal) }));
  const runtime = { ...createTestRuntime(), mode: 'cockpit', definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2,
    ui: { uri: ui.manifest.uri, mimeType: ui.manifest.mime_type, limit: 4 * 1024 ** 2, directory: pathToFileURL(ui.root + '/') },
    serialize: JSON.stringify, failure: session.failure, close: session.close };
  const sdkServer = buildAgdfServer({ runtime }), client = new Client({ name: 'synthetic-errors', version: '1' }, {
    capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [ui.manifest.mime_type] } } },
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try {
    await sdkServer.connect(b); await client.connect(a);
    const prepared = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: 'fixture-a' } });
    expect(prepared.isError).toBeUndefined(); expect(prepared._meta.agdf_cockpit.session_id).toBeTruthy();
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./sdk-trace-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022', minify: false } });
    server = createServer(async (req, res) => {
      if (req.url === '/tool') {
        const buffers = []; for await (const bytes of req) buffers.push(bytes);
        const input = JSON.parse(Buffer.concat(buffers).toString()), result = await client.callTool(input); replies.push({ input, result });
        res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
      }
      if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
      res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html');
      res.end(req.url === '/cockpit.html' ? ui.files['cockpit.html'] : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
        : '<!doctype html><iframe title="Synthetic Cockpit" style="width:100%;height:1400px"></iframe><script type="module" src="/host.js"></script>');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await page.goto('http://127.0.0.1:' + server.address().port);
    const frame = page.frameLocator('iframe');
    await frame.locator('.work-step-details > summary').click();
    await expect(frame.getByRole('button', { name: 'Stand des Vorhabens öffnen', exact: true })).toBeVisible();
    const run = replies.find(row => row.input.arguments.operation === 'snapshot').result;
    expect(run.isError).toBeUndefined(); expect(run.structuredContent.data.run.evaluation.blocking_reason).not.toBe('none');
    expect(run.structuredContent.data.run.document_states.some(row => row.source_state === 'missing')).toBe(true);
    await expect(frame.getByText('Dokument nicht verfügbar.', { exact: true })).toBeVisible();
    await page.screenshot({ path: evidencePath('mcp-cockpit-blocked-run.png'), fullPage: true });
    deny = true;
    await frame.getByRole('button', { name: 'Stand des Vorhabens öffnen', exact: true }).click();
    await expect(frame.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.', { exact: true })).toBeVisible();
    const negative = replies.findLast(row => row.input.arguments.operation === 'document').result;
    expect(negative.isError).toBe(true); expect(negative.content).toHaveLength(2); expect(negative.structuredContent.code).toBe('source_changed');
    await page.screenshot({ path: evidencePath('mcp-cockpit-read-error.png'), fullPage: true });
    expect(treeBytes(f.root)).toEqual(protectedBefore);
  } finally {
    // Finish session long polls before closing their SDK connection, as in the
    // adjacent close scenarios; a read still in flight must be able to settle.
    await sdkServer.closeAgdfRuntime();
    if (server) await new Promise(resolve => server.close(resolve));
    await client.close(); await sdkServer.close(); f.close(); rmSync(temporary, { recursive: true, force: true });
  }
});
