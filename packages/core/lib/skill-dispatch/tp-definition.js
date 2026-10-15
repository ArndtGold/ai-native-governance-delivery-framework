import { extractField } from "../control-evaluation/verified-change.js";
import { ARTEFACT_TEMPLATE_IDS, resolveArtefactTemplatePath } from "../resources/artefact-templates.js";
import { resolveArtifactPresentationLanguages } from "../resources/context.js";

// Pure assignment over evaluated state and checked source facts; no writer or approval.
export function tpDefinitionPhase(targetDir, control, input, sources) {
  const state = control?.status_card?.runState;
  if (control?.next_operation?.type === "reassess_source_analysis") return null;
  if (input.ur_action !== undefined || input.prd_action !== undefined || input.sd_action !== undefined || !input.run_id
      || control?.status_card?.run_id !== input.run_id || !state || !sources
      || control.current_gate !== "TP" || !["open", "blocked"].includes(control.status)
      || !["none", "Approval: TP"].includes(control.missing_approval)
      || !["none", "AGDF_TP_TRACEABILITY_INCOMPLETE"].includes(control.blocking_reason)
      || (control.doctor_report?.findings ?? []).some(f => ["block", "revise"].includes(f.severity))
      || state.approvals.get("SD")?.status !== "approved"
      || state.artefacts.get("SD")?.status !== "approved"
      || state.approvals.get("PRD")?.status !== "approved"
      || state.artefacts.get("PRD")?.status !== "approved"
      || state.approvals.get("TP")?.status === "approved"
      || !["done", "not_applicable"].includes(state.artefacts.get("Brownfield Review")?.status)
      || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision?.decision)) return null;
  if (input.skill_id !== "tp-definition" && !(input.intake || input.continue_delivery)) return null;
  const revisionId = extractField(state.content ?? "", "revision_id");
  if (!revisionId) return null;
  const artifactPath = `.agdf/control/artefacts/${input.run_id}/TP.md`;
  const artefact = state.artefacts.get("TP");
  const registered = artefact?.status === "draft";
  if (artefact?.status === "approved" || (registered
      && String(artefact.path ?? "").replace(/^`|`$/gu, "") !== artifactPath)) return null;
  if (registered && input.tp_action !== "revise"
      && control.traceability_readiness?.ready !== false) return null;
  return Object.freeze({
    phase: "tp_definition", skill_id: "tp-definition", governance_target: targetDir,
    run_id: input.run_id, revision_id: revisionId,
    ...resolveArtifactPresentationLanguages(targetDir, input.presentation_language),
    artifact_path: artifactPath, template_path: resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.TP),
    source_artifacts: Object.freeze(sources.map(s => s.path)),
    sources: Object.freeze(sources.map(s => Object.freeze({ ...s }))), draft_registered: registered,
    instruction: "Execute tp-definition from these exact approved PRD/SD and analytical inputs. Preserve ready drafts without explicit revision intent. Keep criteria-chain-v1, declare tp-decisions-v1, resolve SD later_tp decisions and specify executable evidence obligations. Material questions block approval and require a concrete clarification at the earliest existing source owner; no silent source edits. Use the shared typed recording procedure, then redispatch gate-check for this run with continue_delivery true to obtain its clarification or presentation continuation. Changed drafts require fresh presentation and a new deliberate Approval: TP.",
  });
}
