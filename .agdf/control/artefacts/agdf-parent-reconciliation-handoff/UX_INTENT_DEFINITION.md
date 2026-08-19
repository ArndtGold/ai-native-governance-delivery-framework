# UX Intent Definition: Parent Reconciliation Handoff

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: finish a Child run confidently while seeing whether an explicitly related
  Parent or programme state still needs coordination.
- success_signal: the Child result remains visibly final, the Parent handoff is unambiguous and the
  user sees at most one concrete next action without mistaking coordination for another approval.
- primary_decision_or_action: no new decision is introduced; act on the one reconciliation next
  step only when the handoff is open.
- working_modes:
  - no explicit Parent relationship;
  - explicit relationship already reconciled;
  - explicit relationship open or stale;
  - programme aggregate startable but not final-ready;
  - programme aggregate final-ready.
- effective_state_by_mode:
  - no relationship: reconciliation not applicable;
  - reconciled: resolved with concrete Parent reference;
  - open/stale: Child complete, Parent coordination open;
  - aggregate startable: evidence matrix may be maintained but final QA/acceptance remains closed;
  - aggregate final-ready: declared programme evidence conditions are complete.
- visible_state_types: Child completion, Parent reconciliation status, Parent reference, one next
  action, aggregation readiness and explicit non-authorizing boundary.
- effective_state_authority_by_mode: Child QA/UAT/OR remains authoritative for Child completion;
  Parent run remains authoritative for Parent state; the closeout contract defines only the handoff
  projection; programme requirements define their own readiness evidence.
- primary_state_presentation_owner_by_mode: `release-or` presents the audit handoff;
  `delivery-closeout` consumes it for operational handoff; Doctor/Delivery Map may report a
  deterministic diagnostic but do not decide or mutate state.
- activation_paths: only an explicit durable Child-to-Parent/programme relationship activates the
  projection; absence or ambiguity never triggers inferred Parentage.
- blockers:
  - missing or ambiguous explicit relationship evidence: show open/unknown recovery, never infer;
  - Parent unavailable or stale: preserve Child completion and point to Parent reconciliation;
  - aggregation evidence incomplete: show startable but not final-ready;
  - incompatible legacy run: retain legacy behavior and do not require migration by default.
- recovery_paths:
  - add or repair one explicit durable relationship at its owning gate;
  - reconcile the named Parent artefacts and re-run the deterministic check;
  - complete the named programme evidence before final readiness;
  - retain an accepted open handoff explicitly when automatic reconciliation is inappropriate.
- relevant_state_transitions:
  - relationship absent -> not applicable;
  - explicit relationship + matching Parent -> resolved;
  - explicit relationship + stale Parent -> open;
  - open -> resolved after Parent update and validation;
  - aggregate not started -> startable -> final-ready only from declared evidence;
  - none of these transitions changes Child approval or completion.
- proposed_prd_acceptance_criteria:
  - users can distinguish Child completion from Parent coordination in every mode;
  - open reconciliation exposes exactly one Parent target and one recovery action;
  - no approval control is rendered for reconciliation itself;
  - missing/ambiguous relationships fail closed without inferred Parentage;
  - aggregation readiness never implies QA/UAT or creates a new gate;
  - legacy runs without explicit relationships remain unchanged;
  - diagnostic and OR wording preserve evidence and authority classes.
- open_product_questions: `none`; qualification and severity are design questions within the
  approved intent, not unresolved user intent.
- affected_outputs: closeout contract, OR report/template, delivery closeout consumption,
  deterministic status/diagnostic output and programme aggregation wording.
- evidence: approved UR; Brownfield Review; Benchmark v3/Parent Roadmap reconciliation; existing
  Context Graph reconciliation interaction pattern.
- missing_evidence: technical relationship schema, diagnostic owner/severity and migration design
  belong to SD after PRD approval.
- required_next_step: incorporate these criteria into PRD Revision 1 and request exact PRD approval.
