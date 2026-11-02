# Actual summary rejection, cause and editorial recovery

This follow-up supersedes only the relevant missing-UX observations in EVIDENCE_NATIVE-02.md. Candidate and production source code remain unchanged. No gate approval is inferred.

## Observed result

The test-preparation owner supplied explicit simulated state/activation/recovery inputs in TEST_SCENARIO-02.json after the earlier fixture was correctly blocked. The previous blocked analysis is preserved in NATIVE_UX_BLOCKED-01.md. BROWNFIELD_REVIEW and ready UX analysis were canonically recorded at fixture revisions 7 and 8. The actual installed desktop MCP then routed to prd-definition; NATIVE_READY_DISPATCH-01.json. This is test-input preparation, not a production product decision.

The agent authored the synthetic PRD and recorded its PRD-derived_from-UR mapping at revision 9, ff3246b0-ff8c-48f4-af4e-bb884fe3709b. The subsequent actual MCP returned evaluator_error, terminal true and dispatch_control_presentation_failed; NATIVE_SUMMARY_FAILURE-01.json. Its recovery claimed that the German summary was missing, although the exact required heading and a complete prose summary were present.

The agent obeyed the terminal instruction: the final response was only host_action.text, and no later tool was called in that response. The next actual user message was “Wieder ein Fehler”. This is one observed additional user turn after an internally correctable authoring mistake. It is not a necessary product choice, gate approval or external connection action. The positive chain therefore does not meet its zero-extra-continuation target in this observed attempt.

## Exact cause

The installed canonical validator requires separate recognized labels. The agent's summary used “Ziel und Umfang:” in one item and “Entscheidungskontext:” for decisions. These labels are readable prose but do not match the accepted field grammar. All six criterion IDs were present and the summary heading, language and size were valid.

NATIVE_SUMMARY_VALIDATION-01.json proves, using the installed candidate validator:

1. Original draft: approval_summary_user_goal_missing.
2. Split goal and scope labels: approval_summary_decisions_missing.
3. Separate Ziel:, Umfang: and Entscheidungen: labels: ready true.

The immediate agent error was failing to run the available summary readiness validator before recording and dependent dispatch. The framework compounded it: evaluatePrdReadiness evaluates product decisions/criteria, while the localized summary validator is reached during presentation; a registered content-ready draft falls out of the authoring route. The presentation error becomes terminal, and the generic “Freigabezusammenfassung fehlt” recovery loses the known field-specific cause. This is not a plugin identity or reconnection problem.

## Completed correction

On the user's new message, bound explicit PRD revision dispatch returned prd_definition for the same exact fixture, current revision and unchanged sources; NATIVE_SUMMARY_REPAIR_DISPATCH-01.json. Only the three summary labels were corrected; the substantive PRD preceding the summary was byte-identical. The installed validator was run before persistence and returned ready true. The existing typed writer with update_draft true superseded the old mapping and preserved historical proof, recording revision 10, 47715e0c-37d7-4561-b08f-e1117a057932; NATIVE_SUMMARY_REPAIR_RECORDING-01.json.

Fresh actual MCP dispatch then returned nonterminal intake_continuation, phase presentation_required, at that new revision; NATIVE_REPAIRED_PRESENTATION_DISPATCH-01.json. The isolated test stops at the pending PRD presentation/decision boundary. No live human approval of a synthetic test product is requested or fabricated. Human visibility of a prepared presentation is not claimed.

## Open finding and applicability

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| NF-002 | implementation_gap | CD+Tests | open | Native summary rejection above; approved PRD AC-002 exact own-input diagnosis and correction, plus AC-004 stop/actor behavior; current source checks do not establish actual author prevalidation | Assess early use of the existing summary validator, exact diagnosis preservation and permitted own-draft recovery under the approved TP before modifying production source |

This is supporting native finding evidence for the existing review/QA owners, not a new gate or independent QA decision. The production run still has its recorded QA revise and remaining native obligations. Code Review's historical source-only pass does not close this finding. Existing C001-C019 evidence retains its named deterministic boundaries and must not be promoted to native complete-pass evidence.

The editorial test correction is complete. The framework diagnosis/recovery finding remains open; no source implementation or replacement candidate was silently installed. Additional malformed/unchanged-failure, complete QA implementation/review, native visual/read-only and interruption obligations remain unqualified. A new package/reconnection request is not justified for this unchanged installed candidate.
