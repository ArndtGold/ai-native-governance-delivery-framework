import assert from "node:assert/strict";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";
import { createPortablePluginManifest, selectOpenAISettings } from "../lib/public-plugin/manifest.js";
import { inventory, validatePortableProfile } from "../lib/public-plugin/validator.js";
import { createPortableSchemaValidator } from "./support/portable-schema.js";
import { getPluginSourceRoot } from "../lib/public-plugin/source-root.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = getPluginSourceRoot(repoRoot);
assert.equal(existsSync(join(repoRoot, "plugin")), false, "old canonical mirror must be absent");
assert.equal(lstatSync(source).isSymbolicLink(), false, "new source owner must be a real directory");
const runtime = join(repoRoot, "create-agdf/generated/plugins/agdf");
const publicRoot = join(repoRoot, "create-agdf/generated/submissions/openai/agdf");
const validateSchema = createPortableSchemaValidator(repoRoot);
const read = (root, path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const write = (root, path, value) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), JSON.stringify(value, null, 2) + "\n");
};
const definition = read(source, "meta/agdf-plugin.definition.json");
const first = buildPublicPluginCandidate({ repoRoot, outputRoot: publicRoot, validateSchema });
for (const [root, profile] of [[source, "source"], [publicRoot, "public"], [runtime, "runtime"]]) {
  const result = validatePortableProfile(root, { profile, validateSchema });
  assert.deepEqual(result.portable, createPortablePluginManifest(definition, { publicCandidate: profile === "public", runtimeProfile: profile === "runtime" }));
  assert.equal(result.settings.skills, "./skills/");
  if (profile !== "source") assert.equal(result.files.some((path) => path.startsWith("host-templates/")), false);
}
const local = read(runtime, ".codex-plugin/plugin.json");
assert.equal(local.hooks, "./hooks/hooks.json");
assert.equal(local.mcpServers, "./mcp/codex.mcp.json");
assert.equal(Object.hasOwn(read(runtime, "plugin.json").extensions ?? {}, "com.openai"), false);
const inline = read(publicRoot, "plugin.json");
const contradictory = { skills: "./absent/", hooks: "./unexpected.json", mcpServers: "./unexpected-mcp.json", interface: { displayName: "WRONG" } };
assert.strictEqual(selectOpenAISettings(inline, contradictory), inline.extensions["com.openai"]);
assert.equal(selectOpenAISettings(inline, contradictory).hooks, undefined, "inline selection must never merge fallback capabilities");
assert.strictEqual(selectOpenAISettings({ extensions: {} }, local), local);

function negative(label, root, profile, mutate, expected) {
  const fixture = mkdtempSync(join(tmpdir(), `agdf-portable-${label}-`));
  try {
    cpSync(root, fixture, { recursive: true });
    mutate(fixture);
    assert.throws(() => validatePortableProfile(fixture, { profile, validateSchema }), expected, label);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
}
negative("unknown-field", publicRoot, "public", (r) => write(r, "plugin.json", { ...read(r, "plugin.json"), skills: "./skills/" }), /AGDF_PORTABLE_SCHEMA_INVALID/);
negative("missing-logo", publicRoot, "public", (r) => rmSync(join(r, "assets/agdf-logo.svg")), /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
for (const [label, field, value] of [["case", "logo", "./assets/AGDF-logo.svg"], ["escape", "logo", "./../../logo.svg"], ["wrong-type", "logo", "./skills/"], ["file-as-parent", "logo", "./assets/agdf-logo.svg/absent"]]) {
  negative(label, publicRoot, "public", (r) => {
    const p = read(r, "plugin.json"); p.extensions["com.openai"].interface[field] = value; write(r, "plugin.json", p);
  }, /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
}
for (const path of ["mcp.json", ".mcp.json", "app.json", ".app.json", "hooks/hooks.json", "mcp/codex.mcp.json", "host-templates/shared/hooks/hooks.json"]) {
  negative(`discovery-${path.replaceAll("/", "-")}`, publicRoot, "public", (r) => write(r, path, {}), /AGDF_(?:PUBLIC_PLUGIN_CONTRACT|PORTABLE_PROFILE)_INVALID/);
}
for (const key of ["hooks", "mcpServers", "app"]) {
  negative(`legacy-${key}`, publicRoot, "public", (r) => write(r, ".codex-plugin/plugin.json", { ...read(r, ".codex-plugin/plugin.json"), [key]: {} }), /AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID/);
}
negative("runtime-inline", runtime, "runtime", (r) => write(r, "plugin.json", inline), /AGDF_PORTABLE_PROFILE_INVALID/);
negative("runtime-hook-missing", runtime, "runtime", (r) => rmSync(join(r, "hooks/hooks.json")), /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
negative("runtime-mcp-missing", runtime, "runtime", (r) => rmSync(join(r, "mcp/codex.mcp.json")), /AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING/);
negative("identity", publicRoot, "public", (r) => write(r, "plugin.json", { ...read(r, "plugin.json"), version: "0.0.0" }), /AGDF_PUBLIC_PLUGIN_VERSION_DRIFT/);
negative("runtime-fallback-drift", runtime, "runtime", (r) => write(r, ".codex-plugin/plugin.json", { ...read(r, ".codex-plugin/plugin.json"), mcpServers: "./mcp/claude.mcp.json" }), /AGDF_PORTABLE_PROFILE_INVALID/);

const mcp = { $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", mcpServers: { demo: { type: "stdio", command: "node", args: ["./server.js"], cwd: "./" } } };
validateSchema("mcp", mcp);
const missingType = structuredClone(mcp); delete missingType.mcpServers.demo.type;
assert.throws(() => validateSchema("mcp", missingType), /AGDF_PORTABLE_SCHEMA_INVALID/);
const reserved = structuredClone(mcp); reserved.mcpServers.demo.env = { PLUGIN_ROOT: "other" };
assert.throws(() => validateSchema("mcp", reserved), /AGDF_PORTABLE_SCHEMA_INVALID/);
const before = inventory(publicRoot);
assert.throws(() => buildPublicPluginCandidate({ repoRoot, outputRoot: publicRoot }), /SCHEMA_TOOL_REQUIRED/);
assert.throws(() => buildPublicPluginCandidate({ repoRoot, outputRoot: publicRoot, validateSchema: (kind, value) => validateSchema(kind, { ...value, unexpected: true }) }), /AGDF_PORTABLE_SCHEMA_INVALID/);
assert.deepEqual(inventory(publicRoot), before, "failed validation must preserve previous candidate/readiness");
assert.equal(existsSync(`${publicRoot}.previous`), false);
const second = buildPublicPluginCandidate({ repoRoot, outputRoot: publicRoot, validateSchema });
assert.equal(first.digest, second.digest);
assert.deepEqual(inventory(publicRoot), before);
console.log(`Portable plugin schema/profile/resource/selection/retry tests passed; digest ${second.digest}`);
