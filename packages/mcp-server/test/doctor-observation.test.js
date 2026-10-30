import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createRun } from '../../core/lib/control-state/run-state-repository.js';
import { evaluateDoctor } from '../../core/lib/control-evaluation/doctor.js';

const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
const base = { operation: 'doctor', presentation_language: 'en', working_directory: root,
  primary_target: root, target_source: 'explicit_target', all_active: true };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fingerprint(path = join(root, '.agdf/control')) {
  return readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .map(entry => [entry.name, entry.isDirectory() ? fingerprint(join(path, entry.name)) : hash(readFileSync(join(path, entry.name)))]);
}
const findingKeys = rows => rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row)
  .sort(([left], [right]) => left.localeCompare(right))))).sort();
try {
  const absent = join(fixture.root, 'absent-target');
  mkdirSync(join(absent, '.git'), { recursive: true }); writeFileSync(join(absent, '.git/HEAD'), 'ref: refs/heads/main\n');
  for (const modern of [false, true]) await withStdioClient({ ...fixture, modern }, async client => {
    const { structuredContent: { report } } = await client.callTool({ name: 'agdf_inspect', arguments: {
      ...base, working_directory: absent, primary_target: absent } });
    assert.equal(report.available, true); assert.equal(report.inventory.state, 'absent');
    assert.equal(report.status, evaluateDoctor(absent, { allActive: true }).status);
    assert.deepEqual(report.runs, []); assert.equal(existsSync(join(absent, '.agdf')), false);
  });
  let count = 0;
  for (const wanted of [0, 1, 10, 100]) {
    while (count < wanted) createRun(root, `doctor-${String(++count).padStart(3, '0')}`);
    const before = fingerprint(), reference = evaluateDoctor(root, { allActive: true });
    for (const modern of [false, true]) await withStdioClient({ ...fixture, modern }, async client => {
      let args = base, first, final; const runs = [], findings = []; let pages = 0;
      do {
        const reply = await client.callTool({ name: 'agdf_inspect', arguments: args });
        assert.equal(reply.isError, undefined, JSON.stringify(reply));
        const report = reply.structuredContent.report;
        assert.equal(report.available, true); assert.ok(report.runs.length <= 20);
        first ??= report; final = report; pages++;
        runs.push(...report.runs.map(row => row.run_id)); findings.push(...report.findings);
        assert.equal(report.inventory.accounted_count + report.inventory.remaining_count, wanted);
        if (report.next_cursor) {
          assert.equal(report.overall_status, null); assert.equal(report.completeness, 'partial');
          assert.equal(report.next_calls.length, 1); args = report.next_calls[0].arguments;
        } else break;
      } while (pages < 64);
      assert.equal(final.completeness, 'complete'); assert.equal(final.status, reference.status);
      assert.equal(final.inventory.accounted_count, wanted); assert.equal(new Set(runs).size, wanted);
      assert.deepEqual(findingKeys(findings), findingKeys(reference.findings));
      if (wanted === 100) {
        assert.ok(pages >= 5);
        await withStdioClient({ ...fixture, modern }, async foreign => {
          const reply = await foreign.callTool({ name: 'agdf_inspect', arguments: { ...base, cursor: first.next_cursor } });
          assert.equal(reply.structuredContent.report.reason, 'diagnostic_cursor_invalid');
          assert.equal(reply.structuredContent.report.overall_status, null);
        });
        const outOfOrder = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, cursor: `${first.observation_id}:999` } });
        assert.equal(outOfOrder.structuredContent.report.reason, 'diagnostic_cursor_invalid');
        for (const cursor of [first.next_cursor + ':extra', first.next_cursor + '\n',
          `${first.observation_id}:0${first.next_cursor.split(':')[1]}`]) {
          const malformed = await client.callTool({ name: 'agdf_inspect', arguments: { ...base, cursor } });
          assert.equal(malformed.isError, true); assert.equal(malformed.structuredContent, undefined);
          assert.match(malformed.content.map(item => item.text ?? '').join('\n'), /Input validation error[\s\S]*cursor/iu,
            'the real SDK rejects malformed cursor syntax before Core execution');
        }
        const replay = await client.callTool({ name: 'agdf_inspect', arguments: first.next_calls[0].arguments });
        assert.equal(replay.structuredContent.report.available, true, 'bad or foreign cursors must not retire the valid observation');
        const backlog = join(root, '.agdf/control/MASTER_BACKLOG.md'), content = readFileSync(backlog, 'utf8');
        try {
          writeFileSync(backlog, content + '\n');
          const changed = await client.callTool({ name: 'agdf_inspect', arguments: first.next_calls[0].arguments });
          assert.equal(changed.structuredContent.report.available, false);
          assert.equal(changed.structuredContent.report.reason, 'source_changed');
          assert.equal(changed.structuredContent.report.overall_status, null);
          assert.equal(changed.structuredContent.report.next_calls[0].arguments.cursor, undefined);
        } finally { writeFileSync(backlog, content); }
      }
    });
    assert.deepEqual(fingerprint(), before, 'successful reads and deliberate restored fixture mutation leave no canonical effect');
  }
  mkdirSync(join(root, '.agdf/control/runs/unsupported'));
  writeFileSync(join(root, '.agdf/control/runs/unsupported/RUN_STATE.md'), '# Unsupported canonical history\n');
  const futurePath = createRun(root, 'future-format');
  writeFileSync(futurePath, readFileSync(futurePath, 'utf8').replace('- control_state_version: 2', '- control_state_version: 3'));
  const invalidReference = evaluateDoctor(root, { allActive: true });
  for (const modern of [false, true]) await withStdioClient({ ...fixture, modern }, async client => {
    let args = base, final, invalid = 0; const findings = [];
    for (let page = 0; page < 64; page++) {
      const { structuredContent: { report } } = await client.callTool({ name: 'agdf_inspect', arguments: args });
      assert.equal(report.available, true); invalid += report.invalid_entries.length; final = report;
      findings.push(...report.findings);
      if (!report.next_cursor) break;
      args = report.next_calls[0].arguments;
    }
    assert.equal(invalid, 2); assert.equal(final.inventory.accounted_count, 102);
    assert.equal(final.completeness, 'complete'); assert.equal(final.overall_status, 'block');
    assert.deepEqual(findingKeys(findings), findingKeys(invalidReference.findings), 'all invalid-entry finding fields match direct Core diagnosis');
    const { all_active, ...selected } = base;
    const reply = await client.callTool({ name: 'agdf_inspect', arguments: { ...selected, run_id: 'future-format' } });
    assert.equal(reply.isError, undefined, 'a completed incompatible-version diagnosis is distinct from transport failure');
    const report = reply.structuredContent.report;
    assert.equal(report.status, 'block');
    const incompatible = report.findings.find(finding => finding.code === 'AGDF_RUN_VERSION_UNSUPPORTED');
    assert.equal(incompatible?.classification, 'unsupported_version'); assert.equal(incompatible.actual_version, '3');
    assert.equal(incompatible.path, futurePath); assert.match(incompatible.next_step, /compatible reader/iu);
  });
  console.log('Owned STDIO doctor: both protocols, absent control plus complete 0/1/10/100 inventories, exact finding parity, foreign/order/mutation failures and invalid-entry accounting passed.');
} finally { fixture.dispose(); }
