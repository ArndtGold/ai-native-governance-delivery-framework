import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CASES } from '../fixtures.mjs';
import { SCHEMA, aggregate, digest, reviewInput, scoreReview, validateReview } from '../review.mjs';
import { FEATURES, codexArgs, executeSession, inspectTrace, reassessComparison } from '../runner.mjs';

const finding = (item = CASES[0]) => {
  const expected = item.oracle.expected[0];
  return { finding_id: 'F1', requirement_id: expected.requirement_id,
    gap_type: expected.gap_type, source: expected.source, line: expected.lines[0],
    evidence_quote: item.packet.artifacts.find(a => a.path === expected.source).lines[expected.lines[0] - 1],
    explanation: 'A concrete input violates the stated requirement.', required_next_step: 'Correct the defect and add a regression test.' };
};
const result = (item = CASES[0], findings = [finding(item)]) => ({ packet_digest: digest(item.packet), disposition: findings.length ? 'findings' : 'no_findings', findings });
const trace = (extra = []) => [
  { type: 'thread.started', thread_id: 'synthetic-session' }, { type: 'turn.started' }, ...extra,
  { type: 'item.completed', item: { type: 'agent_message', text: '{"result":true}' } },
  { type: 'turn.completed', usage: { input_tokens: 10, cached_input_tokens: 5, output_tokens: 3 } },
].map(e => JSON.stringify(e)).join('\n');

test('hidden executable checks distinguish every defect and its correct counterpart', () => {
  assert.equal(CASES.length, 6);
  for (const item of CASES) {
    assert.equal(item.oracle.check(item.packet), item.oracle.expected.length === 0, item.id);
    assert.equal(item.oracle.check(item.packet), item.oracle.check(structuredClone(item.packet)));
    for (const variant of ['baseline', 'critical']) {
      const input = reviewInput(item.packet, variant);
      assert.ok(input.includes(JSON.stringify(item.packet)));
      assert.ok(!input.includes('expected_findings'));
      assert.ok(!input.includes('oracle'));
    }
  }
});

test('bindings, exact citations and output schema reject fabricated findings', () => {
  assert.deepEqual(validateReview(result(), CASES[0].packet), result());
  for (const [field, value, expected] of [
    ['requirement_id', 'AC-999', /unknown_requirement/],
    ['source', '../../secret', /unverifiable_citation/],
    ['line', 99, /unverifiable_citation/],
    ['evidence_quote', 'invented line', /unverifiable_citation/],
    ['evidence_quote', ' ', /unverifiable_citation/],
    ['gap_type', 'pass', /invalid_schema/],
  ]) {
    const r = result(); r.findings[0][field] = value;
    assert.throws(() => validateReview(r, CASES[0].packet), expected);
  }
  assert.throws(() => validateReview({ ...result(), authorizes: true }, CASES[0].packet), /invalid_schema/);
  assert.throws(() => validateReview({ ...result(), packet_digest: digest(CASES[1].packet) }, CASES[0].packet), /packet_binding_mismatch/);
  assert.throws(() => validateReview({ ...result(), disposition: 'no_findings' }, CASES[0].packet), /contradictory/);
  assert.throws(() => validateReview({ ...result(), disposition: 'insufficient_evidence' }, CASES[0].packet), /missing_evidence/);
  assert.throws(() => validateReview(result(CASES[0], [finding(), finding()]), CASES[0].packet), /duplicate_finding_id/);
  const stale = structuredClone(CASES[0].packet); stale.artifacts[0].lines[1] += ' // changed';
  assert.throws(() => validateReview(result(), stale), /packet_binding_mismatch/);
  assert.equal(SCHEMA.additionalProperties, false);
});

test('scoring distinguishes misses and false clears from unmatched and redundant observations', () => {
  const correct = scoreReview(result(), CASES[0].oracle);
  assert.deepEqual([correct.true_positives, correct.false_negatives, correct.unmatched_findings], [1, 0, 0]);
  const missed = scoreReview(result(CASES[0], []), CASES[0].oracle);
  assert.equal(missed.false_clear, true); assert.equal(missed.false_negatives, 1);
  const wrongCategory = result(); wrongCategory.findings[0].gap_type = 'evidence_gap';
  const wrong = scoreReview(wrongCategory, CASES[0].oracle);
  assert.equal(wrong.true_positives, 0); assert.equal(wrong.unmatched_findings, 1); assert.equal(wrong.false_negatives, 1);
  const duplicate = scoreReview(result(CASES[0], [finding(), { ...finding(), finding_id: 'F2' }]), CASES[0].oracle);
  assert.equal(duplicate.true_positives, 1); assert.equal(duplicate.redundant_findings, 1); assert.equal(duplicate.unmatched_findings, 0);
  const falseAlarm = scoreReview(result(CASES[1], [finding()]), CASES[1].oracle);
  assert.equal(falseAlarm.clean_case_flagged, true); assert.equal(falseAlarm.unmatched_findings, 1);
  assert.equal(scoreReview(result(CASES[1], []), CASES[1].oracle).clean_case_flagged, false);
});

test('invalid or unmeasured sessions cannot improve quality metrics', () => {
  const rows = [{ variant: 'critical', status: 'invalid', wall_time_ms: 11 },
    { variant: 'critical', status: 'measured', wall_time_ms: 12, usage: null, score: scoreReview(result(CASES[0], []), CASES[0].oracle) }];
  const a = aggregate(rows, 'critical');
  assert.equal(a.measured, 1); assert.equal(a.invalid, 1); assert.equal(a.recall, 0);
  assert.equal(a.wall_time_ms, 23); assert.equal(a.usage, null); assert.equal(a.cost_usd, null);
  assert.equal(a.precision, null, 'unmatched findings need independent semantic labels');
  assert.equal(aggregate([], 'baseline').recall, null);
  assert.equal(aggregate([], 'baseline').usage, null);
});

test('event audit refuses tools, failed/incomplete turns and mismatched final output', () => {
  assert.equal(inspectTrace(trace(), '{"result":true}').tool_calls, 0);
  for (const type of ['command_execution', 'mcp_tool_call', 'file_change', 'tool_search', 'unknown_tool']) {
    assert.throws(() => inspectTrace(trace([{ type: 'item.started', item: { type } }]), '{"result":true}'), /unexpected_tool_or_action/);
  }
  for (const type of ['turn.failed', 'error']) assert.throws(() => inspectTrace(trace([{ type }]), '{"result":true}'), /incomplete/);
  assert.throws(() => inspectTrace(trace(), 'different'), /trace_mismatch/);
  assert.throws(() => inspectTrace('{}'), /incomplete/);
  assert.throws(() => inspectTrace('not json'), /JSON/);
});

test('only identified pre-turn host diagnostics are distinct from model actions or errors', () => {
  const notice = { type: 'item.completed', item: { type: 'error', message: 'Under-development features enabled: skip_host_skill_discovery. Host notice.' } };
  const base = trace().split('\n').map(line => JSON.parse(line));
  const beforeTurn = [base[0], notice, ...base.slice(1)].map(e => JSON.stringify(e)).join('\n');
  assert.equal(inspectTrace(beforeTurn, '{"result":true}').startup_diagnostics.length, 1);
  assert.throws(() => inspectTrace(trace([notice]), '{"result":true}'), /unexpected_tool_or_action/);
  const unknown = structuredClone(notice); unknown.item.message = 'Authentication failed';
  assert.throws(() => inspectTrace([base[0], unknown, ...base.slice(1)].map(e => JSON.stringify(e)).join('\n'), '{"result":true}'), /unexpected_tool_or_action/);
});

test('offline reassessment preserves sources, binds original inputs and keeps partial results incomplete', () => {
  const dir = mkdtempSync(join(tmpdir(), 'codex-reassess-test-'));
  try {
    const source = join(dir, 'source'), output = join(dir, 'assessment'), cell = join(source, 'C01-baseline');
    mkdirSync(cell, { recursive: true });
    const r = result(), final = JSON.stringify(r);
    const events = trace().replace('{\\"result\\":true}', JSON.stringify(r).replaceAll('"', '\\"'));
    writeFileSync(join(cell, 'prompt.txt'), reviewInput(CASES[0].packet, 'baseline'));
    writeFileSync(join(cell, 'final.json'), final);
    writeFileSync(join(cell, 'events.jsonl'), events);
    const report = { schema_version: '1', kind: 'synthetic_codex_review_comparison', complete: false,
      host: { cli: 'codex-cli 0.163.0', model: 'test-model', effort: 'high', platform: 'test', arch: 'test' },
      experiment: {
        cases_digest: digest(CASES.map(({ id, packet, oracle }) => ({ id, packet, expected: oracle.expected }))),
        fixtures_digest: digest(readFileSync(new URL('../fixtures.mjs', import.meta.url), 'utf8')),
        review_contract_digest: digest(readFileSync(new URL('../review.mjs', import.meta.url), 'utf8')),
      },
      sessions: [{ case_id: 'C01', variant: 'baseline', packet_digest: digest(CASES[0].packet),
        wall_time_ms: 23, status: 'invalid', error: 'unexpected_tool_or_action' }],
    };
    const original = JSON.stringify(report);
    writeFileSync(join(source, 'report.json'), original);
    const derived = reassessComparison({ source, output });
    assert.equal(derived.complete, false);
    assert.equal(derived.summary.baseline.measured, 1);
    assert.equal(derived.summary.baseline.true_positives, 1);
    assert.equal(derived.derived_analysis.inputs.length, 1);
    assert.equal(readFileSync(join(source, 'report.json'), 'utf8'), original);
    assert.equal(readFileSync(join(cell, 'events.jsonl'), 'utf8'), events);
    assert.throws(() => reassessComparison({ source, output }), /EEXIST/);
    report.experiment.cases_digest = digest('changed cases');
    writeFileSync(join(source, 'report.json'), JSON.stringify(report));
    assert.throws(() => reassessComparison({ source, output: join(dir, 'stale') }), /comparison_source_mismatch/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('worker invocation confines reviews to fresh inline packets with no execution tools', () => {
  const args = codexArgs({ workspace: '/tmp/fixture', schema: '/tmp/schema', final: '/tmp/final', model: 'test-model', effort: 'high' });
  for (const flag of ['--ignore-user-config', '--ephemeral', '--json', '--sandbox', '--output-schema']) assert.ok(args.includes(flag));
  assert.equal(args[args.indexOf('--sandbox') + 1], 'read-only');
  assert.ok(args.includes('mcp_servers={}')); assert.ok(args.includes('approval_policy="never"'));
  assert.ok(!args.includes('resume')); assert.ok(!args.includes('fork'));
  assert.ok(!args.some(value => value.includes('agdf') || value.includes('bypass')));
  for (const name of ['shell_tool', 'plugins', 'remote_plugin', 'apps', 'hooks', 'multi_agent', 'code_mode_host']) assert.equal(FEATURES[name], false);
});

test('process execution captures failure and bounds hangs without a model or network', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'codex-review-test-'));
  try {
    const file = join(dir, 'fixture.cjs');
    writeFileSync(file, 'process.stdin.resume(); process.stdin.on("end",()=>{console.log("out");console.error("err");process.exit(7)});');
    const failed = await executeSession({ executable: process.execPath, args: [file], input: 'packet', cwd: dir, timeoutMs: 1000 });
    assert.equal(failed.code, 7); assert.equal(failed.stdout.trim(), 'out'); assert.equal(failed.stderr.trim(), 'err');
    writeFileSync(file, 'setInterval(()=>{}, 1000);');
    const timed = await executeSession({ executable: process.execPath, args: [file], input: '', cwd: dir, timeoutMs: 100 });
    assert.equal(timed.failure, 'timeout'); assert.ok(timed.wall_time_ms < 5000);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
