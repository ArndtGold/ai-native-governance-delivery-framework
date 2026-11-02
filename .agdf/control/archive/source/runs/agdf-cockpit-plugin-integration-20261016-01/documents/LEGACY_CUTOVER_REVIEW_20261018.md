# Legacy cutover attempt and current source review — 2026-10-18

Status: blocked at existing evidence predicate
Authorizes: false
Run: agdf-cockpit-plugin-integration-20261016-01

## Actual attempted operation

Executed the version-matched CLI owner mcp disable --surface codex --scope project --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework --retire-cockpit agdf-cockpit-local --evidence .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/evidence/legacy-cutover-attempt-20261018/partial-transition.json --json using Node 22.22.3 and the previously verified matching CLI source snapshot. Exit 1; result failed; diagnostics cockpit_transition_failed and cockpit_legacy_retained, reason AGDF_MCP_COCKPIT_EVIDENCE_INVALID; changes:[].

The record deliberately reports result:partial, excludes an unobserved native teardown, and marks the incomplete origin inventory incomplete. The independent existing validator reports record, observations, inventory. Missing provider coverage is also distinct from the documented host closing limitation; accepting that limitation alone would not establish a complete inventory. No qualified transition or evidence was forged, and no direct config edit bypassed the owner.

## Preservation and review

Before/after SHA-256 values for the real project/user configs, current plugin declaration and production marketplace transaction are identical. Legacy remains active. No plugin/cache update, journal settlement, source change or Git action was performed. All 58 source/test/build files in the existing review inventory are unchanged, so prior automated results remain applicable and were not rerun.

CODE_REVIEW_SOURCE_20261018.md concludes the focused current source review with pass and no confirmed actionable defect in the reviewed scope, while explicitly excluding unexecuted migration effects. This does not complete the operational CR step: the current Run remains CD+Tests, and the canonical review writer rejects review registration outside CR or Quick Task Execution. No CR/QA/UAT approval or readiness is claimed.

## Concrete remaining condition

Approved SD SDD-004 / section 4.4 and TP T-008 / N-LEGACY require matching qualification before the guarded disablement. HOST_EVIDENCE_LIMIT_20261018.md expressly leaves CPI-E01 open and changes no source condition. CLI_LIFECYCLE_EVIDENCE_20261018.md establishes the isolated CLI lane only, not the remaining native qualification or complete effective origin inventory.

The existing permitted path is to obtain the missing qualification and complete inventory, then retry the guarded transition and finish final effect review. A requested exception for host-limited evidence would instead require explicit source revision of the affected SD/TP predicates through their existing owner, with its fresh presentation/approval; an old TP approval or this note cannot silently supply that change. No such policy change has been implemented or presented as accepted.

Raw partial evidence, owner output, validator output and preservation/source-equivalence checks are sealed in evidence/legacy-cutover-attempt-20261018. Previous reports and sealed evidence remain intact.
