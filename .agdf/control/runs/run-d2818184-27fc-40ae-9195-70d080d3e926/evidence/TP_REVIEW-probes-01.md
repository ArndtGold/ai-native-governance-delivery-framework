# TP Review evidence probes (run-d2818184-27fc-40ae-9195-70d080d3e926)

Run for the TP Review on 2026-11-06 against the working tree of `feat/companion-core-run-view` after the CR corrections (CR pass, revision 34). Neither probe is part of the repository; both import the repository's own test harness and Core modules and change nothing outside temporary folders. Environment: Windows 11, Node v22.22.3, `packages/mcp-server` harness `createOwnedRuntimeFixture` / `withStdioClient` / `createMcpDeliveryHarness`.

## Probe A: run_completed through the real MCP tool path (TPR-04)

Claim: SCN-012 / AC-006 require `run_completed` from a real MCP outcome; the repository tests derive it from a synthetic accepted result only.

Method: the steps of `packages/mcp-server/test/verified-change-flow.test.js` (UR, approval, Verified Change eligibility, route, execution, mini-closeout) driven through facade legacy, facade modern and plugin generation, with the companion data root handed over as the launcher does (`AGDF_COMPANION_DATA_ROOT` for the facade, `--data` for the plugin generation); after the accepted `closeout.record` the journal must hold exactly one `run_completed` line for the run at gate OR with the closeout operation id, and the replay (`already_applied`) must add none.

Observed, first execution (10:44 CET, parallel load from the TP route run):

```text
facade legacy: run_completed lines after closeout 1, after replay 1; journal kinds ["material_staged","document_recorded","approval_requested","approval_recorded","material_staged","material_staged","document_recorded","material_staged","material_staged","run_completed"]; closeout call 2252 ms
facade modern: run_completed lines after closeout 1, after replay 1; journal kinds ["material_staged","document_recorded","approval_requested","approval_recorded","material_staged","material_staged","document_recorded","material_staged","material_staged","run_completed"]; closeout call 2107 ms
plugin generation: run_completed lines after closeout 1, after replay 1; journal kinds ["material_staged","document_recorded","approval_requested","approval_recorded","material_staged","material_staged","document_recorded","material_staged","effect_unknown","material_staged","run_completed"]; closeout call 7127 ms
```

In the plugin generation the Verified Change execution call returned `effect_unknown` (`dispatch_timeout`); the harness confirmed the recorded effect through `operation-status` and continued. The journal shows that uncertain outcome once, as designed.

Observed, second execution (11:35 CET, no parallel test load; machine load from other applications, CPU idle 30 to 73 percent in the performance test run at 11:31 CET):

```text
facade legacy: run_completed lines after closeout 1, after replay 1; (same journal kinds as above); closeout call 3881 ms
facade modern: run_completed lines after closeout 1, after replay 1; (same journal kinds as above); closeout call 5443 ms
plugin generation: aborted before the closeout: verified_change.record (execution) returned effect_unknown / dispatch_timeout and the harness did not recover it
```

Assessment: `run_completed` is derived exactly once from a real accepted closeout through all three paths (plugin generation once), and never for the replay. The plugin-generation timeout occurs inside the worker execution budget (`packages/mcp-server/src/worker.js:114`, 10 s), before the journal runs (`packages/mcp-server/src/generation-runtime.js`, journal after the result projection); the Verified Change execution path is not changed by this run. It is recorded as an observation, not as a finding of this run. Limit: the probe is review evidence, not a permanent regression test.

```js
// TP Review evidence probe (not part of the repository): drives the real Verified Change mini-closeout through
// the MCP tool path (facade legacy, facade modern, plugin generation) with a companion data root and checks
// that the accepted closeout.record yields exactly one run_completed journal line, and the replay none.
// Steps copied from packages/mcp-server/test/verified-change-flow.test.js; only the data root and journal checks are added.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const repo = 'file:///C:/Workspace/ai-native-governance-delivery-framework/';
const { createOwnedRuntimeFixture } = await import(`${repo}packages/mcp-server/test/owned-runtime.js`);
const { withStdioClient } = await import(`${repo}packages/mcp-server/test/helpers.js`);
const { createMcpDeliveryHarness } = await import(`${repo}packages/mcp-server/test/delivery-harness.js`);
const { COMPANION_DATA_ROOT_ENV, journalPath } = await import(`${repo}packages/core/lib/companion/journal.js`);
const { parseEventLines } = await import(`${repo}packages/core/lib/companion/events.js`);
const { pluginRoot } = await import(`${repo}scripts/support/plugin-mcp-fixture.js`);

const eventsOf = dataRoot => (existsSync(journalPath(dataRoot)) ? parseEventLines(readFileSync(journalPath(dataRoot), 'utf8')) : []);
const variants = [
  { label: 'facade legacy', modern: false, options: {} },
  { label: 'facade modern', modern: true, options: {} },
  { label: 'plugin generation', modern: true, options: { pluginSourceRoot: pluginRoot } },
];
for (const { label, modern, options } of variants) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [], ...options }), root = fixture.governanceTarget;
  const launcherData = fixture.args.includes('--data') ? fixture.args[fixture.args.indexOf('--data') + 1] : null;
  const dataRoot = launcherData ?? mkdtempSync(join(tmpdir(), 'agdf-probe-data-'));
  const env = launcherData ? undefined : { [COMPANION_DATA_ROOT_ENV]: dataRoot };
  try {
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
    git(['init', '-q']); git(['config', 'core.fsmonitor', 'false']); git(['config', 'maintenance.auto', 'false']); git(['config', 'gc.auto', '0']);
    git(['config', 'user.name', 'Synthetic protocol fixture']); git(['config', 'user.email', 'fixture@example.invalid']);
    writeFileSync(join(root, 'README.md'), 'Before\n'); git(['add', '.']); git(['commit', '-qm', 'Synthetic clean baseline']);
    await withStdioClient({ ...fixture, modern, env }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic bounded README copy');
      await h.invoke('agdf_record', 'step.record', { step: 'ur', title: 'Synthetic bounded README copy',
        source: await h.stage('UR', '# UR: Bounded copy\n## Problem\nOne README sentence is unclear.\n## Goal\nClarify one sentence.\n## Scope\nREADME.md only.\n') });
      await h.approve('UR');
      let text = `# Verified Change: Synthetic copy
## Record
- status: eligible
- related_ur: ${h.prefix}UR.md
- escalation_target: structured_slice
- canonical_owner: README.md
- allowed_source_paths: README.md
- allowed_derived_paths: none
- prohibited_impacts: none
- propagation_command: none
- validation_commands: assert exact README sentence
- baseline_commit: captured_by_owner
- baseline_tracked_paths: none
- baseline_untracked_paths: none
- execution_changed_paths: none
- execution_scope_status: pending
- validation_status: pending
- propagation_status: not_applicable
## Brownfield Selection
- mode: post_ur_review
- decision: verified_change
- scope_reason: One copy owner with deterministic validation and no prohibited impact.
- evidence: Synthetic bounded protocol fixture analysis.
## Mini-Closeout
- delivered:
- intentionally_not_delivered:
- residual_risk: none
- next_step:
`;
      await h.invoke('agdf_record', 'verified_change.record', { phase: 'eligibility', source: await h.stage('Verified Change', text) });
      await h.invoke('agdf_record', 'step.record', { step: 'route', route: 'verified_change', reason: 'One bounded README owner and direct deterministic validation.',
        source: await h.stage('Brownfield Review', '# Brownfield Review\n- decision: pass\nSynthetic bounded copy with one owner.\n') });
      const readRecord = async () => (await h.inputs()).filter(p => p.chunk?.role === 'source' && p.chunk.type === 'Verified Change').map(p => p.chunk.content).join('');
      text = await readRecord();
      writeFileSync(join(root, 'README.md'), 'After: clearer sentence.\n');
      text = text.replace('- status: eligible', '- status: executed').replace('- execution_scope_status: pending', '- execution_scope_status: pass').replace('- validation_status: pending', '- validation_status: pass');
      await h.invoke('agdf_record', 'verified_change.record', { phase: 'execution', source: await h.stage('Verified Change', text) });
      text = await readRecord();
      text = text.replace('- delivered:\n', '- delivered: One README sentence was clarified and directly checked.\n')
        .replace('- intentionally_not_delivered:\n', '- intentionally_not_delivered: All other product changes.\n').replace('- next_step:\n', '- next_step: Optional explicit handoff only.\n');
      const material = await h.stage('Verified Change', text);
      const help = await h.call('agdf_inspect', { operation: 'operation-contract', module: 'agdf_closeout/closeout.record', presentation_language: 'en',
        working_directory: root, primary_target: root, target_source: 'explicit_target', run_id: h.runId, expected_revision_id: h.revision() });
      const input = h.bound(), confirmation = help.report.confirmation_format.replace('{run_id}', h.runId).replace('{expected_revision_id}', input.expected_revision_id)
        .replace('{operation_id}', input.operation_id).replace('{or.digest}', material.digest);
      input.command = { kind: 'closeout.record', payload: { or: material, confirmation } };
      const started = Date.now();
      const closed = await h.call('agdf_closeout', input);
      const elapsed = Date.now() - started;
      assert.equal(closed.current.lifecycle, 'completed', JSON.stringify(closed));
      const completed = eventsOf(dataRoot).filter(event => event.kind === 'run_completed');
      assert.deepEqual(completed.map(event => [event.run_id, event.gate, event.operation_id]), [[h.runId, 'OR', input.operation_id]], JSON.stringify(eventsOf(dataRoot)));
      assert.equal((await h.call('agdf_closeout', input)).outcome, 'already_applied');
      const after = eventsOf(dataRoot).filter(event => event.kind === 'run_completed');
      const kinds = eventsOf(dataRoot).map(event => event.kind);
      console.log(`${label}: run_completed lines after closeout ${completed.length}, after replay ${after.length}; journal kinds ${JSON.stringify(kinds)}; closeout call ${elapsed} ms`);
    });
  } finally {
    fixture.dispose();
    if (!launcherData) rmSync(dataRoot, { recursive: true, force: true });
  }
}
```

## Probe B: schema-valid results for recovery_required and effect_unknown (TPR-05)

Claim: the TP's documented alternative covers `recovery_required` and a returned `effect_unknown` "with result objects validated against the published result schema".

Method: build result objects that satisfy the published RUN_COMMAND result schema (`operationContract(group, kind).result_schema`, validated with ajv), project them with `projectToolResult` and derive the event with `deriveEvent`; also check the objects used by `packages/core/test/companion-events-test.js` against the same schema.

Observed:

```text
agdf_closeout closeout.record recovery_required: schema-valid=true, event kind=recovery_required, gate=OR
agdf_record step.record effect_unknown: schema-valid=true, event kind=effect_unknown, gate=EVIDENCE
repository test object closeout.record recovery_required: schema-valid=false (/outcome must be equal to one of the allowed values; / must have required property 'operation_id'; / must have required property 'recovery'; / must match exactly one schema in oneOf)
repository test object step.record effect_unknown: schema-valid=false (/outcome must be equal to one of the allowed values; / must have required property 'recovery'; / must match exactly one schema in oneOf)
```

Assessment: both kinds are derived correctly from schema-valid results, which meets the TP's alternative; the repository test objects alone do not. Limit: `recovery_required` is still not produced through a real tool-path fault.

```js
// TP Review evidence probe (not part of the repository): the TP's documented alternative for SCN-012 says
// recovery_required and a returned effect_unknown are covered "with result objects validated against the
// published result schema". This probe builds such objects, validates them with the published
// RUN_COMMAND result schema (operationContract(...).result_schema) and derives the event kinds from their
// projection, exactly as the runtime does (projectToolResult + deriveEvent).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const repo = 'file:///C:/Workspace/ai-native-governance-delivery-framework/';
const require = createRequire(new URL('package.json', repo));
const Ajv = require('ajv').default ?? require('ajv');
const { operationContract } = await import(`${repo}packages/core/lib/control-state/run-command-contract.js`);
const { projectToolResult } = await import(`${repo}packages/core/lib/mcp-tool-errors.js`);
const { interactionLocales } = await import(`${repo}packages/core/lib/resources/context.js`);
const { localePack } = await import(`${repo}packages/core/lib/interaction-presentation.js`);
const { deriveEvent, eventKind } = await import(`${repo}packages/core/lib/companion/events.js`);

const pack = localePack(interactionLocales, 'en');
const RUN = 'run-11111111-2222-4333-8444-555555555555', OP = '66666666-7777-4888-8999-000000000000';
const base = { schema_version: '1', presentation_language: 'en', working_directory: '/p', primary_target: '/p', target_source: 'explicit_target',
  target_id: `sha256:${'a'.repeat(64)}`, run_id: RUN, expected_revision_id: '11111111-2222-4333-8444-555555555555', operation_id: OP, assurance: 'cooperative_local' };
const cases = [
  { group: 'agdf_closeout', kind: 'closeout.record', payload: { or: { path: 'x.md', digest: `sha256:${'b'.repeat(64)}` }, confirmation: 'c' },
    result: { schema_version: '1', outcome: 'recovery_required', authorizes: false, reason: 'recovery_required', operation_id: OP,
      recovery: 'Inspect the original operation with agdf_inspect operation-status before any retry.' }, facts: undefined, expected: ['recovery_required', 'OR'] },
  { group: 'agdf_record', kind: 'step.record', payload: { step: 'evidence', reason: 'r', covers: 'c', source: { path: 'e.md', digest: `sha256:${'c'.repeat(64)}` } },
    result: { schema_version: '1', outcome: 'effect_unknown', authorizes: false, reason: 'dispatch_timeout', operation_id: OP, dispatch: 'unknown',
      recovery: 'Inspect the original operation with agdf_inspect operation-status before any retry.' }, facts: { code: 'dispatch_timeout', dispatch: 'unknown' }, expected: ['effect_unknown', 'EVIDENCE'] },
];
const ajv = new Ajv({ strict: false, allErrors: true });
for (const { group, kind, payload, result, facts, expected } of cases) {
  const schema = operationContract(group, kind).result_schema;
  const valid = ajv.validate(schema, result);
  assert.ok(valid, `${kind} ${result.outcome} must satisfy the published result schema: ${JSON.stringify(ajv.errors)}`);
  const input = { ...base, command: { kind, payload } };
  const projected = projectToolResult(group, input, result, pack, facts);
  const event = deriveEvent(group, input, projected, { id: 'e1', at: '2026-11-06T10:00:00.000Z', root: '/p' });
  assert.equal(eventKind(group, input, projected), expected[0]);
  assert.deepEqual([event.kind, event.gate, event.run_id, event.operation_id], [expected[0], expected[1], RUN, OP]);
  console.log(`${group} ${kind} ${result.outcome}: schema-valid=${valid}, event kind=${event.kind}, gate=${event.gate}`);
}
// The objects used by packages/core/test/companion-events-test.js for the same two kinds, checked against the same schema.
const testObjects = [
  ['agdf_closeout', 'closeout.record', { schema_version: '1', outcome: 'recovery_required', authorizes: false, reason: 'recovery_required' }],
  ['agdf_record', 'step.record', { schema_version: '1', outcome: 'effect_unknown', authorizes: false, reason: 'dispatch_timeout', operation_id: OP }],
];
for (const [group, kind, result] of testObjects) {
  const valid = ajv.validate(operationContract(group, kind).result_schema, result);
  console.log(`repository test object ${kind} ${result.outcome}: schema-valid=${valid}${valid ? '' : ` (${ajv.errors.map(e => `${e.instancePath || '/'} ${e.message}`).join('; ')})`}`);
}
```
