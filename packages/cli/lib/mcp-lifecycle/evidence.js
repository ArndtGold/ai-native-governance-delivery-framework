const SURFACES = new Set(["codex", "claude", "opencode", "copilot"]);
const SCOPES = new Set(["project", "user"]);
const QUALIFICATION_FIELDS = Object.freeze([
  "surface",
  "capability",
  "host_version",
  "client_variant",
  "session_variant",
  "configuration_variant",
  "os",
  "arch",
  "requested_scope",
  "native_scope",
  "configuration_source",
  "node_version",
  "server_version",
  "dispatcher_version",
  "sdk_version",
  "entrypoint_identity",
  "discovery_evidence_ref",
  "dispatch_evidence_ref",
  "failure_evidence_ref",
  "cleanup_evidence_ref",
]);

function plainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function evidenceRef(value) {
  return typeof value === "string" && value.startsWith(".agdf/control/artefacts/") && !value.includes("..");
}

export function validateMcpQualificationRecord(record) {
  const errors = [];
  if (!plainObject(record)) return Object.freeze({ valid: false, errors: Object.freeze(["record"]) });
  if (!SURFACES.has(record.surface)) errors.push("surface");
  if (record.capability !== "supported") errors.push("capability");
  for (const field of QUALIFICATION_FIELDS) {
    if (typeof record[field] !== "string" || !record[field].trim()) errors.push(field);
  }
  if (!SCOPES.has(record.requested_scope)) errors.push("requested_scope");
  for (const field of ["discovery_evidence_ref", "dispatch_evidence_ref", "failure_evidence_ref", "cleanup_evidence_ref"]) {
    if (!evidenceRef(record[field])) errors.push(field);
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export function validateMcpDirectEvidenceResult(record, { expected = {} } = {}) {
  const errors = [];
  if (!plainObject(record) || record.schema_version !== 1) errors.push("schema_version");
  if (!SURFACES.has(record?.surface)) errors.push("surface");
  if (!["qualified", "unverified"].includes(record?.result)) errors.push("result");
  if (record?.authorizes !== false) errors.push("authorizes");
  if (!Array.isArray(record?.raw_log_sha256)
      || record.raw_log_sha256.some((value) => !/^[a-f0-9]{64}$/u.test(value))) errors.push("raw_log_sha256");
  else if (!record.raw_log_sha256.length) errors.push("raw_log_sha256");

  if (record?.result === "qualified") {
    const qualification = validateMcpQualificationRecord(record.qualification);
    errors.push(...qualification.errors.map((field) => `qualification:${field}`));
    if (record.qualification?.surface !== record.surface) errors.push("qualification:surface_match");
    for (const [field, value] of Object.entries(expected)) {
      if (record.qualification?.[field] !== value) errors.push(`qualification:expected:${field}`);
    }
    if (record.registration_status !== "matched") errors.push("registration_status");
    if (record.discovery_status !== "discovered" || record.discovery_source !== "direct_host") errors.push("discovery");
    if (record.tool_name !== "agdf_dispatch" || record.dispatch_status !== "passed") errors.push("dispatch");
    if (record.failure_status !== "passed") errors.push("failure_status");
    if (record.cleanup_status !== "restored") errors.push("cleanup_status");
  } else if (!Array.isArray(record?.gaps) || !record.gaps.length
      || record.gaps.some((value) => typeof value !== "string" || !value.trim())) {
    errors.push("gaps");
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const mcpQualificationFields = QUALIFICATION_FIELDS;

// Cockpit observations are a distinct cooperative claim, never dispatch qualification.
export function validateCockpitTransitionEvidence(record, { expected = {} } = {}) {
  const errors = [];
  const hash = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
  if (!plainObject(record) || record.schema_version !== 1 || record.kind !== 'cockpit_transition'
    || record.surface !== 'codex' || record.result !== 'qualified' || record.authorizes !== false
    || record.assurance !== 'cooperative_local') errors.push('record');
  for (const key of ['target_id', 'config_digest', 'section_digest', 'plugin_digest', 'ui_digest',
    'server_digest', 'dispatcher_digest', 'sdk_digest']) if (!hash(record?.[key])) errors.push(key);
  for (const key of ['config_path', 'plugin_root', 'runtime_root', 'version', 'legacy_id']) {
    if (typeof record?.[key] !== 'string' || !record[key]) errors.push(key);
  }
  if (!(record?.previous_plugin_digest === null && record?.previous_plugin_version === null)
    && !(hash(record?.previous_plugin_digest) && typeof record?.previous_plugin_version === 'string'
      && record.previous_plugin_version.length > 0)) errors.push('previous_installation');
  if (!['agdf-cockpit', 'agdf-cockpit-local'].includes(record?.legacy_id)) errors.push('legacy_id');
  if (!plainObject(record?.host) || ['name', 'version', 'session_id', 'os', 'arch'].some(key => typeof record.host[key] !== 'string' || !record.host[key])) errors.push('host');
  if (!Array.isArray(record?.observations) || !['discovery', 'ui_initialize', 'render', 'interaction', 'provider_attribution', 'teardown']
    .every(key => record.observations.includes(key))) errors.push('observations');
  if (record?.inventory?.complete !== true || !Array.isArray(record.inventory.origins) || !record.inventory.origins.length
    || record.inventory.origins.length > 64 || record.inventory.origins.some(row => !plainObject(row) || typeof row.path !== 'string' || !hash(row.digest))) errors.push('inventory');
  if (!Array.isArray(record?.providers) || !record.providers.length || record.providers.length > 64
    || record.providers.some(row => !plainObject(row) || typeof row.origin !== 'string' || typeof row.server_id !== 'string'
      || typeof row.connection_id !== 'string' || !row.connection_id || !Array.isArray(row.tools)
      || !plainObject(row.exposed_tools) || row.tools.some(name => typeof name !== 'string'
        || typeof row.exposed_tools[name] !== 'string' || !row.exposed_tools[name]))) errors.push('providers');
  if (Array.isArray(record?.providers) && record.providers.every(row => plainObject(row) && plainObject(row.exposed_tools))) {
    const connections = record.providers.map(row => row.connection_id);
    const exposed = record.providers.flatMap(row => Object.values(row.exposed_tools));
    if (new Set(connections).size !== connections.length || new Set(exposed).size !== exposed.length) errors.push('provider_collision');
  }
  const provider = (Array.isArray(record?.providers) ? record.providers : []).filter(row => plainObject(row) && row.origin === record.plugin_root && row.server_id === 'agdf-cockpit');
  if (provider?.length !== 1 || !Array.isArray(provider[0].tools) || !['agdf_cockpit', 'agdf_cockpit_read'].every(name => provider[0].tools.includes(name))) errors.push('provider');
  if (!Array.isArray(record?.evidence) || !record.evidence.length || record.evidence.length > 16
    || record.evidence.some(row => !plainObject(row) || !evidenceRef(row.path) || !hash(row.digest))) errors.push('evidence');
  if (record?.legacy_id === 'agdf-cockpit' && (record.isolated_qualification?.isolated !== true
    || record.isolated_qualification.target_id !== record.target_id
    || record.isolated_qualification.plugin_digest !== record.plugin_digest
    || typeof record.isolated_qualification.context_id !== 'string' || !record.isolated_qualification.context_id)) errors.push('isolated_qualification');
  for (const [key, value] of Object.entries(expected)) if (record?.[key] !== value) errors.push(`expected:${key}`);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}
