import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";
import { digestNormalizedPluginSource } from "../../create-agdf/lib/runtime/plugin-provenance.js";
import { CAPABILITIES, CLAIMS, HOSTS, OUTCOMES, SCENARIOS, canonical, importHistoricalHC, tuple, validateInventory, validateObservation } from "./contract.mjs";
import { evaluateClaim } from "./evaluate.mjs";
import { renderComparison } from "./render.mjs";

export const MANIFEST_PATH = "evals/host-compatibility/manifest.json";
const OUTPUT = "docs/compatibility";
const OBSERVATIONS = "evals/host-compatibility/observations";
const SNAPSHOT = `${OUTPUT}/evidence/snapshot.json`;
const FACTS = `${OUTPUT}/evidence/facts.json`;
const OWNER = ".agdf-compatibility-owned.json";
export const hash = content => createHash("sha256").update(content).digest("hex");
const readJson = path => JSON.parse(readFileSync(path, "utf8"));
const bytes = value => `${JSON.stringify(value, null, 2)}\n`;
const relativePath = (root, path) => relative(root, path).split(sep).join("/");

export function safePath(root, path) {
  if (typeof path !== "string" || !path || isAbsolute(path) || path.includes("\\") || path.split("/").some(p => ["..", ".", ""].includes(p))) throw new Error("unsafe_relative_path");
  const base = resolve(root); const result = resolve(base, path);
  if (!result.startsWith(`${base}${sep}`)) throw new Error("path_outside_root");
  let current = base;
  for (const segment of path.split("/")) {
    current = join(current, segment);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error("symlink_path_forbidden");
  }
  return result;
}

function localReferences(source, file) {
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module", allowHashBang: true });
  const refs = [];
  const walk = node => {
    if (!node || typeof node !== "object") return;
    if (["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(node.type) && node.source) refs.push(node.source.value);
    if (node.type === "ImportExpression") {
      if (node.source.type !== "Literal" || typeof node.source.value !== "string") throw new Error(`unresolved_dynamic_import:${file}`);
      refs.push(node.source.value);
    }
    // File-backed entrypoints spawned by fixtures are dependencies too.
    if (node.type === "NewExpression" && node.callee?.name === "URL" && node.arguments[0]?.type === "Literal"
        && node.arguments[1]?.type === "MemberExpression" && node.arguments[1].object?.type === "MetaProperty") refs.push(node.arguments[0].value);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
  };
  walk(ast);
  return refs.filter(ref => typeof ref === "string" && ref.startsWith("."));
}

export function sourceClosure(root, entries) {
  const files = new Set();
  const visit = file => {
    if (files.has(file)) return;
    const path = safePath(root, file);
    if (!existsSync(path)) throw new Error(`source_missing:${file}`);
    if (lstatSync(path).isDirectory()) return;
    files.add(file);
    if (![".js", ".mjs", ".cjs"].includes(extname(file))) return;
    for (const ref of localReferences(readFileSync(path, "utf8"), file)) visit(relativePath(root, resolve(dirname(path), ref)));
  };
  entries.forEach(visit);
  return [...files].sort();
}

export function sourceSnapshot(root, manifest) {
  const problems = validateInventory(manifest);
  if (canonical(manifest.scenarios) !== canonical(SCENARIOS)) problems.push("scenario_inventory_mismatch");
  if (problems.length) throw new Error(problems.join(","));
  // Explicit file inputs are copied/inspected by fixtures, not executed as repository modules.
  const hostFiles = Object.fromEntries(HOSTS.map(host => [host, [...new Set([
    ...sourceClosure(root, manifest.source_entrypoints[host]), ...(manifest.source_files?.[host] ?? []),
  ])].sort()]));
  const owned = new Set(Object.values(hostFiles).flat());
  const support = sourceClosure(root, manifest.common_entrypoints);
  const common = [...new Set([...support.filter(file => !owned.has(file)), ...manifest.extra_sources, MANIFEST_PATH])].sort();
  const files = [...new Set([...common, ...Object.values(hostFiles).flat()])].sort();
  if (files.some(file => file.startsWith(`${OUTPUT}/`) || file.startsWith(`${OBSERVATIONS}/`) || file.startsWith(".agdf/control/"))) throw new Error("self_invalidating_source_set");
  const fingerprints = Object.fromEntries(files.map(file => [file, hash(readFileSync(safePath(root, file)))]));
  const definition = readJson(safePath(root, "plugin/meta/agdf-plugin.definition.json"));
  const payloads = Object.fromEntries(HOSTS.map(host => {
    const profile = host === "copilot" ? "create-agdf/generated/plugins/copilot/agdf" : "create-agdf/generated/plugins/agdf";
    const payloadRoot = safePath(root, profile);
    return [host, { canonical_version: definition.version, source_digest: digestNormalizedPluginSource(payloadRoot, definition.version), runtime_digest: readJson(join(payloadRoot, "runtime/runtime-manifest.json")).digest }];
  }));
  const byHost = Object.fromEntries(HOSTS.map(host => [host, hash(canonical(Object.fromEntries([...new Set([...common, ...hostFiles[host]])].sort().map(file => [file, fingerprints[file]]))))]));
  return { version: definition.version, payloads, files: fingerprints, by_host: byHost, digest: hash(canonical({ fingerprints, payloads })) };
}

function readReferences(root, observations) {
  return Object.fromEntries(observations.flatMap(o => o.references ?? []).map(ref => {
    const path = safePath(root, ref.path);
    return [ref.path, existsSync(path) ? hash(readFileSync(path)) : null];
  }));
}

function historicalInputs(root, manifest) {
  return manifest.historical_sources.flatMap(source => {
    if (source.format !== "historical_hc_v1") throw new Error("unknown_historical_format");
    const path = safePath(root, source.path); const schemaPath = safePath(root, source.schema_path);
    const reference = { path: source.path, sha256: hash(readFileSync(path)), schema_sha256: hash(readFileSync(schemaPath)) };
    return importHistoricalHC(readJson(path), reference).map(o => ({ ...o,
      original_references: o.original_references.map(ref => {
        const pathname = relativePath(root, resolve(dirname(path), ref.split("#")[0]));
        try { const p = safePath(root, pathname); return { path: pathname, sha256: existsSync(p) && lstatSync(p).isFile() ? hash(readFileSync(p)) : null }; }
        catch { return { path: null, sha256: null }; }
      }) }));
  });
}

export function comparison(snapshot, observations, referenceHashes, historical = [], nativeTargets = []) {
  const rows = observations.filter(o => o.lane === "deterministic_adapter").map(o => ({ ...o, ...evaluateClaim(o, observations, referenceHashes) }));
  const native = nativeTargets.flatMap(target => CLAIMS.map(claim => {
    const query = { environment: target.environment, expected: snapshot.payloads[target.environment.host], source_fingerprint: null,
      lane: target.lane, claim, mechanism: target.mechanisms?.[claim] ?? "unspecified" };
    return evaluateClaim(query, observations, referenceHashes);
  }));
  const missing = HOSTS.flatMap(host => SCENARIOS.filter(scenario => !rows.some(o => o.environment.host === host && o.scenario === scenario)).map(scenario => `${host}.${scenario}`));
  const invalid = observations.flatMap(o => validateObservation(o, referenceHashes).map(error => `${o.id}:${error}`));
  for (const o of observations.filter(o => o.lane === "deterministic_adapter")) {
    const payload = snapshot.payloads[o.environment.host];
    if (!payload || o.expected.canonical_version !== payload.canonical_version || o.expected.runtime_digest !== payload.runtime_digest
        || (!["updated", "update-stale", "recoverable", "recovery-partial"].includes(o.scenario) && o.expected.source_digest !== payload.source_digest)) invalid.push(`${o.id}:fixture_payload_snapshot_mismatch`);
  }
  if (new Set(observations.map(o => o.id)).size !== observations.length) invalid.push("duplicate_observation_id");
  const failed = rows.filter(o => o.conformance?.passed !== true || o.state !== o.conformance.expected);
  const dates = [...new Set(observations.map(o => o.observed_at))].sort();
  return { snapshot, rows, native, historical, dates, scenarios: { evaluated: rows.length, failed: failed.length },
    diagnostics: [...missing, ...invalid], consistent: rows.length > 0 && missing.length === 0 && invalid.length === 0 && failed.length === 0 };
}

function publicationSafe(value) {
  // Only structured fixture facts and reviewed native records may be published. Raw transcripts are excluded.
  const content = canonical(value);
  if (/(?:\/Users\/|\/home\/|\/private\/|\/var\/folders\/|[A-Za-z]:\\\\)/.test(content)) throw new Error("private_path_in_public_evidence");
}

export function checkComparison(root = process.cwd()) {
  try {
    const manifest = readJson(safePath(root, MANIFEST_PATH));
    const snapshot = readJson(safePath(root, SNAPSHOT));
    const current = sourceSnapshot(root, manifest);
    if (canonical(current) !== canonical(snapshot.source)) throw new Error("source_snapshot_changed");
    const source = snapshot.observation_source;
    if (!source.path.startsWith(`${OBSERVATIONS}/`) || hash(readFileSync(safePath(root, source.path))) !== source.sha256) throw new Error("observation_source_changed");
    const observations = readJson(safePath(root, source.path));
    const inputSources = Object.fromEntries(manifest.native_sources.map(path => [path, hash(readFileSync(safePath(root, path)))]));
    if (canonical(inputSources) !== canonical(snapshot.input_sources)) throw new Error("native_input_changed");
    if (canonical(observations) !== canonical(snapshot.observations)) throw new Error("published_observations_changed");
    const historical = historicalInputs(root, manifest);
    if (canonical(historical) !== canonical(snapshot.historical)) throw new Error("historical_source_changed");
    const report = comparison(current, observations, readReferences(root, observations), historical, manifest.native_targets);
    if (!report.consistent) throw new Error(`comparison_invalid:${report.diagnostics.join(",")};failures=${report.scenarios.failed}`);
    publicationSafe(snapshot);
    if (readFileSync(safePath(root, `${OUTPUT}/HOST_COMPATIBILITY.md`), "utf8") !== renderComparison(report)) throw new Error("rendered_comparison_changed");
    return { status: "pass", scenarios: report.scenarios, source_fingerprint: current.digest };
  } catch (error) { return { status: "fail", diagnostic: error.message }; }
}

function filesUnder(root, directory = root) {
  return readdirSync(directory).sort().flatMap(name => {
    const path = join(directory, name);
    if (lstatSync(path).isSymbolicLink()) throw new Error("symlink_output_forbidden");
    return lstatSync(path).isDirectory() ? filesUnder(root, path) : [relativePath(root, path)];
  });
}

async function record(root, { runSuite, beforePublish = () => {} } = {}) {
  root = realpathSync(root);
  const manifest = readJson(safePath(root, MANIFEST_PATH));
  const before = sourceSnapshot(root, manifest);
  const output = safePath(root, OUTPUT);
  if (existsSync(output)) {
    if (!existsSync(join(output, OWNER))) throw new Error("foreign_output_directory");
    const owner = readJson(join(output, OWNER));
    const allowed = new Set([...owner.files, OWNER, ...manifest.public_evidence.map(path => path.slice(OUTPUT.length + 1))]);
    if (owner.owner !== "agdf-host-compatibility" || filesUnder(output).some(path => !allowed.has(path))) throw new Error("foreign_output_files");
  }
  const suite = runSuite ?? (await import("../../create-agdf/scripts/host-compatibility-test.js")).runCompatibilitySuite;
  const observations = await suite();
  const facts = Object.fromEntries(observations.map(o => [o.id, { expected: o.expected, observed: o.observed, environment: o.environment, facts: o.facts, original: o.original, conformance: o.conformance }]));
  const factsBytes = bytes(facts); const factsDigest = hash(factsBytes);
  for (const o of observations) {
    o.source_fingerprint = before.by_host[o.environment.host];
    o.references = [{ path: FACTS, sha256: factsDigest }];
    o.publication = { reviewed: true, evidence: FACTS, method: "structured_fixture_facts" };
  }
  const inputSources = {};
  for (const source of manifest.native_sources) {
    if (!source.startsWith(`${OBSERVATIONS}/`)) throw new Error("native_source_outside_observations");
    const content = readFileSync(safePath(root, source));
    inputSources[source] = hash(content);
    const input = JSON.parse(content);
    if (!Array.isArray(input) || input.some(o => o.lane === "deterministic_adapter" || o.publication?.reviewed !== true
        || !o.references?.every(ref => manifest.public_evidence.includes(ref.path)))) throw new Error("unreviewed_native_source");
    observations.push(...input);
  }
  const observationBytes = bytes(observations);
  const attemptPath = `${OBSERVATIONS}/${hash(observationBytes)}.json`;
  mkdirSync(safePath(root, OBSERVATIONS), { recursive: true });
  const attemptFile = safePath(root, attemptPath);
  if (existsSync(attemptFile)) { if (readFileSync(attemptFile, "utf8") !== observationBytes) throw new Error("immutable_observation_conflict"); }
  else writeFileSync(attemptFile, observationBytes, { flag: "wx" });
  const current = sourceSnapshot(root, manifest);
  if (canonical(before) !== canonical(current)) throw new Error("source_changed_during_recording");
  const historical = historicalInputs(root, manifest);
  const references = { ...readReferences(root, observations.filter(o => o.lane !== "deterministic_adapter")), [FACTS]: factsDigest };
  const report = comparison(current, observations, references, historical, manifest.native_targets);
  if (!report.consistent) throw new Error(`scenario_recording_failed:${attemptPath};failures=${report.scenarios.failed};${report.diagnostics.join(",")}`);
  const snapshot = { schema_version: 1, source: current, observations, historical, input_sources: inputSources, observation_source: { path: attemptPath, sha256: hash(observationBytes) } };
  publicationSafe(snapshot); publicationSafe(facts);
  mkdirSync(dirname(output), { recursive: true });
  const stage = mkdtempSync(join(dirname(output), ".compatibility-stage-"));
  const backup = `${stage}-previous`;
  let movedPrevious = false;
  try {
    mkdirSync(join(stage, "evidence"));
    writeFileSync(join(stage, "evidence/facts.json"), factsBytes);
    writeFileSync(join(stage, "evidence/snapshot.json"), bytes(snapshot));
    writeFileSync(join(stage, "HOST_COMPATIBILITY.md"), renderComparison(report));
    for (const path of manifest.public_evidence) {
      if (!path.startsWith(`${OUTPUT}/evidence/`) || [FACTS, SNAPSHOT].includes(path)) throw new Error("invalid_public_evidence_path");
      const destination = safePath(stage, path.slice(OUTPUT.length + 1)); mkdirSync(dirname(destination), { recursive: true });
      const content = readFileSync(safePath(root, path));
      publicationSafe(content.toString("utf8"));
      if (references[path] && hash(content) !== references[path]) throw new Error("native_evidence_changed_during_recording");
      writeFileSync(destination, content);
    }
    writeFileSync(join(stage, OWNER), bytes({ owner: "agdf-host-compatibility", files: filesUnder(stage) }));
    beforePublish();
    if (canonical(sourceSnapshot(root, manifest)) !== canonical(before)) throw new Error("source_changed_before_publication");
    const finalInputs = Object.fromEntries(manifest.native_sources.map(path => [path, hash(readFileSync(safePath(root, path)))]));
    if (canonical(finalInputs) !== canonical(inputSources)) throw new Error("native_input_changed_during_recording");
    if (canonical(historicalInputs(root, manifest)) !== canonical(historical)) throw new Error("historical_source_changed_during_recording");
    const finalReferences = { ...readReferences(root, observations.filter(o => o.lane !== "deterministic_adapter")), [FACTS]: factsDigest };
    if (canonical(finalReferences) !== canonical(references)) throw new Error("native_evidence_changed_during_recording");
    if (existsSync(output)) { renameSync(output, backup); movedPrevious = true; }
    try { renameSync(stage, output); }
    catch (error) { if (movedPrevious) renameSync(backup, output); throw error; }
    if (movedPrevious) rmSync(backup, { recursive: true });
    return { status: "pass", scenarios: report.scenarios, source_fingerprint: current.digest };
  } finally { if (existsSync(stage)) rmSync(stage, { recursive: true, force: true }); }
}

export async function recordComparison(root = process.cwd(), options = {}) {
  try { return await record(root, options); }
  catch (error) {
    const directory = safePath(root, `${OBSERVATIONS}/failures`); mkdirSync(directory, { recursive: true });
    const diagnostic = { schema_version: 1, status: "failed", observed_at: new Date().toISOString(),
      code: /^[a-z_]+(?=:|$)/.exec(error.message)?.[0] ?? "recording_failed" };
    const content = bytes(diagnostic); writeFileSync(join(directory, `${hash(content)}.json`), content);
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!["record", "check"].includes(process.argv[2]) || process.argv.length !== 3) throw new Error("Use record or check with no additional arguments.");
    const result = process.argv[2] === "record" ? await recordComparison() : checkComparison();
    console.log(JSON.stringify(result, null, 2)); if (result.status !== "pass") process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
