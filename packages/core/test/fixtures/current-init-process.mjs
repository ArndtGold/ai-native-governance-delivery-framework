import { readFileSync, writeSync } from 'node:fs';
import { currentFixture } from './current-run.js';
const [root, path, phase] = process.argv.slice(2);
const f = currentFixture({ after() {} }, { root, initialize: false, checkpoint(point) {
  if (point === phase) { writeSync(1, 'AGDF_KILL_CHECKPOINT'); process.kill(process.pid, 'SIGKILL'); }
} });
const result = f.execute(JSON.parse(readFileSync(path, 'utf8')));
if (!['accepted', 'already_applied'].includes(result.outcome)) { process.stderr.write(JSON.stringify(result)); process.exitCode = 2; }
