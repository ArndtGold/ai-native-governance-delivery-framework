import { test, expect, chromium } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
import { COCKPIT_RENDER_DEFINITION, COCKPIT_PLUGIN_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_CONTINUATION_DEFINITION,
  parseCockpitArguments, parseCockpitContinuationArguments, parsePluginCockpitArguments } from '../../../core/lib/control-inspect/cockpit-contract.js';
import { createCompanionJournal, journalPath } from '../../../core/lib/companion/journal.js';
import { createCodexContinuationAdmission } from '../../../core/lib/companion/codex-continuation.js';
import { readCockpitUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';
import { evidencePath } from './server-fixture.mjs';
import { JSDOM } from 'jsdom';
import { clarifiedUr } from '../../../core/test/planned-fixtures.js';

// Optional retained design input. The normal repository suite needs no private Run.
// This uses the same Core/SDK/built-UI harness, never another product renderer.
const referenceDirectory = process.env.AGDF_COMPANION_REFERENCE_DIR;
const checkBrowserZoom = process.env.AGDF_COMPANION_BROWSER_ZOOM === '1';

test('Companion keyboard click sends one bound request and reopens pending (synthetic SDK host)', async ({ page }) => {
  const cleanups = [];
  const fixture = buildCompanionFixtures({ after: fn => cleanups.push(fn) }, ['F04'])[0];
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-companion-continuation-browser-'));
  const ui = readCockpitUiBuild();
  const session = createCockpitSessionService(undefined, { integrationSurface: 'codex', pluginMode: true,
    continuationQualified: true, companionDataRoot: temporary });
  const tools = [
    [COCKPIT_PLUGIN_RENDER_DEFINITION, parsePluginCockpitArguments, session.render],
    [COCKPIT_READ_DEFINITION, parseCockpitArguments, session.read],
    [COCKPIT_CONTINUATION_DEFINITION, parseCockpitContinuationArguments, session.continue],
  ].map(([definition, parse, execute]) => ({ name: definition.name, definition, parse: value => parse(value), execute }));
  const runtime = { ...createTestRuntime(), mode: 'cockpit', definition: COCKPIT_PLUGIN_RENDER_DEFINITION, tools,
    uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2, ui: {
      uri: ui.manifest.uri, mimeType: ui.manifest.mime_type, limit: 4 * 1024 ** 2, directory: pathToFileURL(ui.root + '/'),
    }, serialize: JSON.stringify, failure: session.failure, close: session.close };
  const sdkServer = buildAgdfServer({ runtime });
  const client = new Client({ name: 'synthetic-continuation-companion', version: '1' },
    { capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [ui.manifest.mime_type] } } } });
  const [a, b] = InMemoryTransport.createLinkedPair();
  let server, prepared;
  const sent = [];
  const open = async () => client.callTool({ name: 'agdf_cockpit', arguments: {
    working_directory: fixture.root, primary_target: fixture.root, target_source: 'explicit_target', run_id: fixture.runId,
  } });
  try {
    await sdkServer.connect(b);
    await client.connect(a);
    prepared = await open();
    const targetId = prepared.structuredContent.target.target_id;
    expect(prepared._meta.agdf_cockpit.continuation).toBe(true);
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./sdk-trace-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022' } });
    server = createServer(async (req, res) => {
      try {
        if (req.url === '/tool') {
          const chunks = [];
          for await (const data of req) chunks.push(data);
          const input = JSON.parse(Buffer.concat(chunks).toString());
          const result = await client.callTool(input);
          if (input.name === 'agdf_cockpit_continue' && result.structuredContent?.send === true) sent.push(result.structuredContent);
          res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
        }
        if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
        res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html');
        res.end(req.url === '/cockpit.html' ? ui.files['cockpit.html'] : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
          : '<!doctype html><style>body{margin:0}iframe{display:block;width:100%;height:100vh;border:0}</style><iframe title="Synthetic Cockpit"></iframe><script type="module" src="/host.js"></script>');
      } catch { res.statusCode = 500; res.end('synthetic_tool_failed'); }
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(`http://127.0.0.1:${server.address().port}/?companion=inline&continuation=withhold`);
    const card = page.frameLocator('iframe').getByRole('article', { name: 'Companion-Statuskarte' });
    const button = card.getByRole('button', { name: 'Run fortsetzen' });
    await expect(button).toBeVisible();
    await expect(card.locator('.companion-turn').getByRole('button', { name: 'Run fortsetzen' })).toHaveCount(1);
    await expect(button).toHaveAccessibleDescription(await card.locator('.companion-turn > p[id]').innerText());
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(card.getByText('Die Bestätigung von Codex steht noch aus.')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'continuation-message').length)).toBe(1);
    const context = await page.evaluate(() => window.sdkTraceHarness.logs.find(row => row.kind === 'context-ack' && row.params.structuredContent?.agdf_companion_continuation));
    expect(sent).toHaveLength(1);
    expect(context.params.structuredContent.agdf_companion_continuation.call.arguments).toMatchObject({ run_id: fixture.runId,
      continuation_attempt_id: sent[0].attempt_id });
    expect(createCodexContinuationAdmission(temporary).inspect({ target_id: targetId, run_id: fixture.runId }).state).toBe('pending');
    prepared = await open();
    await page.reload();
    await expect(card.getByText('Die Bestätigung von Codex steht noch aus.')).toBeVisible();
    await expect(button).toHaveCount(0);
    await card.getByRole('button', { name: 'Übergabe prüfen' }).click();
    await expect(card.getByText('Der Begleiter hat den Status geprüft.', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => window.sdkTraceHarness.logs.some(row => row.kind === 'continuation-message'))).toBe(false);
    expect(sent).toHaveLength(1);
  } finally {
    await client.close(); await sdkServer.close();
    if (server) await new Promise(resolve => server.close(resolve));
    rmSync(temporary, { recursive: true, force: true });
    for (const cleanup of cleanups.reverse()) cleanup();
  }
});

async function launchZoomBrowser(temporary) {
  const extension = join(temporary, 'browser-zoom');
  mkdirSync(extension);
  writeFileSync(join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3,
    name: 'Local Companion zoom test', version: '1.0', permissions: ['tabs'], background: { service_worker: 'zoom.js' } }));
  writeFileSync(join(extension, 'zoom.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  return chromium.launchPersistentContext(join(temporary, 'browser-profile'), {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
}

function referenceFixture(cleanups) {
  const doc = new JSDOM(readFileSync(join(referenceDirectory, 'index.html'), 'utf8')).window.document;
  const title = doc.querySelector('[data-run-heading]').textContent;
  const goal = doc.querySelector('.run-goal').textContent;
  const markdown = [...doc.querySelector('[data-prd]').children].map(el => {
    if (/^H[1-6]$/.test(el.tagName)) return '#'.repeat(Number(el.tagName[1])) + ' ' + el.textContent;
    if (el.matches('ul, ol')) return [...el.children].map((li, i) => (el.tagName === 'UL' ? '- ' : `${i + 1}. `) + li.textContent).join('\n');
    if (el.classList.contains('doc-meta')) return [...el.children].map(row => row.textContent).join('  \n');
    return el.textContent;
  }).join('\n\n') + `

Owner: Synthetic visual author
Traceability contract: criteria-chain-v1

## Acceptance Criteria
- criterion_id: AC-001
- requirement: Preserve the complete reference sample as Markdown in the existing reader.
- observable_success: The sample title, paragraphs and lists are visible beside the current Companion.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Synthetic sample ownership | before_prd | resolved | Disposable visual reference only | Test author |

## AGDF Approval Summary (de; source=en)
- Ziel: Den Entwurf zusammen mit dem Companion lesen.
- Umfang: Rein synthetische visuelle Prüfung.
- AC-001: Der vollständige Beispieltext bleibt im bestehenden Markdown-Leser erhalten.
- Entscheidungen: Beispieldaten im isolierten Test; keine menschliche Abnahme.
`;
  const writer = currentFixture({ after: callback => cleanups.push(callback) });
  const run = currentRun(writer, goal);
  const check = result => expect(result.outcome).toBe('accepted');
  check(run.step('ur', clarifiedUr.replace('Independent work', title).replace('Preserve one explicit intent.', goal), { title }));
  check(run.approve('UR'));
  check(run.step('route', '# Brownfield Review\n\nSynthetic reading sample.\n- ux_intent_definition_required: no\n', { route: 'structured_slice', reason: 'Disposable reference fixture' }));
  check(run.record('PRD', markdown));
  return { root: writer.root, runId: run.id, markdown, title, goal };
}

for (const surface of ['inline', 'panel', ...(referenceDirectory ? ['reference'] : [])]) test(`built Codex Companion opens a registered PRD and restores the compact card from ${surface} (synthetic SDK host)`, async ({ page: defaultPage }) => {
  test.setTimeout(180_000);
  const cleanups = [];
  const fixture = surface === 'reference' ? referenceFixture(cleanups) : buildCompanionFixtures({ after: callback => cleanups.push(callback) }, ['F03'])[0];
  const writer = currentFixture({ after: callback => cleanups.push(callback) }, { root: fixture.root, initialize: false });
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-companion-browser-'));
  const ui = readCockpitUiBuild(), session = createCockpitSessionService(fixture.root, { integrationSurface: 'codex', companionDataRoot: temporary });
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
  let server, zoomContext;
  let page = defaultPage;
  let supersedeBeforeDocument, supersededDocumentCode;
  let documentRequests = 0, subjectCaptures = 0;
  const before = treeBytes(fixture.root);
  try {
    if (checkBrowserZoom && surface === 'panel') {
      zoomContext = await launchZoomBrowser(temporary);
      page = zoomContext.pages()[0];
    }
    await sdkServer.connect(b);
    await client.connect(a);
    let prepared = await client.callTool({ name: 'agdf_cockpit', arguments: {
      run_id: fixture.runId, ...(surface === 'panel' ? { view: 'companion' } : {}),
    } });
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
          const request = JSON.parse(Buffer.concat(chunks).toString());
          const { operation, session_id, run_id } = request.arguments ?? {};
          if (operation === 'document') documentRequests++;
          const supersede = operation === 'document' && session_id === supersedeBeforeDocument && !!session_id;
          if (supersede) {
            supersedeBeforeDocument = undefined;
            // A parallel host view has already selected the same Run again.
            await session.read({ operation: 'snapshot', session_id, run_id });
          }
          const result = await client.callTool(request);
          if (operation === 'snapshot' && run_id === fixture.runId && result.structuredContent?.data?.run) subjectCaptures++;
          if (supersede) supersededDocumentCode = result.structuredContent?.code;
          res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
        }
        if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
        if (surface === 'reference' && ['/reference.html', '/base.css'].includes(req.url)) {
          res.setHeader('content-type', req.url === '/base.css' ? 'text/css' : 'text/html');
          res.end(readFileSync(join(referenceDirectory, req.url === '/base.css' ? 'base.css' : 'index.html'))); return;
        }
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
    if (surface === 'reference') {
      const reference = await page.context().newPage();
      const metrics = [];
      try {
        await reference.emulateMedia({ reducedMotion: 'reduce' });
        await reference.goto(`http://127.0.0.1:${server.address().port}/reference.html`);
        const layout = frame.locator('.companion-workspace');
        const refLayout = reference.locator('#companion-document-demo .workspace');
        const measure = async (locator, selectors) => locator.evaluate((root, selectors) => Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
          const el = root.querySelector(selector), css = getComputedStyle(el), box = el.getBoundingClientRect();
          return [name, { text: el.textContent.trim(), width: box.width, height: box.height, font: css.fontFamily, size: css.fontSize,
            lineHeight: css.lineHeight, color: css.color, background: css.backgroundColor, padding: css.padding, gap: css.gap }];
        })), selectors);
        for (const width of [1360, 360]) for (const theme of ['light', 'dark']) {
          const inset = await layout.evaluate(el => innerWidth - el.getBoundingClientRect().width);
          await page.setViewportSize({ width: Math.round(width + inset), height: 900 });
          const refInset = await refLayout.evaluate(el => innerWidth - el.getBoundingClientRect().width);
          await reference.setViewportSize({ width: Math.round(width + refInset), height: 900 });
          await reference.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
          const chrome = await layout.evaluate(el => el.closest('.compact-cockpit').getBoundingClientRect().height - el.getBoundingClientRect().height);
          await page.evaluate(({ theme, height }) => window.sdkTraceHarness.setContext({ theme, containerDimensions: { height } }), { theme, height: 704 + chrome });
          await expect(layout).toHaveAttribute('data-wide', String(width >= 850));
          await expect.poll(() => layout.evaluate(el => el.getBoundingClientRect().height)).toBe(704);
          if (width < 850) {
            if (await frame.getByRole('button', { name: 'Zurück zum Companion' }).count()) await frame.getByRole('button', { name: 'Zurück zum Companion' }).click();
            if (await reference.locator('[data-close]').isVisible()) await reference.locator('[data-close]').click();
            await expect(source).toBeVisible();
            await expect(source).toBeEnabled();
            await expect(card.getByText('Du bist dran', { exact: true })).toBeVisible();
            await layout.screenshot({ path: evidencePath(`matched-product-${width}-${theme}-card.png`) });
            await refLayout.screenshot({ path: evidencePath(`matched-reference-${width}-${theme}-card.png`) });
            await source.click(); await reference.locator('[data-open]').click();
          }
          await expect(frame.getByRole('article', { name: 'Originaldokument' }).getByRole('heading', { name: 'PRD: Entwürfe direkt im Companion lesen' })).toBeVisible();
          await expect(frame.getByRole('region', { name: 'Entwurf lesen' })).toHaveAttribute('aria-busy', 'false');
          await expect(frame.getByText('Aktueller Stand nicht bestätigt.')).toHaveCount(0);
          await expect(frame.getByText('Überarbeitung nötig', { exact: false })).toHaveCount(0);
          await expect(source).toHaveCount(0);
          await frame.locator('.companion-reader-scroll').evaluate(el => { el.scrollTop = 0; });
          await reference.locator('[data-scroller]').evaluate(el => { el.scrollTop = 0; });
          await frame.locator('body').evaluate(() => document.activeElement?.blur());
          await reference.locator('body').evaluate(() => document.activeElement?.blur());
          await layout.screenshot({ path: evidencePath(`matched-product-${width}-${theme}.png`) });
          await refLayout.screenshot({ path: evidencePath(`matched-reference-${width}-${theme}.png`) });
          const product = await measure(layout, { title: '.document h1', section: '.document h2', paragraph: '.document > p', cardTitle: '.companion-card h2', turn: '.companion-turn > strong', phases: '.companion-gates', footer: '.companion-footer' });
          const original = await measure(refLayout, { title: '.document h1', section: '.document h2', paragraph: '.document > p', cardTitle: '.run-title', turn: '.turn-line', phases: '.gates', footer: '.companion-footer' });
          for (const key of ['cardTitle', 'turn']) {
            expect(product[key].size, `${key} size`).toBe(original[key].size);
            expect(product[key].lineHeight, `${key} line height`).toBe(original[key].lineHeight);
          }
          expect(product.title.text).toBe(original.title.text);
          expect(product.cardTitle.text).toBe(original.cardTitle.text);
          metrics.push({ width, theme, product, reference: original });
        }
        writeFileSync(evidencePath('matched-metrics.json'), JSON.stringify({ source: fixture.markdown, metrics,
          integrationDifferences: ['Canonical readiness decision table retained after sample; metadata stays Markdown, not the illustrative grid.', 'Original F1 header, complete phases, actual source revision and compact accessible menu retained.', 'Draft typography scales with reader width.'] }, null, 2));
      } finally { await reference.close(); }
      return;
    }
    await expect(card.getByText('Du bist dran')).toBeVisible();
    await expect(card.locator('.companion-figure-block .companion-signal')).toHaveText('Das Vorhaben ist in der Phase „Produktanforderungen“.');
    await expect(card.locator('.companion-signal')).toBeVisible();
    const section = frame.getByRole('region', { name: 'AGDF Cockpit', exact: true });
    await expect.poll(() => section.evaluate(el => {
      const left = el.getBoundingClientRect().left;
      const column = el.querySelector('.companion-column').getBoundingClientRect().left;
      const heading = el.querySelector('.companion-card h2').getBoundingClientRect().left;
      const menu = el.querySelector('.companion-menu-trigger').getBoundingClientRect().left;
      return { edge: column - left, textInset: heading - column, menuInset: menu - column };
    })).toEqual({ edge: 1, textInset: 26, menuInset: 16 });
    if (surface === 'panel') {
      for (const height of [1392, 820]) {
        await page.setViewportSize({ width: 360, height });
        await expect.poll(() => section.evaluate(el => {
          const bottom = el.querySelector('footer').getBoundingClientRect().bottom;
          return Math.abs(el.ownerDocument.defaultView.innerHeight - bottom);
        })).toBeLessThanOrEqual(1);
        await expect.poll(async () => Math.round((await section.boundingBox()).height)).toBe(height);
      }
    } else {
      await expect.poll(async () => Math.round((await section.boundingBox()).height)).toBe(760);
    }
    await expect(frame.getByText('Host-Verbindung prüfen', { exact: true })).toHaveCount(0);
    await expect.poll(display).toMatchObject({ state: 'ui_reported_visible', run_id: fixture.runId, presentation: {
      title: await card.getByRole('heading', { level: 2 }).innerText(),
      status: 'Das Vorhaben ist in der Phase „Produktanforderungen“.', gate: 'PRD', gate_state: 'current',
    } });
    await expect(frame.getByRole('button', { name: 'Alle Vorhaben', exact: true })).toHaveCount(0);
    const gateSummary = card.getByRole('list', { name: 'Gate-Fortschritt' });
    const gateSummaryLabels = ['UR Abgeschlossen', 'PRD Aktuell', 'SD Danach'];
    await expect(gateSummary.locator('[aria-current="step"]')).toContainText('PRD');
    const pitStop = card.getByText('Boxenstopp 2 von 8', { exact: true });
    await expect(pitStop).toBeVisible();
    const readingOrder = await card.evaluate(el => Array.from(el.querySelectorAll(
      '.companion-signal, h2, .companion-goal, .companion-turn > strong, .companion-turn > .companion-source, .companion-turn > .compact-muted, .companion-pit-stop, .companion-gates, summary',
    )).map(element => element.className || element.tagName));
    expect(readingOrder).toEqual(['companion-signal', 'H2', 'companion-goal', 'STRONG', 'companion-source',
      'compact-muted', 'companion-pit-stop', 'companion-gates', 'SUMMARY']);
    await expect(gateSummary.getByRole('listitem')).toHaveText(gateSummaryLabels);
    const fullPath = card.getByRole('list', { name: 'Vollständige Gate-Reihenfolge' });
    await expect(fullPath).toBeHidden();
    expect(await card.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= el.ownerDocument.defaultView.innerWidth)).toBe(true);
    await page.screenshot({ path: evidencePath(`codex-companion-${surface}-360.png`), fullPage: true });
    const details = card.getByText('ⓘ Details', { exact: true });
    await details.focus(); await details.press('Enter');
    await expect(fullPath.getByRole('listitem')).toHaveText(['UR Abgeschlossen', 'PRD Aktuell', 'SD Offen', 'TP Offen', 'CD+Tests Offen', 'QA Offen', 'UAT Offen', 'OR Offen']);
    await expect(card.getByText('Warum halten wir die Produktanforderungen fest?', { exact: true })).toBeVisible();
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
    await expect(frame.getByRole('button', { name: 'Zurück zum Companion' })).toBeVisible();
    await expect(frame.locator('.companion-reader')).toBeVisible();
    const openedDraft = frame.getByRole('article', { name: 'Originaldokument' });
    const openedTitle = openedDraft.getByRole('heading', { name: 'PRD: Synthetic saved filter', exact: true });
    await expect(openedTitle).toBeVisible();
    const readerLabel = frame.getByRole('heading', { name: 'Produktanforderungen · Entwurf', exact: true });
    await expect(readerLabel).toHaveCSS('font-size', '13px');
    await expect(readerLabel.locator('svg[aria-hidden="true"]')).toBeVisible();
    await expect(readerLabel.locator('.reader-draft-label')).toHaveCSS('display', 'inline');
    await expect(readerLabel.locator('.reader-label-divider')).toBeVisible();
    await expect(openedDraft.locator('p').first()).toHaveCSS('font-size', '15px');
    await expect(openedTitle).toHaveCSS('font-size', '24px');
    const sectionHeading = openedDraft.getByRole('heading', { name: 'Product Scope', exact: true });
    const bodyColor = await openedDraft.evaluate(el => getComputedStyle(el).color);
    await expect(sectionHeading).toHaveCSS('color', bodyColor);
    await expect(sectionHeading).toHaveCSS('border-bottom-width', '0px');
    await expect(openedTitle).not.toHaveCSS('color', bodyColor);
    await expect(openedTitle).toHaveCSS('border-bottom-width', '1px');
    await page.screenshot({ path: evidencePath(`companion-reader-${surface}-360.png`), fullPage: true });
    await frame.getByRole('button', { name: 'Zurück zum Companion' }).click();
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
      await frame.getByRole('button', { name: 'Zurück zum Companion' }).click();
      await expect(source).toBeFocused();
      await menu.press('Enter');
      await expect(sound).toHaveAttribute('aria-checked', 'true');
      await reload.click();
      await expect(source).toBeEnabled();
      expect(await starts()).toBe(index + 1);
      expect(treeBytes(fixture.root)).toEqual(afterUpdate);
    }
    expect(await page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'display-mode-request'))).toEqual([]);
    await expect(frame.getByRole('navigation', { name: 'Aktive Runs' })).toHaveCount(0);
    const otherRun = currentRun(writer, 'Zweiter Test-Run');
    currentRun(writer, 'Dritter Test-Run');
    await menu.press('Enter');
    await reload.click();
    const navigation = frame.getByRole('navigation', { name: 'Aktive Runs' });
    await expect(navigation.getByText('aktive Runs', { exact: true })).toBeVisible();
    await expect(navigation).toContainText('3 von 3');
    const nextRun = navigation.getByRole('button', { name: 'Nächster Run' });
    await expect(nextRun).toBeEnabled();
    await nextRun.click();
    await expect(navigation).toContainText('1 von 3');
    await expect(card.getByRole('heading', { name: 'Dritter Test-Run' })).toBeVisible();
    await expect(nextRun).toBeFocused();
    const time = frame.locator('.companion-footer time');
    const menuLabel = menu.locator('.companion-menu-label');
    for (const width of [520, 360, 320]) {
      await page.setViewportSize({ width, height: 820 });
      await expect(time).toBeVisible();
      if (surface === 'inline' && width === 520) {
        await expect(menuLabel).toBeVisible();
        await expect(menuLabel.locator('.companion-menu-chevron')).toBeVisible();
      } else await expect(menuLabel).toBeHidden();
      // ResizeObserver and host size notifications settle asynchronously. Measure
      // the complete footer in one layout, not three different animation frames.
      await expect.poll(() => frame.locator('.companion-footer').evaluate(el => {
        const menu = el.querySelector('.companion-menu-trigger').getBoundingClientRect();
        const nav = el.querySelector('nav').getBoundingClientRect();
        const time = el.querySelector('time').getBoundingClientRect();
        const footer = el.getBoundingClientRect();
        const card = el.closest('.compact-cockpit').getBoundingClientRect();
        return el.ownerDocument.documentElement.scrollWidth <= innerWidth && menu.right < nav.left && nav.right < time.left
          && Math.abs(nav.left + nav.width / 2 - (card.left + card.width / 2)) < 1
          && Math.abs(footer.bottom - (card.bottom - 1)) < 1
          && Math.abs(nav.y - menu.y) < 2 && menu.width >= 44 && menu.height >= 44
          && [...el.querySelectorAll('nav button')].every(button => button.getBoundingClientRect().width >= 44);
      })).toBe(true);
    }
    if (surface === 'inline') await page.screenshot({ path: evidencePath('companion-footer-320.png'), fullPage: true });
    await menu.press('Enter');
    await options.getByRole('menuitem', { name: 'Zurück zum Chat-Run' }).click();
    await expect(navigation).toContainText('3 von 3');
    await expect(source).toBeEnabled();
    expect(await starts()).toBe(2);
    if (surface === 'inline') {
      // The same built UI/session now exercises the composed reader, never a mock.
      await menu.click(); await sound.click();
      const appendix = '\n\n## FIRST-READER-MARKER\n\n'
        + '| Gate | Ergebnis |\n| --- | --- |\n| QA | Pass |\n\n'
        + Array.from({ length: 30 }, (_, i) => `### Abschnitt ${i + 1}\n\n` + 'Lesetext zur Quelle und Entscheidung.\n\n'.repeat(5)).join('\n\n')
        + '\n\n- Ebene eins\n  - Ebene zwei\n\n| Sehr breite Tabelle | Wert |\n| --- | --- |\n| ' + 'Zelle'.repeat(90) + ' | Ende |\n\n```text\n' + 'original-code-'.repeat(120) + '\n```\n\n'
        + '[Externe Quelle](https://example.invalid/passiv)\n\n![Passives Bild](https://example.invalid/image.png)\n\n<div>Passives HTML</div>\n\n## LAST-READER-MARKER\n\nVollständiges Ende.\n';
      replaceCompanionPrd(writer, fixture.runId, 'Langer Entwurf', appendix);
      await menu.press('Enter'); await expect(reload).toBeEnabled(); await reload.press('Enter');
      await expect(options).toBeHidden();
      await expect(source).not.toHaveAttribute('aria-disabled', 'true');
      const layout = frame.locator('.companion-workspace');
      const inset = await layout.evaluate(el => innerWidth - el.getBoundingClientRect().width);
      // At the same width, the inline card fills its container while the
      // expanded host keeps the standalone Companion compact.
      await page.setViewportSize({ width: 500, height: 820 });
      const column = frame.locator('.companion-column');
      await expect.poll(async () => (await section.boundingBox()).width).toBe(500);
      await expect.poll(async () => (await column.boundingBox()).width).toBe(500 - inset);
      const rightInset = () => column.evaluate(el => el.closest('.compact-cockpit').getBoundingClientRect().right - el.getBoundingClientRect().right);
      await expect.poll(rightInset).toBe(1);
      await page.evaluate(() => window.sdkTraceHarness.setContext({ displayMode: 'fullscreen' }));
      await expect.poll(async () => (await section.boundingBox()).width).toBe(362);
      await expect.poll(async () => (await column.boundingBox()).width).toBe(360);
      await page.evaluate(() => window.sdkTraceHarness.setContext({ displayMode: 'inline' }));
      await expect.poll(async () => (await section.boundingBox()).width).toBe(500);
      await expect.poll(async () => (await column.boundingBox()).width).toBe(500 - inset);
      await page.screenshot({ path: evidencePath('companion-chat-500-closed.png'), fullPage: true });
      await expect(options).toBeHidden();
      await source.click();
      await expect(frame.getByRole('region', { name: 'Entwurf lesen' })).toBeVisible();
      await page.setViewportSize({ width: 750, height: 820 });
      await expect.poll(async () => (await section.boundingBox()).width).toBe(750);
      const draft = frame.getByRole('article', { name: 'Originaldokument' });
      const intermediateFont = await draft.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      expect(intermediateFont).toBeGreaterThan(15);
      expect(intermediateFont).toBeLessThan(16);
      await frame.getByRole('button', { name: 'Zurück zum Companion' }).click();
      await expect(source).toBeFocused();
      await expect.poll(async () => (await column.boundingBox()).width).toBe(750 - inset);
      // The manual open/close above dismisses this decision. A new synthetic
      // decision verifies auto-open still uses the available host width.
      replaceCompanionPrd(writer, fixture.runId, 'Langer Entwurf nach Rückweg', appendix);
      await menu.click(); await reload.click();
      await expect(source).toBeEnabled();
      await page.setViewportSize({ width: 849, height: 820 });
      await expect(layout).toHaveAttribute('data-wide', 'false');
      await expect(frame.getByRole('region', { name: 'Entwurf lesen' })).toHaveCount(0);
      await source.focus();
      await page.setViewportSize({ width: 850, height: 820 });
      await expect(layout).toHaveAttribute('data-wide', 'true');
      await expect(gateSummary.getByRole('listitem')).toHaveText(gateSummaryLabels);
      await expect(pitStop).toBeVisible();
      const reader = frame.getByRole('region', { name: 'Entwurf lesen' }), content = frame.getByRole('article', { name: 'Originaldokument' });
      const scroll = frame.locator('.companion-reader-scroll'), runHeading = card.locator('[data-focus-id="companion-run-heading"]');
      const readerHeader = reader.locator('header');
      const readerTitle = readerHeader.getByRole('heading', { name: 'Produktanforderungen · Entwurf' });
      const sources = reader.locator('details.document-provenance').filter({ has: frame.getByText('Dokumentdetails', { exact: true }) });
      const revision = sources.locator('dd code').first();
      await expect(content.getByRole('heading', { name: 'FIRST-READER-MARKER' })).toBeAttached();
      expect(await content.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(15.24, 1);
      await expect(content.getByRole('heading', { name: 'LAST-READER-MARKER' })).toBeAttached();
      await expect(source).toHaveCount(0);
      await expect(card.getByRole('button', { name: 'Zum Entwurf' })).toHaveCount(0);
      await expect(runHeading).toBeFocused();
      await expect(readerTitle).toBeVisible();
      await expect(readerHeader).not.toContainText('Run-Revision');
      await expect(readerHeader).not.toContainText(await runHeading.innerText());
      await expect(sources).not.toHaveAttribute('open');
      expect(await content.getByRole('heading', { level: 1 }).evaluate(heading => heading.nextElementSibling?.textContent)).toBe('Product Scope');
      await expect(content).not.toContainText('Traceability contract');
      await expect(sources.getByText('criteria-chain-v1', { exact: true })).toHaveCount(1);
      await expect(sources.getByText('criteria-chain-v1', { exact: true })).toBeHidden();
      const events = card.getByRole('region', { name: 'Ereignisse' });
      await expect(events).toHaveCount(0);
      const journal = createCompanionJournal({ dataRoot: temporary });
      const recordApproval = run_id => journal.observe('agdf_approve', {
        primary_target: fixture.root, run_id, command: { kind: 'approval.record', payload: { gate: 'PRD' } },
      }, { outcome: 'accepted' });
      expect(recordApproval(otherRun.id)).toBe(true);
      expect(recordApproval(fixture.runId)).toBe(true);
      const refreshEvents = () => frame.locator('body').evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await refreshEvents();
      await expect(events.getByRole('listitem')).toHaveCount(1);
      await expect(events.getByRole('listitem')).toContainText('Freigabe erfasst für Produktanforderungen');
      await expect(events.locator('time')).toBeVisible();
      const journalFile = journalPath(temporary);
      const recorded = readFileSync(journalFile);
      rmSync(journalFile);
      mkdirSync(journalFile);
      await refreshEvents();
      await expect(events).toContainText('Ereignisse nicht verfügbar');
      await expect(readerTitle).toBeVisible();
      rmSync(journalFile, { recursive: true });
      writeFileSync(journalFile, recorded);
      await refreshEvents();
      await expect(events.getByRole('listitem')).toHaveCount(1);
      await expect(runHeading).toBeFocused();
      await expect(readerTitle).toBeVisible();
      const capturedRevision = await revision.textContent();
      await expect(reader.getByRole('button', { name: 'Aktuelle Fassung öffnen' })).toHaveCount(0);
      expect((await frame.locator('.companion-column').boundingBox()).width).toBeLessThanOrEqual(360);
      await expect.poll(rightInset).toBe(1);
      const original = readFileSync(join(fixture.root, '.agdf/control/runs', fixture.runId, 'documents/PRD.md'), 'utf8');
      const download = reader.locator('header').getByRole('link', { name: 'Originaldatei herunterladen' });
      const downloadHint = download.getByText('Download', { exact: true });
      await expect(downloadHint).toBeHidden();
      await download.hover();
      await expect(downloadHint).toBeVisible();
      expect(decodeURIComponent((await download.getAttribute('href')).split(',')[1])).toBe(original);
      const [saved] = await Promise.all([page.waitForEvent('download'), download.click()]);
      expect(saved.suggestedFilename()).toBe('PRD.md');
      expect(readFileSync(await saved.path(), 'utf8')).toBe(original);
      await expect(scroll.getByRole('link', { name: 'Originaldatei herunterladen' })).toHaveCount(0);
      await expect(content.locator('img, script, a')).toHaveCount(0);
      await expect(content.getByText('[Bild: Passives Bild]', { exact: true })).toBeVisible();
      if (await options.isVisible()) await options.press('Escape');
      await page.setViewportSize({ width: 1360, height: 820 });
      await expect(content).toHaveCSS('font-size', '16px');
      await expect(content.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '28px');
      const decisionTable = content.locator('.reader-table-frame').filter({ has: frame.getByRole('columnheader', { name: 'Decision', exact: true }) });
      const compactTable = content.getByRole('table').filter({ has: frame.getByRole('columnheader', { name: 'Ergebnis', exact: true }) });
      const wideTable = content.locator('.reader-table-frame').filter({ has: frame.getByRole('columnheader', { name: 'Sehr breite Tabelle' }) });
      const titleBounds = await content.getByRole('heading', { level: 1 }).boundingBox();
      const compactBounds = await compactTable.boundingBox();
      expect(compactBounds.x).toBeCloseTo(titleBounds.x, 0);
      expect(compactBounds.width).toBeCloseTo(titleBounds.width, 0);
      const wideBounds = await wideTable.boundingBox();
      const readerBounds = await scroll.boundingBox();
      expect(wideBounds.x).toBeCloseTo(titleBounds.x, 0);
      const followingHeading = content.getByRole('heading', { name: 'LAST-READER-MARKER' });
      expect((await followingHeading.boundingBox()).x).toBeCloseTo(wideBounds.x, 0);
      expect((await content.getByText('Vollständiges Ende.', { exact: true }).boundingBox()).x).toBeCloseTo(wideBounds.x, 0);
      expect(wideBounds.width).toBeGreaterThan(titleBounds.width);
      expect(wideBounds.x).toBeGreaterThan(readerBounds.x);
      expect(wideBounds.x + wideBounds.width).toBeLessThan(readerBounds.x + readerBounds.width);
      expect(await scroll.evaluate(el => el.scrollWidth - el.clientWidth)).toBe(0);
      const tableShadow = () => decisionTable.evaluate(el => getComputedStyle(el, '::after').backgroundImage);
      await expect(decisionTable).toHaveAttribute('data-edge', 'fits');
      await expect.poll(tableShadow).toBe('none');
      await page.screenshot({ path: evidencePath('companion-reading-overview.png'), fullPage: true });
      const detailsToggle = sources.getByText('Dokumentdetails', { exact: true });
      await detailsToggle.click();
      await expect(sources.getByText('criteria-chain-v1', { exact: true })).toBeVisible();
      await detailsToggle.evaluate(element => element.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: evidencePath('companion-document-details.png'), fullPage: true });
      await detailsToggle.click();
      await scroll.evaluate(el => { el.scrollTop = el.scrollHeight / 2; });
      const offset = await scroll.evaluate(el => el.scrollTop);
      await expect(download).toBeInViewport();
      await frame.getByRole('button', { name: 'Entwurf schließen' }).hover();
      await frame.getByRole('button', { name: 'Entwurf schließen' }).press('Shift+Tab');
      await expect(download).toBeFocused();
      await expect(downloadHint).toBeVisible();
      await download.press('Tab');
      await expect(frame.getByRole('button', { name: 'Entwurf schließen' })).toBeFocused();
      await frame.getByRole('button', { name: 'Entwurf schließen' }).focus();
      await frame.getByRole('button', { name: 'Entwurf schließen' }).press('Tab');
      await expect(scroll).toBeFocused();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(offset);
      await page.setViewportSize({ width: 1360, height: 820 });
      await page.screenshot({ path: evidencePath('companion-reading-wide-light.png'), fullPage: true });
      await page.evaluate(() => window.sdkTraceHarness.setContext({ theme: 'dark', displayMode: 'fullscreen', containerDimensions: { maxHeight: 620, width: 1360 } }));
      await expect.poll(async () => (await section.boundingBox()).height).toBeLessThanOrEqual(620);
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(offset);
      await expect.poll(() => content.evaluate(el => {
        const luminance = color => {
          const [r, g, b] = color.match(/[\d.]+/g).slice(0, 3).map(value => {
            const channel = Number(value) / 255;
            return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
          });
          return .2126 * r + .7152 * g + .0722 * b;
        };
        const background = luminance(getComputedStyle(el.closest('.companion-reader')).backgroundColor);
        return Math.min(...[...el.querySelectorAll('h1, h2, h3, p, li')].map(text => {
          const foreground = luminance(getComputedStyle(text).color);
          return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
        }));
      })).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({ path: evidencePath('companion-reading-wide-dark.png'), fullPage: true });
      await about.click();
      await page.setViewportSize({ width: 1361, height: 820 });
      await frame.getByRole('dialog').press('Escape');
      await expect.poll(async () => Math.round((await section.boundingBox()).height)).toBe(620);
      await page.setViewportSize({ width: 1360, height: 620 });
      await frame.locator('.mcp-entry').evaluate(el => {
        const message = document.createElement('p'); message.dataset.testHostMessage = 'true';
        message.style.cssText = 'height:64px;margin:0'; message.textContent = 'Synthetischer Host-Hinweis'; el.append(message);
      });
      await expect.poll(async () => Math.round((await section.boundingBox()).height)).toBe(556);
      await frame.locator('[data-test-host-message]').evaluate(el => el.remove());
      await expect.poll(async () => Math.round((await section.boundingBox()).height)).toBe(620);
      await page.setViewportSize({ width: 1360, height: 820 });
      await menu.click();
      const [readerBox, menuBox] = await Promise.all([reader.boundingBox(), options.boundingBox()]);
      expect(menuBox.x).toBeGreaterThanOrEqual(readerBox.x + readerBox.width);
      await reload.press('Escape');
      await page.evaluate(() => window.sdkTraceHarness.setContext({ theme: 'light', displayMode: 'pip', containerDimensions: { height: 420, width: 1360 } }));
      await expect.poll(async () => (await section.boundingBox()).height).toBeLessThanOrEqual(420);
      await expect(content).toHaveCSS('font-size', '16px');
      await scroll.evaluate(el => { el.scrollTop = el.scrollHeight; });
      await expect(content.getByText('Vollständiges Ende.')).toBeVisible();
      await expect(readerTitle).toBeVisible();
      await expect(menu).toBeVisible();
      await menu.click();
      expect((await options.boundingBox()).y).toBeGreaterThanOrEqual(0);
      await reload.press('Escape');
      await page.screenshot({ path: evidencePath('companion-reading-low-panel.png'), fullPage: true });
      await page.evaluate(() => window.sdkTraceHarness.setContext({ theme: 'light', displayMode: 'inline', containerDimensions: { maxHeight: 760, width: 1360 } }));
      await scroll.evaluate(el => { el.scrollTop = 500; });
      await runHeading.focus();
      await page.setViewportSize({ width: 320, height: 820 });
      await expect(card).toBeVisible();
      await expect(runHeading).toBeFocused();
      await expect(reader).toHaveCount(0);
      await source.click();
      await expect(card).toBeHidden();
      await expect(content).toHaveCSS('font-size', '15px');
      await expect(content.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '24px');
      await expect(readerLabel.locator('svg')).toBeVisible();
      await expect(readerLabel.locator('.reader-draft-label')).toHaveCSS('display', 'block');
      await expect(readerLabel.locator('.reader-label-divider')).toBeHidden();
      await expect(reader.getByRole('heading', { name: 'Produktanforderungen · Entwurf' })).toBeFocused();
      await expect(download).toBeInViewport();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(500);
      expect(await reader.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const tableViewport = decisionTable.getByRole('region', { name: 'Horizontal scrollbare Tabelle' });
      expect((await decisionTable.boundingBox()).x).toBeCloseTo((await followingHeading.boundingBox()).x, 0);
      expect(await tableViewport.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
      await expect.poll(tableShadow).toContain('linear-gradient');
      await tableViewport.evaluate(el => { el.scrollLeft = el.scrollWidth; });
      await expect.poll(tableShadow).toBe('none');
      await tableViewport.evaluate(el => { el.scrollLeft = 0; });
      await expect.poll(tableShadow).toContain('linear-gradient');
      expect((await reader.locator('.companion-reader-header').boundingBox()).height).toBeLessThanOrEqual(80);
      expect((await frame.locator('.cockpit-brand-header').boundingBox()).height).toBeLessThanOrEqual(80);
      await page.screenshot({ path: evidencePath('companion-reading-narrow.png'), fullPage: true });
      await page.setViewportSize({ width: 1360, height: 820 });
      await scroll.focus();
      const oldCaptureCount = subjectCaptures, oldDocumentCount = documentRequests;
      const otherUr = clarifiedUr.replace(/^# UR: .*$/m, '# UR: Zweiter Test-Run');
      expect(otherRun.step('ur', otherUr, { title: 'Zweiter Test-Run' }).outcome).toBe('accepted');
      // Allow a full five-second freshness interval and the subsequent snapshot read.
      await expect.poll(() => subjectCaptures, { timeout: 10_000 }).toBeGreaterThan(oldCaptureCount);
      await expect(download).toBeVisible();
      await expect(reader.locator('.companion-reader-notice')).toHaveCount(0);
      expect(documentRequests).toBe(oldDocumentCount);
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(500);
      await expect(scroll).toBeFocused();
      replaceCompanionPrd(writer, fixture.runId, 'Neue Entscheidung', appendix);
      const change = reader.getByRole('button', { name: 'Aktuelle Fassung öffnen' });
      await expect(change).toBeVisible({ timeout: 12000 });
      await expect(source).toHaveCount(0);
      const approvalHint = card.getByText('Approval: PRD', { exact: true });
      await expect(approvalHint).toHaveCount(0);
      await expect(reader.locator('.companion-reader-notice')).toHaveCount(1);
      await expect(revision).toHaveText(capturedRevision);
      await expect(scroll).toBeFocused();
      await expect(content.getByRole('heading', { name: 'PRD: Synthetic saved filter Langer Entwurf' })).toBeAttached();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(500);
      await expect(download).toHaveCount(0);
      await page.screenshot({ path: evidencePath('companion-reading-new-decision.png'), fullPage: true });
      // SCN-CDR-020/030: a transport failure must preserve the old immutable reading.
      const failSource = async route => {
        if (route.request().postDataJSON()?.arguments?.operation === 'document') await route.abort();
        else await route.continue();
      };
      await page.route('**/tool', failSource);
      await expect(change).toBeEnabled(); await change.focus(); await change.press('Enter');
      await expect(reader.getByRole('alert')).toContainText('Die gewählte Fassung konnte nicht bestätigt werden');
      const retry = reader.getByRole('button', { name: 'Erneut prüfen' });
      await expect(retry).toBeFocused();
      await expect(content.getByRole('heading', { name: 'PRD: Synthetic saved filter Langer Entwurf' })).toBeAttached();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(500);
      await expect(download).toHaveCount(0);
      await page.screenshot({ path: evidencePath('companion-reading-failed-switch.png'), fullPage: true });
      await page.unroute('**/tool', failSource);
      await retry.press('Enter');
      await expect(change).toBeEnabled(); await change.focus(); await change.press('Enter');
      await expect(content.getByRole('heading', { name: 'PRD: Synthetic saved filter Neue Entscheidung' })).toBeAttached();
      await expect(approvalHint).toBeVisible();
      await expect(revision).not.toHaveText(capturedRevision);
      await expect(reader.getByRole('heading', { name: 'Produktanforderungen · Entwurf' })).toBeFocused();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(0);
      // SCN-CDR-017/027/028: retain position metadata, re-read on return, never swap a vanished version silently.
      await scroll.evaluate(el => { el.scrollTop = 345; });
      const subjectHeading = card.getByRole('heading', { level: 2 });
      const subjectTitle = await subjectHeading.innerText();
      const cycleRun = async () => {
        const counter = navigation.locator('.companion-run-counter > span').first();
        const start = Number((await counter.innerText()).match(/^(\d+) von 3$/)[1]);
        for (let step = 1; step <= 3; step++) {
          await expect(nextRun).toBeEnabled(); await nextRun.click();
          await expect(counter).toHaveText(`${(start - 1 + step) % 3 + 1} von 3`);
        }
      };
      await cycleRun();
      await expect(content.getByRole('heading', { name: 'PRD: Synthetic saved filter Neue Entscheidung' })).toBeAttached();
      await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBe(345);
      await expect(subjectHeading).toHaveText(subjectTitle);
      await expect(nextRun).toBeEnabled(); await nextRun.click();
      await expect(subjectHeading).not.toHaveText(subjectTitle);
      replaceCompanionPrd(writer, fixture.runId, 'Nach Run-Rückkehr', appendix);
      // Updating a draft can reorder Runs by activity. Return by identity, never
      // by its former ordinal; the full switcher cycle is checked above and below.
      await menu.click();
      await options.getByRole('menuitem', { name: 'Zurück zum Chat-Run' }).click();
      await expect(reader.getByRole('alert')).toContainText('Die zuvor gelesene Fassung ist nicht mehr verfügbar');
      await expect(content).toHaveCount(0);
      await expect(change).toBeEnabled(); await change.click();
      await expect(content.getByRole('heading', { name: 'PRD: Synthetic saved filter Nach Run-Rückkehr' })).toBeAttached();
      expect(await scroll.evaluate(el => el.scrollTop)).toBe(0);
      await reader.getByRole('button', { name: 'Entwurf schließen' }).click();
      await expect(source).toBeFocused();
      await menu.click(); await reload.click();
      await page.setViewportSize({ width: 849, height: 820 });
      await page.setViewportSize({ width: 1360, height: 820 });
      await expect(reader).toHaveCount(0);
      await expect.poll(async () => (await section.boundingBox()).width).toBe(1360);
      await cycleRun();
      await expect(source).not.toHaveAttribute('aria-disabled', 'true');
      await expect(reader).toHaveCount(0);
      expect(await page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'display-mode-request'))).toEqual([]);
    } else if (surface === 'panel') {
      const longReadingSample = '\n\n## Leseposition\n\n' + 'Lesetext für den Entwurf.\n\n'.repeat(45)
        + '| Breite Tabelle | Ergebnis |\n| --- | --- |\n| ' + 'Tabelle'.repeat(95) + ' | Ende |\n';
      replaceCompanionPrd(writer, fixture.runId, 'Boxenfunk C', longReadingSample);
      prepared = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: fixture.runId } });
      supersedeBeforeDocument = prepared._meta.agdf_cockpit.session_id;
      await page.setViewportSize({ width: 523, height: 820 });
      await page.goto(`http://127.0.0.1:${server.address().port}/?companion=panel&first-open=1`);
      const reader = frame.getByRole('region', { name: 'Entwurf lesen' });
      await expect(source).toBeEnabled({ timeout: 12000 });
      await expect(reader).toBeHidden();
      await page.setViewportSize({ width: 524, height: 820 });
      await expect(reader.getByRole('heading', { name: 'Produktanforderungen · Entwurf' })).toBeVisible();
      await expect(reader.getByRole('heading', { name: 'PRD: Synthetic saved filter Boxenfunk C' })).toBeVisible();
      await expect(reader.getByRole('alert')).toHaveCount(0);
      expect(supersededDocumentCode).toBe('resource_denied');
      const layout = frame.locator('.companion-workspace');
      const document = reader.getByRole('article', { name: 'Originaldokument' });
      const fontSize = () => document.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      const opacity = () => reader.evaluate(el => Number(getComputedStyle(el).opacity));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect.poll(opacity).toBeCloseTo(0.0036, 4);
      const smallestReader = await reader.boundingBox();
      const closeAtSmallest = await reader.getByRole('button', { name: 'Entwurf schließen' }).boundingBox();
      expect(closeAtSmallest.x + closeAtSmallest.width).toBeLessThanOrEqual(smallestReader.x + smallestReader.width);
      await page.setViewportSize({ width: 800, height: 820 });
      await expect.poll(() => layout.evaluate(() => innerWidth)).toBe(800);
      await expect.poll(opacity).toBe(1);
      await expect.poll(fontSize).toBeGreaterThan(15);
      await page.setViewportSize({ width: 660, height: 820 });
      await expect.poll(opacity).toBeCloseTo(0.49, 2);
      const opacityOnShrink = await opacity();
      await page.setViewportSize({ width: 524, height: 820 });
      await expect.poll(() => layout.evaluate(() => innerWidth)).toBe(524);
      await expect(reader).toBeVisible();
      await expect.poll(fontSize).toBe(15);
      await expect.poll(opacity).toBeCloseTo(0.0036, 4);
      const close = reader.getByRole('button', { name: 'Entwurf schließen' });
      await close.press('Tab');
      const viewport = reader.locator('.companion-reader-scroll');
      await expect(viewport).toBeFocused();
      await expect.poll(opacity).toBe(1);
      await viewport.evaluate(el => { el.scrollTop = 240; });
      await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBe(240);
      await page.setViewportSize({ width: 523, height: 820 });
      await expect(reader).toBeHidden();
      await expect(card).toBeVisible();
      await expect(source).toBeFocused();
      await source.press('Tab');
      await expect(frame.getByText('ⓘ Details', { exact: true })).toBeFocused();
      const companion = await layout.locator('.companion-column').boundingBox();
      expect(companion.width).toBe(360);
      expect(companion.x + companion.width).toBe(522);
      await page.setViewportSize({ width: 660, height: 820 });
      await expect(reader.getByRole('heading', { name: 'PRD: Synthetic saved filter Boxenfunk C' })).toBeVisible();
      await expect.poll(opacity).toBe(opacityOnShrink);
      await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBe(240);
      await page.setViewportSize({ width: 800, height: 820 });
      await expect.poll(opacity).toBe(1);
      if (zoomContext) {
        // Chromium's tab zoom affects layout CSS pixels without pinch scaling.
        await page.setViewportSize({ width: 1660, height: 1300 });
        const measure = () => page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, visualScale: visualViewport.scale }));
        const beforeZoom = await measure();
        const worker = zoomContext.serviceWorkers()[0] ?? await zoomContext.waitForEvent('serviceworker');
        const zoomFactor = await worker.evaluate(async url => {
          const [tab] = await chrome.tabs.query({ url });
          await chrome.tabs.setZoom(tab.id, 2);
          return chrome.tabs.getZoom(tab.id);
        }, new URL(page.url()).origin + '/*');
        expect(zoomFactor).toBe(2);
        await expect.poll(measure).toEqual({ width: beforeZoom.width / 2, dpr: beforeZoom.dpr * 2, visualScale: 1 });
        const wideZoom = await measure();
        const header = reader.getByRole('heading', { name: 'Produktanforderungen · Entwurf' });
        const footerMenu = frame.locator('.companion-footer').getByRole('button', { name: 'AGDF Companion' });
        await expect(header).toBeInViewport();
        await expect(footerMenu).toBeInViewport();
        await close.press('Tab');
        await expect(viewport).toBeFocused();
        const scrollableTable = document.getByRole('region', { name: 'Horizontal scrollbare Tabelle' }).filter({ hasText: 'Breite Tabelle' });
        await expect.poll(() => scrollableTable.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
        await expect.poll(() => layout.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await footerMenu.press('Enter');
        await expect(frame.getByRole('menuitem', { name: 'Neu lesen' })).toBeVisible();
        await page.keyboard.press('Escape');
        await page.screenshot({ path: evidencePath('companion-reader-zoom-200-wide.png') });

        await page.setViewportSize({ width: 760, height: 1100 });
        const narrowZoom = await measure();
        expect(narrowZoom.width).toBe(380);
        await expect(card).toBeInViewport();
        await source.press('Enter');
        await expect(header).toBeFocused();
        await expect.poll(() => layout.evaluate(el => el.ownerDocument.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: evidencePath('companion-reader-zoom-200-narrow.png') });
        await reader.getByRole('button', { name: 'Zurück zum Companion' }).press('Enter');
        await expect(source).toBeFocused();
        await expect(footerMenu).toBeInViewport();
        writeFileSync(evidencePath('companion-reader-zoom-200.json'), JSON.stringify({ zoomFactor, beforeZoom, wideZoom, narrowZoom }, null, 2));
      }
    }
  } finally {
    const frame = await page.frameLocator('iframe').locator('body').innerText({ timeout: 1000 }).catch(() => null);
    writeFileSync(evidencePath(`codex-companion-${surface}-synthetic-host.txt`), frame ?? 'No visible iframe content');
    await sdkServer.closeAgdfRuntime();
    if (server) await new Promise(resolve => server.close(resolve));
    await client.close(); await sdkServer.close();
    await zoomContext?.close();
    for (const cleanup of cleanups.reverse()) await cleanup();
    rmSync(temporary, { recursive: true, force: true });
  }
});

const reviewTitle = 'Statusmeldungen im Kundenportal';
const reviewQuestion = 'Prüfe, ob Ziel und Umfang deinem Auftrag entsprechen.';
const requirements = `# UR: Statusmeldungen im Kundenportal

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none

## Problem

Kunden erfahren erst auf Nachfrage, ob ihre Anfrage angekommen ist. Der Support beantwortet dadurch regelmäßig dieselben Rückfragen.

## Goal

Kunden sehen nach dem Absenden sofort, dass ihre Anfrage eingegangen ist. Sie können später im Portal nachsehen, ob sie bereits bearbeitet wird.

## Scope

- Nach dem Absenden erscheint eine Eingangsbestätigung mit der Nummer der Anfrage.
- In der Übersicht stehen die Status „Eingegangen“, „In Bearbeitung“ und „Erledigt“.
- Fehlt der aktuelle Stand, erklärt das Portal dies und bietet eine Möglichkeit zum erneuten Laden.

## Non-Goals

E-Mail-Benachrichtigungen und verbindliche Bearbeitungsfristen sind nicht Teil dieses Vorhabens.

## Affected Users

Kunden mit einer laufenden Anfrage und das Supportteam.

## Acceptance Signals

1. Nach erfolgreichem Absenden sind Eingangsbestätigung und Anfragenummer sichtbar.
2. In der Übersicht lässt sich eine Anfrage anhand ihrer Nummer finden.
3. Ein veralteter Stand ist als solcher erkennbar.

## Risks And Unknowns

Der Support prüft, ob die drei Status seine üblichen Abläufe verständlich abbilden.

## Existing Source Of Truth

Bestehende Anfragenübersicht und gemeinsam abgestimmter Ablauf des Supportteams.

## Next Step

Prüfe, ob die beschriebenen Status und der vereinbarte Umfang zur Anfrage passen.
`;

for (const closeMode of ['accepted', 'ignored', 'deny-release']) test(`built Cockpit close: ${closeMode} (synthetic host)`, async ({ page }) => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-sdk-trace-browser-'));
  const f = fixture({ title: reviewTitle, content: requirements }), before = treeBytes(f.root);
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
    if (closeMode === 'accepted') {
      const card = frame.locator('[data-role="card"]');
      await page.setViewportSize({ width: 360, height: 800 });
      await expect(card.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(card.getByRole('heading', { name: reviewTitle })).toBeVisible();
      const mark = card.locator('header img');
      await expect(mark).toBeVisible();
      expect(await mark.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      const taskCard = card.locator('.review-task-card');
      await expect(taskCard.getByText('Anforderungen · Entwurf')).toBeVisible();
      await expect(taskCard.getByText(reviewQuestion)).toBeVisible();
      await expect(taskCard.getByText(/Kontrollstatus|Approval: UR/)).toHaveCount(0);
      await expect(card.getByRole('button', { name: 'Prüfung öffnen' })).toBeVisible();
      await page.screenshot({ path: evidencePath('cockpit-review-card-360.png') });
      await card.getByRole('button', { name: 'Prüfung öffnen' }).click();
      await page.setViewportSize({ width: 480, height: 800 });
      const reader = frame.locator('[data-role="reader"]');
      await expect(reader.locator('header img')).toBeVisible();
      await expect(reader.locator('[data-review-source]')).toBeVisible();
      await expect(reader.getByText('Eine frühere Lesestelle ist in dieser neu geöffneten Ansicht nicht verfügbar.')).toHaveCount(0);
      await expect(reader.getByText(reviewQuestion)).toBeVisible();
      await expect(reader.getByText('Entwurf', { exact: true })).toBeVisible();
      await expect(reader.locator('[data-review-source]')).toContainText('Kunden sehen nach dem Absenden sofort');
      const provenance = reader.locator('.review-source details');
      const identity = await provenance.getByText('Revision', { exact: false }).locator('code').textContent();
      await expect(provenance.locator('code').first()).not.toBeVisible();
      await provenance.locator('summary').focus();
      await provenance.locator('summary').press('Enter');
      await expect(provenance.getByText(identity, { exact: true })).toBeVisible();
      await provenance.locator('summary').press('Enter');
      await page.screenshot({ path: evidencePath('cockpit-review-reader-480.png') });
      await page.evaluate(() => window.sdkTraceHarness.setTheme('dark'));
      await expect(frame.locator('html')).toHaveAttribute('data-theme', 'dark');
      const darkHeader = reader.locator('header');
      await expect(reader.getByText(reviewQuestion)).toBeVisible();
      expect(await darkHeader.evaluate(header => getComputedStyle(header, '::before').backgroundImage.includes('data:image/jpeg'))).toBe(true);
      await page.screenshot({ path: evidencePath('cockpit-review-reader-dark-480.png'), animations: 'disabled' });
      await page.evaluate(() => window.sdkTraceHarness.setTheme('light'));
      await expect(frame.locator('html')).not.toHaveAttribute('data-theme', 'dark');
      const firstVisibleParagraph = pane => {
        const top = pane.getBoundingClientRect().top;
        return [...pane.querySelectorAll('p, li, h1, h2, h3, h4, pre')]
          .find(row => row.getBoundingClientRect().bottom > top)?.textContent;
      };
      const source = reader.locator('[data-review-source]');
      await source.evaluate(pane => { pane.scrollTop = 400; });
      await expect.poll(() => source.evaluate(pane => pane.scrollTop)).toBeGreaterThan(0);
      const anchor = await source.evaluate(firstVisibleParagraph);
      expect(anchor).toBeTruthy();
      await reader.getByRole('button', { name: 'Vollansicht öffnen' }).click();
      await page.setViewportSize({ width: 1200, height: 900 });
      const workspace = frame.locator('[data-role="workspace"]');
      await expect(workspace.locator('header img')).toBeVisible();
      await expect(workspace.locator('[data-review-source]')).toHaveCSS('border-top-width', '0px');
      await expect(workspace.locator('.review-source details').getByText(identity, { exact: true })).toHaveCount(1);
      await expect(workspace.getByText('Nachweise', { exact: true })).toBeVisible();
      await page.screenshot({ path: evidencePath('cockpit-review-workspace-1200.png') });
      await page.setViewportSize({ width: 480, height: 800 });
      await workspace.getByRole('button', { name: 'Zurück zur Prüfung' }).click();
      await expect(reader.locator('.review-source details').getByText(identity, { exact: true })).toHaveCount(1);
      await expect.poll(() => source.evaluate(firstVisibleParagraph)).toBe(anchor);
      expect(await page.evaluate(() => window.sdkTraceHarness.logs.filter(row => row.kind === 'context-ack'))).toEqual([]);
      await reader.getByRole('button', { name: 'Vollansicht öffnen' }).click();
    } else {
      await expect(frame.getByText('Eine frühere Lesestelle ist in dieser neu geöffneten Ansicht nicht verfügbar.')).toBeVisible();
      if (closeMode === 'ignored') await page.screenshot({ path: evidencePath('cockpit-review-reopened-no-checkpoint.png') });
      await frame.getByRole('button', { name: 'Anforderungen öffnen', exact: true }).click();
    }
    await expect(frame.locator('[data-review-source]')).toBeVisible();
    await frame.getByText('Host-Verbindung prüfen', { exact: true }).click();
    expect(trace).toHaveLength(0);
    await frame.getByRole('button', { name: 'SDK-Nachweis aufzeichnen' }).click();
    await expect(frame.getByLabel('SDK-Nachrichten dieser Ansicht')).toContainText('ui/initialize');
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
      const path = new URL(req.url, 'http://127.0.0.1').pathname;
      if (path === '/tool') {
        const buffers = []; for await (const bytes of req) buffers.push(bytes);
        const input = JSON.parse(Buffer.concat(buffers).toString()), result = await client.callTool(input); replies.push({ input, result });
        res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
      }
      if (path === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
      res.setHeader('content-type', path === '/host.js' ? 'text/javascript' : 'text/html');
      res.end(path === '/cockpit.html' ? ui.files['cockpit.html'] : path === '/host.js' ? readFileSync(join(temporary, 'host.js'))
        : '<!doctype html><iframe title="Synthetic Cockpit" style="width:100%;height:1400px"></iframe><script type="module" src="/host.js"></script>');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await page.goto('http://127.0.0.1:' + server.address().port + '/?closeMode=accepted');
    const frame = page.frameLocator('iframe');
    await expect(frame.getByText(/Der gespeicherte Stand des Vorhabens konnte nicht verifiziert werden/)).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Prüfung öffnen' })).toHaveCount(0);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.screenshot({ path: evidencePath('cockpit-review-blocked-card-360.png') });
    await frame.getByRole('button', { name: 'Arbeitsstand ansehen' }).click();
    await expect(frame.locator('[data-role="workspace"]')).toBeVisible();
    const reviewSource = frame.getByRole('button', { name: 'Anforderungen öffnen', exact: true });
    await expect(reviewSource).toBeVisible();
    expect(replies.some(row => row.input.arguments.operation === 'document')).toBe(false);
    const run = replies.find(row => row.input.arguments.operation === 'snapshot').result;
    expect(run.isError).toBeUndefined(); expect(run.structuredContent.data.run.evaluation.blocking_reason).not.toBe('none');
    expect(run.structuredContent.data.run.document_states.some(row => row.source_state === 'missing')).toBe(true);
    await frame.getByText('Arbeitsstand und Quellen', { exact: true }).click();
    await expect(frame.getByText('Dokument nicht verfügbar.', { exact: true })).toBeVisible();
    await page.screenshot({ path: evidencePath('mcp-cockpit-blocked-run.png'), fullPage: true });
    deny = true;
    await reviewSource.click();
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
