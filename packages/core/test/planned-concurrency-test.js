import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { symlinkOrSkip } from './control-cockpit-fixtures.js';
import { currentOwnedMutationClaimPaths } from '../lib/control-state/control-layout.js';
import { ownedRecordingGitObservation } from '../lib/control-state/run-verified-change.js';
import { readControlLayout, withControlMutation, inspectMutationClaims, retireRecoveredMutationClaim, markControlMutationEffect } from '../lib/control-state/control-layout.js';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'agdf-planned-admission-'));
  mkdirSync(join(root, '.agdf/control'), { recursive: true });
  writeFileSync(join(root, '.agdf/control/config.json'), JSON.stringify({ control_layout: 'run-folders-v1' }));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
const request = () => ({ operation_id: randomUUID(), request_digest: 'sha256:' + 'a'.repeat(64) });
const markerPath = root => join(root, '.agdf/control/maintenance/PLANNED_LAYOUT_PENDING.json');

test('SCN-002/024: Git scope ignores only exact active admission bytes and retains foreign operation paths', t => {
  const root = fixture(t), foreign = `.agdf/control/maintenance/admission/${randomUUID()}.json`;
  withControlMutation(root, { resource: 'run:selected', operation_id: randomUUID() }, () => {
    const [own] = currentOwnedMutationClaimPaths(root), bytes = readFileSync(join(root, own), 'utf8');
    writeFileSync(join(root, foreign), 'foreign retained evidence');
    const observation = ownedRecordingGitObservation({ gitPathList: () => ['README.md', own, foreign] }, 'selected');
    assert.deepEqual(observation.gitPathList(root, []), ['README.md', foreign]);
    writeFileSync(join(root, own), 'foreign replacement');
    assert.throws(() => observation.gitPathList(root, []), /ADMISSION_UNKNOWN/);
    assert.equal(readFileSync(join(root, own), 'utf8'), 'foreign replacement');
    writeFileSync(join(root, own), bytes); // restore the injected fixture fault only
  });
  assert.equal(readFileSync(join(root, foreign), 'utf8'), 'foreign retained evidence');
});

test('SCN-029: layout is explicit and unsupported or unsafe config fails closed', t => {
  const root = fixture(t);
  assert.equal(readControlLayout(root).layout, 'run-folders-v1');
  writeFileSync(join(root, '.agdf/control/config.json'), '{}');
  assert.throws(() => readControlLayout(root), /LAYOUT_UNSUPPORTED/);
  writeFileSync(join(root, '.agdf/control/config.json'), '{"control_layout":"future"}');
  assert.throws(() => readControlLayout(root), /LAYOUT_UNSUPPORTED/);
  rmSync(join(root, '.agdf/control/config.json'));
  writeFileSync(join(root, 'foreign'), '{}');
  if (symlinkOrSkip(join(root, 'foreign'), join(root, '.agdf/control/config.json')))
    assert.throws(() => readControlLayout(root), /PATH_INVALID/);
});

test('SCN-024: selected config change between inspection and claim rejects before effect', t => {
  const root = fixture(t); let effect = false;
  assert.throws(() => withControlMutation(root, { resource: 'run:a', checkpoint(stage) {
    if (stage === 'claim_published') writeFileSync(join(root, '.agdf/control/config.json'), '{"control_layout":"run-folders-v1","changed":true}');
  } }, () => { effect = true; }), /MAINTENANCE_REQUIRED/);
  assert.equal(effect, false); assert.deepEqual(inspectMutationClaims(root), []);
});

test('SCN-024: known failures retire claims; uncertain outcomes require exact proof, never TTL', t => {
  const root = fixture(t);
  assert.throws(() => withControlMutation(root, { resource: 'run:a' }, () => { throw Error('rejected'); }), /rejected/);
  assert.equal(inspectMutationClaims(root).length, 0);
  let pending;
  try { withControlMutation(root, { resource: 'run:a' }, () => { markControlMutationEffect(); throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED'); }); }
  catch (error) { pending = error.admission_claim; }
  assert.ok(pending);
  assert.equal(inspectMutationClaims(root).length, 1);
  assert.throws(() => retireRecoveredMutationClaim(root, { ...pending, proveOutcome: () => false }), /ADMISSION_UNKNOWN/);
  retireRecoveredMutationClaim(root, { ...pending, proveOutcome: claim => claim.resource === 'run:a' });
  assert.equal(inspectMutationClaims(root).length, 0);
});

test('SCN-024: unknown foreign claims remain untouched while independent work stays admitted', t => {
  const root = fixture(t);
  withControlMutation(root, { resource: 'run:a' }, () => {});
  const foreign = join(root, '.agdf/control/maintenance/admission/foreign'); writeFileSync(foreign, 'keep');
  assert.throws(() => inspectMutationClaims(root), /ADMISSION_UNKNOWN/);
  withControlMutation(root, { resource: 'run:b' }, () => assert.equal(readFileSync(foreign, 'utf8'), 'keep'));
  assert.equal(readFileSync(foreign, 'utf8'), 'keep');
});

test('SCN-023/024: independent processes overlap and retire only their original admission', async t => {
  const root = fixture(t), release = join(root, 'release');
  const module = new URL('../lib/control-state/control-layout.js', import.meta.url).href;
  const source = `import { withControlMutation } from ${JSON.stringify(module)};
    import { existsSync } from 'node:fs';
    withControlMutation(process.argv[1], {resource:'run:first'}, () => {
      process.send('admitted'); const until=Date.now()+5000;
      while(!existsSync(process.argv[2])) { if(Date.now()>until) throw Error('barrier_timeout'); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10); }
    }); process.disconnect();`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', source, root, release], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  const exit = once(child, 'exit');
  assert.deepEqual(await once(child, 'message'), ['admitted', undefined]);
  withControlMutation(root, { resource: 'run:second' }, () => {
    assert.equal(inspectMutationClaims(root).length, 2, 'no common exclusive ordinary mutex');
  });
  writeFileSync(release, 'finish');
  assert.deepEqual(await exit, [0, null]);
  assert.equal(inspectMutationClaims(root).length, 0);

});
