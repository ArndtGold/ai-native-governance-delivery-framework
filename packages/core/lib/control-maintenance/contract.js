import { isAbsolute } from "node:path";
import { assertControlMigration } from "./compatibility.js";

// Counts are presentation projections of the canonical inventory, never a stored policy.
export function controlCounts(control) {
  return {
    migration: control.runs.filter((run) => run.status === "migration_required" || run.pending_recoveries?.length === 1).length,
    repair: control.runs.filter((run) => run.status === "repair_required" && run.pending_recoveries?.length !== 1).length,
    historical: control.runs.filter((run) => run.status === "historical").length,
  };
}

export function assertMaintenanceResult(value, target = value?.target) {
  if (!value || value.schema_version !== 1 || value.authorizes !== false
      || typeof target !== "string" || !isAbsolute(target) || value.target !== target
      || !["inspect", "guided"].includes(value.operation)
      || !["complete", "unavailable", "not_checked"].includes(value.inspection_state)
      || !["not_started", "deferred", "applied", "partial", "needs_input"].includes(value.maintenance_outcome)
      || !Array.isArray(value.diagnostics)) throw new Error("AGDF_MAINTENANCE_RESULT_INVALID");
  if (value.inspection_state === "complete") {
    assertControlMigration(value.compatibility);
    if (value.compatibility.target !== target
        || JSON.stringify(value.counts) !== JSON.stringify(controlCounts(value.compatibility))) {
      throw new Error("AGDF_MAINTENANCE_TARGET_MISMATCH");
    }
  } else if (value.compatibility !== null || value.counts !== null) throw new Error("AGDF_MAINTENANCE_RESULT_INVALID");
  return value;
}

export function maintenanceResult(target, compatibility, { operation = "inspect", outcome = "not_started", diagnostic, diagnostics = [] } = {}) {
  return assertMaintenanceResult({ schema_version: 1, target, operation, authorizes: false,
    inspection_state: compatibility ? "complete" : "unavailable",
    compatibility, counts: compatibility ? controlCounts(compatibility) : null,
    maintenance_outcome: outcome, diagnostics: diagnostic ? [{ code: diagnostic }] : diagnostics });
}

export function maintenanceExitCode(report) {
  if (report.inspection_state !== "complete") return 1;
  if (report.maintenance_outcome === "deferred") return 0;
  return ["current", "absent"].includes(report.compatibility.status) ? 0 : 2;
}
