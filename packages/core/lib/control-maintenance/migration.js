import { join } from "node:path";
import { regularFileSnapshot } from "../control-state/run-store-inspection.js";
import { applyRunRecovery, inspectRunRecovery, previewRunRecovery } from "../control-state/run-recovery.js";
import { inspectControlMigration, safeApprovalReset } from "./compatibility.js";

export async function migrateInstallationControl(root, { mode = "inspect", confirmMigration } = {}) {
  if (!["inspect", "safe"].includes(mode)) throw new Error("AGDF_CONTROL_MIGRATION_MODE_INVALID");
  const before = inspectControlMigration(root);
  if (mode === "inspect" || !root) return before;
  const changes = [];
  const errors = [];
  // A structural inventory failure never authorizes a partial migration of an incomplete inventory.
  if (before.diagnostics.some((finding) => finding.code !== "AGDF_LEGACY_MIGRATION_REQUIRED")) return before;
  const candidates = before.runs.filter((entry) => entry.status === "migration_required" || entry.pending_recoveries?.length);
  // Bind the single decision to read-only snapshots. Declining must not even create journals.
  // The canonical recovery writer still checks each selected revision under its own lock.
  let selected;
  if (typeof confirmMigration === "function" && candidates.length) {
    selected = new Map();
    for (const run of candidates) {
      try {
        if (run.pending_recoveries?.length > 1) throw new Error("AGDF_RECOVERY_JOURNAL_CONFLICT");
        const pending = run.pending_recoveries?.[0];
        const journalContent = pending ? regularFileSnapshot(join(root, pending.journal)).content.toString("utf8") : null;
        const journal = pending ? JSON.parse(journalContent) : null;
        const inspection = pending ? null : inspectRunRecovery(root, run.run_id, { inspectHistory: false });
        selected.set(run.run_id, {
          run_id: run.run_id, pending, journalContent,
          source_revision_id: journal?.source_revision_id ?? inspection.revision_id,
          source_content_digest: journal?.source_content_digest ?? inspection.content_digest,
          source_artefacts: journal?.source_artefacts ?? inspection.artefacts,
          prior_approvals: journal?.prior_approvals ?? inspection.approvals,
          next_gate: journal?.next_gate ?? inspection.next_gate_if_recovered,
        });
      } catch (error) { errors.push({ run_id: run.run_id, code: String(error.code ?? error.message) }); }
    }
    if (selected.size) {
      const plan = { target: root, control: before, runs: [...selected.values()], diagnostics: errors,
        approval_reset_count: [...selected.values()].filter((run) => !safeApprovalReset(run.prior_approvals)).length,
        authorizes: false };
      if (await confirmMigration(structuredClone(plan)) !== "migrate") return before;
    }
  }
  for (const run of candidates) {
    if (selected && !selected.has(run.run_id)) continue;
    if (run.pending_recoveries?.length > 1) { errors.push({ run_id: run.run_id, code: "AGDF_RECOVERY_JOURNAL_CONFLICT" }); continue; }
    if (run.pending_recoveries?.length) run.safe_to_migrate = safeApprovalReset(run.pending_recoveries[0].prior_approvals ?? []);
    if (!selected && !run.safe_to_migrate) continue;
    try {
      const snapshot = selected?.get(run.run_id);
      const pending = run.pending_recoveries?.[0];
      if (snapshot) {
        if (pending) {
          if (regularFileSnapshot(join(root, pending.journal)).content.toString("utf8") !== snapshot.journalContent) {
            throw new Error("AGDF_STALE_RUN_REVISION");
          }
        } else {
          const current = inspectRunRecovery(root, run.run_id, { inspectHistory: false });
          if (current.revision_id !== snapshot.source_revision_id || current.content_digest !== snapshot.source_content_digest
              || JSON.stringify(current.artefacts) !== JSON.stringify(snapshot.source_artefacts)) throw new Error("AGDF_STALE_RUN_REVISION");
        }
      }
      const preview = pending ?? previewRunRecovery(root, run.run_id);
      if (snapshot && !pending && (preview.source_content_digest !== snapshot.source_content_digest
          || JSON.stringify(preview.source_artefacts) !== JSON.stringify(snapshot.source_artefacts))) throw new Error("AGDF_STALE_RUN_REVISION");
      // A concurrent approval change must never turn a safe migration into approval invalidation.
      const journal = JSON.parse(regularFileSnapshot(join(root, preview.journal)).content.toString("utf8"));
      const safe = safeApprovalReset(journal.prior_approvals);
      const confirmation = selected || safe ? preview.confirmation : null;
      if (confirmation !== preview.confirmation) continue;
      const applied = applyRunRecovery(root, { runId: run.run_id, previewId: preview.preview_id, confirmation });
      if (applied.seal_status !== "valid" && applied.outcome !== "already_recovered") throw new Error("AGDF_CONTROL_MIGRATION_VERIFICATION_FAILED");
      changes.push({ run_id: run.run_id, outcome: applied.outcome, revision_id: applied.revision_id,
        backup: preview.journal, next_gate: preview.next_gate });
    } catch (error) {
      errors.push({ run_id: run.run_id, code: String(error.code ?? error.message) });
    }
  }
  const after = inspectControlMigration(root);
  after.changes = changes;
  after.diagnostics.push(...errors);
  if (errors.length) after.status = "repair_required";
  return after;
}

