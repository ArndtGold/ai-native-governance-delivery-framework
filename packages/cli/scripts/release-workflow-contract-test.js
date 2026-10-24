import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { verificationPlan } from "../../../scripts/verify-ci.mjs";

// Validate the actual npm entrypoints, including suites not reached by individual probes.
const packageRoot = new URL("../", import.meta.url);
const packageManifest = JSON.parse(readFileSync(new URL("package.json", packageRoot), "utf8"));
for (const [name, command] of Object.entries(packageManifest.scripts)) {
  for (const [, entrypoint] of command.matchAll(/\bnode\s+((?:\.\/)?(?:scripts\/|\.\.\/)[^\s&]+)/gu)) {
    assert.ok(existsSync(new URL(entrypoint, packageRoot)), `${name} references missing npm entrypoint ${entrypoint}`);
  }
}

const root = new URL("../../../.github/workflows/", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");
const publishText = read("publish-agdf.yml");
const guardrailsText = read("agdf-guardrails.yml");
const nativeText = read("codex-release-e2e.yml");
const evidenceText = read("host-compatibility-evidence.yml");
assert.equal(existsSync(new URL("publish-create-agdf.yml", root)), false);
const publish = YAML.parse(publishText);
const guardrails = YAML.parse(guardrailsText);
const native = YAML.parse(nativeText);
const evidence = YAML.parse(evidenceText);
// Expand shared plan steps for the same ordering assertions as direct workflow commands.
function expandVerificationSteps(steps) {
  return steps.flatMap(step => {
    const invocation = /^node scripts\/verify-ci\.mjs --(stage|lane|profile) ([\w-]+)$/u.exec(step.run ?? '');
    if (!invocation) return [step];
    return verificationPlan({ [invocation[1]]: invocation[2] }).flatMap(stage => stage.commands.map(command => ({
      run: `${command.tool} ${command.args.join(' ')}`, ...(command.cwd ? { 'working-directory': command.cwd } : {}),
    })));
  });
}
assert.equal(guardrails.jobs.verify.uses, './.github/workflows/verify-agdf.yml');
assert.equal(publish.jobs.tests.uses, './.github/workflows/verify-agdf.yml');
assert.equal(publish.jobs.tests.with.scope, 'linux');
assert.ok(publish.jobs.publish.needs.includes('tests'));
const guardrailPlan = verificationPlan().flatMap(stage => stage.commands.map(command => ({
  run: `${command.tool} ${command.args.join(' ')}`, ...(command.cwd ? { 'working-directory': command.cwd } : {}),
})));
function assertFixtureDependencies(steps) {
  const installs = steps.map((step, index) => ({ step, index })).filter(({ step }) =>
    step['working-directory'] === 'packages/mcp-server' && step.run === 'npm ci --ignore-scripts');
  const fixture = steps.findIndex(step => String(step.run ?? '').includes('test:host-compatibility'));
  const prepare = steps.findIndex(step => String(step.run ?? '').includes('release:prepare'));
  assert.equal(installs.length, 1, 'source fixtures require one locked MCP dependency installation');
  assert.ok(prepare >= 0 && prepare < installs[0].index, 'CLI payloads must be prepared before MCP packs its local dependency');
  assert.ok(fixture >= 0 && installs[0].index < fixture, 'MCP dependencies must be installed before host compatibility fixtures');
}
for (const steps of [guardrailPlan, expandVerificationSteps(evidence.jobs.record.steps)]) {
  assertFixtureDependencies(steps);
  const missing = steps.filter(step => step['working-directory'] !== 'packages/mcp-server');
  assert.throws(() => assertFixtureDependencies(missing), /one locked MCP dependency installation/);
  const late = [...missing, steps.find(step => step['working-directory'] === 'packages/mcp-server')];
  assert.throws(() => assertFixtureDependencies(late), /before host compatibility fixtures/);
  const early = [steps.find(step => step['working-directory'] === 'packages/mcp-server'), ...missing];
  assert.throws(() => assertFixtureDependencies(early), /before MCP packs its local dependency/);
}
assert.deepEqual(publish.on.push.tags, ["agdf-v*"]);
assert.deepEqual(guardrails.on.push.branches, ["main"]);
assert.deepEqual(guardrails.permissions, { contents: "read" });
assert.ok(Object.hasOwn(guardrails.on, "workflow_dispatch"));
assert.deepEqual(Object.keys(evidence.on).sort(), ["push", "workflow_dispatch"]);
assert.deepEqual(evidence.on.push.branches, ["main"]);
assert.deepEqual(evidence.permissions, { contents: "read" });
assert.equal(evidence.jobs.record.if, "github.ref == 'refs/heads/main'");
assert.equal(evidence.concurrency["cancel-in-progress"], false);
assert.equal(evidence.jobs.publish.needs, "record");
assert.equal(evidence.jobs.publish.if, "needs.record.outputs.changed == 'true'");
assert.deepEqual(evidence.jobs.publish.permissions, { contents: "write", "pull-requests": "write", actions: "write" });
for (const job of Object.values(evidence.jobs)) {
  assert.equal(job.steps.find(step => step.uses?.startsWith("actions/checkout@")).with["persist-credentials"], false);
}
const evidenceSteps = expandVerificationSteps(evidence.jobs.record.steps);
const evidenceIndex = needle => evidenceSteps.findIndex(step => String(step.run ?? "").includes(needle));
assert.ok(evidenceIndex("npm ci --ignore-scripts") < evidenceIndex("release:prepare"));
assert.ok(evidenceIndex("release:prepare") < evidenceIndex("await recordComparison()"));
assert.ok(evidenceIndex("await recordComparison()") < evidenceIndex("npm run compatibility:check"));
assert.ok(evidenceIndex("npm run compatibility:check") < evidenceIndex("npm run check:community-health"));
assert.ok(evidenceIndex("npm run check:community-health") < evidenceIndex("git diff --cached --binary"));
assert.match(evidenceText, /result\.diagnostic !== 'source_snapshot_changed'/u);
assert.doesNotMatch(guardrailsText, /compatibility:record|recordComparison/u);
assert.ok(evidence.jobs.publish.steps.every(step => !/npm |node /u.test(step.run ?? "")));
assert.deepEqual(publish.permissions, { contents: "read" });
assert.deepEqual(publish.jobs.publish.permissions, { contents: "read", "id-token": "write" });
for (const [name, job] of Object.entries({ validate: publish.jobs.validate, publish: publish.jobs.publish })) {
  const steps = job.steps;
  const index = (needle) => steps.findIndex((step) => String(step.run ?? "").includes(needle));
  assert.ok(index("npm ci --ignore-scripts") >= 0, `${name} must install declared checkout dependencies`);
  assert.ok(index("npm ci --ignore-scripts") < index("release:prepare"), `${name} must install before preparing`);
}
// Source integrity also probes the generated OpenCode package. A fresh checkout
// must prepare those assets before either source or built integrity consumes them.
function assertIntegrityPreparation(steps) {
  const expanded = expandVerificationSteps(steps);
  const prepare = expanded.findIndex(step => String(step.run ?? '').includes('release:prepare'));
  assert.ok(prepare >= 0, 'integrity consumers require release preparation');
  for (const [index, step] of expanded.entries()) {
    if (String(step.run ?? '').includes('check-runtime-integrity.mjs')) {
      assert.ok(prepare < index, 'release assets must be prepared before integrity checks');
    }
  }
}
for (const job of Object.values(publish.jobs)) {
  if (job.steps?.some(step => String(step.run ?? '').includes('check-runtime-integrity.mjs'))) {
    assertIntegrityPreparation(job.steps);
  }
}
const validationSteps = publish.jobs.validate.steps;
const sourceIntegrity = validationSteps.find(step => step.run === 'node plugins/agdf/scripts/check-runtime-integrity.mjs');
assert.ok(sourceIntegrity, 'publish validation retains source integrity');
assert.throws(() => assertIntegrityPreparation([
  sourceIntegrity, ...validationSteps.filter(step => step !== sourceIntegrity),
]), /before integrity checks/);
assert.throws(() => assertIntegrityPreparation(
  validationSteps.filter(step => !String(step.run ?? '').includes('release:prepare')),
), /require release preparation/);
const publishSteps = publish.jobs.publish.steps;
const firstPublish = publishSteps.findIndex((step) => String(step.run ?? "").includes("npm publish"));
assert.ok(firstPublish > 0);
assert.ok(publishSteps.findIndex((step) => String(step.run ?? "").includes("--preflight")) < firstPublish);
assert.ok(publishSteps.findIndex((step) => String(step.run ?? "").includes("NPM_TOKEN is required")) < firstPublish);
assert.ok(publishSteps.some((step) => step.if === "failure()" && String(step.run).includes("--report")));
assert.ok(publish.jobs.bootstrap.steps.some((step) => String(step.run ?? "").includes("--complete")));
// Reviewed native evidence gates publication, with one explicitly documented 0.20.0 exception.
// No native model credentials run here; no observation is synthesized by the exception.
assert.equal(publish.jobs['codex-e2e'], undefined);
assert.equal(publish.jobs['claude-evidence'], undefined);
assert.ok(publish.jobs.publish.needs.includes('release-evidence'));
assert.equal(publish.jobs['desktop-evidence'], undefined);
const evidenceGate = publish.jobs['release-evidence'];
assert.equal(evidenceGate['timeout-minutes'], 10);
assert.ok(!evidenceGate.if && !evidenceGate['continue-on-error']);
assert.ok(evidenceGate.steps.some(step => /release-evidence\.mjs validate\s/u.test(String(step.run ?? '')) && step.run.includes('--all-hosts')));
assert.ok(evidenceGate.steps.every(step => !step['continue-on-error'] && !step.if && !JSON.stringify(step).includes('CODEX_API_KEY')));
const nativeGateScript = evidenceGate.steps.find(step => String(step.run ?? '').includes('release-evidence.mjs validate')).run;
const releaseDocumentation = readFileSync(new URL('../../../RELEASE.md', import.meta.url), 'utf8');
assert.match(releaseDocumentation, /0\.20\.0 native evidence exception/u);
// Execute the actual workflow shell against an isolated validator double. Future
// releases must still call the validator and propagate its missing-evidence failure.
function exerciseNativeGate(version, tag, validationStatus = 23) {
  const fixture = mkdtempSync(join(tmpdir(), 'agdf-native-publication-gate-'));
  try {
    const candidateId = 'a'.repeat(64);
    writeFileSync(join(fixture, '.release-candidate.json'), JSON.stringify({ version, candidate_id: candidateId }));
    mkdirSync(join(fixture, 'scripts/native-probes'), { recursive: true });
    writeFileSync(join(fixture, 'scripts/native-probes/release-evidence.mjs'), `
      import { writeFileSync } from 'node:fs';
      writeFileSync('validation-invocation.json', JSON.stringify(process.argv.slice(2)));
      process.exit(Number(process.env.NATIVE_GATE_TEST_STATUS));
    `);
    const summaryPath = join(fixture, 'summary.md');
    const result = spawnSync('bash', ['-e', '-c', nativeGateScript], {
      cwd: fixture, encoding: 'utf8',
      env: { ...process.env, GITHUB_REF_NAME: tag, GITHUB_STEP_SUMMARY: summaryPath.replaceAll('\\', '/'),
        NATIVE_GATE_TEST_STATUS: String(validationStatus) },
    });
    assert.ifError(result.error);
    const invocationPath = join(fixture, 'validation-invocation.json');
    return { status: result.status, stdout: result.stdout,
      summary: existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8') : '',
      invocation: existsSync(invocationPath) ? JSON.parse(readFileSync(invocationPath, 'utf8')) : null };
  } finally { rmSync(fixture, { recursive: true, force: true }); }
}
const waived = exerciseNativeGate('0.20.0', 'agdf-v0.20.0');
assert.equal(waived.status, 0);
assert.equal(waived.invocation, null);
assert.match(waived.stdout, /::warning::.*qualification is incomplete/u);
assert.match(waived.summary, /no native pass is claimed/u);
assert.ok(waived.summary.includes('a'.repeat(64)), 'exception summary binds the prepared candidate');
for (const [version, tag] of [
  ['0.20.1', 'agdf-v0.20.1'], ['0.21.0', 'agdf-v0.21.0'], ['1.0.0', 'agdf-v1.0.0'],
  ['0.20.0', 'main'], ['0.20.0', 'agdf-v0.20.1'], ['0.20.1', 'agdf-v0.20.0'],
]) {
  const required = exerciseNativeGate(version, tag);
  assert.equal(required.status, 23, `${tag}/${version} must preserve validation failure`);
  assert.deepEqual(required.invocation, ['validate', '--candidate', '.release-candidate.json', '--directory',
    `evals/host-compatibility/native/${'a'.repeat(64)}`, '--all-hosts']);
  assert.equal(required.summary, '', 'no exception for another tag or candidate version');
}
assert.equal(exerciseNativeGate('0.20.1', 'agdf-v0.20.1', 0).status, 0,
  'ordinary releases can publish with passing reviewed evidence');
const ancestors = (id, jobs, visiting = new Set()) => {
  assert.ok(!visiting.has(id), 'publication dependency cycle');
  const next = new Set([...visiting, id]);
  return new Set([id, ...[jobs[id].needs ?? []].flat().flatMap(dep => [...ancestors(dep, jobs, next)])]);
};
for (const [id, job] of Object.entries(publish.jobs)) if (job.steps?.some(step => String(step.run ?? '').includes('npm publish'))) {
  const required = ancestors(id, publish.jobs);
  for (const dependency of ['release-evidence','validate','tests']) assert.ok(required.has(dependency), id + ' bypasses ' + dependency);
  assert.ok(!job.if && !job['continue-on-error'], id + ' must fail closed');
}
const bypass = structuredClone(publish.jobs); bypass.publish.needs = ['validate','tests'];
assert.equal(ancestors('publish-wrapper', bypass).has('release-evidence'), false, 'mutated graph exposes bypass');
const chain = ['publish', 'wait-create-agdf', 'verify-published-mcp', 'publish-mcp', 'wait-mcp', 'publish-wrapper', 'wait-wrapper', 'wait-wrapper-latest', 'bootstrap'];
for (let i = 1; i < chain.length; i++) assert.equal(publish.jobs[chain[i]].needs, chain[i - 1]);
assert.deepEqual(publish.jobs['verify-published-mcp'].with, { scope: 'linux', suite: 'mcp', published: true });
for (const name of ['publish', 'publish-mcp', 'publish-wrapper']) {
  assert.deepEqual(publish.jobs[name].permissions, { contents: 'read', 'id-token': 'write' });
  assert.equal(publish.jobs[name].steps.filter(step => String(step.run ?? '').includes('npm publish')).length, 1);
}
for (const name of ['wait-create-agdf', 'wait-mcp', 'wait-wrapper', 'wait-wrapper-latest', 'bootstrap']) {
  assert.ok(!publish.jobs[name].permissions?.['id-token']);
  assert.ok(publish.jobs[name].steps.every(step => !JSON.stringify(step).includes('secrets.')));
}
for (const [name, text] of Object.entries({ publish: publishText, guardrails: guardrailsText, native: nativeText, evidence: evidenceText })) {
  for (const [, reference] of text.matchAll(/uses:\s+(actions\/[^\s#]+)/gu)) {
    assert.match(reference, /^actions\/[a-z-]+@[0-9a-f]{40}$/u, `${name} must pin each external action by full SHA`);
  }
  assert.equal(text.includes("--package-lock=false"), false, `${name}: unlocked installs belong only to published MCP partitions`);
}
assert.match(nativeText, /refs\/tags\/agdf-v\*/u);
assert.doesNotMatch(nativeText, /refs\/tags\/create-agdf-v\*/u);
const cliLock = JSON.parse(readFileSync(new URL("../distribution/agdf/package-lock.json", import.meta.url), "utf8"));
const serverLock = JSON.parse(readFileSync(new URL("../../mcp-server/package-lock.json", import.meta.url), "utf8"));
for (const [lock, localPath] of [[cliLock, "file:../.."], [serverLock, "file:../../dist/npm/create-agdf"]]) {
  assert.equal(lock.packages["node_modules/create-agdf"].resolved, localPath);
}
console.log("Coupled release workflow contract passed.");
execFileSync(process.execPath, [fileURLToPath(new URL("../../../scripts/host-compatibility/ci-publication-test.mjs", import.meta.url))], { stdio: "inherit" });
