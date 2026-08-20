import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgentSkillsConformance } from "../../plugin/scripts/agent-skills-conformance.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const pluginRoot = join(repoRoot, "plugin");
const policySource = join(pluginRoot, "meta", "agent-skills-conformance.json");
const syncScript = join(packageRoot, "scripts", "sync-package-assets.js");

function skill({ name = "demo", description = "Use this skill for a focused fixture.", resource = "../../meta/contracts/quality.md", extra = "" } = {}) {
  return [
    "---",
    `name: ${name}`,
    `description: ${description}`,
    "---",
    "",
    "# demo",
    "",
    "## Runtime Contract",
    `- \`${resource}\``,
    "",
    "## Rules",
    "Keep the fixture deterministic.",
    "",
    extra,
  ].join("\n");
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), "agdf-agent-skills-"));
  mkdirSync(join(root, "meta", "contracts"), { recursive: true });
  mkdirSync(join(root, "skills", "demo"), { recursive: true });
  cpSync(policySource, join(root, "meta", "agent-skills-conformance.json"));
  writeFileSync(join(root, "meta", "agdf-plugin.definition.json"), `${JSON.stringify({
    codex: { skillPrefix: "" },
    copilot: { skillPrefix: "agdf-" },
    opencode: { skillPrefix: "agdf-" },
    skillSet: [{ slug: "demo" }],
  }, null, 2)}\n`);
  writeFileSync(join(root, "meta", "contracts", "quality.md"), "# fixture contract\n");
  writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill());
  return root;
}

function validate(root, options = {}) {
  return validateAgentSkillsConformance({ pluginRoot: root, surfaceRoot: root, surface: "source", ...options });
}

function codes(result) {
  return result.findings.map(({ code }) => code);
}

function fixtureCase(mutate, expectedCode, { blocking = true } = {}) {
  const root = createFixture();
  try {
    mutate(root);
    const result = validate(root);
    assert.equal(result.blocking, blocking, JSON.stringify(result.findings, null, 2));
    assert.equal(codes(result).includes(expectedCode), true, `expected ${expectedCode}; got ${codes(result).join(", ")}`);
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const source = validateAgentSkillsConformance({ pluginRoot, surfaceRoot: pluginRoot, surface: "source" });
assert.equal(source.blocking, false, JSON.stringify(source.findings, null, 2));
assert.equal(source.inspectedSkillCount, 10);
assert.equal(source.skills.length, 10);
assert.equal(source.skills.every(({ portability }) => portability === "plugin_scoped"), true);
assert.deepEqual(validateAgentSkillsConformance({ pluginRoot, surfaceRoot: pluginRoot, surface: "source" }), source, "repeated validation must be deterministic");
const canonicalPolicy = JSON.parse(readFileSync(policySource, "utf8"));
assert.equal(Object.hasOwn(canonicalPolicy, "skillSet"), false, "policy must not duplicate the canonical skill inventory");
assert.deepEqual(canonicalPolicy.frontmatterProfile.requiredFields, ["name", "description"]);
assert.equal(canonicalPolicy.strictRules.nameMaxCodePoints, 64);
assert.equal(canonicalPolicy.strictRules.descriptionMaxCodePoints, 1024);

fixtureCase((root) => rmSync(join(root, "meta", "agent-skills-conformance.json")), "AGDF_SKILL_POLICY_UNREADABLE");
fixtureCase((root) => {
  const path = join(root, "meta", "agent-skills-conformance.json");
  const policy = JSON.parse(readFileSync(path, "utf8"));
  policy.schemaVersion = 2;
  writeFileSync(path, `${JSON.stringify(policy, null, 2)}\n`);
}, "AGDF_SKILL_POLICY_SCHEMA_UNSUPPORTED");
fixtureCase((root) => mkdirSync(join(root, "skills", "extra")), "AGENT_SKILLS_INVENTORY_MISMATCH");
fixtureCase((root) => rmSync(join(root, "skills", "demo", "SKILL.md")), "AGENT_SKILLS_FILE_MISSING");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), "# no frontmatter\n"), "AGENT_SKILLS_FRONTMATTER_MISSING");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), "---\nname: demo\n"), "AGENT_SKILLS_FRONTMATTER_UNCLOSED");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill().replace("name: demo", "name: demo\nname: demo")), "AGDF_SKILL_FRONTMATTER_DUPLICATE_FIELD");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill().replace("name: demo\n", "")), "AGENT_SKILLS_NAME_MISSING");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ description: "\"\"" })), "AGENT_SKILLS_DESCRIPTION_MISSING");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ name: "demo--bad" })), "AGENT_SKILLS_NAME_INVALID");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ name: "-demo" })), "AGENT_SKILLS_NAME_INVALID");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ name: "demo-" })), "AGENT_SKILLS_NAME_INVALID");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ name: "other" })), "AGENT_SKILLS_NAME_PARENT_MISMATCH");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ description: `"${"x".repeat(1025)}"` })), "AGENT_SKILLS_DESCRIPTION_INVALID");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill().replace("description:", "metadata:\n  nested: true\ndescription:")), "AGDF_SKILL_FRONTMATTER_FIELD_UNSUPPORTED");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ name: "123" })), "AGDF_SKILL_FRONTMATTER_SCALAR_INVALID");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ description: '"unterminated' })), "AGDF_SKILL_FRONTMATTER_SCALAR_INVALID");
const advisoryResult = fixtureCase((root) => {
  const path = join(root, "skills", "demo", "SKILL.md");
  writeFileSync(path, `${skill()}${"advisory line\n".repeat(501)}`);
}, "AGENT_SKILLS_LENGTH_ADVISORY", { blocking: false });
const advisoryFinding = advisoryResult.findings.find(({ code }) => code === "AGENT_SKILLS_LENGTH_ADVISORY");
assert.equal(advisoryFinding.classification, "upstream_advisory");
assert.equal(advisoryFinding.severity, "warning");
assert.deepEqual(Object.keys(advisoryFinding), ["code", "classification", "severity", "skillPath", "resource", "message", "remediation"]);
const localRuleResult = fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ description: "Different discovery wording." })), "AGDF_SKILL_DESCRIPTION_PREFIX_INVALID");
assert.equal(localRuleResult.findings.find(({ code }) => code === "AGDF_SKILL_DESCRIPTION_PREFIX_INVALID").classification, "agdf_policy");

for (const description of [`"Use this skill ${"x".repeat(1009)}"`, "'Use this skill for a single-quoted fixture.'"]) {
  const root = createFixture();
  try {
    writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ description }));
    const result = validate(root);
    assert.equal(result.blocking, false, JSON.stringify(result.findings, null, 2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const maxNameRoot = createFixture();
try {
  const maxName = "a".repeat(64);
  const definitionPath = join(maxNameRoot, "meta", "agdf-plugin.definition.json");
  const definition = JSON.parse(readFileSync(definitionPath, "utf8"));
  definition.skillSet[0].slug = maxName;
  writeFileSync(definitionPath, `${JSON.stringify(definition, null, 2)}\n`);
  renameSync(join(maxNameRoot, "skills", "demo"), join(maxNameRoot, "skills", maxName));
  writeFileSync(join(maxNameRoot, "skills", maxName, "SKILL.md"), skill({ name: maxName }));
  const result = validate(maxNameRoot);
  assert.equal(result.blocking, false, JSON.stringify(result.findings, null, 2));
} finally {
  rmSync(maxNameRoot, { recursive: true, force: true });
}

const localRoot = createFixture();
try {
  writeFileSync(join(localRoot, "skills", "demo", "reference.md"), "# local\n");
  writeFileSync(join(localRoot, "skills", "demo", "SKILL.md"), skill({ resource: "./reference.md" }));
  const result = validate(localRoot);
  assert.equal(result.blocking, false, JSON.stringify(result.findings, null, 2));
  assert.equal(result.skills[0].portability, "skill_local");
} finally {
  rmSync(localRoot, { recursive: true, force: true });
}

fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ resource: "./missing.md" })), "AGDF_SKILL_RESOURCE_UNRESOLVED");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ resource: "../../../outside.md" })), "AGDF_SKILL_RESOURCE_TRAVERSAL");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ resource: "/tmp/absolute.md" })), "AGDF_SKILL_RESOURCE_PATH_UNSAFE");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ resource: "https://example.com/resource.md" })), "AGDF_SKILL_RESOURCE_PATH_UNSAFE");
fixtureCase((root) => {
  mkdirSync(join(root, "meta", "other"));
  writeFileSync(join(root, "meta", "other", "other.md"), "# other\n");
  writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ resource: "../../meta/other/other.md" }));
}, "AGDF_SKILL_RESOURCE_SCOPE_UNDECLARED");
fixtureCase((root) => writeFileSync(join(root, "skills", "demo", "SKILL.md"), skill({ extra: "See `../undeclared.md`.\n\n" })), "AGDF_SKILL_RESOURCE_UNDECLARED_INLINE");

const codeExampleRoot = createFixture();
try {
  writeFileSync(join(codeExampleRoot, "skills", "demo", "SKILL.md"), skill({ extra: "```text\nSee `../example-only.md`.\n```\n" }));
  const result = validate(codeExampleRoot);
  assert.equal(result.blocking, false, JSON.stringify(result.findings, null, 2));
} finally {
  rmSync(codeExampleRoot, { recursive: true, force: true });
}

const symlinkRoot = createFixture();
const externalRoot = mkdtempSync(join(tmpdir(), "agdf-agent-skills-external-"));
try {
  writeFileSync(join(externalRoot, "outside.md"), "# outside\n");
  symlinkSync(join(externalRoot, "outside.md"), join(symlinkRoot, "skills", "demo", "linked.md"));
  writeFileSync(join(symlinkRoot, "skills", "demo", "SKILL.md"), skill({ resource: "./linked.md" }));
  const result = validate(symlinkRoot);
  assert.equal(codes(result).includes("AGDF_SKILL_RESOURCE_SYMLINK_ESCAPE"), true, JSON.stringify(result.findings, null, 2));
} finally {
  rmSync(symlinkRoot, { recursive: true, force: true });
  rmSync(externalRoot, { recursive: true, force: true });
}

execFileSync(process.execPath, [syncScript], { stdio: "pipe" });
const generatedRoot = join(packageRoot, "generated");
for (const [surface, generatedPluginRoot, surfaceRoot] of [
  ["plugin", join(generatedRoot, "plugins", "agdf"), join(generatedRoot, "plugins", "agdf")],
  ["copilot", pluginRoot, join(generatedRoot, ".github", "skills")],
  ["opencode", pluginRoot, join(generatedRoot, ".opencode")],
  ["public_candidate", join(generatedRoot, "submissions", "openai", "agdf"), join(generatedRoot, "submissions", "openai", "agdf")],
]) {
  const result = validateAgentSkillsConformance({ pluginRoot: generatedPluginRoot, surfaceRoot, surface });
  assert.equal(result.blocking, false, `${surface}: ${JSON.stringify(result.findings, null, 2)}`);
  assert.equal(result.inspectedSkillCount, 10, surface);
  assert.equal(result.skills.every(({ portability }) => portability === "plugin_scoped"), true, surface);
}

const generatedFaultRoot = mkdtempSync(join(tmpdir(), "agdf-agent-skills-copilot-"));
try {
  cpSync(join(generatedRoot, ".github", "skills"), generatedFaultRoot, { recursive: true });
  const path = join(generatedFaultRoot, "agdf-gate-check", "SKILL.md");
  writeFileSync(path, readFileSync(path, "utf8").replace("name: agdf-gate-check", "name: generated-drift"));
  const result = validateAgentSkillsConformance({ pluginRoot, surfaceRoot: generatedFaultRoot, surface: "copilot" });
  assert.equal(codes(result).includes("AGENT_SKILLS_NAME_PARENT_MISMATCH"), true, JSON.stringify(result.findings, null, 2));
  assert.equal(result.surface, "copilot");
} finally {
  rmSync(generatedFaultRoot, { recursive: true, force: true });
}

console.log("Agent Skills conformance tests passed (source, policy, metadata, resources, symlinks and 4 generated surfaces)");
