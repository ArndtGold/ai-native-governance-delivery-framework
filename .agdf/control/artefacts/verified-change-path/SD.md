# Solution Design: Fail-Closed Verified Change Path

## Design Decision

Add `verified_change` as a fifth canonical Mode/Slice Decision value. It is an internal compact lifecycle, not a new user gate:

```text
Approval: UR
  -> Brownfield Review
  -> Mode/Slice Decision: verified_change
  -> VERIFIED_CHANGE.md eligibility record
  -> bounded implementation + deterministic checks
  -> VERIFIED_CHANGE.md mini-closeout
```

The normal structured transition remains the only fallback. Any validation failure, missing required field, failed check, disallowed impact, ambiguous ownership or unsafe worktree baseline blocks Verified Change execution and routes the work to the Brownfield-selected `structured_slice` or `structured_delivery` escalation target.

## Single Owners

| Concern | Canonical owner | Derived / enforcing surfaces |
|---|---|---|
| Lifecycle, eligibility and transition semantics | `plugin/meta/agdf-runtime-contract.md` | Router, templates and generated runtime-contract copies reference or copy it. |
| Compact record schema | `plugin/control/templates/artefacts/VERIFIED_CHANGE.md` | Generated control templates and installed package copies. |
| Parse, transition and deterministic validation | `create-agdf/bin/create-agdf.js` | `doctor` and `gate-check` expose the same decision; no separate validation CLI is added. |
| Guidance | `plugin/meta/agdf-agent-router.md`, relevant skills | Must reference the Runtime Contract rather than duplicate its full transition table. |
| Regression proof | `create-agdf/scripts/control-state-test.js` and focused CLI fixtures | Package smoke runs these existing tests. |

## Compact Record Schema

`VERIFIED_CHANGE.md` is the single durable record for eligibility, execution and mini-closeout. Its fixed front matter fields are intentionally parseable with the existing Markdown-field approach:

```text
- status: draft | eligible | executed | escalated
- related_ur:
- escalation_target: structured_slice | structured_delivery
- canonical_owner:
- allowed_source_paths:
- allowed_derived_paths: none | <paths>
- prohibited_impacts: none
- propagation_command: none | <command>
- validation_commands:
- baseline_tracked_paths:
- baseline_untracked_paths:
```

It contains four bounded tables/sections:

1. **Eligibility assertions**: one row for each required condition and direct evidence.
2. **Baseline**: tracked and untracked dirty paths captured before the record becomes `eligible`.
3. **Execution evidence**: actual changed paths within the declared scope, propagation result and each command outcome.
4. **Mini-closeout**: delivered work, intentionally not delivered work, escalation result, residual risk and next step.

The exact template constrains vocabulary. Free-form prose may explain evidence but cannot substitute a missing field or required assertion.

## Eligibility And Baseline Validation

`doctor` and `gate-check` share one evaluator in `create-agdf/bin/create-agdf.js` that reads the record linked from the selected run state. It returns structured findings and a boolean `verified_change_eligible`/`verified_change_executed` result.

Eligibility requires all of the following:

1. Mode/Slice Decision is `verified_change` with scope reason and Brownfield evidence.
2. The record exists, has `status: eligible` or `executed`, names exactly one canonical owner, and names a structured escalation target.
3. Source paths are non-empty, normalized repository-relative paths; derived paths are either `none` or similarly bounded paths.
4. `prohibited_impacts` is exactly `none`; separate assertions explicitly state no gate, permission, security, persistence, architecture, external API, CLI or release behavior change.
5. A deterministic validation command is present; a propagation command is mandatory whenever derived paths are declared.
6. The initial baseline lists tracked (`git diff HEAD --name-only`) and untracked (`git ls-files --others --exclude-standard`) paths. A declared source or derived path may not already be dirty at baseline; otherwise ownership of the candidate diff is ambiguous and execution is blocked.
7. At execution closeout, newly dirty paths relative to the baseline must be a subset of declared source/derived paths plus the record itself and its permitted compact control pointer. Pre-existing unrelated dirty paths remain baseline entries and do not invalidate the candidate.
8. Recorded validation commands must have `pass` evidence before `executed` is accepted.

This baseline design prevents an already-dirty candidate file from being silently adopted, while preserving worktree isolation when unrelated files were already dirty before the record was created.

## Transition Integration

Extend the canonical transition model and `transitionDecisionForRunState`:

| State | Current step | Allowed | Forbidden |
|---|---|---|---|
| Mode/Slice Decision is `verified_change`, record missing/draft | `Verified Change Execution` | Create compact record, capture baseline, prove eligibility, run `doctor`/`gate-check` | Implement candidate change, claim validation or closeout |
| Valid record is `eligible` | `Verified Change Execution` | Implement declared paths, run declared propagation/validation commands, record evidence | Touch unlisted paths, expand impacts, claim full QA/UAT/release |
| Valid record is `executed` | `OR` | Use compact record mini-closeout and offer delivery closeout | PRD/SD/TP/QA/UAT by ritual; release without explicit delivery authority |
| Record invalid or disallowed | `Verified Change Execution` | Mark record `escalated`, retain reason, continue at declared structured target | Implement using Verified Change |

The new step is added to the internal artefact vocabulary and next-skill map. Existing `quick_task`, structured modes and legacy records retain their current transitions.

## Template, Guidance And Propagation

- Add `VERIFIED_CHANGE.md` to canonical control templates and package/control-file manifests so it propagates through the existing sync script.
- Add `verified_change` to canonical mode enumerations in Runtime Contract, run/Brownfield templates and parser validation.
- Update agent router and gate-check guidance to select this mode only after approved UR and Brownfield evidence; they reference the canonical eligibility rules rather than replicate them.
- Update runtime-integrity assertions only for stable canonical strings and required template presence; do not turn prose wording into a duplicate policy engine.
- Regenerate all package/surface copies using `sync-package-assets.js`.

## Escalation Semantics

The record’s `escalation_target` is chosen during Brownfield Review and cannot be changed by execution logic. A failed eligibility check emits a `revise` finding with a concrete reason and directs the user/agent to that structured target. It does not erase the record or reuse its baseline as implementation permission.

## Compatibility And Safety

- Existing records with no `verified_change` parse unchanged.
- No new public CLI command is introduced; `doctor --json` and `gate-check --json` expose the path.
- `verified_change` never bypasses UR or Brownfield Review and never permits security, permission, persistence, architecture, external API, CLI, gate or release behavior changes.
- The compact record is an audit artefact, not a substitute for an undisclosed structured product decision.
- Context Graph node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` is updated only after the implemented contract and tests prove the new boundary.

## Test Design

1. Parser recognises `verified_change` and preserves all legacy mode values.
2. Valid fixture transitions draft → eligible → executed and emits the correct allowed/forbidden lists.
3. Missing owner, multi-owner, invalid path, missing validation command, missing propagation with derived paths, prohibited impact, dirty declared baseline path and failed command evidence all fail closed.
4. Baseline fixture proves unrelated pre-existing dirty files do not invalidate a bounded candidate, while newly introduced unlisted paths do.
5. Invalid record directs exactly to its declared structured escalation target.
6. Existing quick-task and structured transition fixtures retain their expected outputs.
7. Runtime integrity, control-state tests, package smoke, doctor and generated-surface sync pass.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_ref: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- required_action: update the node after implementation with the final verified eligibility contract, baseline rule and worked example.
- gate_effect: none before implementation; unresolved update blocks clean closeout after implementation.

## Approval

- status: approved
- approval: `Approval: SD`
- approval date: 2026-07-14

## Decision Required

Approve the implementation and test plan: `Approval: TP`.
