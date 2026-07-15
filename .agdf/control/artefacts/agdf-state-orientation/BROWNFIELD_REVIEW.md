# Brownfield Review: State Orientation Visibility (Slice A)

Status: done
Mode: post_ur_review
Date: 2026-07-15
Owner: agent

## 1. Decision

- mode_slice_decision: structured_slice
- decision: pass
- required_next_gate: PRD

## 2. Scope Reason

Three additive, non-behavioural improvements to the compact human Run Status Card
projection layer: a path-derived breadcrumb (H3), a post-acceptance transition
micro-narration (H4), and an internal-sub-state collapse applying the existing
derived-projection principle (H5). No approval authority, gate model, interaction
kind, or machine contract changes. The work touches normative spec files
(`plugin/meta/`, `plugin/skills/`), the CLI presentation layer
(`create-agdf/bin/`, `create-agdf/lib/`) and the locale registry — all excluded
from the Trivial Change Boundary, so quick_task is not eligible. No broad
architecture/policy/persistence/release impact, so structured_delivery is not
required. The slice stays intentionally small: one bounded presentation contract
extension with resolved design decisions.

## 3. Evidence

### Affected owners and current coverage

| Owner | File | H3 Breadcrumb | H4 Narration | H5 Internal-state collapse |
|---|---|---|---|---|
| Runtime Contract | `plugin/meta/agdf-runtime-contract.md` | `not_done` — no breadcrumb spec | `partially_done` — derived-projection principle exists (§Run Status Card, §Gate Transition Card); no post-acceptance narration contract | `partially_done` — derived-projection principle exists ("do not expose snake_case keys"); no explicit sub-state collapse rules |
| Gate-check skill | `plugin/skills/gate-check/SKILL.md` | `not_done` — no breadcrumb rendering | `partially_done` — one TP-specific narration example at line 69; not generalized | `not_done` — no collapse guidance |
| Locale registry | `plugin/meta/agdf-interaction-locales.json` | `not_done` — no breadcrumb keys | `partially_done` — `afterApproval` copy exists (pre-approval effect, not post-acceptance narration); no narration templates | `not_done` — no human labels for internal sub-states |
| CLI status card | `create-agdf/bin/create-agdf.js:2336` `buildStatusCard()` | `not_done` — `current_gate` and `mode_slice_decision` exist but no path indicator | `partially_done` — `postApprovalTransition()` computes next gate/allowed; not rendered as narration | `partially_done` — `mode_slice_decision` in JSON; no human collapse |
| Presentation layer | `create-agdf/lib/interaction-presentation.js` | `not_done` | `not_done` — `buildApprovalOrientationSnapshot` handles pre-approval; no post-acceptance output | `not_done` |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | propagation needed | propagation needed | propagation needed |

### Reuse strategy

| Concern | Strategy | Reuse source |
|---|---|---|
| H3 Breadcrumb | `extend` | Derive from existing `mode_slice_decision` + Approvals table + `gateTitles` locale keys; no new machine state |
| H4 Narration | `extend` | Generalize existing TP pattern (gate-check:69); reuse `postApprovalTransition()` output and `afterApproval` locale copy as seed |
| H5 Collapse | `extend` | Apply existing derived-projection principle (runtime-contract:140-147); no new principle, only explicit sub-state mapping |

### Change impact

- **Files**: `agdf-runtime-contract.md` (spec), `gate-check/SKILL.md` (guidance), `agdf-interaction-locales.json` (locale keys), `create-agdf/bin/create-agdf.js` (status card field), `create-agdf/lib/interaction-presentation.js` (presentation logic), generated surface copies.
- **Interfaces**: JSON output unchanged (machine contract stable); only human Markdown projection changes.
- **Backwards compatibility**: fully compatible — additions only.
- **Regression**: `create-agdf/scripts/control-state-test.js` and `plugin/scripts/check-runtime-integrity.mjs` need new assertions for breadcrumb, narration and collapse.

## 4. Parallel-Structure Risk

The in-progress `agdf-human-decision-surface` slice (UAT revise) touches the same
files: `agdf-runtime-contract.md`, `gate-check/SKILL.md`,
`agdf-interaction-locales.json`, `interaction-presentation.js`.

**Boundary**: `agdf-human-decision-surface` owns the **approval-time** two-card
envelope (Run Status Card + Gate Transition Card before approval), the semantic
interaction payload, the sequence preflight and option ordering. Slice A owns the
**status-time** breadcrumb, the **post-acceptance** narration and the
**internal-state collapse**. The temporal and structural boundary is clear.

**Risk**: concurrent modification of the same files could conflict, especially in
`interaction-presentation.js` and `agdf-interaction-locales.json`.

**Mitigation**: sequence the slices. `agdf-human-decision-surface` is at UAT
revise (nearly complete). Slice A should either wait for its UAT pass, or the PRD
must explicitly define non-overlapping sections in each shared file. The SD must
name the exact functions/keys each slice owns and prohibit cross-modification.

## 5. SoT / Runtime / Product-Semantics Drift

No drift. `SOT_REGISTRY.md` confirms `plugin/meta/agdf-runtime-contract.md` and
`create-agdf/bin/create-agdf.js` as active primary SoTs. No second owner or
competing spec. The `agdf-human-decision-surface` SD (section 2) declares the same
ownership table with no conflict.

## 6. Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-RUN-STATUS-CARD` (CONTEXT_GRAPH.md:15)
- context_graph_reconciliation: open_gap (to be resolved at OR closeout when the
  node is updated with breadcrumb, narration and collapse scope)
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-RUN-STATUS-CARD` already covers "compact human/agent
  status projection"; Slice A extends it with path visibility, transition
  narration and internal-state projection. No new node needed.

## 7. Missing Evidence

- No live CLI rendering evidence yet (expected at CD+Tests).
- No regression-test coverage for the three additions yet (expected at TP/CD+Tests).
- `agdf-human-decision-surface` UAT pass not yet recorded; sequencing risk remains
  open until it completes or the SD defines non-overlapping file sections.

## 8. Risks

- **Sequencing risk**: concurrent modification of `interaction-presentation.js` and
  `agdf-interaction-locales.json` with `agdf-human-decision-surface`. Mitigated by
  sequencing or explicit section ownership in SD.
- **Breadcrumb path derivation**: the verified_change path has no PRD/SD/TP; the
  breadcrumb must derive from Mode/Slice Decision + Approvals table, not a fixed
  template. The derivation logic lives in `buildStatusCard()` and must be tested
  for all four path types.
- **Narration non-overlap**: the post-acceptance narration must not duplicate the
  Gate Transition Card. The SD must define the temporal and structural separation
  rule (pre-approval vs. post-acceptance, different templates, never same message).
- **Locale budget**: new breadcrumb and narration keys must stay within the
  `lengthBudgets` declared in `agdf-interaction-locales.json`.

## 9. Required Next Step

Record the Mode/Slice Decision (`structured_slice`) in the selected
`RUN_STATE.md`, then draft the compact PRD at the smallest justified depth.
