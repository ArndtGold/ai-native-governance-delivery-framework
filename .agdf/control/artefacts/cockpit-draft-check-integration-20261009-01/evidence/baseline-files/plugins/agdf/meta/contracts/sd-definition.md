# AGDF Runtime Contract — SD Definition

Use only a bound skill_continuation with phase sd_definition. This contract owns semantic
design drafting and clarification; it adds no gate, writer, persistence or approval authority.

## Binding and sources

Dispatch before direct work. Unbound invocation uses the existing resolve_delivery_run inventory,
matching original need to approved scope, then revision-bound gate-check resume intake. Never
select AGDF_RUN_ID, invent a run, infer editing intent from discovery/selection or use cwd as
authority. Use only returned governance_target, run_id, revision_id, artifact_path and sources.
Read the exact approved PRD, resolved product decisions, completed Brownfield routing and required
ready analytical inputs. PRD is product authority; analyses are subordinate. Missing/stale/foreign/
approved bindings or unrelated prerequisite/integrity/source blockers require fresh control.

## Draft and clarify

Use the existing SD format and one canonical unapproved design: draft/open metadata, named Owner,
Solution Overview, Ownership And Source Of Truth, Architecture Decisions, Integration Points,
Constraints And Compatibility, Test And Evidence Strategy, Acceptance Traceability, Risks And
Open Questions, Design Decisions, Next Step. Retain criteria-chain-v1. Explain architecture,
boundaries, flows, reuse, alternatives, rationale and trade-offs at proportionate depth. Map every
PRD criterion exactly once to realization, authoritative owner, stable SDD IDs or reasoned none
and compatibility/risk. Never duplicate acceptance, invent scope/users or claim implementation.
Retain actual sources/draft and a reasoned derivation review; structure alone is not semantic proof.

Always declare Design Decisions contract: sd-decisions-v1 and exactly one Design Decisions table:
Decision | Timing | Status | Resolution | Owner. Unique decisions use before_sd or later_tp,
status resolved/open/deferred, named owner and concrete resolution or deferral reason. Material
architecture/design choices belong before_sd and must be resolved before presentation. later_tp
may defer execution/test/evidence detail only; never hide binding architecture or product intent.
With no material unknown, record a concrete resolved applicability decision, not an empty table.
Legacy unmarked designs retain existing checks; this never permits removing a new draft's
declaration/table to conceal questions. Declared readiness does not prove all questions were found.

Missing material facts: preserve a useful draft and before_sd open row, retain answered context
and ask one focused bundled question. Sufficient inputs need no redundant question. Record confirmed
answers and updated design through the checked writer, then re-evaluate. Specific decision or
traceability correction permission never removes its blocker or unrelated source/integrity checks.
A product-scope/acceptance conflict stays unresolved and returns to the earliest affected existing
UR/PRD revision owner. Do not edit approved sources, invent a transition after downstream linking
or manufacture answers; use supported revision/recovery and fresh source approval where required.

## Explicit revision and recording

Before recording, use the continuation's resolved language and summary fields with
gate-artifact-preparation's Language and approval summary preparation. A translated summary
must be part of the draft before presentation, not deferred until a renderer failure.

A ready registered draft requires actual human editing intent; skill loading/selection is not
permission. Ordinary continuation presents its current result. Explicit canonical revision uses
gate-check intake true, intake_mode resume, run_id, expected_revision_id and sd_action revise
(CLI --sd-action revise), exclusive of UR/PRD actions and continue_delivery. Never edit an
approved design or transfer approvals. Source-intent changes use their existing revision owner.

Use gate-artifact-preparation's shared Reviewed Recording Input with the supplied run/revision:
run-step --step artefact --gate SD --evidence <recording-input.json>. Record SD-derived_from-PRD
from its exact approved source. Initial registration uses update_draft false; permitted explicit
replacement uses true with fresh mapping/input paths, preserving previous proof/history and
other protected bytes. No hand-authored receipt, run-update bypass or unknown-edit reseal.
Use supported transaction/recovery with fresh state on failure.

Redispatch gate-check after recording. Prepare its exact run-present when supplied, show returned
text verbatim and wait for a NEW deliberate Approval: SD. Changed drafts require fresh presentation;
old replies cannot approve new content. Use the existing localized summary when languages differ.
Only valid approval permits existing TP drafting; this skill creates no TP, code, QA or release.
