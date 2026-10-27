import { resolve } from 'node:path';
import { reassessComparison, runComparison } from '../codex-review/runner.mjs';

const usage = 'Usage: node evals/scripts/run-codex-review.js (--live --model <id> [--effort high] [--timeout-ms 120000] | --reassess <source-directory>) [--out <new-directory>]';
try {
  const args = process.argv.slice(2), options = {};
  if (args.includes('--help')) { console.log(usage); process.exit(0); }
  if (args.includes('--live') === args.includes('--reassess')) throw Error(`${usage}\nChoose exactly one mode. --live enables up to 12 account-backed sessions; --reassess is offline.`);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--live') continue;
    const name = { '--model': 'model', '--effort': 'effort', '--out': 'output', '--timeout-ms': 'timeoutMs', '--reassess': 'source' }[args[i]];
    if (!name || !args[i + 1] || args[i + 1].startsWith('--') || name in options) throw Error(usage);
    options[name] = name === 'timeoutMs' ? Number(args[++i]) : args[++i];
  }
  options.output ??= resolve('probe-results', `codex-review-${new Date().toISOString().replaceAll(':', '-')}`);
  if (options.source) {
    if (options.model || options.effort || options.timeoutMs) throw Error('Reassessment cannot change model, effort or timeout.');
    const report = reassessComparison(options);
    console.log(`Offline reassessment ${report.complete ? 'complete' : 'incomplete'}: ${options.output}/REPORT.md (source preserved, authorizes: false)`);
    if (!report.complete) process.exitCode = 1;
  } else {
    // Parent directory must already exist: never create or overwrite arbitrary trees.
    const controller = new AbortController();
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => controller.abort());
    const report = await runComparison({ ...options, signal: controller.signal,
      onProgress: row => console.log(`${row.case_id} ${row.variant}: ${row.status}${row.error ? ` (${row.error})` : ''}`) });
    console.log(`Comparison ${report.complete ? 'complete' : 'incomplete'}: ${options.output}/REPORT.md (authorizes: false)`);
    if (!report.complete) process.exitCode = 1;
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
