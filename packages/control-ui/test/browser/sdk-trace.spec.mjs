import { test, expect } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildAgdfServer } from '../../../mcp-server/src/server.js';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { createCockpitSessionService } from '../../../core/lib/control-inspect/cockpit-session.js';
import { COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, parseCockpitArguments } from '../../../core/lib/control-inspect/cockpit-contract.js';
import { readCockpitUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';
import { evidencePath } from './server-fixture.mjs';

for (const closeMode of ['accepted', 'ignored', 'deny-release']) test(`built Cockpit close: ${closeMode} (synthetic host)`, async ({ page }) => {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-sdk-trace-browser-')), f = fixture(), before = treeBytes(f.root);
  const ui = readCockpitUiBuild(), session = createCockpitSessionService(f.root);
  const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition, i) => ({ name: definition.name, definition,
    parse: value => parseCockpitArguments(value, i === 0), execute: (value, signal) => i === 0 ? session.render(value) : session.read(value, signal) }));
  const runtime = { mode: 'cockpit', definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2,
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
        const bytes = req.url === '/cockpit.html' ? ui.files['cockpit.html'] : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
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
    await frame.getByRole('button', { name: 'Stand des Vorhabens öffnen', exact: true }).click();
    await expect(frame.getByRole('button', { name: 'Dokument schließen' })).toBeVisible();
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
    // The rejected-close case intentionally leaves its Core session open.
    // End the fixture before awaiting HTTP shutdown so long polls can finish.
    await sdkServer.closeAgdfRuntime();
    if (server) await new Promise(resolve => server.close(resolve));
    await client.close(); await sdkServer.close(); f.close(); rmSync(temporary, { recursive: true, force: true });
  }
});
