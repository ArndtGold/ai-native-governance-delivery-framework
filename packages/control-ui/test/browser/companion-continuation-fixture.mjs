import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { test as base } from '@playwright/test';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildAgdfServer } from '../../../mcp-server/src/server.js';
import { createTestRuntime } from '../../../mcp-server/test/runtime-fixture.js';
import { createMcpDispatchRuntime } from '../../../cli/lib/mcp-dispatch-runtime.js';
import { readSystemBootId } from '../../../cli/lib/mcp-lifecycle/system-boot.js';
import { buildCompanionFixtures, pendingCompanionCodeReview } from '../../../core/test/fixtures/companion-fixtures.js';
import { currentFixture } from '../../../core/test/fixtures/current-run.js';
import { createCockpitReader } from '../../../core/lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../../../core/lib/control-inspect/cockpit-session.js';
import { COCKPIT_PLUGIN_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_CONTINUATION_DEFINITION,
  parsePluginCockpitArguments, parseCockpitArguments, parseCockpitContinuationArguments } from '../../../core/lib/control-inspect/cockpit-contract.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';
import { observeCodexActivity } from '../../../core/lib/companion/codex-activity.js';
import { readCockpitUiBuild } from '../../../../scripts/cockpit-ui-build.mjs';

const origin = 'http://127.0.0.1:38419';
const sources = { gesture: 'Chromium', message: 'SDK bridge', permit: 'Cockpit publication',
  grant: 'fixture dispatch', read: 'fixture reader', reply: 'simulated receiver' };

export function counts(events, observed, candidate) {
  return Object.fromEntries(Object.keys(sources).map(kind => [kind, observed.has(kind)
    ? events.filter(e => e.kind === kind && e.candidate === candidate).length : 'unknown']));
}

export const test = base.extend({
  subject: ['brownfield', { option: true }],
  assets: [async ({}, use) => {
    const ui = readCockpitUiBuild();
    const built = await build({ configFile: false, logLevel: 'error', build: { write: false, target: 'es2022',
      lib: { entry: new URL('./sdk-trace-host.ts', import.meta.url).pathname, formats: ['es'], fileName: 'host' } } });
    const host = [built].flat().flatMap(b => b.output).find(chunk => chunk.type === 'chunk' && chunk.isEntry).code;
    const hash = createHash('sha256');
    for (const path of ['sdk-trace-host.ts', 'companion-continuation-fixture.mjs', 'companion-continuation-cases.mjs'])
      hash.update(readFileSync(new URL(path, import.meta.url)));
    await use({ ui, host, fixtureDigest: hash.digest('hex'), commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() });
  }, { scope: 'worker' }],

  lab: async ({ context, assets, subject }, use, info) => {
    const cleanups = [];
    const lifecycle = { after: fn => cleanups.push(fn) };
    const fixture = subject === 'code-review' ? (() => {
      const f = currentFixture(lifecycle), run = pendingCompanionCodeReview(f);
      return { id: 'code-review', root: f.root, runId: run.id };
    })() : buildCompanionFixtures(lifecycle, ['F04'])[0];
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-browser-admission-')));
    const target = { working_directory: fixture.root, primary_target: fixture.root, target_source: 'explicit_target' };
    // The Cockpit clock can run ahead of the dispatch clock, so a picked-up handoff ends without waiting.
    let offset = 0;
    const options = { integrationSurface: 'codex', pluginMode: true, continuationQualified: true, companionDataRoot: root,
      continuationBootId: readSystemBootId(), now: () => Date.now() + offset };
    let session = createCockpitSessionService(undefined, options);
    const tool = (definition, parse, method) => ({ name: definition.name, definition, parse: value => parse(value),
      execute: (value, signal) => session[method](value, signal) });
    const tools = [tool(COCKPIT_PLUGIN_RENDER_DEFINITION, parsePluginCockpitArguments, 'render'),
      tool(COCKPIT_READ_DEFINITION, parseCockpitArguments, 'read'),
      tool(COCKPIT_CONTINUATION_DEFINITION, parseCockpitContinuationArguments, 'continue')];
    const { ui } = assets;
    const runtime = createTestRuntime();
    const server = buildAgdfServer({ runtime: { ...runtime, mode: 'cockpit', definition: COCKPIT_PLUGIN_RENDER_DEFINITION,
      tools, uiCapabilityRequired: true, responseLimit: 8 * 1024 ** 2,
      ui: { uri: ui.manifest.uri, mimeType: ui.manifest.mime_type, limit: 4 * 1024 ** 2, directory: pathToFileURL(ui.root + '/') },
      serialize: JSON.stringify, failure: session.failure, close: () => session.close() } });
    const client = new Client({ name: 'synthetic-continuation-companion', version: '1' }, { capabilities: {
      extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [ui.manifest.mime_type] } } } });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const dispatch = createMcpDispatchRuntime({ surface: 'codex', continuationQualified: true, companionDataRoot: root });
    const gate = dispatch.tool('agdf_dispatch');
    const reader = createCockpitReader(fixture.root);
    const lookup = () => reader.snapshot(fixture.runId).data.run;
    const targetId = resolveControlCommandTarget(fixture.root).target_id;
    const marker = 'case-' + randomUUID();
    const markerFile = join(fixture.root, 'case-marker.json');
    writeFileSync(markerFile, JSON.stringify({ run_id: fixture.runId, marker }));
    const events = [], observed = new Set(Object.keys(sources)), messages = [];
    let candidate = ui.manifest.digest, viewNumber = 0;
    const add = (kind, data = {}) => events.push({ seq: events.length + 1, candidate, kind, source: sources[kind] ?? 'test fixture', ...data });
    const tally = () => counts(events, observed, candidate);
    const faults = { rejectContext: false, losePublishReply: false, stale: false, foreign: false };
    const prompt = { session_id: 'fixture-chat', turn_id: 'fixture-turn' };
    let race, displayAcknowledgement;
    function synchronizeStarts() { race = { views: new Set(), ...Promise.withResolvers() }; }
    function delayDisplayAcknowledgement() {
      displayAcknowledgement = Promise.withResolvers();
      return () => displayAcknowledgement.resolve();
    }

    async function open(page, runId = fixture.runId) {
      const view = ++viewNumber;
      const generation = candidate;
      let bound;
      await page.setViewportSize({ width: 360, height: 900 });
      await page.exposeBinding('observeGesture', (_, name) => add('gesture', { view, name, candidate: generation }));
      await page.addInitScript(() => document.addEventListener('click', event => {
        const button = event.target.closest?.('button');
        if (event.isTrusted && /^(Run fortsetzen|Erneut versuchen)$/.test(button?.textContent.trim()))
          void window.observeGesture(event.detail ? 'pointer' : 'keyboard');
      }, true));
      await page.exposeBinding('observeContinuation', (_, kind, params) => {
        if (kind === 'context') {
          if (faults.rejectContext) throw Error('fixture recipient context unavailable');
          bound = params.structuredContent?.agdf_companion_continuation;
          return;
        }
        assert.equal(kind, 'message');
        add('message', { view, attempt: bound?.call?.arguments?.continuation_attempt_id,
          revision: bound?.revision_id, candidate: generation });
        assert.equal(params.role, 'user');
        assert.equal(params.content.length, 1);
        assert.ok(params.content[0].text.includes(fixture.runId));
        assert.equal(bound?.target_id, targetId);
        assert.equal(bound.call.tool, 'agdf_dispatch');
        const args = bound.call.arguments;
        assert.equal(args.working_directory, fixture.root);
        assert.equal(args.primary_target, fixture.root);
        assert.equal(args.run_id, fixture.runId);
        assert.equal(bound.revision_id, lookup().revision_id);
        assert.equal(bound.operation_key, lookup().evaluation.next_operation.operation_key);
        messages.push(bound);
      });
      // Fulfil only the test origin in-process. No test request reaches a listening service.
      await page.route(origin + '/**', async route => {
        const path = new URL(route.request().url()).pathname;
        if (runId !== fixture.runId) {
          if (path !== '/') return route.fulfill({ status: 404 });
          add('selection-refused', { view });
          return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<p role="status">Dieser Run gehört nicht zu diesem Testfall.</p>' });
        }
        if (path === '/prepared') {
          bound = undefined;
          const prepared = await client.callTool({ name: 'agdf_cockpit', arguments: { ...target, run_id: runId } });
          return route.fulfill({ json: prepared });
        }
        if (path === '/tool') {
          const input = route.request().postDataJSON();
          const operation = input.arguments.operation;
          if (input.name === 'agdf_cockpit_read' && operation === 'display_ack' && displayAcknowledgement)
            await displayAcknowledgement.promise;
          if (race && input.name === 'agdf_cockpit_continue' && operation === 'reserve') {
            race.views.add(view);
            if (race.views.size === 2) race.resolve();
            await race.promise;
          }
          if (input.name === 'agdf_cockpit_continue' && faults.stale && operation === 'reserve') input.arguments.revision_id = randomUUID();
          if (input.name === 'agdf_cockpit_continue' && faults.foreign && operation === 'reserve') input.arguments.run_id = 'foreign-fixture';
          const response = await client.callTool(input);
          const r = response.structuredContent;
          if (input.name === 'agdf_cockpit_read' && operation === 'display_ack')
            add('display-ack', { view, state: r?.state, code: r?.code, candidate: generation });
          if (input.name === 'agdf_cockpit_continue') {
            add(r?.send === true ? 'permit' : 'service-' + operation, { view, state: r?.state, attempt: r?.attempt_id,
              candidate: generation });
            if (r?.send && faults.losePublishReply) return route.fulfill({ json: { isError: true, content: [] } });
          }
          return route.fulfill({ json: response });
        }
        if (path === '/host.js') return route.fulfill({ contentType: 'application/javascript', body: assets.host });
        if (path === '/cockpit.html') return route.fulfill({ contentType: 'text/html', body: ui.files['cockpit.html'] });
        if (path !== '/') return route.fulfill({ status: 404 });
        return route.fulfill({ contentType: 'text/html', body: '<!doctype html><style>body{margin:0}iframe{width:100%;height:96vh;border:0}</style><header>Test-Run ' + fixture.runId + '</header><iframe title="Begleiter"></iframe><script type="module" src="/host.js"></script>' });
      });
      await page.goto(origin + '/?companion=inline&continuation=withhold');
      return page.frameLocator('iframe');
    }

    function receive(route = 'companion') {
      // Release only the original bound message and execute only the designated readback.
      const bound = messages[0];
      const args = route === 'ordinary' ? { ...target, run_id: fixture.runId, skill_id: 'gate-check', continue_delivery: true }
        : bound.call.arguments;
      const result = gate.execute(gate.parse({ ...args, presentation_language: 'en' }));
      assert.equal(result.continuation?.work_admission, undefined);
      if (!result.terminal && route === 'ordinary') {
        assert.ok(result.continuation);
        add('ordinary', { route });
      } else if (!result.terminal) {
        assert.equal(result.continuation?.run_id ?? fixture.runId, fixture.runId);
        const attempt = args.continuation_attempt_id;
        add('grant', { route, attempt });
        const status = lookup();
        assert.equal(status.run_id, fixture.runId);
        add('read', { attempt, run_id: status.run_id, gate: status.evaluation.current_gate });
        const reply = JSON.parse(readFileSync(markerFile, 'utf8'));
        assert.equal(reply.run_id, status.run_id);
        add('reply', { attempt, marker: reply.marker });
      } else {
        assert.equal(result.terminal, true);
        add('dispatch-refused', { route, disposition: result.host_action?.text });
      }
      return result;
    }
    function hook(name, fields = {}) {
      add('simulated-hook', { name, session: fields.session_id ?? prompt.session_id, turn: fields.turn_id ?? prompt.turn_id });
      return observeCodexActivity(root, { ...prompt, hook_event_name: name, ...fields });
    }
    async function rollover() {
      await session.close();
      session = createCockpitSessionService(undefined, options);
      add('simulated-candidate-change', { predecessor: candidate });
      candidate = ui.manifest.digest + '/simulated-restart';
    }
    try {
      await server.connect(b); await client.connect(a);
      const advance = ms => { offset += ms; };
      await use({ open, receive, hook, rollover, advance, synchronizeStarts, delayDisplayAcknowledgement, events, observed, tally, messages, faults, marker, fixture, root, targetId,
        current: lookup, candidate: () => candidate });
    } finally {
      race?.resolve();
      displayAcknowledgement?.resolve();
      const visible = [];
      for (const page of context.pages()) {
        const frame = page.frames().find(f => f.url() === origin + '/cockpit.html');
        if (frame) visible.push(await frame.locator('.companion-turn').allInnerTexts().catch(() => []));
      }
      await context.close();
      const candidates = [...new Set([ui.manifest.digest, candidate])];
      const path = info.outputPath('continuation-case.json');
      writeFileSync(path, JSON.stringify({
        scenario: info.title, commit: assets.commit, ui_digest: ui.manifest.digest, fixture_digest: assets.fixtureDigest,
        fixture: fixture.runId, marker, visible,
        simulation: 'Chromium, local SDK host, fixture receiver and injected lifecycle events', native_qualified: false,
        observed_sources: [...observed], counts: candidates.map(id => ({ candidate: id, ...counts(events, observed, id) })), events,
      }, null, 2));
      await info.attach('continuation-case', { contentType: 'application/json', path });
      await server.closeAgdfRuntime(); await client.close(); await server.close(); await runtime.close(); await dispatch.close();
      rmSync(root, { recursive: true, force: true });
      for (const cleanup of cleanups.reverse()) cleanup();
    }
  },
});
