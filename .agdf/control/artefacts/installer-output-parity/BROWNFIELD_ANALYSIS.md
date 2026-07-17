# Brownfield Analysis: Coherent AGDF Installation Lifecycle

Status: done; revision 4
Mode: pre_implementation_analysis
Decision: pass
Revision: 4
Date: 2026-07-17
Based on: approved `TP.md` revision 4 and current repository evidence

## Revision 4 Pre-Implementation Analysis

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: none
- scope: MSC-01 through MSC-08 only; canonical surface propagation, additive lifecycle result,
  English renderer, verbose diagnostics, existing installer/scaffold integration and focused tests.
- evidence: `lifecycle/result.js`, `lifecycle/presentation.js`, `cli/parse-args.js`,
  `cli/application.js`, `installers/plugin-installers.js`, `scaffold/presentation.js`,
  `lifecycle-test.js` and `cli-modularization-test.js` are existing extension owners.
- current_coverage: surface validation, English rendering, additive activation/delivery projections,
  captured native success output and verbose routing are not done; the existing result, renderer,
  parser, installer and scaffold boundaries are suitable for extension.
- reuse_strategy: extend those owners in place; preserve `lifecycle/status.js` as the delivery
  composition authority and `agdf-interaction-locales.json` for chat/approval only.
- parallel_structure_risk: low if presentation remains one module; high if installer-specific cards,
  a second surface registry or a new locale layer are added.
- risks: Capturing plugin output must preserve exit/phase behavior; repository setup has different
  surface evidence; a pending restart must never be mapped to delivery. All are covered by the
  existing isolated-fixture owners.
- context_graph_impact: update_existing_node
- required_next_step: execute MSC-01 through MSC-08 through the existing-owner implementation path.

### Revision 3 Finding Resolved

The TP names `node create-agdf/scripts/cli-test.js`, but this file does not exist. The current focused
CLI regression owner is `node create-agdf/scripts/cli-modularization-test.js`. This is a plan-evidence
defect, not a product or design change. TP revision 4 now names
`node create-agdf/scripts/cli-modularization-test.js` and received renewed exact approval on
2026-07-17. The implementation path passes without a parallel-structure or ownership finding.

## Revision 2 Baseline

## Scope

Verify the approved implementation path for IOP-01 through IOP-13 before CD+Tests, with specific
attention to existing CLI/installer owners, destructive-operation safety, generated assets and
overlap with active interaction and state-orientation runs.

## Evidence

- `create-agdf/lib/cli/command-registry.js`, `parse-args.js` and `application.js` are the established
  command discovery, parsing and handler owners.
- `create-agdf/lib/installers/plugin-installers.js` and `opencode.js` already own host-native install,
  version verification, OpenCode ownership markers and the richest current status projection.
- `create-agdf/lib/scaffold/plan.js`, `write.js` and `presentation.js` own collision-safe repository
  writes and `codex-repo` completion guidance.
- `create-agdf/lib/control-evaluation/doctor.js` and `gate-check.js` are the existing delivery
  authorities and must only be composed by general status.
- `create-agdf/scripts/cli-modularization-test.js`, `interaction-presentation-test.js`, package smoke,
  runtime-integrity and release-bootstrap tests provide the correct extension points.
- `agdf-human-decision-surface` is active at UAT `revise` and explicitly owns canonical value
  transport, decorated-label rejection, native attempt evidence and fallback sequencing.
- `agdf-state-orientation` already owns status-time breadcrumb, post-acceptance narration and
  internal-state projection and is in closeout.
- `plugin/meta/agdf-plugin.definition.json` still declares Codex `exact_option_value`, while the
  currently loaded Codex question schema decorates the required recommended option and exposes no
  separate canonical value. This is current runtime/metadata drift, not an installer-owned policy.

## Current Coverage

| Area | Coverage | Strategy |
|---|---|---|
| Lifecycle result and shared Success Card | not_done | new module behind existing CLI composition root |
| Codex/Claude install verification | partially_done | refactor existing adapters to return evidence |
| OpenCode install/status and ownership | partially_done | extend existing probes and markers |
| General installation/repository/delivery status | partially_done | compose existing probes plus doctor/gate-check |
| Repository disable and global uninstall | not_done | new operations over existing ownership/native adapters |
| `codex-repo` verification | partially_done | extend scaffold plan/write/presentation owners |
| Read-only request orientation | partially_done | consume existing status/interaction projection; add only a non-overlapping request-classification branch |
| Native approval capability truth | fully owned elsewhere, live UAT unresolved | dependency on `agdf-human-decision-surface`; do not reimplement |
| Documentation hierarchy | partially_done | revise the three existing docs owners only |

## Reuse Strategy

- Extend the existing command registry, parser and application rather than replacing the CLI.
- Add one lifecycle result/presentation layer; keep surface operations in current installer/scaffold
  owners and delivery decisions in current evaluators.
- Reuse OpenCode marker proof and scaffold collision checks as the ownership model; do not invent an
  independent deletion registry.
- Consume the canonical interaction preflight and the durable UAT outcome from
  `agdf-human-decision-surface`. This run may document the current capability-dependent fallback and
  test integration, but must not modify approval transport metadata, authority or fallback policy.
- Add the read-only orientation only after exact section-level revalidation against the completed
  state-orientation changes; no second status-card or narration composer is permitted.

## Impact And Compatibility

- Public CLI gains additive commands and flags; existing command names, schemas and exit-code owners
  remain compatible.
- No persistent data migration is needed.
- Disable/uninstall are high-risk mutation paths and require preview, ownership proof and isolated
  fixture tests before any real-host UAT.
- Generated plugin/package assets must be synced from canonical sources once, after source changes.
- Documentation must describe verified surface differences instead of implying cross-host parity.

## Parallel-Structure And Drift Findings

1. **Resolved plan conflict:** TP revision 2 converts IOP-10 to dependency/integration work and
   explicitly prohibits changes to approval capability metadata and fallback authority. The
   `agdf-human-decision-surface` run remains the sole owner and its UAT remains `revise`.
2. **Sequencing constraint:** read-only request orientation shares the gate-check/runtime presentation
   surface with `agdf-state-orientation`; implementation must be additive and section-scoped after
   revalidation, not a new status owner.
3. **Current drift:** static Codex exact-value metadata conflicts with the observed loaded tool. The
   safe runtime behavior is exact text, but repository correction and live proof belong to the human
   decision run. This installer run must expose the dependency honestly and cannot close AC-05/06 by
   repository projection alone.

## Risks

- Destructive lifecycle commands could remove user-owned configuration without marker/native proof.
- General status could become a second gate evaluator if it derives delivery policy itself.
- Installer success could overstate activation when restart or `/plugins` remains host-owned.
- Concurrent interaction edits could invalidate both runs' UAT evidence.
- Aggregate smoke tests may touch generated files; unrelated worktree changes must remain isolated.

## Context Graph

- context_graph_impact: update
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-RUN-STATUS-CARD`,
  `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: implementation_pending
- context_graph_gate_effect: warning while revised TP approval is pending
- required_action: update existing nodes only after implementation evidence exists; do not create a
  second interaction node

## Decision And Next Step

- mode_slice_decision: structured_delivery
- required_next_gate: none
- decision: pass
- missing_evidence: implementation and test evidence; fresh host-visible UAT remains a linked
  downstream dependency rather than implementation permission
- required_next_step: execute CD+Tests for approved TP revision 2, starting with the shared lifecycle
  result contract and isolated fixtures
- transparency: The revised plan preserves the existing interaction owner, scopes read-only
  orientation additively and leaves a clean implementation path for the installer lifecycle.
