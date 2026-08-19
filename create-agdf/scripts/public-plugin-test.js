import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";
import { LISTING_LIMITS, loadJson, unicodeLength, validatePublicPluginContract } from "../lib/public-plugin/contract.js";
import { renderClaudePluginManifest, renderCodexPluginManifest } from "../lib/public-plugin/manifest.js";
import { inventory, validateCandidate } from "../lib/public-plugin/validator.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const pluginRoot = join(repoRoot, "plugin");
const outputRoot = join(packageRoot, "generated", "submissions", "openai", "agdf");
const definition = loadJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"));
const capabilityMatrix = loadJson(join(pluginRoot, "submission", "openai", "capability-matrix.json"));
const reviewerCases = loadJson(join(pluginRoot, "submission", "openai", "reviewer-cases.json"));
const releaseNotes = readFileSync(join(pluginRoot, "submission", "openai", "release-notes.md"), "utf8");
const availabilityRecord = readFileSync(join(pluginRoot, "submission", "openai", "availability.md"), "utf8");
const expectedLongDescription = "AI Governance & Delivery Framework (AGDF) is a governance framework for agentic work. Its first implementation provides a control layer for governed AI-assisted software delivery. It combines workflow skills, explicit gates, control templates and machine-readable repository checks to keep work aligned with approved scope and make evidence a prerequisite for consequential gate transitions. Supported workflows include brownfield analysis, task-plan review, QA decisions, durable run state and auditable delivery closeout. AGDF is an independent open-source project, not a security sandbox, compliance certification or autonomous release system.";

assert.deepEqual(validatePublicPluginContract({ definition, capabilityMatrix, reviewerCases, releaseNotes }), []);
assert.equal(availabilityRecord.includes(`- release: \`${definition.version}\``), true, "availability release must match definition");
assert.equal(unicodeLength(definition.publicDistribution.publicDisplayName), 4);
assert.equal(unicodeLength(definition.publicDistribution.shortDescription), 29);
assert.equal(definition.displayName, "AI Governance & Delivery Framework");
assert.equal(Object.hasOwn(definition, "claudeDescription"), false);
assert.equal(Object.hasOwn(definition, "shortDescription"), false);
assert.equal(Object.hasOwn(definition.publicDistribution, "longDescription"), false);
assert.equal(definition.longDescription, expectedLongDescription);
assert.equal(definition.publicDistribution.publicDisplayName, "AGDF");
assert.equal(definition.publicDistribution.fullDisplayName, "AI Governance & Delivery Framework (AGDF)");
assert.equal(definition.publicDistribution.shortDescription, "Governed AI delivery controls");
assert.equal(definition.publicDistribution.defaultPrompt.length, 3);
assert.deepEqual(definition.publicDistribution.defaultPrompt, [
  "Assess whether AGDF fits this work and recommend the lightest safe delivery path.",
  "Start this request under AGDF governance.",
  "Review the active AGDF run and explain the next allowed step.",
]);
assert.deepEqual(definition.publicDistribution.defaultPrompt.map(unicodeLength), [81, 41, 61]);

for (const [field, limit] of [["publicDisplayName", LISTING_LIMITS.displayName], ["shortDescription", LISTING_LIMITS.shortDescription]]) {
  const altered = structuredClone(definition);
  altered.publicDistribution[field] = "x".repeat(limit + 1);
  assert.ok(validatePublicPluginContract({ definition: altered, capabilityMatrix, reviewerCases, releaseNotes }).some((error) => error.includes("exceeds")));
}
const longDeveloper = structuredClone(definition);
longDeveloper.publicDistribution.developerName = "x".repeat(LISTING_LIMITS.developerName + 1);
longDeveloper.developerName = longDeveloper.publicDistribution.developerName;
assert.ok(validatePublicPluginContract({ definition: longDeveloper, capabilityMatrix, reviewerCases, releaseNotes }).some((error) => error.includes("exceeds 80")));
const tooManyPrompts = structuredClone(definition);
tooManyPrompts.publicDistribution.defaultPrompt.push("extra");
tooManyPrompts.codex.defaultPrompt.push("extra");
assert.ok(validatePublicPluginContract({ definition: tooManyPrompts, capabilityMatrix, reviewerCases, releaseNotes }).some((error) => error.includes("exactly 3")));
const tooLongPrompt = structuredClone(definition);
tooLongPrompt.publicDistribution.defaultPrompt[0] = "x".repeat(129);
tooLongPrompt.codex.defaultPrompt[0] = tooLongPrompt.publicDistribution.defaultPrompt[0];
assert.ok(validatePublicPluginContract({ definition: tooLongPrompt, capabilityMatrix, reviewerCases, releaseNotes }).some((error) => error.includes("exceeds 128")));

const sourceManifest = readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8");
assert.equal(sourceManifest, renderCodexPluginManifest(definition), "source Codex manifest must be a canonical projection");
const claudeManifest = readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8");
assert.equal(claudeManifest, renderClaudePluginManifest(definition), "source Claude manifest must be a canonical projection");
const localManifest = JSON.parse(sourceManifest);
const localClaudeManifest = JSON.parse(claudeManifest);
assert.equal(localManifest.interface.displayName, "AI Governance & Delivery Framework");
assert.equal(localManifest.interface.shortDescription, "Control layer for governed AI-assisted delivery.");
assert.equal(localManifest.interface.longDescription, expectedLongDescription);
assert.equal(localClaudeManifest.description, expectedLongDescription);
assert.equal(localManifest.interface.defaultPrompt.length, 4);

const first = buildPublicPluginCandidate({ repoRoot, outputRoot });
const firstInventory = inventory(outputRoot);
const second = buildPublicPluginCandidate({ repoRoot, outputRoot });
assert.equal(second.digest, first.digest, "two candidate builds must have identical semantic digest");
assert.deepEqual(inventory(outputRoot), firstInventory, "two candidate builds must be content-equivalent");
const { manifest, files } = validateCandidate(outputRoot);
assert.equal(manifest.interface.displayName, "AGDF");
assert.equal(manifest.interface.shortDescription, "Governed AI delivery controls");
assert.equal(manifest.interface.longDescription, expectedLongDescription);
assert.equal(manifest.interface.defaultPrompt.length, 3);
assert.equal(manifest.hooks, undefined);
assert.equal(files.some((path) => path.endsWith(".mcp.json") || path.endsWith(".app.json")), false);
assert.equal(files.some((path) => path.startsWith(".agdf/control/")), false);
assert.equal(files.includes("submission/openai/readiness.json"), true);
assert.equal(files.includes("submission/openai/readiness.md"), true);
const readiness = loadJson(join(outputRoot, "submission", "openai", "readiness.json"));
assert.equal(readiness.candidateState, "repository_ready");
assert.equal(readiness.submissionReady, false);
assert.equal(readiness.evidence.installed_host.state, "unverified");
assert.equal(readiness.evidence.portal.state, "unverified");
assert.equal(readiness.evidence.post_publication.state, "unverified");
assert.equal(readiness.externalState.availability, "pending");

const evidenceTemplates = [
  join(repoRoot, ".agdf", "control", "artefacts", "agdf-public-plugin-distribution", "HOST_UAT_TEMPLATE.json"),
  join(repoRoot, ".agdf", "control", "artefacts", "agdf-public-plugin-distribution", "EXTERNAL_STATE_EVIDENCE_TEMPLATE.json"),
  join(repoRoot, ".agdf", "control", "artefacts", "agdf-public-plugin-distribution", "POST_PUBLICATION_CHECKLIST.md"),
];
const evidenceText = evidenceTemplates.map((path) => readFileSync(path, "utf8")).join("\n");
for (const forbiddenKey of ["inquiryUrl", "sessionUrl", "identityDocument", "identityImage", "accessToken", "refreshToken", "sessionToken", "cookie", "credential"]) {
  assert.equal(new RegExp(`\\"${forbiddenKey}\\"\\s*:`, "i").test(evidenceText), false, `evidence templates must not define ${forbiddenKey}`);
}
const workflow = readFileSync(join(repoRoot, ".github", "workflows", "agdf-guardrails.yml"), "utf8");
assert.equal(workflow.includes("npm --prefix create-agdf run release:prepare"), true, "CI must execute canonical release preparation");
assert.equal(workflow.includes("npm --prefix pages run test:public-documents"), true, "CI must execute public policy route validation");
for (const forbidden of ["OPENAI_API_KEY", "PERSONA", "portal publish", "portal submit"]) {
  assert.equal(workflow.includes(forbidden), false, `CI must not receive or perform ${forbidden}`);
}

const serialized = files.filter((path) => /\.(?:json|md|js)$/.test(path)).map((path) => readFileSync(join(outputRoot, path), "utf8")).join("\n");
for (const forbidden of [/persona.*(?:inquiry|session).*url\s*["':=]/i, /identityDocument\s*["':=]/i, /identityImage\s*["':=]/i, /(?:accessToken|refreshToken|sessionToken|cookie)\s*["':=]/i]) {
  assert.equal(forbidden.test(serialized), false, `candidate must reject sensitive field pattern ${forbidden}`);
}
assert.equal(serialized.includes(repoRoot), false, "candidate must not contain local absolute paths");

function negativeFixture(name, mutate, expected) {
  const root = mkdtempSync(join(tmpdir(), `agdf-public-${name}-`));
  try {
    cpSync(outputRoot, root, { recursive: true });
    mutate(root);
    assert.throws(() => validateCandidate(root), expected);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

negativeFixture("missing", (root) => rmSync(join(root, "assets", "agdf-logo.svg")), /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
negativeFixture("case", (root) => {
  const path = join(root, ".codex-plugin", "plugin.json");
  const value = JSON.parse(readFileSync(path, "utf8"));
  value.interface.logo = "./assets/AGDF-logo.svg";
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}, /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
negativeFixture("traversal", (root) => {
  const path = join(root, ".codex-plugin", "plugin.json");
  const value = JSON.parse(readFileSync(path, "utf8"));
  value.skills = "./../../skills";
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}, /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
negativeFixture("prompt-count", (root) => {
  const path = join(root, ".codex-plugin", "plugin.json");
  const value = JSON.parse(readFileSync(path, "utf8"));
  value.interface.defaultPrompt.pop();
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}, /AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED/);
negativeFixture("symlink", (root) => symlinkSync(join(root, "assets", "agdf-logo.svg"), join(root, "linked-logo.svg")), /symlink not allowed/);

console.log(`Public plugin tests passed (${second.fileCount} inventoried candidate files; digest ${second.digest})`);
