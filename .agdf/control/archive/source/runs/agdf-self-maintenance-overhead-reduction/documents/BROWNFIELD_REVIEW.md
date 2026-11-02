# Brownfield Review: Reduce AGDF's Own Framework-Maintenance Overhead

Mode: post_ur_review
Status: done
Date: 2026-07-13
Based on: approved UR

## 1. Decision

`pass`. Existing owners are understood well enough to size this work; two of the UR's four candidate
outcomes turn out to already exist, which materially narrows the remaining scope.

## 2. Mode/Slice Decision

`structured_slice`. Not `quick_task`: both remaining real gaps touch normative paths explicitly excluded
from the existing Trivial Change Boundary (`plugin/control/templates/**` and `plugin/meta/**`) — so the
Trivial Change Boundary's own rules require full ceremony for this fix, which is a load-bearing finding in
its own right (see section 6). Not a full new `structured_delivery` from scratch: two of the four
candidate outcomes are already implemented, so PRD/SD/TP depth only needs to cover the narrow remaining
scope, not the original UR's full four-point ambition.

## 3. Per-Candidate Current Coverage

| Candidate (from UR) | Current coverage | Evidence |
|---|---|---|
| 1. Automated drift checks prevent manifest issues before they reach the backlog | `partially_done` | `plugin/scripts/check-runtime-integrity.mjs` already contains extensive hardcoded field-by-field checks comparing `agdf-plugin.definition.json` against the concrete Codex/Claude/package manifests (name, version, description, homepage, repository, license, skill prefixes, etc.), and this already runs in CI (`agdf-guardrails.yml` "Verify runtime integrity" step, before every PR/push). The historical `plugin-manifest-drift-5292f62` incident was a real gap in *field coverage* at the time, not an absent mechanism. Remaining gap: no process ensures new manifest fields automatically get a corresponding integrity assertion when they are added — this is a discipline gap, not a missing tool. |
| 2. Non-canonical surfaces (Copilot/OpenCode/generated Codex copies) generated from canonical definition instead of manually maintained | `fully_done` | `create-agdf/scripts/sync-package-assets.js` already generates all surface copies from `plugin/meta/agdf-plugin.definition.json` and `plugin/` as the single source, and this already runs in CI (`agdf-guardrails.yml` "Sync generated package assets" step). The UR's premise that these are "manually maintained per fix" was incorrect — no new work is needed here. |
| 3. `MASTER_BACKLOG.md` scope field distinguishing framework-maintenance vs external-delivery | `not_done` | No such field or vocabulary exists today. Confirmed via `plugin/control/templates/MASTER_BACKLOG.md` Rules section and `create-agdf/bin/create-agdf.js`'s `backlogStatusLabels`/`backlogArtefactLabels` vocabulary enforcement (checked via `doctor` findings `AGDF_BACKLOG_STATUS_UNKNOWN`/`AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN`). |
| 4. Trivial Change Boundary reassessed for narrow, root-cause-clear code fixes | `not_done` | Open question, not yet decided. Today's own two fixes (Windows `fsync` guard, CLI ambiguity crash) both touched executable code and so both correctly stayed excluded from the existing boundary — confirming the boundary behaved exactly as designed, but leaving open whether a narrower, safely-scoped extension is possible. |

## 4. Reuse Strategy

- Candidate 3: `extend`. Reuse the existing canonical-vocabulary enforcement pattern
  (`backlogStatusLabels`/`backlogArtefactLabels` + corresponding `doctor` finding codes) by adding a third
  vocabulary (e.g. `backlogScopeLabels`: `framework-maintenance` | `external-delivery`) and a matching
  finding code (e.g. `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN`), rather than inventing a free-text or
  parallel-mechanism field. This is the same architecture already proven for status/artefact labels.
- Candidate 4: `extend`, conditionally. Any change must stay an explicit, fail-closed allow-list addition
  to the existing boundary in `plugin/meta/agdf-runtime-contract.md`, consistent with why the original
  boundary was built as a path-list rather than a prose judgment call. No new parallel boundary mechanism.

## 5. Change Impact

- Candidate 3 touches: `plugin/control/templates/MASTER_BACKLOG.md` (Rules section), `create-agdf/bin/create-agdf.js` (vocabulary constant + a new `doctor` finding), and this repository's own live `.agdf/control/MASTER_BACKLOG.md` (to adopt the new field). Backwards compatible: existing rows without a `scope` value should not retroactively fail `doctor` — needs an explicit decision (warn vs. block) at PRD stage.
- Candidate 4 touches: `plugin/meta/agdf-runtime-contract.md` (Non-Normative Trivial Change Boundary subsection) and `.agdf/control/CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` (update, not replace). No CLI/code change implied unless the criteria become mechanically checkable.
- No data model, migration, or backwards-incompatible change in either candidate.

## 6. Parallel-Structure And Drift Risk

- No parallel structure risk identified for candidate 3 if it reuses the existing vocabulary-enforcement
  pattern as designed above.
- A real, load-bearing irony surfaced: the Trivial Change Boundary's own rules currently require full
  Structured Delivery ceremony to change *anything* about the boundary itself, or to add a backlog scope
  field to the canonical template — both are explicitly-listed normative paths. This is not a bug; it is
  the boundary working as designed (fail closed on its own normative surface). It does mean this UR's own
  delivery cannot itself be a "quick fix," which is worth stating plainly rather than glossing over.
- Widening candidate 4 risks reopening the scope-creep-loophole risk explicitly rejected during the
  original boundary's Brownfield Review/PRD (a prose "use your judgment" criterion was rejected in favor
  of an explicit path allow-list). Any PRD-stage proposal must preserve that same explicit,
  fail-closed-by-default character — e.g. an allow-list of concrete, mechanically-verifiable conditions
  (single function/module changed, an accompanying regression test added, no PRD/SD/TP artefact touched,
  no product-facing behavior change) rather than an "obviously small" judgment call.

## 7. SoT / Runtime / Product-Semantics Drift

None identified. This work does not change gate order, approval semantics, or product-facing AGDF
behavior — it changes internal governance tooling and one internal rule's scope.

## 8. Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: not_applicable
- context_graph_required_action: Revisit at PRD/QA stage once candidate 4's concrete criteria (if any) are
  decided; no new node created here per Brownfield Review's own rule against automatic node creation.
- context_graph_gate_effect: none

## Required Next Step

Draft a focused PRD covering exactly the two remaining candidates (backlog scope-visibility field; a
concrete, evidence-based decision on whether/how to extend the Trivial Change Boundary), explicitly
retiring or noting as already-delivered the two candidates the codebase already implements. Request
`Approval: PRD`.
