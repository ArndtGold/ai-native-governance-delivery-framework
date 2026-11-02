import { extractField } from "../control-evaluation/verified-change.js";

// Pure assignment over evaluated state and checked source facts; no writer or approval.
export function sdDefinitionPhase(targetDir, control, input, sources) {
  const state = control?.status_card?.runState;
  if (input.ur_action !== undefined || input.prd_action !== undefined || !input.run_id
      || control?.status_card?.run_id !== input.run_id || !state || !sources
      || control.current_gate !== "SD" || !["open", "blocked"].includes(control.status)
      || !["none", "Approval: SD"].includes(control.missing_approval)
      || !["none", "AGDF_SD_DECISIONS_OPEN", "AGDF_SD_TRACEABILITY_INCOMPLETE"].includes(control.blocking_reason)
      || (control.doctor_report?.findings ?? []).some(f => ["block", "revise"].includes(f.severity))
      || state.approvals.get("PRD")?.status !== "approved"
      || state.artefacts.get("PRD")?.status !== "approved"
      || state.approvals.get("SD")?.status === "approved"
      || !["done", "not_applicable"].includes(state.artefacts.get("Brownfield Review")?.status)
      || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision?.decision)) return null;
  if (input.skill_id !== "sd-definition" && !(input.intake || input.continue_delivery)) return null;
  const revisionId = extractField(state.content ?? "", "revision_id");
  if (!revisionId) return null;
  const artifactPath = `.agdf/control/artefacts/${input.run_id}/SD.md`;
  const artefact = state.artefacts.get("SD");
  const registered = artefact?.status === "draft";
  if (artefact?.status === "approved" || (registered
      && String(artefact.path ?? "").replace(/^`|`$/gu, "") !== artifactPath)) return null;
  if (registered && input.skill_id !== "sd-definition" && input.sd_action !== "revise"
      && control.sd_readiness?.ready !== false && control.traceability_readiness?.ready !== false) return null;
  return Object.freeze({
    phase: "sd_definition", skill_id: "sd-definition", governance_target: targetDir,
    run_id: input.run_id, revision_id: revisionId, presentation_language: input.presentation_language,
    artifact_path: artifactPath, source_artifacts: Object.freeze(sources.map(s => s.path)),
    sources: Object.freeze(sources.map(s => Object.freeze({ ...s }))), draft_registered: registered,
    instruction: "Execute sd-definition from these exact approved/analytical inputs and confirmed answers. Require actual editing intent before changing a ready draft. Preserve approved product authority, declare sd-decisions-v1, retain material open decisions and criteria-chain-v1. Use the shared typed recording procedure, then redispatch gate-check. Neither assignment nor authoring approves a gate; changed content needs fresh presentation and a new deliberate Approval: SD.",
  });
}
