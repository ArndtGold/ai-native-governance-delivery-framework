import { lstatSync, readdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { discoverRuns } from "../control-state/run-state-reader.js";
import { directoryIdentity, regularFileSnapshot } from "../control-state/run-store-inspection.js";
import { artefactFileDigest, listedArtefactPaths, pendingArtefactPaths, runSealState } from "../control-state/run-seal.js";
import { inspectRunRecovery } from "../control-state/run-recovery.js";
import { doctorRequiredFiles } from "../control-evaluation/required-files.js";
import { inspectControlConfiguration } from "../control-state/control-configuration.js";
import { hasSymlinkComponent } from "../control-state/contained-file.js";
import { APPROVAL_GATES } from "../control-state/run-seal.js";

function entryExists(path) {
  try { lstatSync(path); return true; } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export function safeApprovalReset(approvals) {
  return APPROVAL_GATES.every((gate) => approvals.some((approval) => approval.gate === gate))
    && approvals.every((approval) => approval.status === "missing" && !approval.evidence);
}

function interruptedRecoveries(root, runId) {
  const directory = join(root, ".agdf", "control", "runs", runId, "recovery-previews");
  if (!entryExists(directory)) return [];
  directoryIdentity(directory);
  return readdirSync(directory).filter((name) => name.endsWith(".json")).map((name) => {
    const journal = JSON.parse(regularFileSnapshot(join(directory, name)).content.toString("utf8"));
    return journal.phase === "applying" ? { preview_id: journal.preview_id, confirmation: journal.confirmation,
      prior_approvals: journal.prior_approvals, source_revision_id: journal.source_revision_id, next_gate: journal.next_gate,
      journal: `.agdf/control/runs/${runId}/recovery-previews/${name}` } : null;
  }).filter(Boolean);
}

export const CONTROL_MIGRATION_STATUSES = Object.freeze(["not_checked", "absent", "current", "migration_required", "repair_required"]);

export function uncheckedControl() {
  return { schema_version: 1, supported_control_state_version: 2, target: null,
    status: "not_checked", runs: [], diagnostics: [], changes: [], authorizes: false };
}

// Repository compatibility is separate from delivery readiness and grants no gate authority.
// Never search neighbouring repositories or infer a write target from a host configuration path.
export function inspectControlMigration(root) {
  if (!root) return uncheckedControl();
  if (!isAbsolute(root)) throw new Error("AGDF_CONTROL_MIGRATION_TARGET_INVALID");
  const result = { ...uncheckedControl(), target: root, status: "absent" };
  const agdf = join(root, ".agdf");
  try {
    if (!entryExists(agdf)) return result;
    for (const path of [root, agdf, join(agdf, "control")]) {
      try { directoryIdentity(path); } catch {
        throw Object.assign(new Error("AGDF_CONTROL_PATH_INVALID"), { path });
      }
    }
    const required = [join(".agdf", "control", "config.json"), join(".agdf", "control", "README.md"),
      ...doctorRequiredFiles.filter((path) => !path.endsWith("AGDF_RUN.md"))];
    for (const path of required) {
      try { regularFileSnapshot(join(root, path)); } catch {
        throw Object.assign(new Error("AGDF_CONTROL_SCAFFOLD_INCOMPLETE"), { path });
      }
    }
    const configuration = inspectControlConfiguration(root);
    if (!configuration.active) throw new Error(configuration.diagnostic);
    const legacyPath = join(agdf, "control", "AGDF_RUN.md");
    if (entryExists(legacyPath)) {
      const legacy = regularFileSnapshot(legacyPath).content.toString("utf8");
      if (!legacy.startsWith("<!-- AGDF LEGACY PROJECTION")) {
        result.diagnostics.push({ code: "AGDF_LEGACY_MIGRATION_REQUIRED", path: ".agdf/control/AGDF_RUN.md" });
      }
    }
    const runsPath = join(agdf, "control", "runs");
    if (!entryExists(runsPath) && result.diagnostics.length) {
      result.status = "migration_required";
      return result;
    }
    directoryIdentity(runsPath);
    for (const run of discoverRuns(root)) {
      const entry = { run_id: run.run_id, control_state_version: run.meta?.control_state_version ?? null,
        lifecycle: run.meta?.lifecycle ?? null, status: "current", seal_status: null,
        safe_to_migrate: false, approvals: [], pending_recoveries: [], diagnostics: [] };
      if (!run.valid) {
        entry.status = "repair_required";
        entry.diagnostics = run.findings;
      } else {
        const seal = runSealState(root, run.content);
        entry.seal_status = seal.status;
        const pending = new Set(pendingArtefactPaths(run.content));
        const unresolved = listedArtefactPaths(run.content).filter((path) => {
          const status = artefactFileDigest(root, path);
          return status === "unresolved" || (status === "missing" && (!pending.has(path) || hasSymlinkComponent(root, path)));
        });
        if (run.meta.lifecycle !== "active" && seal.status === "unsealed") {
          // Historical records remain non-authorizing evidence; installation does not reopen them
          // or manufacture a retrospective integrity/approval attestation.
          entry.status = "historical";
        } else if (unresolved.length) {
          entry.status = "repair_required";
          entry.diagnostics = unresolved.map((path) => ({ code: "AGDF_RECOVERY_ARTEFACT_MISSING", path }));
        } else if (seal.status === "unsealed" && run.meta.lifecycle === "active") {
          const inspection = inspectRunRecovery(root, run.run_id, { inspectHistory: false });
          entry.approvals = inspection.approvals;
          entry.next_gate = inspection.next_gate_if_recovered;
          entry.status = inspection.artefacts.every((file) => file.status === "valid" || file.planned) ? "migration_required" : "repair_required";
          entry.safe_to_migrate = entry.status === "migration_required" && safeApprovalReset(inspection.approvals);
          entry.diagnostics = inspection.artefacts.filter((file) => file.status !== "valid" && !file.planned)
            .map((file) => ({ code: "AGDF_RECOVERY_ARTEFACT_PATH_INVALID", path: file.path }));
        } else if (seal.status !== "valid") {
          entry.status = "repair_required";
          entry.diagnostics = [{ code: "AGDF_RUN_SEAL_INVALID", seal_status: seal.status }];
        }
        entry.pending_recoveries = interruptedRecoveries(root, run.run_id);
        if (entry.pending_recoveries.length) {
          entry.status = "repair_required";
          entry.diagnostics.push({ code: "AGDF_RECOVERY_RESUME_REQUIRED" });
        }
      }
      result.runs.push(entry);
    }
    result.status = result.runs.some((run) => run.status === "repair_required") ? "repair_required"
      : result.diagnostics.length || result.runs.some((run) => run.status === "migration_required") ? "migration_required" : "current";
  } catch (error) {
    result.status = "repair_required";
    result.diagnostics.push({ code: String(error.code ?? error.message), ...(error.path ? { path: error.path } : {}) });
  }
  return result;
}

export function assertControlMigration(value) {
  if (!value || value.schema_version !== 1 || value.supported_control_state_version !== 2
      || !CONTROL_MIGRATION_STATUSES.includes(value.status) || value.authorizes !== false
      || !(value.target === null || (typeof value.target === "string" && isAbsolute(value.target)))
      || (value.status === "not_checked" && value.target !== null)
      || (value.status !== "not_checked" && value.target === null)
      || !Array.isArray(value.runs) || !Array.isArray(value.diagnostics) || !Array.isArray(value.changes)) {
    throw new Error("AGDF_CONTROL_MIGRATION_REPORT_INVALID");
  }
  if (value.repair && (value.repair.authorizes !== false || value.repair.target !== value.target
      || !["needs_input", "deferred", "partial", "applied"].includes(value.repair.status)
      || !Array.isArray(value.repair.diagnostics) || !Array.isArray(value.repair.items)
      || value.repair.items.some((item) => typeof item.run_id !== "string" || typeof item.available !== "boolean"
        || !["manual", "self_reference", "run_snapshot", "missing_artefacts"].includes(item.kind)
        || !Array.isArray(item.sources) || !Array.isArray(item.required)))) {
    throw new Error("AGDF_CONTROL_REPAIR_REPORT_INVALID");
  }
  return value;
}

