from pathlib import Path
import shutil,json
r=Path.cwd(); c=r/'packages/core/lib'; a=r/'create-agdf/lib'
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
# Resources are immutable and package-bound. Only the generated descriptor selects profile roots.
write(c/'resources/binding.js','''// Build-owned binding; Core never guesses checkout or inherited environment roots.
export const packageURL = new URL("../../", import.meta.url);
export const generatedURL = new URL("../../generated/", import.meta.url);
export const contractsURL = new URL("plugins/agdf/meta/contracts/", generatedURL);
''')
write(c/'resources/context.js','''import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeLanguageTag, resolvePresentationLocale } from "../interaction-presentation.js";
import { validateInteractionCatalog } from "../interaction-catalog-validation.js";
import { packageURL, generatedURL, contractsURL } from "./binding.js";

function freeze(value) {
  if (value && typeof value === "object") { for (const entry of Object.values(value)) freeze(entry); Object.freeze(value); }
  return value;
}
export function createResourceContext({ packageURL, generatedURL, contractsURL, expectedVersion } = {}) {
  if (![packageURL, generatedURL, contractsURL].every(value => value instanceof URL && value.protocol === "file:")) throw new Error("runtime_resources_unavailable");
  const packageRoot = fileURLToPath(packageURL), generatedRoot = fileURLToPath(generatedURL);
  const pluginDefinition = JSON.parse(readFileSync(new URL("plugins/agdf/meta/agdf-plugin.definition.json", generatedURL), "utf8"));
  const interactionLocales = JSON.parse(readFileSync(new URL("plugins/agdf/meta/agdf-interaction-locales.json", generatedURL), "utf8"));
  if (!/^\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(pluginDefinition.version) || (expectedVersion && pluginDefinition.version !== expectedVersion)
      || !Array.isArray(pluginDefinition.runtimeContract?.modules) || !pluginDefinition.runtimeContract.modules.length
      || new Set(pluginDefinition.runtimeContract.modules).size !== pluginDefinition.runtimeContract.modules.length
      || pluginDefinition.runtimeContract.modules.some(path => !/^meta\\/contracts\\/[a-z0-9-]+\\.md$/u.test(path))
      || !Array.isArray(pluginDefinition.skillSet) || !interactionLocales.locales?.[interactionLocales.fallbackLocale]) throw new Error("runtime_resources_unavailable");
  validateInteractionCatalog(interactionLocales);
  return freeze({ packageRoot, generatedRoot, contractsRoot: fileURLToPath(contractsURL), pluginDefinition, interactionLocales });
}
export const resources = createResourceContext({ packageURL, generatedURL, contractsURL });
export const { packageRoot, generatedRoot, pluginDefinition, interactionLocales } = resources;
export function configuredLanguage(value, context = resources) {
  const normalized = canonicalizeLanguageTag(value);
  if (!normalized) return "";
  const language = normalized.split("-")[0];
  if (context.interactionLocales.locales[normalized] || context.interactionLocales.locales[language]) return resolvePresentationLocale(context.interactionLocales, normalized);
  return normalized;
}
export function resolveConfiguredChatLanguage(targetDir, context = resources) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return context.interactionLocales.fallbackLocale;
  try { return resolvePresentationLocale(context.interactionLocales, JSON.parse(readFileSync(configPath, "utf8")).chat_language); }
  catch { return context.interactionLocales.fallbackLocale; }
}
''')
write(c/'resources/contracts.js','''import { readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { resources } from "./context.js";
export function runtimeContractModules(definition = resources.pluginDefinition) {
  return definition.runtimeContract.modules.map(path => basename(path, ".md"));
}
export function readRuntimeContract(module, { context = resources } = {}) {
  const modules = runtimeContractModules(context.pluginDefinition);
  if (!modules.includes(module)) return Object.freeze({ ok: false, reason: "module_unknown", modules });
  const path = join(context.contractsRoot, `${module}.md`);
  try { return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") }); }
  catch { return Object.freeze({ ok: false, reason: "module_unavailable", modules }); }
}
export function readSkillRuntimeContracts(skillId, { context = resources } = {}) {
  const modules = context.pluginDefinition.skillSet.find(skill => skill.slug === skillId)?.runtimeContractModules;
  if (!Array.isArray(modules) || !modules.length || new Set(modules).size !== modules.length) throw new Error("runtime_contracts_unavailable");
  return Object.freeze(modules.map(module => {
    const result = readRuntimeContract(module, { context });
    if (!result.ok || !result.content.trim()) throw new Error("runtime_contracts_unavailable");
    return Object.freeze({ module, content: result.content, sha256: createHash("sha256").update(result.content).digest("hex") });
  }));
}
''')
write(a/'runtime/control-context.js','export * from "#agdf-core/resources/context.js";\n')
# CLI keeps the explicit legacy contract override; MCP uses only the Core package-bound reader.
s=(a/'cli/contract-command.js').read_text();s=s[:s.index('// MCP serves')]+'''export { readSkillRuntimeContracts, runtimeContractModules } from "#agdf-core/resources/contracts.js";
import { runtimeContractModules, readRuntimeContract as readOwnedContract } from "#agdf-core/resources/contracts.js";
export function readRuntimeContract(module, { pluginRoot = process.env.AGDF_DISPATCH_PLUGIN_ROOT, definition = pluginDefinition } = {}) {
  const modules = runtimeContractModules(definition);
  if (!modules.includes(module)) return Object.freeze({ ok: false, reason: "module_unknown", modules });
  if (pluginRoot) for (const root of [join(pluginRoot, "meta", "contracts"), join(pluginRoot, "copilot-skills", "contracts")]) {
    const path = join(root, `${module}.md`);
    if (existsSync(path)) return Object.freeze({ ok: true, module, path, content: readFileSync(path, "utf8") });
  }
  return readOwnedContract(module);
}
''';write(a/'cli/contract-command.js',s)
for p in [c/'control-maintenance/interaction.js',c/'control-maintenance/presentation.js']:
 s=p.read_text().replace('../cli/runtime-context.js','../resources/context.js');p.write_text(s)
# Prompt I/O provider; Core only consumes callbacks.
p=c/'control-maintenance/interaction.js';s=p.read_text();start=s.index('export async function promptControlMigration');end=s.index('export async function selectControlRepair');prompt1=s[start:end];start2=s.index('export async function promptControlRepair');prompt2=s[start2:];s=s[:start]+s[end:start2];s=s.replace('import { createInterface } from "node:readline/promises";\n','').replace('import process from "node:process";\n','');p.write_text(s)
write(a/'control-maintenance/interaction.js','''import { createInterface } from "node:readline/promises";
import process from "node:process";
import { interactionLocales } from "#agdf-core/resources/context.js";
import { selectControlMigration, selectControlRepair } from "#agdf-core/control-maintenance/interaction.js";
export * from "#agdf-core/control-maintenance/interaction.js";
'''+prompt1+prompt2)
# Runtime process launch stays in CLI; Core builds/validates only explicit tuples.
p=c/'skill-dispatch/binding.js';s=p.read_text();probe=s[s.index('export function createRuntimeProbe'):s.index('export function validateDispatchBinding')];env=s[s.index('export function runtimeEnvironment'):s.index('function fileIdentity')];identity=s[s.index('function fileIdentity'):s.index('export function createRuntimeProbe')]
s=s.replace('import { spawnSync } from "node:child_process";\n','').replace('import process from "node:process";\n','');s=s.replace('const PROBE = \'process.stdout.write("AGDF_RUNTIME_OK:"+process.versions.node)\';\nconst RUNTIME_PROBE_TIMEOUT_MS = 5_000;\n','');s=s[:s.index('export function runtimeEnvironment')]+s[s.index('export function validateDispatchBinding'):];s=s.replace('executable = process.execPath, versions = process.versions','executable, versions').replace('{ probe = probeRuntime, stat = statSync } = {}','{ probe, stat = statSync } = {}').replace('  fileIdentity(validator, stat);','  if (typeof probe !== "function") throw new Error("runtime_unavailable");\n  fileIdentity(validator, stat);');s=s.replace('export function validateDispatchBinding',identity+'export function validateDispatchBinding');p.write_text(s)
write(a/'runtime/runtime-probe.js','''import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import process from "node:process";
const PROBE = 'process.stdout.write("AGDF_RUNTIME_OK:"+process.versions.node)';
const RUNTIME_PROBE_TIMEOUT_MS = 5_000;
const text = value => typeof value === "string" && value.length > 0 && value.length <= 4096 && !/[\\r\\n\\0]/u.test(value);
const absolute = value => text(value) && isAbsolute(value);
'''+env+identity+probe)
write(a/'skill-dispatch/binding.js','''import process from "node:process";
import { createDispatchBinding as buildBinding } from "#agdf-core/skill-dispatch/binding.js";
import { createRuntimeProbe } from "../runtime/runtime-probe.js";
export { createRuntimeProbe, runtimeEnvironment } from "../runtime/runtime-probe.js";
export { validateDispatchBinding, unavailableDispatchContext } from "#agdf-core/skill-dispatch/binding.js";
const probeRuntime = createRuntimeProbe();
export function createDispatchBinding(options, dependencies = {}) {
  return buildBinding({ executable: process.execPath, versions: process.versions, ...options }, { probe: probeRuntime, ...dependencies });
}
''')
# Recovery Git observes raw bytes only; candidates/approval semantics remain Core-owned.
p=c/'control-state/run-recovery.js';s=p.read_text();start=s.index('function gitHistoryCandidates');end=s.index('function safeRunFiles');old=s[start:end];p.write_text(s[:start]+'''function gitHistoryCandidates(root, runId, readGitHistory) {
  if (typeof readGitHistory !== "function") return { status: "unavailable", candidates: [] };
  const relativePath = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  let entries;
  try { entries = readGitHistory(root, relativePath); } catch { return { status: "unavailable", candidates: [] }; }
  if (!Array.isArray(entries) || entries.length > 25) return { status: "unavailable", candidates: [] };
  const candidates = [];
  for (const entry of entries) {
    if (!entry || entry.path !== relativePath || !/^[0-9a-f]{40,64}$/u.test(entry.commit) || typeof entry.content !== "string" || Buffer.byteLength(entry.content) > 1024 * 1024) continue;
    const parsed = parseRunState(entry.content, runId);
    if (!parsed.valid) continue;
    const meta = scalarFields(entry.content).values;
    const sealPattern = /^sha256:[0-9a-f]{64}$/u;
    candidates.push({ commit: entry.commit, revision_id: parsed.meta.revision_id, content_digest: digestContent(entry.content),
      seal_lines_present: sealPattern.test(meta.get("content_seal") ?? "") && sealPattern.test(meta.get("approval_seal") ?? ""), approval_provenance: "not_proven_by_git_revision" });
  }
  return { status: "available", candidates };
}

'''+s[end:]);s=p.read_text().replace('import { execFileSync } from "node:child_process";\n','').replace('{ inspectHistory = true }','{ inspectHistory = true, readGitHistory }').replace('gitHistoryCandidates(root, runId)','gitHistoryCandidates(root, runId, readGitHistory)').replace('previewRunRecovery(root, runId) {','previewRunRecovery(root, runId, options = {}) {').replace('const inspection = inspectRunRecovery(root, runId);','const inspection = inspectRunRecovery(root, runId, options);');p.write_text(s)
write(a/'runtime/git-history.js','''import { execFileSync } from "node:child_process";
export function readGitHistory(root, path) {
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000, maxBuffer: 1024 * 1024 });
  return git(["log", "--all", "--follow", "--format=%H", "--", path]).trim().split(/\\r?\\n/u).filter(Boolean).slice(0, 25).flatMap(commit => {
    try { return [{ path, commit, content: git(["show", `${commit}:${path}`]) }]; } catch { return []; }
  });
}
''')
write(a/'control-state/run-recovery.js','''import { inspectRunRecovery as inspect, previewRunRecovery as preview } from "#agdf-core/control-state/run-recovery.js";
import { readGitHistory } from "../runtime/git-history.js";
export { applyRunRecovery, inspectSelfReferenceRecovery } from "#agdf-core/control-state/run-recovery.js";
export const inspectRunRecovery = (root, runId, options = {}) => inspect(root, runId, { readGitHistory, ...options });
export const previewRunRecovery = (root, runId, options = {}) => preview(root, runId, { readGitHistory, ...options });
''')
# Repair provider retains exact bounded Git query; Core verifies path/digest before use.
p=c/'control-maintenance/repair.js';s=p.read_text();start=s.index('function git(root');end=s.index('function proposal');git=s[start:end];s=s[:start]+'''function gitOriginals(root, path, readGitOriginals) {
  if (!isSafeControlRelativePath(path) || typeof readGitOriginals !== "function") return [];
  try {
    const entries = readGitOriginals(root, path);
    if (!Array.isArray(entries) || entries.length > 9) return [];
    return entries.filter(entry => entry?.path === path && isSafeControlRelativePath(entry.git_path)
      && entry.source === "git" && /^[0-9a-f]{40,64}$/u.test(entry.commit)
      && typeof entry.bytes === "string" && entry.bytes.length <= 3 * 1024 * 1024
      && entry.digest === textDigest(Buffer.from(entry.bytes, "base64").toString("utf8")));
  } catch { return []; }
}

'''+s[end:];s=s.replace('import { execFileSync } from "node:child_process";\n','').replace('inspectRunRepair(root, run) {','inspectRunRepair(root, run, readGitOriginals) {').replace('gitOriginals(root, relative)','gitOriginals(root, relative, readGitOriginals)').replace('gitOriginals(root, artifact)','gitOriginals(root, artifact, readGitOriginals)').replace('inspectControlRepair(root) {','inspectControlRepair(root, { readGitOriginals } = {}) {').replace('inspectRunRepair(root, run)','inspectRunRepair(root, run, readGitOriginals)').replace('applyRunRepair(root, item, hooks = {})','applyRunRepair(root, item, hooks = {}, readGitOriginals)').replace('{ chooseRepair, confirmRepair, hooks }','{ chooseRepair, confirmRepair, hooks, readGitOriginals }').replace('inspectControlRepair(control.target)','inspectControlRepair(control.target, { readGitOriginals })').replace('applyRunRepair(control.target, item, hooks)','applyRunRepair(control.target, item, hooks, readGitOriginals)');p.write_text(s)
write(a/'runtime/git-originals.js','''import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isSafeControlRelativePath } from "#agdf-core/control-state/contained-file.js";
import { directoryIdentity } from "#agdf-core/control-state/run-store-inspection.js";
import { canonicalRunText } from "#agdf-core/control-state/run-seal.js";
const textDigest = content => `sha256:${createHash("sha256").update(canonicalRunText(content)).digest("hex")}`;
'''+git.replace('function gitOriginals','export function readGitOriginals'))
write(a/'control-maintenance/repair.js','''import { inspectControlRepair as inspect, repairInstallationControl as repair } from "#agdf-core/control-maintenance/repair.js";
import { readGitOriginals } from "../runtime/git-originals.js";
export const inspectControlRepair = (root, options = {}) => inspect(root, { readGitOriginals, ...options });
export const repairInstallationControl = (control, options = {}) => repair(control, { readGitOriginals, ...options });
''')
p=c/'control-maintenance/service.js';s=p.read_text().replace('confirmMigration, confirmRepair }','confirmMigration, confirmRepair, readGitOriginals }').replace('{ chooseRepair: () => "start", confirmRepair: reviewed(confirmRepair) }','{ chooseRepair: () => "start", confirmRepair: reviewed(confirmRepair), readGitOriginals }');p.write_text(s)
write(a/'control-maintenance/service.js','''import { runControlMaintenance as run } from "#agdf-core/control-maintenance/service.js";
import { readGitOriginals } from "../runtime/git-originals.js";
export const runControlMaintenance = (target, options = {}) => run(target, { readGitOriginals, ...options });
''')
# Private source resources are an explicit derived projection, never checkout fallback.
g=r/'packages/core/generated/plugins/agdf/meta';g.mkdir(parents=True,exist_ok=True)
for name in ['agdf-plugin.definition.json','agdf-interaction-locales.json']:shutil.copyfile(r/'plugins/agdf/meta'/name,g/name)
shutil.copytree(r/'plugins/agdf/meta/contracts',g/'contracts',dirs_exist_ok=True)
write(c/'index.js','''import { resources } from "./resources/context.js";
import { readRuntimeContract, readSkillRuntimeContracts } from "./resources/contracts.js";
import { dispatchSkillRequest } from "./skill-dispatch/service.js";
import { inspectControlRequest } from "./control-inspect/service.js";
export { createResourceContext, resources } from "./resources/context.js";
export function createCoreServices({ resources: context = resources, observers = {}, runtimeBinding } = {}) {
  const contracts = { readRuntimeContract: module => readRuntimeContract(module, { context }), readSkillRuntimeContracts: skill => readSkillRuntimeContracts(skill, { context }) };
  return Object.freeze({ ...contracts, resources: context, runtimeBinding,
    dispatch: (input, dependencies = {}) => dispatchSkillRequest(input, { ...observers, ...contracts, ...dependencies }),
    inspect: (input, dependencies = {}) => inspectControlRequest(input, { ...observers, ...contracts, ...dependencies }),
  });
}
''')
print('Immutable resources and explicit CLI providers extracted')
