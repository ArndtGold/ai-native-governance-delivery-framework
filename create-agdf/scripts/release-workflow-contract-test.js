import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const root = new URL("../../.github/workflows/", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");
const publishText = read("publish-agdf.yml");
const guardrailsText = read("agdf-guardrails.yml");
const nativeText = read("codex-release-e2e.yml");
assert.equal(existsSync(new URL("publish-create-agdf.yml", root)), false);
const publish = YAML.parse(publishText);
const guardrails = YAML.parse(guardrailsText);
const native = YAML.parse(nativeText);
assert.deepEqual(publish.on.push.tags, ["agdf-v*"]);
assert.deepEqual(guardrails.on.push.branches, ["main"]);
assert.deepEqual(guardrails.permissions, { contents: "read" });
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
for (const [name, text] of Object.entries({ publish: publishText, guardrails: guardrailsText, native: nativeText })) {
  for (const [, reference] of text.matchAll(/uses:\s+(actions\/[^\s#]+)/gu)) {
    assert.match(reference, /^actions\/[a-z-]+@[0-9a-f]{40}$/u, `${name} must pin each external action by full SHA`);
  }
  assert.equal(text.includes("--package-lock=false"), name === "publish", `${name} dependency policy drift`);
}
assert.match(nativeText, /refs\/tags\/agdf-v\*/u);
assert.doesNotMatch(nativeText, /refs\/tags\/create-agdf-v\*/u);
const cliLock = JSON.parse(readFileSync(new URL("../../agdf/package-lock.json", import.meta.url), "utf8"));
const serverLock = JSON.parse(readFileSync(new URL("../../agdf-mcp-server/package-lock.json", import.meta.url), "utf8"));
for (const lock of [cliLock, serverLock]) {
  assert.equal(lock.packages["node_modules/create-agdf"].resolved, "file:../create-agdf");
}
console.log("Coupled release workflow contract passed.");
