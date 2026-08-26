# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: install-scripts-fresh-checkout-fix
- lifecycle: completed
- revision: 3
- revision_id: 571d9264-f843-4211-90e6-7694e59b6ee9
- mode: verified_change
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make `npm run install:<surface>` work on a fresh checkout by deferring generated-file-dependent module loading in the local install script until after its own `release:prepare` step has produced `create-agdf/generated/`.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The load-order fix is implemented and verified: the installer loads without `generated/`, runs its own `release:prepare` and the original `ENOENT` is gone. Full native-Windows suite evidence is blocked by two pre-existing host issues (symlink `EPERM` in `test:public-plugin`, transient rename `EPERM` in `%TEMP%`), A/B-verified as independent of this change. |
| What is approved? | UR is approved by exact user approval on 2026-08-26. Verified Change requires no further user gate. |
| What is missing? | Nothing within scope; non-Windows/CI full-suite evidence and the two Windows follow-ups are disclosed separately. |
| What is the next allowed action? | Use delivery closeout only when the user explicitly requests a commit, push or pull-request handoff. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, release, publication or deployment. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided by the user on 2026-08-26 for revision 1 (`571d9264-f843-4211-90e6-7694e59b6ee9`) via native gate question and revalidated before persistence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/UR.md` | approved | Fresh-checkout install crash, load-order root cause and bounded fix scope. |
| Brownfield Review | `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/BROWNFIELD_REVIEW.md` | done | Single-owner load-order refactor path; `verified_change` selected with scope reason and evidence. |
| Verified Change | `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/VERIFIED_CHANGE.md` | pass | Fix, regression test, probe evidence, end-to-end boundary shift and disclosed native-Windows limitation. |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: `bounded_regression_fix`; one file's load order plus one focused regression test, no product-semantics or interface change, single retained owner, locally reversible and independently verifiable; Quick Task cannot carry the required regression evidence and PRD/SD/TP depth has no trigger.
- evidence: `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/BROWNFIELD_REVIEW.md`; direct ENOENT reproduction 2026-08-26; import-chain analysis of `install-local-plugin.js`, `application.js`, `local-marketplace.js`, `runtime-context.js`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | defines | fresh-checkout local install fix scope | `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/UR.md` |
| UR | approved_by | `Approval: UR` | User input on 2026-08-26 after revalidation of revision 1. |
| UR | fixes_regression_in | run `agdf-local-plugin-install-scripts` | Delivered installer crashes on fresh checkouts; prior QA/UAT ran with `generated/` present. |
| Verified Change | implements_and_verifies | UR | `.agdf/control/artefacts/install-scripts-fresh-checkout-fix/VERIFIED_CHANGE.md`; probe, negative control and end-to-end evidence of 2026-08-26. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Direct ENOENT reproduction of `npm run install:claude` on a checkout without `create-agdf/generated/` | User terminal output, 2026-08-26 | Failure mode and stack trace through `runtime-context.js:18` | direct |
| Eager top-level imports in the installer script | `create-agdf/scripts/install-local-plugin.js` lines 7-8 | Root-cause load order | direct |
| Eager `readFileSync` of the generated definition at module evaluation | `create-agdf/lib/cli/runtime-context.js` line 18 | Root-cause read site | direct |
| `create-agdf/generated*/` is gitignored | `.gitignore` line 29 | Why fresh checkouts lack the file | direct |
| `sync-package-assets.js` reads only from `plugin/meta/` sources | `create-agdf/scripts/sync-package-assets.js` | Standalone viability of the preparation step | direct |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Load-order boundary recorded: installer entry points must not eagerly import generated-definition consumers before their own preparation step.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The load-order boundary between preparation and generated-metadata consumers is reusable for any future entry-point script.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- next_allowed_action: Use `delivery-closeout` only if the user explicitly requests a commit, push or pull-request handoff.
- quality_outlook: Run the full installer suite once on a non-Windows or CI host to convert the disclosed limitation into green evidence; address the two pre-existing native-Windows blockers (symlink negative fixture, transient rename `EPERM`) in separately approved follow-ups.
