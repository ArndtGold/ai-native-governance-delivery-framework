import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture } from '../../packages/core/test/fixtures/current-run.js';
import { evaluateSetupObservation, auditSetupProject, runSetupProbe, SETUP_PROMPT, SETUP_TIMEOUT_MS } from './codex-project-setup.mjs';

const operation_id = randomUUID(), target = '/fixture/project';
const call = (tool, input, data) => ({ name: `mcp__plugin_agdf_agdf__${tool}`, input,
  result: { text: JSON.stringify(data), is_error: false } });
const observation = () => ({ process: { code: 0, timeout: false, output_limit: false },
  parsed: { trace_complete: true, calls: [call('agdf_inspect', { operation: 'project-state', primary_target: target }, { report: { available: true } }),
    call('agdf_project', { operation_id, primary_target: target }, { outcome: 'accepted' }),
    call('agdf_inspect', { operation: 'operation-status', primary_target: target, module: `project.initialize/${operation_id}` }, { report: { status: 'recorded' } })] },
  audit: { status: 'initialized', operation_status: 'recorded', operation_id, target, file_count: 16, hashes_match: true,
    extra_files: [], run_count: 0, approval_created: false, staging_clean: true }, commands: ['git init -q'] });

test('finite native oracle requires turn, process, original operation and exact canonical effects', () => {
  assert.equal(SETUP_TIMEOUT_MS, 300000);
  assert.equal(evaluateSetupObservation(observation()).success, true);
  for (const change of [o => o.process.timeout = true, o => o.process.code = 1, o => o.process.output_limit = true,
    o => o.parsed.trace_complete = false, o => o.parsed.calls.splice(1, 1), o => o.parsed.calls.pop(),
    o => o.audit.operation_status = 'unknown', o => o.audit.file_count = 15, o => o.audit.hashes_match = false,
    o => o.audit.extra_files.push('unexpected'), o => o.audit.run_count = 1, o => o.audit.approval_created = true,
    o => o.audit.staging_clean = false, o => o.audit.target = '/foreign', o => o.commands.push('agdf-project --command-file request.json'),
    o => o.commands.push('git init -q; cp seeds .agdf'), o => o.commands.push('echo seed > .agdf/config.json'),
    o => o.commands.push('python -c "writeFile()"'),
    o => o.parsed.calls.push(call('agdf_run', {}, { outcome: 'accepted' }))]) {
    const o = observation(); change(o); assert.equal(evaluateSetupObservation(o).success, false);
  }
  assert(!SETUP_PROMPT.includes(operation_id)); assert(!SETUP_PROMPT.includes(target));
  assert(!/sha256|target_id|command-file|operation_id/u.test(SETUP_PROMPT));
});
test('filesystem oracle audits actual canonical receipt, all seeds, authored drift and staging', t => {
  const f = currentFixture(t, { initialize: false }), input = f.request('project.initialize', { language: 'en' });
  assert.equal(f.execute(input).outcome, 'accepted');
  let audit = auditSetupProject(f.root, input.operation_id);
  assert.equal(audit.status, 'initialized'); assert.equal(audit.hashes_match, true, JSON.stringify(audit));
  assert.equal(audit.file_count, 16); assert.equal(audit.approval_created, false);
  assert.equal(auditSetupProject(f.root, randomUUID()).operation_status, 'unknown');
  writeFileSync(join(f.root, '.agdf/control/CONTEXT_GRAPH.md'), 'authored drift\n');
  audit = auditSetupProject(f.root, input.operation_id); assert.equal(audit.hashes_match, false);
  mkdirSync(join(f.root, '.agdf/.control-stage-leftover')); assert.equal(auditSetupProject(f.root, input.operation_id).staging_clean, false);
  rmSync(join(f.root, '.agdf/control/.agdf-canonical-init.json')); assert.notEqual(auditSetupProject(f.root, input.operation_id).operation_status, 'recorded');
});
test('unavailable host preflight retains measured elapsed times and starts no model session', async t => {
  const f = currentFixture(t, { initialize: false });
  // Node is a controlled non-Codex executable: --version works, app-server and
  // plugin list cannot supply a model/plugin. No credentials or real host used.
  const report = await runSetupProbe(join(f.root, 'unavailable-probe'), { env: { CODEX_BIN: process.execPath, PATH: process.env.PATH } });
  assert.equal(report.success, false); assert.equal(report.session_elapsed_ms, null);
  assert(Number.isFinite(report.preflight_elapsed_ms) && report.preflight_elapsed_ms >= 0);
  assert(report.elapsed_ms >= report.preflight_elapsed_ms);
  assert.deepEqual(report.reasons, ['configured_model_cli_or_plugin_unavailable']);
});
