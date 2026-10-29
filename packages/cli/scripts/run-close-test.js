import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Synthetic isolated repository only; preview and apply go through the repository CLI and the
// surface-local validator with the same Core text. No real run of this repository is closed.
const root = mkdtempSync(join(tmpdir(), 'agdf-run-close-cli-')), home = mkdtempSync(join(tmpdir(), 'agdf-run-close-home-'));
const repositoryCli = resolve(import.meta.dirname, '../bin/create-agdf.js'), validator = resolve(import.meta.dirname, '../bin/agdf-validator.js');
// A synthetic Git identity in a temporary HOME; the real user configuration is never read.
const env = { ...process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, '.config') };
const run = (bin, ...args) => {
  const result = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env });
  let value = null; try { value = JSON.parse(result.stdout); } catch {}
  return { code: result.status, value, text: result.stdout, error: result.stderr };
};
const state = id => readFileSync(join(root, '.agdf', 'control', 'runs', id, 'RUN_STATE.md'), 'utf8');
try {
  execFileSync('git', ['init', '-q', root]);
  writeFileSync(join(home, '.gitconfig'), '[user]\n\tname = Synthetic CLI Owner\n\temail = cli-owner@example.invalid\n');
  assert.equal(run(repositoryCli, 'init', '--dir', root, '--language', 'en').code, 0);
  for (const id of ['cli-a', 'cli-b', 'cli-c', 'cli-d']) assert.equal(run(repositoryCli, 'run-create', '--dir', root, '--run', id).code, 0);

  // Option grammar: explicit actions, exactly one entry source, an exclusive successor kind.
  for (const args of [['--action', 'close'], [], ['--action', 'preview'], ['--action', 'preview', '--run', 'cli-a', '--outcome', 'abandoned'],
    ['--action', 'preview', '--run', 'cli-a', '--outcome', 'superseded', '--reason', 'x', '--successor-run', 'cli-b', '--successor-ref', 'PR'],
    ['--action', 'preview', '--closure-file', 'x.json', '--run', 'cli-a'], ['--action', 'apply', '--preview-id', 'abcd1234'],
    ['--action', 'apply', '--preview-id', 'abcd1234', '--confirmation', 'Close runs: abcd1234', '--run', 'cli-a'],
    ['--action', 'preview', '--run', 'cli-a', '--outcome', 'abandoned', '--reason', 'x', '--reason', 'y']]) {
    const refused = run(repositoryCli, 'run-close', '--dir', root, ...args);
    assert.notEqual(refused.code, 0, args.join(' ')); assert.ok(refused.error.trim(), args.join(' '));
  }
  assert.notEqual(run(repositoryCli, 'run-step', '--dir', root, '--run', 'cli-a', '--revision', 'x', '--step', 'evidence', '--evidence', 'x', '--outcome', 'abandoned').code, 0);
  assert.match(run(repositoryCli, '--help').text, /run-close --action apply --preview-id <8-hex> --confirmation "Close runs: <preview_id>"/u);
  assert.match(run(validator, '--help').text, /run-close/u);

  // SCN-020: an unknown successor run is refused and nothing is stored.
  const unknown = run(repositoryCli, 'run-close', '--dir', root, '--json', '--action', 'preview', '--run', 'cli-a', '--outcome', 'superseded', '--reason', 'Replaced', '--successor-run', 'no-such-run');
  assert.equal(unknown.code, 2); assert.deepEqual(unknown.value.problems, [{ index: 0, run_id: 'cli-a', problem: 'successor_run_unknown' }]);

  // SCN-002, SCN-020: one entry through --run with an explicit successor kind; text output is the Core text.
  const single = run(repositoryCli, 'run-close', '--dir', root, '--action', 'preview', '--run', 'cli-a', '--outcome', 'superseded', '--reason', 'Replaced by cli-b', '--successor-run', 'cli-b');
  assert.equal(single.code, 0, single.error);
  const singleId = single.text.match(/^Closure preview ([0-9a-f]{8}) · 1 run · digest [0-9a-f]{12}$/mu)?.[1];
  assert.ok(singleId, single.text);
  assert.ok(single.text.includes('A closed run is final: it cannot be reopened, and continuing the work needs a new run.'));
  assert.ok(single.text.includes(`reply exactly: Close runs: ${singleId}`)); assert.ok(single.text.includes('Outcome: superseded by cli-b'));
  const german = run(repositoryCli, 'run-close', '--dir', root, '--language', 'de', '--action', 'preview', '--run', 'cli-a', '--outcome', 'abandoned', '--reason', 'Nicht mehr nötig');
  assert.match(german.text, /^Abschlussvorschau [0-9a-f]{8} · 1 Run · Digest [0-9a-f]{12}$/mu); assert.match(german.text, /genau antworten: Close runs: [0-9a-f]{8}$/mu);

  // A closure file through the surface-local validator, with a free reference and JSON output.
  const file = join(root, 'closure.json');
  writeFileSync(file, JSON.stringify({ entries: [{ run_id: 'cli-c', outcome: 'superseded', reason: 'Moved to a package', successor_reference: 'PR #41' },
    { run_id: 'cli-d', outcome: 'abandoned', reason: 'Dropped' }] }));
  const listed = run(validator, 'run-close', '--dir', root, '--json', '--action', 'preview', '--closure-file', file);
  assert.equal(listed.code, 0, listed.error); assert.equal(listed.value.outcome, 'preview'); assert.equal(listed.value.run_count, 2);
  assert.deepEqual(listed.value.entries[0].successor, { kind: 'reference', value: 'PR #41', verified: false });
  assert.equal(listed.value.text.split('\n')[2], `To close the closable runs below, reply exactly: ${listed.value.confirmation_phrase}`);
  writeFileSync(join(root, 'broken.json'), '{"entries": [');
  assert.equal(run(validator, 'run-close', '--dir', root, '--action', 'preview', '--closure-file', join(root, 'broken.json')).code, 1);

  // Apply: a wrong phrase changes nothing; the exact phrase closes; a repeat reports the runs as already closed.
  const before = [state('cli-c'), state('cli-d')];
  const wrong = run(validator, 'run-close', '--dir', root, '--json', '--action', 'apply', '--preview-id', listed.value.preview_id, '--confirmation', `Close runs: ${singleId}`);
  assert.equal(wrong.code, 2); assert.equal(wrong.value.reason, 'confirmation_other_preview'); assert.deepEqual([state('cli-c'), state('cli-d')], before);
  const applied = run(validator, 'run-close', '--dir', root, '--json', '--action', 'apply', '--preview-id', listed.value.preview_id, '--confirmation', listed.value.confirmation_phrase);
  assert.equal(applied.code, 0, applied.error); assert.equal(applied.value.outcome, 'applied');
  assert.deepEqual(applied.value.results.map(row => row.result), ['closed', 'closed']);
  assert.deepEqual(applied.value.confirmed_by, { name: 'Synthetic CLI Owner', email: 'cli-owner@example.invalid', statement: 'cooperative' });
  assert.match(state('cli-c'), /^- lifecycle: superseded$/mu); assert.match(state('cli-d'), /^- lifecycle: abandoned$/mu);
  const text = run(repositoryCli, 'run-close', '--dir', root, '--action', 'apply', '--preview-id', listed.value.preview_id, '--confirmation', listed.value.confirmation_phrase);
  assert.equal(text.code, 0); assert.ok(text.text.includes('1. `cli-c`: already closed by this preview'), text.text);
  const singleApplied = run(repositoryCli, 'run-close', '--dir', root, '--action', 'apply', '--preview-id', singleId, '--confirmation', `Close runs: ${singleId}`);
  assert.ok(singleApplied.text.includes('1. `cli-a`: closed as superseded by cli-b'), singleApplied.text);
  assert.ok(singleApplied.text.includes('Confirmed by: Synthetic CLI Owner <cli-owner@example.invalid> (cooperative local Git statement)'));
  // The closed runs no longer appear as active.
  const active = run(repositoryCli, 'doctor', '--dir', root, '--json', '--all-active').value.runs.map(row => row.run_id);
  assert.deepEqual(active, ['cli-b']);
  console.log('run-close preview and apply through the repository CLI and the surface-local validator passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(home, { recursive: true, force: true }); }
