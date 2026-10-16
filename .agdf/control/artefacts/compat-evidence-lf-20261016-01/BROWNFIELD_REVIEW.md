# Brownfield Review: Record host-compatibility evidence from LF source bytes

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: compat-evidence-lf-20261016-01
- related_ur: .agdf/control/artefacts/compat-evidence-lf-20261016-01/UR.md
- current_gate: UR (recorded while the UR card is ready)
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-16

## Objective

Route the re-recording of host-compatibility evidence from LF working-copy bytes so that CI's
`compatibility-freshness` stage passes.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Only recorded evidence files change; no user-facing capability, state or recovery behaviour changes.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none touched | evidence regeneration only | none |
| Source of truth | host-compatibility recorder | `scripts/host-compatibility/run.mjs` `sourceSnapshot` hashes working-copy bytes (`readFileSync`) | low |
| Runtime path | none touched | generated payloads contain no CR bytes; payload digests unaffected | none |
| UI / UX | none | — | none |
| Persistence / data | recorded evidence | `docs/compatibility/evidence/snapshot.json` holds `35eb6d2a…` (CRLF) for `packages/cli/lib/installers/packaged-app-marketplace.js`; LF blob is `c0d138a0…`; 237 of 238 entries match LF blobs at `93adf9ca` and `HEAD` | low |
| Tests / QA | CI stage `compatibility-freshness` | run 38859307536, job `verify (ubuntu-latest)`: `source_snapshot_changed` | low |
| Release / operations | `.gitattributes` `* text=auto eol=lf` | `git ls-files --eol`: `i/lf w/crlf` for the file | low |

## Architecture Impact

- architecture_relevance: architecture-not-applicable
- architecture_impact: none
- architecture_reason: The existing recorder is re-run on corrected working-copy bytes; no module, interface, data, compatibility, runtime or policy boundary changes.
- architecture_evidence: `scripts/host-compatibility/run.mjs`, `docs/compatibility/evidence/snapshot.json`.
- architecture_missing_evidence: none
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| unresolved: recorder hashes working-copy bytes, so any CRLF working copy on Windows yields evidence CI rejects | `scripts/host-compatibility/run.mjs:118` | warn | Out of scope here; propose a follow-up to hash Git-normalized content or refuse CRLF sources at record time. |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Evidence regeneration with the existing recorder after normalizing one working copy to its committed LF bytes; no product code, contract, architecture, policy or persistence change. Code Review remains mandatory.
- evidence: .agdf/control/artefacts/compat-evidence-lf-20261016-01/BROWNFIELD_REVIEW.md
- transparency_note: PRD, SD and TP are skipped because the approved UR fully defines the change; CD+Tests evidence, CR and OR-lite still apply.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: not_applicable
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none
- rejected_alternative: structured_slice, because no product or design decision is open.
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | not_applicable | compact path selected |
| authority_boundary | not_applicable | compact path selected |
| owner_consumer_coordination | not_applicable | compact path selected |
| full_depth_impacts_absent | not_applicable | compact path selected |
| migration_propagation_bounded | not_applicable | compact path selected |
| failure_recovery_local | not_applicable | compact path selected |
| independently_acceptable | not_applicable | compact path selected |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | warn |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: evidence regeneration only.

## Next Permissible Step

- next_allowed_action: After `Approval: UR`, normalize the working copy, re-record and check evidence, verify CI equivalence against LF blobs, then mandatory CR and OR-lite.
- forbidden_until_then: changing tracked evidence before `Approval: UR`.

## Quality Outlook

- quality_outlook: Deterministic and verifiable before push by comparing every recorded hash with its committed LF blob; recurrence stays possible until the recorder is hardened.
