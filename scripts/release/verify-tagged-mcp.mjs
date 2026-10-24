import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ciJobs, ciJobPlan, CI_EXECUTION_BUDGET_MS } from '../ci-plan.mjs';
import { executeVerificationPlan } from '../verify-ci.mjs';
import { assertReleaseSource } from './resume-0200.mjs';

const repository = resolve(process.argv[3]);
assertReleaseSource(repository);
const { ciJobs: originalJobs } = await import(pathToFileURL(resolve(repository, 'scripts/ci-plan.mjs')));
const jobs = ciJobs({ scope: 'linux', suite: 'mcp' });
// Recovery may repair preparation, but must execute the original tag's entire
// MCP inventory, including all revision scenarios, without filtering failures.
assert.deepEqual(jobs, originalJobs({ scope: 'linux', suite: 'mcp' }));
const job = jobs.find(row => row.id === process.argv[2]);
if (!job || process.platform !== 'linux' || Number(process.versions.node.split('.')[0]) !== 22) throw Error('Invalid recovery lane');
const plan = ciJobPlan(job, { suite: 'mcp', published: true });
plan.find(stage => stage.id === 'mcp-dependencies').commands[0].args[0] = fileURLToPath(new URL('./install-published-mcp.mjs', import.meta.url));
const started = Date.now();
executeVerificationPlan(plan, { repository, execute: (executable, argv, options) => {
  const remaining = CI_EXECUTION_BUDGET_MS - (Date.now() - started);
  if (remaining <= 0) throw Error('Recovery verification exceeded its execution budget');
  return spawnSync(executable, argv, { ...options, timeout: remaining });
} });
assertReleaseSource(repository);
