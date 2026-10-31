import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, lstatSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export const MCP_RUNTIME_OWNER = "create-agdf:mcp-runtime";
export const MCP_RUNTIME_MARKER = ".agdf-mcp-owned.json";

export const INSTALLATION_PROVENANCE_FILE = ".agdf-installation.json";
export const LEGACY_LOCAL_INSTALL_FILE = ".agdf-local-install.json";
export const COPILOT_PAYLOAD_INVENTORY_FILE = ".agdf-payload-inventory.json";
// Host-owned liveness markers written into the installed plugin root while a session holds it
// (Claude Code: `.in_use/<pid>`). They are not plugin payload and must not affect provenance.
export const HOST_RUNTIME_MARKER_DIRECTORIES = Object.freeze([".in_use"]);

// Private, owner-recorded qualification metadata, never a tool argument or a
// gesture credential. Native observations must precede recording this tuple.
export const DECISION_APP_OBSERVATIONS = Object.freeze(['initialize', 'app_only_visibility', 'model_call_denied',
  'deliberate_approve', 'deliberate_change', 'deliberate_reject', 'permission_denial', 'document_return', 'teardown']);
// The boolean and read-only diagnosis deliberately share one validator. Host/candidate
// values are owner supplied, never caller credentials or qualification writes.
export function inspectDecisionAppQualification(root, record, expected = {}) {
  const fail = (reason, detail = {}) => Object.freeze({ qualified: false, reason, ...detail, authorizes: false });
  const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
  const hex = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
  try {
    if (record == null) return fail('qualification_record_missing');
    if (!exact(record, ['schema_version', 'result', 'surface', 'host', 'candidate', 'observations', 'evidence', 'assurance', 'authorizes'])
      || record.schema_version !== 1 || record.result !== 'qualified' || record.surface !== 'codex'
      || record.assurance !== 'cooperative_local' || record.authorizes !== false) return fail('qualification_record_invalid');
    if (!expected.client) return fail('host_context_unavailable');
    if (!exact(record.host, ['name', 'version', 'os', 'arch'])
      || typeof record.host.name !== 'string' || !record.host.name || typeof record.host.version !== 'string' || !record.host.version)
      return fail('qualification_host_invalid');
    if (record.host.name !== expected.client.name || record.host.version !== expected.client.version
      || record.host.os !== process.platform || record.host.arch !== process.arch) return fail('qualification_host_mismatch');
    if (!exact(record.candidate, ['server_digest', 'dispatcher_digest', 'sdk_digest', 'resource_digest'])) return fail('qualification_candidate_invalid');
    const mismatches = Object.keys(record.candidate).filter(key => !hex(record.candidate[key]) || record.candidate[key] !== expected[key]);
    if (mismatches.length) return fail('qualification_candidate_mismatch', { fields: mismatches });
    if (!Array.isArray(record.observations) || record.observations.length !== DECISION_APP_OBSERVATIONS.length
      || new Set(record.observations).size !== record.observations.length || !DECISION_APP_OBSERVATIONS.every(key => record.observations.includes(key)))
      return fail('qualification_observations_incomplete', { missing_observations: DECISION_APP_OBSERVATIONS.filter(key => !Array.isArray(record.observations) || !record.observations.includes(key)) });
    if (!Array.isArray(record.evidence) || !record.evidence.length || record.evidence.length > 16) return fail('qualification_evidence_missing_or_invalid');
    const paths = new Set();
    for (const item of record.evidence) {
      if (!exact(item, ['path', 'digest']) || !hex(item.digest) || typeof item.path !== 'string'
        || !/^qualification\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:json|log|md)$/u.test(item.path) || paths.has(item.path)) return fail('qualification_evidence_reference_invalid');
      paths.add(item.path); let path = root;
      for (const component of item.path.split('/')) { path = join(path, component); if (lstatSync(path).isSymbolicLink()) return fail('qualification_evidence_symlink'); }
      const stats = lstatSync(path);
      if (!stats.isFile() || stats.size > 1048576) return fail('qualification_evidence_file_invalid');
      const bytes = readFileSync(path);
      if (bytes.length > 1048576 || createHash('sha256').update(bytes).digest('hex') !== item.digest) return fail('qualification_evidence_digest_mismatch');
    }
    return Object.freeze({ qualified: true, reason: null, authorizes: false });
  } catch { return fail('qualification_evidence_unavailable'); }
}
export function evaluateDecisionAppQualification(root, record, expected) {
  return inspectDecisionAppQualification(root, record, expected).qualified;
}

// Codex starts plugin MCP servers only from absolute paths and passes no plugin root or data directory
// (native probe, Codex 0.145/0.157). The runtime plugin therefore ships a template that the installer
// fills with the absolute marketplace plugin root and data directory; provenance digests the template.
export const CODEX_PLUGIN_MCP_FILE = "mcp.json";
const CODEX_ROOT_TOKEN = "{{AGDF_PLUGIN_ROOT}}";
const CODEX_DATA_TOKEN = "{{AGDF_MCP_DATA}}";

export function renderCodexPluginMcpConfig({ pluginRoot = CODEX_ROOT_TOKEN, dataRoot = CODEX_DATA_TOKEN, portable = true, cockpit = false } = {}) {
  const root = pluginRoot.replaceAll("\\", "/");
  return `${JSON.stringify({
    ...(portable ? { $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json" } : {}),
    mcpServers: {
      agdf: {
        ...(portable ? { type: "stdio" } : {}),
        command: "node",
        args: [`${root}/mcp/agdf-mcp-launch.js`, "--surface", "codex", "--data", dataRoot.replaceAll("\\", "/")],
      },
      ...(cockpit ? { 'agdf-cockpit': {
        ...(portable ? { type: 'stdio' } : {}), command: 'node',
        args: [`${root}/mcp/agdf-mcp-launch.js`, '--surface', 'codex', '--data', dataRoot.replaceAll('\\', '/'), '--cockpit'],
      } } : {}),
    },
  }, null, 2)}\n`;
}

export function renderCopilotPluginMcpConfig() {
  return `${JSON.stringify({
    $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: {
      agdf: {
        type: "stdio",
        command: "node",
        args: ["${PLUGIN_ROOT}/mcp/agdf-mcp-launch.js", "--surface", "copilot", "--data", "${PLUGIN_DATA}"],
      },
    },
  }, null, 2)}\n`;
}

// Returns the template for any config of the owned shape, so an installed file with absolute paths
// digests exactly like the generated one; any other content is returned unchanged and therefore
// changes the digest.
export function normalizeCodexPluginMcpConfig(content) {
  try {
    const config = JSON.parse(String(content));
    const args = config.mcpServers?.agdf?.args;
    if (Array.isArray(args) && args.length === 5 && typeof args[0] === "string"
        && args[0].endsWith("/mcp/agdf-mcp-launch.js") && typeof args[4] === "string" && args[4]) {
      const portable = Object.hasOwn(config, "$schema");
      const cockpit = Object.hasOwn(config.mcpServers, 'agdf-cockpit');
      const expected = renderCodexPluginMcpConfig({ pluginRoot: args[0].slice(0, -"/mcp/agdf-mcp-launch.js".length), dataRoot: args[4], portable, cockpit });
      if (JSON.stringify(config) === JSON.stringify(JSON.parse(expected))) return renderCodexPluginMcpConfig({ portable, cockpit });
    }
  } catch {}
  return content;
}

function isHostRuntimeMarker(root, directory, name) {
  return directory === root && HOST_RUNTIME_MARKER_DIRECTORIES.includes(name);
}

const EXPECTED_PROFILES = Object.freeze({
  "source-development": Object.freeze({ runtime: "absent", installable: false, machineValidation: "unavailable" }),
  "runtime-plugin": Object.freeze({ runtime: "required", installable: true, machineValidation: "local_exact_version_digest" }),
  "copilot-runtime-plugin": Object.freeze({ runtime: "required", installable: true, machineValidation: "local_exact_version_digest_inventory" }),
  "opencode-config-local": Object.freeze({ runtime: "config_local_package", installable: true, machineValidation: "local_exact_version" }),
  "portable-skills": Object.freeze({ runtime: "absent", installable: true, machineValidation: "unavailable_or_external_required" }),
});

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// Every invocation reads the live directory entries and every regular file's
// bytes. Dirent types avoid redundant per-file stat calls; links/unknown types
// retain the original stat-following predicate. No digest or trust cache exists.
function* directoryFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  for (const entry of entries) {
    const path = join(directory, entry.name);
    const type = entry.isDirectory() || entry.isFile() ? entry : statSync(path);
    if (type.isDirectory()) yield* directoryFiles(path);
    else if (type.isFile()) yield path;
  }
}

export function digestDirectory(root) {
  const files = [...directoryFiles(root)];
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

const LEGACY_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([
  "package.json",
  "lib/mcp-dispatch-runtime.js",
  "lib/control-read-boundary.js",
  "lib/control-inspect",
  "lib/skill-dispatch",
  "lib/control-evaluation",
  "lib/control-state",
  "lib/cli/runtime-context.js",
  "lib/runtime/control-context.js",
  "lib/cli/contract-command.js",
  "lib/runtime/plugin-provenance.js",
  "lib/task-target-resolution.js",
  "lib/repository-context-reader.js",
  "lib/interaction-presentation.js",
  "lib/interaction-catalog.js",
  "generated/plugins/agdf/meta/agdf-plugin.definition.json",
  "generated/plugins/agdf/meta/agdf-interaction-locales.json",
  "generated/plugins/agdf/meta/contracts",
]);

const CORE_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([
  "package.json", "lib/mcp-dispatch-runtime.js", "lib/cli/runtime-context.js", "lib/runtime/control-context.js", "lib/cli/contract-command.js", "lib/runtime/plugin-provenance.js", "runtime/core",
  "generated/plugins/agdf/meta/agdf-plugin.definition.json", "generated/plugins/agdf/meta/agdf-interaction-locales.json", "generated/plugins/agdf/meta/contracts",
]);
const FACADE_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...CORE_MCP_DISPATCHER_RUNTIME_ENTRIES,
  'lib/mcp-lifecycle/package.js', 'lib/mcp-lifecycle/facade-entry.js', 'lib/npm-invocation.js', 'lib/host-command.js']);
const PRE_PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...FACADE_MCP_DISPATCHER_RUNTIME_ENTRIES,
  'lib/control-evaluation/git-observation.js']);
const PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...PRE_PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES, 'lib/mcp-protocol-runtime.js', 'lib/mcp-decision-protocol.js']);
const WORKER_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES, 'lib/mcp-worker-runtime.js']);
const OWNER_MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...WORKER_MCP_DISPATCHER_RUNTIME_ENTRIES,
  'lib/mcp-owner-protocol.js', 'lib/mcp-lifecycle/facade-runtime.js', 'lib/mcp-lifecycle/facade-thread-entry.js',
  'lib/mcp-lifecycle/owner-client.js', 'lib/mcp-lifecycle/thread-owner.js']);
const DEFAULT_RESOURCE_ENTRIES = Object.freeze(['generated/plugins/agdf/meta/agdf-defaults.json', 'generated/plugins/agdf/meta/agdf-defaults.schema.json']);
export const MCP_DISPATCHER_RUNTIME_ENTRIES = Object.freeze([...OWNER_MCP_DISPATCHER_RUNTIME_ENTRIES, ...DEFAULT_RESOURCE_ENTRIES]);
function declaresOwnerEntry(root) {
  const entry = readJson(join(root, 'package.json'))?.exports?.['./mcp-owner-protocol'];
  if (entry !== undefined && entry !== './lib/mcp-owner-protocol.js') throw Error('AGDF_MCP_OWNER_EXPORT_INVALID');
  return entry !== undefined;
}
function declaresWorkerEntry(root) {
  const entry = readJson(join(root, 'package.json'))?.exports?.['./mcp-worker-runtime'];
  if (entry !== undefined && entry !== './lib/mcp-worker-runtime.js') throw Error('AGDF_MCP_WORKER_EXPORT_INVALID');
  return entry !== undefined;
}
// Preserve historical owned digests for dispatchers that never import this
// provider. The selecting dispatcher bytes are themselves always digested.
const facadeEntries = root => {
  const source = readFileSync(join(root, 'lib/mcp-dispatch-runtime.js'), 'utf8');
  return source.includes('./mcp-protocol-runtime.js') ? declaresWorkerEntry(root) ? declaresOwnerEntry(root) ? OWNER_MCP_DISPATCHER_RUNTIME_ENTRIES : WORKER_MCP_DISPATCHER_RUNTIME_ENTRIES : PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES
    : source.includes('./control-evaluation/git-observation.js') ? PRE_PROTOCOL_MCP_DISPATCHER_RUNTIME_ENTRIES : FACADE_MCP_DISPATCHER_RUNTIME_ENTRIES;
};
const legacyDispatcherEntries = root => existsSync(join(root, "runtime", "core"))
  ? existsSync(join(root, 'lib/mcp-lifecycle/facade-entry.js')) ? facadeEntries(root) : CORE_MCP_DISPATCHER_RUNTIME_ENTRIES
  : LEGACY_MCP_DISPATCHER_RUNTIME_ENTRIES;
// Selection follows digested consumer bytes, so deleting a required resource
// cannot silently downgrade a new dispatcher to a historical image inventory.
const dispatcherEntries = root => {
  const entries = legacyDispatcherEntries(root);
  const protocol = join(root, 'lib/mcp-protocol-runtime.js');
  return entries.includes('lib/mcp-protocol-runtime.js') && readFileSync(protocol, 'utf8').includes('resolveMcpInput')
    ? [...entries, ...DEFAULT_RESOURCE_ENTRIES] : entries;
};

// Projection and digesting select the same actual declared image. Old packages
// retain their original entry set; a new declaration cannot omit its worker.
export const mcpDispatcherRuntimeEntries = root => dispatcherEntries(root);
export function mcpDispatcherPackageExports(root) {
  return { './mcp-dispatch-runtime': './lib/mcp-dispatch-runtime.js',
    ...(dispatcherEntries(root).includes('lib/mcp-protocol-runtime.js') ? { './mcp-protocol-runtime': './lib/mcp-protocol-runtime.js' } : {}),
    ...(declaresWorkerEntry(root) ? { './mcp-worker-runtime': './lib/mcp-worker-runtime.js' } : {}),
    ...(declaresOwnerEntry(root) ? { './mcp-owner-protocol': './lib/mcp-owner-protocol.js' } : {}) };
}

export const MCP_SDK_RUNTIME_ENTRIES = Object.freeze([
  "node_modules/@modelcontextprotocol/server",
  "node_modules/@modelcontextprotocol/core",
  "node_modules/zod",
]);

function digestSelectedEntries(root, entries, syntheticEntries = []) {
  const files = [];
  function visit(path) {
    const stats = statSync(path);
    if (stats.isDirectory()) {
      for (const file of directoryFiles(path)) files.push({ path: file });
    } else if (stats.isFile()) files.push({ path });
  }
  for (const entry of entries) visit(join(root, entry));
  for (const entry of syntheticEntries) files.push({ path: join(root, entry.path), content: Buffer.from(entry.content) });
  const hash = createHash("sha256");
  for (const file of files.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    hash.update(relative(root, file.path).replaceAll("\\", "/"));
    hash.update("\0");
    // Sort paths first, then consume each current file immediately. Retaining
    // every SDK buffer until sorting only adds allocation/GC pressure; it does
    // not provide an atomic snapshot. Preserve the exact selected wire order.
    hash.update(file.content ?? readFileSync(file.path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function digestMcpDispatcherPackage(root) {
  return digestSelectedEntries(root, dispatcherEntries(root));
}

export function digestPluginMcpDispatcherSource(root, version) {
  const packageJson = `${JSON.stringify({
    name: "create-agdf",
    version,
    private: true,
    type: "module",
    exports: mcpDispatcherPackageExports(root),
    ...(existsSync(join(root, "runtime", "core")) ? { imports: { "#agdf-core": "./runtime/core/lib/index.js", "#agdf-core/*": "./runtime/core/lib/*" } } : {}),
  }, null, 2)}\n`;
  return digestSelectedEntries(
    root,
    dispatcherEntries(root).filter((entry) => entry !== "package.json"),
    [{ path: "package.json", content: packageJson }],
  );
}

export function digestMcpSdkRuntime(root) {
  return digestSelectedEntries(root, MCP_SDK_RUNTIME_ENTRIES);
}

export function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function inspectCopilotPayloadInventory(pluginRoot, expectedVersion) {
  const inventoryPath = join(pluginRoot, COPILOT_PAYLOAD_INVENTORY_FILE);
  const inventory = readJson(inventoryPath);
  if (!inventory || inventory.schema_version !== 1 || inventory.profile_id !== "copilot-runtime-plugin"
      || inventory.version !== expectedVersion || !Array.isArray(inventory.entries)) {
    return { status: "invalid", reason: "copilot_payload_inventory_invalid" };
  }
  const destinations = inventory.entries.map((entry) => entry.destination);
  if (new Set(destinations).size !== destinations.length) {
    return { status: "invalid", reason: "copilot_payload_inventory_duplicate" };
  }
  const actual = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        if (!isHostRuntimeMarker(pluginRoot, directory, name)) visit(path);
      } else if (stats.isFile()) {
        const normalized = relative(pluginRoot, path).replaceAll("\\", "/");
        if (![COPILOT_PAYLOAD_INVENTORY_FILE, INSTALLATION_PROVENANCE_FILE, LEGACY_LOCAL_INSTALL_FILE].includes(normalized)) actual.push(normalized);
      }
    }
  }
  try { visit(pluginRoot); } catch { return { status: "invalid", reason: "copilot_payload_incomplete" }; }
  if (JSON.stringify(actual.sort()) !== JSON.stringify([...destinations].sort())) {
    return { status: "invalid", reason: "copilot_payload_inventory_mismatch" };
  }
  for (const entry of inventory.entries) {
    const path = join(pluginRoot, entry.destination);
    if (!existsSync(path) || digestFile(path) !== entry.digest || statSync(path).size !== entry.bytes) {
      return { status: "invalid", reason: "copilot_payload_digest_mismatch", entry: entry.destination };
    }
  }
  const excluded = actual.some((path) => path.startsWith("copilot-skills/") || path.startsWith(".codex-plugin/")
    || path.startsWith(".claude-plugin/") || path.startsWith("submission/")
    || path === "hooks/hooks.json" || path === "hooks/session-start.sh");
  if (excluded) return { status: "invalid", reason: "copilot_payload_excluded_surface" };
  return { status: "matched", inventory, inventoryDigest: digestFile(inventoryPath) };
}

export function digestNormalizedPluginSource(root, canonicalVersion) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        if (!isHostRuntimeMarker(root, directory, name)) visit(path);
      } else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    const normalizedPath = relative(root, path).replaceAll("\\", "/");
    if ([INSTALLATION_PROVENANCE_FILE, LEGACY_LOCAL_INSTALL_FILE].includes(normalizedPath)) continue;
    let content = readFileSync(path);
    if (normalizedPath === ".codex-plugin/plugin.json"
        || (normalizedPath === "plugin.json" && readJson(path)?.$schema === "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json")) {
      const manifest = readJson(path);
      if (!manifest) throw new Error(`Invalid Codex plugin manifest: ${path}`);
      content = `${JSON.stringify({ ...manifest, version: canonicalVersion }, null, 2)}\n`;
    } else if ([CODEX_PLUGIN_MCP_FILE, "mcp/codex.mcp.json"].includes(normalizedPath)) {
      content = normalizeCodexPluginMcpConfig(content);
    }
    hash.update(normalizedPath);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function validateDistributionProfiles(definition) {
  const contract = definition?.distributionProfiles;
  if (contract?.schemaVersion !== 1) return { status: "invalid", reason: "profile_invalid" };
  if (contract.marketplaceIdentities?.durable !== "agdf"
      || contract.marketplaceIdentities?.generatedRepository !== "agdf-repo") {
    return { status: "invalid", reason: "profile_invalid" };
  }
  for (const [profileId, expected] of Object.entries(EXPECTED_PROFILES)) {
    const observed = contract.profiles?.[profileId];
    if (!observed
        || Object.keys(observed).length !== Object.keys(expected).length
        || Object.keys(expected).some((key) => observed[key] !== expected[key])) {
      return { status: "invalid", reason: "profile_invalid" };
    }
  }
  if (Object.keys(contract.profiles ?? {}).length !== Object.keys(EXPECTED_PROFILES).length) {
    return { status: "invalid", reason: "profile_invalid" };
  }
  return { status: "matched", contract };
}

function classifyInstalledHistoricalProfile(catalogue, definition, classifyHistoricalProfile) {
  if (typeof classifyHistoricalProfile !== "function") {
    return { status: "invalid", reason: "profile_history_invalid" };
  }
  const result = classifyHistoricalProfile({
    catalogue,
    version: definition?.version,
    distributionProfiles: definition?.distributionProfiles,
  });
  if (result.status !== "matched") return result;
  return {
    ...result,
    contract: catalogue.contracts[result.contract_id].distribution_profiles,
  };
}

export function inspectGeneratedRepositoryMarketplace(targetDir) {
  const marketplacePath = join(targetDir, ".agents", "plugins", "marketplace.json");
  if (!existsSync(marketplacePath)) return { status: "absent", marketplacePath };
  const marketplace = readJson(marketplacePath);
  const plugin = marketplace?.plugins?.length === 1 ? marketplace.plugins[0] : null;
  const pluginPath = plugin?.source?.source === "local" ? plugin.source.path : null;
  if (marketplace?.name !== "agdf-repo" || plugin?.name !== "agdf" || pluginPath !== "./plugins/agdf") {
    return { status: "invalid", reason: "repository_marketplace_invalid", marketplacePath };
  }
  const pluginRoot = resolve(targetDir, pluginPath);
  const rel = relative(resolve(targetDir), pluginRoot);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    return { status: "invalid", reason: "repository_marketplace_path_escape", marketplacePath };
  }
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"));
  const runtimeManifest = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"));
  const codexManifest = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"));
  const claudeManifest = readJson(join(pluginRoot, ".claude-plugin", "plugin.json"));
  const runtimeRoot = join(pluginRoot, "runtime");
  const runtimePackageRoot = join(pluginRoot, "runtime", "create-agdf");
  const runtimeEntrypoint = resolve(runtimeRoot, runtimeManifest?.entrypoint ?? "");
  const runtimeEntrypointRel = relative(runtimeRoot, runtimeEntrypoint);
  if (validateDistributionProfiles(definition).status !== "matched"
      || definition?.version !== runtimeManifest?.version
      || codexManifest?.version !== definition?.version
      || claudeManifest?.version !== definition?.version
      || !/^[a-f0-9]{64}$/.test(runtimeManifest?.digest ?? "")
      || !existsSync(join(runtimeRoot, "agdf-local.js"))
      || !runtimeManifest?.entrypoint
      || runtimeEntrypointRel === ".."
      || runtimeEntrypointRel.startsWith(`..${sep}`)
      || isAbsolute(runtimeEntrypointRel)
      || !existsSync(runtimeEntrypoint)
      || !existsSync(runtimePackageRoot)) {
    return { status: "invalid", reason: "repository_runtime_incomplete", marketplacePath, pluginRoot };
  }
  let runtimeDigest;
  try { runtimeDigest = digestDirectory(runtimePackageRoot); } catch {
    return { status: "invalid", reason: "repository_runtime_incomplete", marketplacePath, pluginRoot };
  }
  if (runtimeDigest !== runtimeManifest.digest) {
    return { status: "invalid", reason: "runtime_digest_mismatch", marketplacePath, pluginRoot };
  }
  return {
    status: "matched",
    marketplacePath,
    pluginRoot,
    selector: `${plugin.name}@${marketplace.name}`,
    runtimeDigest,
  };
}

export function inspectInstallationProvenance(pluginRoot, {
  definition,
  runtimeManifest,
  pluginVersion,
  allowLegacy = false,
  profileId = "runtime-plugin",
  inventoryDigest = null,
  allowHistoricalProfilesForMigration = false,
  distributionProfileHistory = null,
  classifyHistoricalProfile = null,
} = {}) {
  const markerPath = join(pluginRoot, INSTALLATION_PROVENANCE_FILE);
  const legacyPath = join(pluginRoot, LEGACY_LOCAL_INSTALL_FILE);
  if (!existsSync(markerPath)) {
    if (allowLegacy && existsSync(legacyPath)) {
      const currentProfile = validateDistributionProfiles(definition);
      if (Object.hasOwn(definition ?? {}, "distributionProfiles")
          && currentProfile.status !== "matched") {
        return allowHistoricalProfilesForMigration
          ? classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile).status === "matched"
            ? { status: "invalid", reason: "installation_provenance_invalid" }
            : classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile)
          : currentProfile;
      }
      const marker = readJson(legacyPath);
      if (!marker
          || marker.schema_version !== 1
          || marker.owner !== "create-agdf"
          || marker.kind !== "codex_local_development_projection"
          || marker.canonical_version !== definition.version
          || marker.codex_install_version !== pluginVersion
          || !/^[a-f0-9]{64}$/.test(marker.source_digest ?? "")) {
        return { status: "invalid", reason: "installation_provenance_invalid", marker };
      }
      let observedSourceDigest;
      try { observedSourceDigest = digestNormalizedPluginSource(pluginRoot, definition.version); } catch {
        return { status: "invalid", reason: "source_digest_mismatch", marker };
      }
      return observedSourceDigest === marker.source_digest
        ? { status: "legacy", marker, observedSourceDigest, reason: "legacy_installation_provenance" }
        : { status: "invalid", reason: "source_digest_mismatch", marker, observedSourceDigest };
    }
    const profile = validateDistributionProfiles(definition);
    if (profile.status !== "matched") return profile;
    return { status: "missing", reason: "installation_provenance_missing" };
  }
  const currentProfile = validateDistributionProfiles(definition);
  const historicalProfile = currentProfile.status !== "matched" && allowHistoricalProfilesForMigration
    ? classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile)
    : null;
  if (currentProfile.status !== "matched" && historicalProfile?.status !== "matched") {
    return historicalProfile ?? currentProfile;
  }
  const profile = currentProfile.status === "matched" ? currentProfile : historicalProfile;
  const marker = readJson(markerPath);
  const portable = readJson(join(pluginRoot, "plugin.json"));
  if (!marker
      || marker.schema_version !== 1
      || marker.owner !== "create-agdf"
      || marker.profile_id !== profileId
      || marker.marketplace_id !== profile.contract.marketplaceIdentities.durable
      || marker.canonical_version !== definition.version
      || marker.codex_install_version !== pluginVersion
      || (portable?.$schema === "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json" && portable.version !== pluginVersion)
      || marker.runtime_digest !== runtimeManifest?.digest
      || (profileId === "copilot-runtime-plugin" && marker.inventory_digest !== inventoryDigest)
      || !/^[a-f0-9]{64}$/.test(marker.source_digest ?? "")) {
    return { status: "invalid", reason: "installation_provenance_invalid", marker };
  }
  let observedSourceDigest;
  try {
    observedSourceDigest = digestNormalizedPluginSource(pluginRoot, definition.version);
  } catch {
    return { status: "invalid", reason: "source_digest_mismatch", marker };
  }
  if (observedSourceDigest !== marker.source_digest) {
    return { status: "invalid", reason: "source_digest_mismatch", marker, observedSourceDigest };
  }
  return {
    status: "matched",
    marker,
    observedSourceDigest,
    profileClassification: historicalProfile ? "supported_historical" : "current",
    historicalReleaseVersion: historicalProfile?.release_version ?? null,
    historicalContractId: historicalProfile?.contract_id ?? null,
    historicalContractDigest: historicalProfile?.contract_digest ?? null,
    historicalEntryDigest: historicalProfile?.entry_digest ?? null,
  };
}

export const distributionProfileContract = Object.freeze({
  expectedProfiles: EXPECTED_PROFILES,
});

// Shared read-only package qualification. Publication/claim writers consume
// this same predicate; the transport adds no competing provenance policy.
export function inspectOwnedMcpRuntimeRoot(root, expectedVersion) {
  const OWNER = MCP_RUNTIME_OWNER, MARKER = MCP_RUNTIME_MARKER;
  // Parsing failures remain inside the original mismatch boundary.
  const readJson = path => JSON.parse(readFileSync(path, "utf8"));
  const markerPath = join(root, MARKER);
  if (!existsSync(root)) return Object.freeze({ status: "absent", root, entrypoint: null, digest: null });
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink() || !existsSync(markerPath)) {
    return Object.freeze({ status: "foreign", root, entrypoint: null, digest: null });
  }
  try {
    const marker = readJson(markerPath, "AGDF_MCP_RUNTIME_MARKER_INVALID");
    const packageRoot = join(root, "node_modules", "@agdf", "mcp-server");
    const dispatcherRoot = join(root, "node_modules", "create-agdf");
    const sdkServerRoot = join(root, "node_modules", "@modelcontextprotocol", "server");
    const sdkCoreRoot = join(root, "node_modules", "@modelcontextprotocol", "core");
    const sdkClientRoot = join(root, "node_modules", "@modelcontextprotocol", "client");
    const sdkV1Root = join(root, "node_modules", "@modelcontextprotocol", "sdk");
    const manifestPath = join(packageRoot, "package.json");
    const dispatcherManifestPath = join(dispatcherRoot, "package.json");
    if (marker.owner !== OWNER || marker.version !== expectedVersion
        || !existsSync(manifestPath) || !existsSync(dispatcherManifestPath)) {
      return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
    }
    for (const ownedRoot of [packageRoot, dispatcherRoot, sdkServerRoot, sdkCoreRoot]) {
      if (!existsSync(ownedRoot) || !lstatSync(ownedRoot).isDirectory() || lstatSync(ownedRoot).isSymbolicLink()) {
        return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
      }
    }
    const manifest = readJson(manifestPath, "AGDF_MCP_SERVER_MANIFEST_INVALID");
    const dispatcherManifest = readJson(dispatcherManifestPath, "AGDF_MCP_DISPATCHER_MANIFEST_INVALID");
    const sdkServerManifest = readJson(join(sdkServerRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    const sdkCoreManifest = readJson(join(sdkCoreRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    const entrypoint = join(packageRoot, "bin", "agdf-mcp.js");
    const serverDigest = digestDirectory(packageRoot);
    const dispatcherDigest = digestMcpDispatcherPackage(dispatcherRoot);
    const sdkDigest = digestMcpSdkRuntime(root);
    const valid = [1, 2].includes(marker.schema_version)
      && typeof marker.node_executable === "string"
      && isAbsolute(marker.node_executable)
      && manifest.name === "@agdf/mcp-server"
      && manifest.version === expectedVersion
      && manifest.dependencies?.["create-agdf"] === expectedVersion
      && manifest.dependencies?.["@modelcontextprotocol/server"] === "2.0.0"
      && manifest.engines?.node === ">=22"
      && dispatcherManifest.name === "create-agdf"
      && dispatcherManifest.version === expectedVersion
      // The actual server import map declares its worker interface. Historical
      // servers have no such entry; new servers must reject an older same-version
      // dispatcher before public admission, rather than failing on the first call.
      && (manifest.imports?.['#agdf-dispatch-worker'] === undefined
        || manifest.imports['#agdf-dispatch-worker'] === 'create-agdf/mcp-worker-runtime' && declaresWorkerEntry(dispatcherRoot))
      && (manifest.imports?.['#agdf-owner-protocol'] === undefined
        || manifest.imports['#agdf-owner-protocol'] === 'create-agdf/mcp-owner-protocol' && declaresOwnerEntry(dispatcherRoot))
      && (manifest.agdfExecutionModel === undefined || manifest.agdfExecutionModel === 'owner_threads_v1'
        && manifest.imports?.['#agdf-owner-protocol'] === 'create-agdf/mcp-owner-protocol'
        && declaresOwnerEntry(dispatcherRoot) && declaresWorkerEntry(dispatcherRoot))
      && sdkServerManifest.name === "@modelcontextprotocol/server"
      && sdkServerManifest.version === "2.0.0"
      && sdkCoreManifest.name === "@modelcontextprotocol/core"
      && sdkCoreManifest.version === "2.0.0"
      && !existsSync(sdkClientRoot)
      && !existsSync(sdkV1Root)
      && existsSync(entrypoint)
      && lstatSync(entrypoint).isFile()
      && !lstatSync(entrypoint).isSymbolicLink()
      && marker.server_digest === serverDigest
      && marker.dispatcher_digest === dispatcherDigest
      && marker.sdk_digest === sdkDigest;
    return Object.freeze({
      status: valid ? "matched" : "mismatch",
      version: expectedVersion,
      root,
      packageRoot,
      dispatcherRoot,
      markerPath,
      entrypoint: valid ? entrypoint : null,
      digest: serverDigest,
      dispatcherDigest,
      sdkDigest,
      executionModel: manifest.agdfExecutionModel ?? 'process_v1',
      nodeExecutable: typeof marker.node_executable === "string" ? marker.node_executable : null,
      references: Object.freeze(Array.isArray(marker.references) ? marker.references : []),
      markerSchemaVersion: marker.schema_version,
      sdkVerification: typeof marker.sdk_verification === "string" ? marker.sdk_verification : null,
    });
  } catch {
    return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
  }
}
