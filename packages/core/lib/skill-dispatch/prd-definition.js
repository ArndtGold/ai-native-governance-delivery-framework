import { extractField } from "../control-evaluation/verified-change.js";
import { resolveArtifactPresentationLanguages } from "../resources/context.js";

// Pure routing over already evaluated control and contained source facts; never a writer or gate.
export function prdDefinitionPhase(targetDir, control, input, sources) {
  const state = control?.status_card?.runState;
  if (control?.next_operation?.type === "reassess_source_analysis") return null;
  if (input.ur_action !== undefined || input.sd_action !== undefined || !input.run_id || control?.status_card?.run_id !== input.run_id || !state || !sources
      || control.current_gate !== "PRD" || !["open", "blocked"].includes(control.status)
      || !["none", "Approval: PRD"].includes(control.missing_approval)
      || !["none", "AGDF_PRD_DECISIONS_OPEN"].includes(control.blocking_reason)
      || (control.doctor_report?.findings ?? []).some(f => ["block", "revise"].includes(f.severity))
      || state.approvals.get("UR")?.status !== "approved"
      || state.artefacts.get("UR")?.status !== "approved"
      || state.approvals.get("PRD")?.status === "approved"
      || !["done", "not_applicable"].includes(state.artefacts.get("Brownfield Review")?.status)
      || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision?.decision)) return null;
  if (input.skill_id !== "prd-definition" && !(input.intake || input.continue_delivery)) return null;
  const revisionId = extractField(state.content ?? "", "revision_id");
  if (!revisionId) return null;
  const artifactPath = `.agdf/control/artefacts/${input.run_id}/PRD.md`;
  const artefact = state.artefacts.get("PRD");
  const registered = artefact?.status === "draft";
  if (artefact?.status === "approved" || (registered
      && String(artefact.path ?? "").replace(/^`|`$/gu, "") !== artifactPath)) return null;
  if (registered && input.skill_id !== "prd-definition" && input.prd_action !== "revise"
      && control.prd_readiness?.ready !== false) return null;
  return Object.freeze({
    phase: "prd_definition", skill_id: "prd-definition", governance_target: targetDir,
    run_id: input.run_id, revision_id: revisionId,
    ...resolveArtifactPresentationLanguages(targetDir, input.presentation_language),
    artifact_path: artifactPath, source_artifacts: Object.freeze(sources.map(s => s.path)),
    sources: Object.freeze(sources.map(s => Object.freeze({ ...s }))), draft_registered: registered,
    instruction: "Execute prd-definition with the original request, confirmed answers and these exact approved/analytical sources. Require actual user editing intent before changing a ready registered draft. Follow the focused semantic contract and shared typed recording procedure; preserve open material decisions and approved intent. Redispatch gate-check after recording. Neither dispatch nor authoring approves a gate; every changed draft needs fresh presentation and a new deliberate reply.",
  });
}
