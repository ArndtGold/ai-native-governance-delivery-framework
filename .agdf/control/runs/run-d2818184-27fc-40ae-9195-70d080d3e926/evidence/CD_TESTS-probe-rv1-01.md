# RV-1 probe: run view under concurrent writes (run-d2818184-27fc-40ae-9195-70d080d3e926)

Run for the QA follow-up on 2026-11-06 against the corrected working tree (Windows 11, Node v22.22.3). Not part of the repository; it imports the repository's fixture factory and Core modules and writes only inside the temporary fixture.

Claim (CODE_REVIEW-input-02 RV-01): a write during a read no longer makes the whole run view unavailable. The automated test covers the bounded retry with an injected capture; this probe repeats the follow-up reviewer's real scenario once.

Method: a child process rewrites the same bytes of the F03 run's `documents/PRD.md` every 50 ms. Interleaved 20 times: (a) one `captureControlScope` around `evaluateGateCheck` without retry, as the first CIR-01 correction read; (b) the corrected `readRunView`.

Observed:

```text
{"fixture":"F03","rewrites_every_ms":50,"rewrites":52,"seconds":3,"capture_attempts":3,"single_capture_without_retry":{"ok":6,"source_changed":14,"other":0},"corrected_run_view":{"ok":15,"store_unavailable":0,"run_source_changed":5,"other":0}}
```

Assessment: Under a rewrite of the F03 run's `documents/PRD.md` every 50 ms, a single captured read without retry failed 14 of 20 times with `source_changed`; the corrected run view never reported the store unavailable, returned 15 of 20 views complete and 5 with that run marked `source_changed` after its bounded retries. The companion now treats such a view like a transient read failure and keeps its last good view (test case in `claude-companion-test.js`, red without the rule). Limit: a probe under continuous writes, not a permanent regression test (timing dependent).

```js
// RV-1 evidence probe (not part of the repository): the follow-up reviewer's scenario against the corrected
// run view. A child process rewrites the same bytes of the F03 run's documents/PRD.md every 50 ms; meanwhile
// (a) a single captured gate-check without retry, as the first CIR-01 correction read, and (b) the corrected
// readRunView are each called 20 times, interleaved. Output: how often each read failed or succeeded.
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const repo = 'file:///C:/Workspace/ai-native-governance-delivery-framework/packages/core/';
const { buildCompanionFixtures } = await import(`${repo}test/fixtures/companion-fixtures.js`);
const { readRunView, CAPTURE_ATTEMPTS } = await import(`${repo}lib/companion/run-view.js`);
const { captureControlScope } = await import(`${repo}lib/control-read/snapshot.js`);
const { evaluateGateCheck } = await import(`${repo}lib/control-evaluation/gate-check.js`);
const cleanups = [];
const [fx] = buildCompanionFixtures({ after: fn => cleanups.push(fn) }, ['F03']);
const target = join(fx.root, '.agdf', 'control', 'runs', fx.runId, 'documents', 'PRD.md');
const writerSource = `const fs = require('fs'); const p = process.argv[1]; const b = fs.readFileSync(p);
  let n = 0; const t = setInterval(() => { fs.writeFileSync(p, b); n += 1; }, 50);
  process.on('message', () => { clearInterval(t); process.send(n); process.exit(0); });`;
const writer = spawn(process.execPath, ['-e', writerSource, target], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
await new Promise(resolve => setTimeout(resolve, 300));
const single = { ok: 0, source_changed: 0, other: 0 }, corrected = { ok: 0, store_unavailable: 0, run_source_changed: 0, other: 0 };
const started = Date.now();
for (let i = 0; i < 20; i++) {
  try {
    captureControlScope(fx.root, view => evaluateGateCheck(view.root, { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: 'en' }));
    single.ok += 1;
  } catch (error) { if (error.code === 'source_changed') single.source_changed += 1; else single.other += 1; }
  const view = readRunView(fx.root, { runIds: [fx.runId] });
  const entry = view.runs.find(run => run.run_id === fx.runId);
  if (view.store.status !== 'ok') corrected.store_unavailable += 1;
  else if (entry?.evaluated) corrected.ok += 1;
  else if (entry?.evaluation_error === 'source_changed') corrected.run_source_changed += 1;
  else corrected.other += 1;
}
const writes = await new Promise(resolve => { writer.once('message', resolve); writer.send('stop'); });
console.log(JSON.stringify({ fixture: 'F03', rewrites_every_ms: 50, rewrites: writes, seconds: Math.round((Date.now() - started) / 1000),
  capture_attempts: CAPTURE_ATTEMPTS, single_capture_without_retry: single, corrected_run_view: corrected }));
for (const fn of cleanups) fn();
```
