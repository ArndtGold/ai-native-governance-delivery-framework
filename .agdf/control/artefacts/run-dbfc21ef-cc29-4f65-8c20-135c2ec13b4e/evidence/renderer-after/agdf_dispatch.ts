agdf_dispatch(args: {
  // Set only with skill_id gate-check for an authorized bound delivery continuation, including after a valid UR, PRD, SD, TP or UAT approval. Requires run_id; incompatible with intake. Never set on a returned judgement skill or for status or advice. Allows canonical Brownfield Review / Mode-Slice recovery, implementation-preparation Brownfield Analysis after TP approval, missing PRD/SD/TP preparation before approval cards, permitted compact implementation/closeout, and OR closeout after UAT approval. Completed Runs stop; no VCS authority is implied.
  continue_delivery?: boolean;
  // Revision from the resolve_delivery_run candidate used for scope matching. Requires intake true, intake_mode resume and run_id. Changed or unavailable binding returns fresh assignment evidence before gate evaluation; it never adopts another run automatically.
  expected_revision_id?: string;
  // Set true only with skill_id gate-check when the governed delivery intake (catalog delivery.start) is the active route; delivery wins mixed intent, so a gate-check invocation that asks for a change also sets it. Omit it for status, approval or next-step questions. It never grants approval or delivery authority.
  intake?: boolean;
  // With intake true: new prepares the explicitly authorized new scope at an unused run_id; resume continues the bound run. Requires run_id. Never infer new from ambiguous continuation.
  intake_mode?: "new" | "resume";
  // Explicit user intent to revise the bound unapproved PRD. Requires gate-check, intake true, intake_mode resume, run_id and expected_revision_id; never approval.
  prd_action?: "revise";
  // Required presentation language for the latest natural-language user request as one well-formed BCP 47 tag. If the request explicitly asks for a response language, use that tag; otherwise use the dominant request language. Use en when mixed or ambiguous. A valid unsupported tag renders through the complete English pack. Missing or invalid input fails before governance evaluation.
  presentation_language: string;
  // Absolute governance-target path paired with target_source. Never derive it from working_directory alone.
  primary_target?: string;
  // Canonical run identifier. Select an existing run from an explicit request, confirmed continuation or unequivocal same-scope assignment after resolve_delivery_run. Scope assignment must use expected_revision_id. For intake_mode new, choose an unused id for the authorized change; never reuse an existing run.
  run_id?: string;
  // Explicit user intent to revise the bound unapproved SD. Requires gate-check, intake true, intake_mode resume, run_id and expected_revision_id; never approval.
  sd_action?: "revise";
  // Canonical AGDF skill slug or exact catalog-registered skill name for the calling host; normalized internally to the stable canonical ID.
  skill_id: string;
  // Authority source for primary_target. Supply it only with primary_target and only when exactly one listed meaning applies; otherwise omit both fields.
  target_source?: "explicit_target" | "continued_target" | "current_repository";
  // Explicit user intent to revise the bound unapproved TP. Requires gate-check, intake true, intake_mode resume, run_id and expected_revision_id; never approval.
  tp_action?: "revise";
  // Explicit user intent to revise the bound unapproved UR. Requires gate-check, intake true, intake_mode resume, run_id and expected_revision_id; never approval.
  ur_action?: "revise";
  // Absolute execution-context path. It never selects or authorizes a target.
  working_directory: string;
}
