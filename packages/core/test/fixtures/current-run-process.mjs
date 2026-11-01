// Real-process checkpoints for the current command/transaction owner.
import { existsSync, readFileSync, writeSync } from 'node:fs';
import { currentFixture } from './current-run.js';
const [root, inputPath, phase, release] = process.argv.slice(2);
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const f = currentFixture({ after() {} }, { root, initialize: false, checkpoint(point) {
  if (point !== phase) return;
  if (!release) { writeSync(1, 'AGDF_KILL_CHECKPOINT'); process.kill(process.pid, 'SIGKILL'); }
  else {
    process.send('held'); const deadline = Date.now() + 15000;
    while (!existsSync(release)) { if (Date.now() > deadline) throw Error('barrier_timeout'); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10); }
  }
} });
const source = f.material(input.binding, 'UR', input.content);
const result = f.execute(f.request('step.record', { step: 'ur', title: input.title, source }, { ...input.binding, operation_id: input.operation_id }));
if (!['accepted', 'already_applied'].includes(result.outcome)) { process.stderr.write(JSON.stringify(result)); process.exitCode = 2; }
if (process.connected) process.disconnect();
