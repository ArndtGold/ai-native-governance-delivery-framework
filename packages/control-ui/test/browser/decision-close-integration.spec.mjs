import { test, expect } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { createOwnedRuntimeFixture } from '../../../mcp-server/test/owned-runtime.js';
import { withStdioClient } from '../../../mcp-server/test/helpers.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../../cli/scripts/fixtures/sd-definition.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';
import { readDecisionUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';
import { evidencePath } from './server-fixture.mjs';

test('Automatic iframe disposal reaches the actual assembled Core and expires only its own view (synthetic host)', async ({ page }) => {
  test.setTimeout(90_000);
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-core-close-browser-'));
  const fixture = createOwnedRuntimeFixture({
    dispatcherSourceRoot: new URL('../../../../dist/npm/create-agdf', import.meta.url).pathname,
    candidateServerRoot: new URL('../../../../dist/npm/agdf-mcp-server', import.meta.url).pathname
  });
  let server;
  try {
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./decision-core-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022', minify: false } });
    const f = createSdDefinitionTestRun(fixture.governanceTarget, join(fixture.dispatcherRoot, 'bin/create-agdf.js'), 'browser-close-only', process.env, { typedApprovals: true });
    writeFileSync(f.file('SD.md'), syntheticSd()); expect(f.recordSd().value.outcome).toBe('recorded');
    const before = readFileSync(f.state), exchange = [];
    await withStdioClient({ ...fixture, capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } } } }, async client => {
      const call = async input => { const result = await client.callTool(input); exchange.push({ request: input, result }); return result; };
      const input = { schema_version: '1', assurance: 'cooperative_local', presentation_language: 'en', working_directory: fixture.governanceTarget,
        primary_target: fixture.governanceTarget, target_source: 'explicit_target', target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id,
        run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
      const material = await call({ name: 'agdf_prepare', arguments: input });
      expect(material._meta?.agdf_decision).toBeUndefined();
      const probe = () => call({ name: 'agdf_decision_view', arguments: { primary_target: input.primary_target, target_id: input.target_id,
        run_id: f.runId, expected_revision_id: input.expected_revision_id, gate: 'SD', presentation_id: material.structuredContent.family_result.presentation_id } });
      const other = await probe(), prepared = await probe();
      expect(other.structuredContent.outcome).toBe('accepted');
      expect(prepared.structuredContent.outcome).toBe('accepted');
      const view = prepared._meta.agdf_decision, otherView = other._meta.agdf_decision;
      const resource = await client.readResource({ uri: readDecisionUiBuild().manifest.uri });
      expect('sha256:' + createHash('sha256').update(resource.contents[0].text).digest('hex')).toBe(readDecisionUiBuild().manifest.digest);
      server = createServer(async (req, res) => {
        try {
          if (req.url === '/tool' && req.method === 'POST') {
            const buffers = []; for await (const bytes of req) buffers.push(bytes);
            res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(await call(JSON.parse(Buffer.concat(buffers).toString())))); return;
          }
          if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
          const bytes = req.url === '/decision.html' ? resource.contents[0].text : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
            : '<!doctype html><iframe title="Disposable Core view" style="width:100%;height:1600px"></iframe><script type="module" src="/host.js"></script>';
          res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html'); res.end(bytes);
        } catch { res.statusCode = 500; res.end('disposable_tool_failed'); }
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      await page.goto('http://127.0.0.1:' + server.address().port);
      const frame = page.frameLocator('iframe');
      await expect(frame.getByText('Preview · not a primary decision view. Delivery is pending.', { exact: true })).toBeVisible();
      await expect(frame.locator('article.document')).toHaveCount(1);
      await expect(frame.getByRole('textbox')).toHaveCount(0);
      await expect(frame.getByRole('button', { name: view.labels.approve, exact: true })).toHaveCount(0);
      await page.locator('iframe').evaluate(frame => frame.remove());
      await expect.poll(() => exchange.filter(row => row.request.arguments?.operation === 'close' && row.result.structuredContent?.data?.closed === true).length).toBe(1);
      const expired = await call({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: view.read_session_id } });
      expect(expired.structuredContent.reason).toBe('session_expired');
      const independent = await call({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: otherView.read_session_id } });
      expect(independent.structuredContent.state).toBe('available');
      expect(exchange.filter(row => row.request.name === 'agdf_decision_action')).toHaveLength(0);
      expect(readFileSync(f.state)).toEqual(before);
      writeFileSync(evidencePath('decision-core-auto-close.json'), JSON.stringify({ evidence_class: 'actual_built_resource_sdk_browser_assembled_core',
        observed_at: new Date().toISOString(), marker: JSON.parse(readFileSync(join(fixture.root, '.agdf-mcp-owned.json'))), ui: readDecisionUiBuild().manifest,
        automatic_close_confirmed: true, subsequent_read: 'session_expired', independent_view_available: true, run_state_unchanged: true,
        decision_calls: 0, native_qualified: false, authorizes: false, exchange }, null, 2));
      await call({ name: 'agdf_cockpit_read', arguments: { operation: 'close', session_id: otherView.read_session_id } });
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    fixture.dispose(); rmSync(temporary, { recursive: true, force: true });
  }
});

test('Confirmed approval handoff retires its assembled Core session while keeping the receipt and exact historical document (synthetic host)', async ({ page }) => {
  test.setTimeout(90_000);
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-core-approved-close-'));
  const fixture = createOwnedRuntimeFixture({ dispatcherSourceRoot: new URL('../../../../dist/npm/create-agdf', import.meta.url).pathname,
    candidateServerRoot: new URL('../../../../dist/npm/agdf-mcp-server', import.meta.url).pathname });
  let server;
  try {
    await build({ configFile: false, logLevel: 'error', build: { outDir: temporary, emptyOutDir: false,
      lib: { entry: new URL('./decision-core-host.ts', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022', minify: false } });
    const cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
    const f = createSdDefinitionTestRun(fixture.governanceTarget, cli, 'browser-approved-close', process.env, { typedApprovals: true });
    writeFileSync(f.file('SD.md'), syntheticSd()); expect(f.recordSd().value.outcome).toBe('recorded');
    const independent = createSdDefinitionTestRun(fixture.governanceTarget, cli, 'browser-still-open', process.env, { typedApprovals: true });
    writeFileSync(independent.file('SD.md'), syntheticSd()); expect(independent.recordSd().value.outcome).toBe('recorded');
    const independentBefore = readFileSync(independent.state), exchange = [];
    // Explicit experimental qualification is confined to this disposable
    // synthetic SDK host. This is not native mediation/human-origin evidence.
    const entry = join(fixture.root, 'synthetic-approved-close.mjs');
    writeFileSync(entry, `import {createMcpDispatchRuntime,createMcpDecisionRuntime,DECISION_UI_URI} from ${JSON.stringify(join(fixture.dispatcherRoot, 'lib/mcp-dispatch-runtime.js'))};
import {runMcpServer} from ${JSON.stringify(join(fixture.serverRoot, 'src/main.js'))};
import {loadCockpitResource} from ${JSON.stringify(join(fixture.serverRoot, 'src/cockpit-resource.js'))};
const ui={uri:DECISION_UI_URI,mimeType:'text/html;profile=mcp-app',limit:4*1024**2,kind:'decision'};ui.digest=loadCockpitResource(ui).digest;
const runtime=await createMcpDecisionRuntime({runtime:createMcpDispatchRuntime({surface:'codex',commandGroups:['agdf_prepare','agdf_record','agdf_approve']}),ui,appOnlyMediationQualified:true,surfaceBinding:()=> '11111111-2222-4333-8444-555555555555'});
await runMcpServer({surface:'codex',runtime,executor:{execute(input,{toolName,signal}){const tool=runtime.tool(toolName);return tool.execute(tool.parse(input),signal)},close:()=>runtime.close()}});`);
    await withStdioClient({ ...fixture, args: [entry], capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } } } }, async client => {
      const call = async input => { const result = await client.callTool(input); exchange.push({ request: input, result }); return result; };
      const prepare = async run => { const result = await call({ name: 'agdf_prepare', arguments: { schema_version: '1', assurance: 'cooperative_local', presentation_language: 'en',
        working_directory: fixture.governanceTarget, primary_target: fixture.governanceTarget, target_source: 'explicit_target',
        target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id, run_id: run.runId, expected_revision_id: run.revision(),
        operation_id: randomUUID(), command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } } });
        return call({ name: 'agdf_decision_view', arguments: { primary_target: fixture.governanceTarget,
          target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id, run_id: run.runId, expected_revision_id: run.revision(),
          gate: 'SD', presentation_id: result.structuredContent.family_result.presentation_id } }); };
      const other = await prepare(independent), prepared = await prepare(f), view = prepared._meta.agdf_decision;
      expect(prepared.structuredContent.app_capability).toBe('available');
      const resource = await client.readResource({ uri: readDecisionUiBuild().manifest.uri });
      server = createServer(async (req, res) => {
        try {
          if (req.url === '/tool' && req.method === 'POST') {
            const buffers = []; for await (const bytes of req) buffers.push(bytes);
            const request = JSON.parse(Buffer.concat(buffers).toString()), result = await call(request);
            if (request.arguments?.operation === 'decision_display' && result.structuredContent?.state === 'available') await call({ name: 'agdf_prepare', arguments: {
              schema_version: '1', assurance: 'cooperative_local', presentation_language: 'en', working_directory: fixture.governanceTarget,
              primary_target: fixture.governanceTarget, target_source: 'explicit_target', target_id: view.binding.target_id, run_id: f.runId,
              expected_revision_id: view.binding.expected_revision_id, operation_id: randomUUID(), command: { kind: 'presentation.deliver',
                payload: { gate: 'SD', presentation_id: view.binding.presentation_id, route: 'automatic' } } } });
            res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result)); return;
          }
          if (req.url === '/prepared') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(prepared)); return; }
          const bytes = req.url === '/decision.html' ? resource.contents[0].text : req.url === '/host.js' ? readFileSync(join(temporary, 'host.js'))
            : '<!doctype html><iframe title="Disposable Core view" style="width:100%;height:1600px"></iframe><script type="module" src="/host.js"></script>';
          res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : 'text/html'); res.end(bytes);
        } catch { res.statusCode = 500; res.end('disposable_tool_failed'); }
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      await page.goto('http://127.0.0.1:' + server.address().port);
      const frame = page.frameLocator('iframe');
      // The App already bounds server-tool calls at 10 seconds. Observe that
      // actual reply before asserting the subsequent render; the default
      // locator wait must not truncate the permitted RPC to five seconds.
      const decisionResponse = page.waitForResponse(response => response.url().endsWith('/tool')
        && response.request().postDataJSON()?.name === 'agdf_decision_action', { timeout: 10_000 });
      await frame.getByRole('button', { name: view.labels.approve, exact: true }).click();
      const decisionReply = await (await decisionResponse).json();
      expect(decisionReply.structuredContent.outcome, JSON.stringify(decisionReply.structuredContent)).toBe('accepted');
      expect(decisionReply.isError).toBeUndefined(); expect(decisionReply.content).toHaveLength(1);
      await expect(frame.getByText(view.labels.confirmed, { exact: true })).toBeVisible();
      await expect(frame.getByText(view.labels.nextRequested, { exact: true })).toBeVisible();
      expect(await page.evaluate(() => window.coreHandoffs.length)).toBe(2);
      const closes = exchange.filter(row => row.request.arguments?.operation === 'close');
      expect(closes).toHaveLength(1); expect(closes[0].result.structuredContent.data.closed).toBe(true);
      const expired = await call({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: view.read_session_id } });
      expect(expired.structuredContent.reason).toBe('session_expired');
      const available = await call({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: other._meta.agdf_decision.read_session_id } });
      expect(available.structuredContent.state).toBe('available');
      await frame.getByRole('button', { name: view.labels.openDocument, exact: true }).click();
      await expect(frame.getByRole('heading', { name: /Historical version/ })).toBeVisible();
      const document = exchange.findLast(row => row.request.arguments?.operation === 'presentation-document').result.structuredContent.report;
      expect(document.applicability).toBe('historical'); expect(document.content_digest).toBe(view.document_digest);
      await frame.getByRole('button', { name: view.labels.back, exact: true }).click();
      await expect(frame.getByText(view.labels.confirmed, { exact: true })).toBeVisible();
      await page.locator('iframe').evaluate(element => element.remove());
      expect(exchange.filter(row => row.request.arguments?.operation === 'close')).toHaveLength(1);
      expect(exchange.filter(row => row.request.name === 'agdf_decision_action')).toHaveLength(1);
      expect(readFileSync(independent.state)).toEqual(independentBefore);
      writeFileSync(evidencePath('decision-approved-auto-close.json'), JSON.stringify({ evidence_class: 'actual_built_resource_sdk_browser_assembled_core',
        observed_at: new Date().toISOString(), ui: readDecisionUiBuild().manifest, automatic_close_confirmed: true, subsequent_read: 'session_expired',
        independent_view_available: true, immutable_historical_document_read: true, decision_calls: 1, native_qualified: false, authorizes: false, exchange }, null, 2));
      await call({ name: 'agdf_cockpit_read', arguments: { operation: 'close', session_id: other._meta.agdf_decision.read_session_id } });
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    fixture.dispose(); rmSync(temporary, { recursive: true, force: true });
  }
});
