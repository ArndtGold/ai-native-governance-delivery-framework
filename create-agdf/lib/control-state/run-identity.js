export const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;
export const REVISION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateRunIdentity({ runId, revisionId } = {}) {
  const findings = [];
  if (!RUN_ID_PATTERN.test(String(runId ?? ""))) findings.push({ code: "AGDF_RUN_ID_INVALID" });
  if (!REVISION_ID_PATTERN.test(String(revisionId ?? ""))) findings.push({ code: "AGDF_RUN_REVISION_ID_INVALID" });
  return findings;
}
