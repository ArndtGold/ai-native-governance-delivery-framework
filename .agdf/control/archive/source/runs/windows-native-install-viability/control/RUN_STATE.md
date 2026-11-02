# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: windows-native-install-viability
- lifecycle: completed
- revision: 3
- revision_id: d054eeed-6236-4f73-a307-8b8018f9b173
- mode: verified_change
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make `npm run install:<surface>` and its test chain complete on native Windows without symlink privilege by probe-gating the symlink negative fixture and adding a bounded Windows-only `EPERM` retry to owned-root directory swaps.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Two independent blockers reproduced on 2026-08-26: deterministic symlink-fixture `EPERM` in `public-plugin-test.js:161` (host lacks `SeCreateSymbolicLinkPrivilege`) and transient rename `EPERM` in `builder.js:71` / `local-marketplace.js:349`. Both are independent of the completed fresh-checkout load-order fix. |
| What is approved? | UR is approved by exact user approval on 2026-08-26. Verified Change requires no further user gate. |
| What is missing? | Nothing within scope. Two out-of-scope findings are recorded in `VERIFIED_CHANGE.md`: the provenance migration gap (owned by run `agdf-cross-host-runtime-integrity`, QA-relevant) and the non-portable darwin-path assertions in `local-marketplace-test.js`. |
| What is the next allowed action? | Use delivery closeout only when the user explicitly requests a commit, push or pull-request handoff. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, release, publication or deployment. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided by the user on 2026-08-26 for revision 1 (`d054eeed-6236-4f73-a307-8b8018f9b173`) via native gate question and revalidated before persistence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/windows-native-install-viability/UR.md` | approved | Symlink-privilege blocker and transient rename locks with bounded fix scope. |
| Brownfield Review | `.agdf/control/artefacts/windows-native-install-viability/BROWNFIELD_REVIEW.md` | done | Extend strategy with one shared retry owner; `verified_change` selected with scope reason and evidence. |
| Verified Change | `.agdf/control/artefacts/windows-native-install-viability/VERIFIED_CHANGE.md` | pass | Five-file change, 3/3 test passes, retry assertions, complete end-to-end install and two disclosed out-of-scope findings. |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: `bounded_portability_fix`; one shared helper plus mechanical call-site substitution in two owners and one probe-gated fixture, no interface or product-semantics change, locally reversible and independently verifiable on this host.
- evidence: `.agdf/control/artefacts/windows-native-install-viability/BROWNFIELD_REVIEW.md`; direct EPERM reproductions and privilege probe of 2026-08-26.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | defines | native-Windows install-chain viability scope | `.agdf/control/artefacts/windows-native-install-viability/UR.md` |
| UR | approved_by | `Approval: UR` | User input on 2026-08-26 after revalidation of revision 1. |
| UR | follows_finding_of | run `install-scripts-fresh-checkout-fix` | Both blockers were disclosed there as out-of-scope pre-existing findings. |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/windows-native-install-viability/BROWNFIELD_REVIEW.md` |
| Verified Change | implements_and_verifies | UR | `.agdf/control/artefacts/windows-native-install-viability/VERIFIED_CHANGE.md`; on-host probe, test and end-to-end install evidence of 2026-08-26. |
| Verified Change | surfaces_finding_for | run `agdf-cross-host-runtime-integrity` | Provenance migration gap reproduced on a real host; contradicts that run's QA-pass claim for real-host migration. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Deterministic symlink `EPERM` at fixture creation | `public-plugin-test.js:161`, three consecutive failing runs 2026-08-26 | Blocking failure mode | direct |
| Missing symlink privilege | `AllowDevelopmentWithoutDevLicense` unset; `whoami /priv` lacks `SeCreateSymbolicLinkPrivilege` | Host capability | direct |
| Transient rename `EPERM` in repo workspace | User terminal output 2026-08-26, `builder.js:71` | Lock-based flakiness beyond `%TEMP%` | direct |
| Transient rename `EPERM` in `%TEMP%` | `local-marketplace.js:349` via `local-development-install-test.js:63`, 2026-08-26 | Lock-based flakiness in fixture staging | direct |
| Same failure without unrelated changes | `git stash` A/B run 2026-08-26 | Pre-existing nature | direct |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Windows lock-tolerance boundary for owned-root swaps and capability-gated negative fixtures recorded on `CG-CREATE-AGDF-CLI-COMPOSITION`.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Windows lock tolerance and capability-gated negative fixtures are reusable boundaries for all owned-root swaps and privilege-dependent tests.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- next_allowed_action: Use `delivery-closeout` only if the user explicitly requests a commit, push or pull-request handoff.
- quality_outlook: Route the provenance migration gap into the `agdf-cross-host-runtime-integrity` QA decision before any `Approval: QA` there; make `local-marketplace-test.js` platform-portable so the retry assertions run on Windows; verify the restarted Claude Code host actually loads `0.13.5+codex.local-16d77782b406`.
