import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

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
const evidenceSteps = evidence.jobs.record.steps;
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
const publishSteps = publish.jobs.publish.steps;
const firstPublish = publishSteps.findIndex((step) => String(step.run ?? "").includes("npm publish"));
assert.ok(firstPublish > 0);
assert.ok(publishSteps.findIndex((step) => String(step.run ?? "").includes("--preflight")) < firstPublish);
assert.ok(publishSteps.findIndex((step) => String(step.run ?? "").includes("NPM_TOKEN is required")) < firstPublish);
assert.ok(publishSteps.some((step) => step.if === "failure()" && String(step.run).includes("--report")));
assert.ok(publishSteps.some((step) => String(step.run ?? "").includes("--complete")));
for (const [name, text] of Object.entries({ publish: publishText, guardrails: guardrailsText, native: nativeText, evidence: evidenceText })) {
  for (const [, reference] of text.matchAll(/uses:\s+(actions\/[^\s#]+)/gu)) {
    assert.match(reference, /^actions\/[a-z-]+@[0-9a-f]{40}$/u, `${name} must pin each external action by full SHA`);
  }
  assert.equal(text.includes("--package-lock=false"), name === "publish", `${name} dependency policy drift`);
}
assert.match(nativeText, /refs\/tags\/agdf-v\*/u);
assert.doesNotMatch(nativeText, /refs\/tags\/create-agdf-v\*/u);
const cliLock = JSON.parse(readFileSync(new URL("../distribution/agdf/package-lock.json", import.meta.url), "utf8"));
const serverLock = JSON.parse(readFileSync(new URL("../../mcp-server/package-lock.json", import.meta.url), "utf8"));
for (const [lock, localPath] of [[cliLock, "file:../.."], [serverLock, "file:../cli"]]) {
  assert.equal(lock.packages["node_modules/create-agdf"].resolved, localPath);
}
console.log("Coupled release workflow contract passed.");
execFileSync(process.execPath, [fileURLToPath(new URL("../../../scripts/host-compatibility/ci-publication-test.mjs", import.meta.url))], { stdio: "inherit" });
