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
