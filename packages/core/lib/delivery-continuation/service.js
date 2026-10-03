import process from "node:process";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { correctRunRelationship } from "../control-state/run-relationship-correction.js";
import { DISPATCH_RECOVERY } from "../interaction-catalog.js";
import { localePack } from "../interaction-presentation.js";
import { createSkillDispatchFailure, createSkillDispatchService } from "../skill-dispatch/service.js";

// Application owner for authorized continuation. Routing itself remains read-only.
// Neither the initial route nor a correction refusal is emitted until this call returns.
export function createDeliveryContinuationService(dependencies = {}) {
  const route = createSkillDispatchService(dependencies);
  const evaluateGate = dependencies.evaluateGateCheck ?? evaluateGateCheck;
  const correct = dependencies.correctRunRelationship ?? correctRunRelationship;
  const now = dependencies.now ?? (() => process.hrtime.bigint());
  const elapsed = start => Math.round(Math.max(0, Number(now() - start) / 1_000_000) * 1000) / 1000;

  return function executeDeliveryContinuation(rawInput) {
    const started = now();
    const initial = route(rawInput);
    // A successful route supplies the validated intent, target and exact control binding.
    // Invalid, unresolved, stale-assignment, status and judgement routes cannot mutate.
    if (rawInput.continueDelivery !== true || initial.outcome !== "control_result"
        || initial.skill?.dispatch_mode !== "deterministic_control"
        || initial.target?.resolution_state !== "resolved"
        || initial.control?.run_id !== rawInput.runId || !initial.control?.revision_id
        || initial.control.blocking_reason !== "AGDF_DELIVERY_RELATIONSHIP_MISSING") return initial;

    const correctionStarted = now();
    let correction;
    const fail = details => createSkillDispatchFailure({
      skill: initial.skill, runtime: initial.runtime,
      timing: { ...initial.timing, control_ms: initial.timing.control_ms + elapsed(correctionStarted), total_ms: elapsed(started) },
      code: DISPATCH_RECOVERY.control_evaluation_failed, details,
      interactionLocales: rawInput.interactionLocales, presentationLanguage: rawInput.presentationLanguage,
      renderRecovery: dependencies.renderSkillDispatchRecovery,
    });
    try {
      correction = correct(initial.target.governance_target, {
        runId: initial.control.run_id, revisionId: initial.control.revision_id,
      }, { evaluateGateCheck: evaluateGate });
      if (correction.reason === "correction_commit_unconfirmed") {
        return fail(`AGDF_CORRECTION_COMMIT_UNCONFIRMED: ${correction.run_id}; committed revision ${correction.revision_id}.`);
      }
      if (correction.outcome !== "corrected") {
        initial.timing.control_ms += elapsed(correctionStarted);
        initial.timing.total_ms = elapsed(started);
        return initial;
      }
      const correctionMs = elapsed(correctionStarted);
      // Reuse the resolved target; evaluate the committed run afresh and route exactly once.
      const freshRoute = createSkillDispatchService({ ...dependencies,
        resolveTaskTarget: () => initial.target,
        evaluateGateCheck: (root, selection) => {
          const report = evaluateGate(root, selection);
          return { ...report, relationship_correction: { ...correction,
            message: localePack(rawInput.interactionLocales ?? dependencies.pluginDefinition?.interactionLocales,
              report.status_card?.presentation_language ?? rawInput.presentationLanguage).operationalValues.relationshipCorrected } };
        },
      });
      const result = freshRoute(rawInput);
      for (const field of ["input_ms", "target_ms", "control_ms", "render_ms"]) result.timing[field] += initial.timing[field];
      result.timing.control_ms += correctionMs;
      result.timing.total_ms = elapsed(started);
      return result;
    } catch { return fail(); }
  };
}
