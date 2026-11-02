# Brownfield Review: Gate-Rationale-Registry and On-Demand "Why?" (Slice B)

Status: done
Mode: post_ur_review
Date: 2026-07-16
Owner: agent

## 1. Decision

- mode_slice_decision: structured_slice
- decision: pass
- required_next_gate: PRD

## 2. Scope Reason

Two additive improvements to the interaction surface: a curated Gate-Rationale-Registry
(one-liner per gate/step in the locale registry, H6) and an on-demand "Why?" interaction
(status kind, deterministic, non-authorizing, H7). No change to approval authority, gate
logic, interaction kinds, or the machine contract. The work touches normative spec files
(`plugin/meta/`, `plugin/skills/`), the CLI presentation library
(`create-agdf/lib/`) and the test suite (`create-agdf/scripts/`) — all excluded from the
Trivial Change Boundary, so `quick_task` is not eligible. No broad
architecture/policy/persistence/release impact, so `structured_delivery` is not required.
The slice stays intentionally small: one additive locale section, one additive runtime
contract clause, one additive skill guidance block and their tests.

## 3. Evidence

### Affected owners and current coverage

| Owner | File | H6 Gate-Rationale-Registry | H7 On-Demand "Why?" |
|---|---|---|---|
| Locale registry | `plugin/meta/agdf-interaction-locales.json` | `not_done` — no `gateRationale` section | `not_done` — no rationale retrieval or fulfilled/protects strings |
| Runtime Contract | `plugin/meta/agdf-runtime-contract.md` | `not_done` — no rationale registry contract | `not_done` — no on-demand "Why?" interaction contract |
| Gate-check skill | `plugin/skills/gate-check/SKILL.md` | `not_done` — no rationale retrieval guidance | `not_done` — no "Why?" response guidance |
| Presentation library | `create-agdf/lib/interaction-presentation.js` | `not_done` — no `gateRationale` validation or retrieval function | `not_done` — no rationale retrieval helper |
| Test suite | `create-agdf/scripts/interaction-presentation-test.js` | `not_done` — no rationale regression tests | `not_done` — no "Why?" retrieval tests |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | propagation needed (locale registry is copied verbatim) | propagation needed (runtime contract is copied verbatim) |

### Reuse strategy

| Concern | Strategy | Reuse source |
|---|---|---|
| H6 Rationale content | `extend` | Add `gateRationale` section to existing locale registry; reuse existing `gateTitles` key set as the canonical key list; `validateLocaleRegistry` enforces parity via existing `flattenKeys` baseline comparison |
| H6 Budget enforcement | `extend` | Existing `lengthBudgets.description` (160 chars) and the budget check in `validateLocaleRegistry` (lines 66–70) apply automatically to new description-category keys |
| H7 "Why?" interaction | `extend` | Use existing `status`/`clarification` interaction kind from the Native Interaction Contract; no new kind; reuse existing `localePack` retrieval for deterministic rationale access |
| H7 Agent guidance | `extend` | Add guidance block to `gate-check/SKILL.md` following the existing pattern for status interactions (non-authorizing, no approval controls) |

### Change impact

- **Files**: `agdf-interaction-locales.json` (new `gateRationale` section + `why` interaction labels), `agdf-runtime-contract.md` (rationale registry contract + "Why?" interaction clause), `gate-check/SKILL.md` ("Why?" response guidance), `interaction-presentation.js` (rationale validation + retrieval function), `interaction-presentation-test.js` (regression tests), generated surface copies (propagation via `sync-package-assets.js`).
- **Interfaces**: JSON output unchanged (machine contract stable); no new CLI fields; rationale is agent-retrieved, not CLI-emitted by default.
- **Backwards compatibility**: fully compatible — additions only. Existing locale validation (`validateLocaleRegistry`) will require `gateRationale` in all packs once added, which is the intended enforcement.
- **Regression**: `interaction-presentation-test.js` needs new assertions for rationale key presence, budget compliance, deterministic retrieval and locale-key parity.

## 4. Parallel-Structure Risk

Two related runs touch overlapping files:

1. **`agdf-state-orientation`** (UAT gate) — touches `agdf-runtime-contract.md`,
   `gate-check/SKILL.md`, `agdf-interaction-locales.json`, `interaction-presentation.js`.
   This run is Slice B, explicitly separated from Slice A (breadcrumb, narration,
   internal-state collapse) in the UR. Non-overlapping sections: Slice A adds
   breadcrumb/narration/collapse; Slice B adds rationale/why. Both are additive to
   different sections of the same files.

2. **`agdf-human-decision-surface`** (UAT revise) — touches `agdf-runtime-contract.md`,
   `gate-check/SKILL.md`, `agdf-interaction-locales.json`, `interaction-presentation.js`.
   This run owns the **approval-time** two-card envelope and `gate_approval` sequence.
   Slice B's "Why?" is a `status` interaction outside the approval sequence — no overlap
   with the option list, `APPROVAL_SEQUENCE` or `validateApprovalOrientationSnapshot`.

**Risk**: concurrent modification of `agdf-interaction-locales.json` and
`interaction-presentation.js` could conflict if both runs are open simultaneously.

**Mitigation**: the SD must name the exact JSON keys and JS functions each slice owns.
Slice B adds a `gateRationale` top-level key per locale and a `gateRationale()` retrieval
function — neither touched by the other runs. The `validateLocaleRegistry` change is
additive (new keys enter the baseline automatically via `flattenKeys`). Sequencing is
preferable if the other runs are still open; the PRD must define non-overlapping sections.

## 5. SoT / Runtime / Product-Semantics Drift

No drift. `SOT_REGISTRY.md` confirms `plugin/meta/agdf-runtime-contract.md` as active
primary SoT. `agdf-interaction-locales.json` is owned by the presentation/locale system
under `plugin/meta/`. No second owner or competing spec. The on-demand "Why?" uses the
existing `status` interaction kind — no new kind, no product-semantics change.

## 6. Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY` (CONTEXT_GRAPH.md:43);
  `CG-RUN-STATUS-CARD` (CONTEXT_GRAPH.md:15)
- context_graph_reconciliation: open_gap (to be resolved at OR closeout when the nodes
  are updated with rationale registry and "Why?" scope)
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-NATIVE-INTERACTION-AUTHORITY` covers the interaction
  contract; Slice B extends it with the on-demand "Why?" status interaction pattern.
  `CG-RUN-STATUS-CARD` covers the compact status projection; Slice B adds the rationale
  registry as a deterministic content source for that projection. No new node needed.

## 7. Missing Evidence

- No implementation evidence yet (expected at CD+Tests).
- No regression-test coverage for rationale or "Why?" yet (expected at TP/CD+Tests).
- `agdf-state-orientation` and `agdf-human-decision-surface` UAT not yet recorded;
  sequencing risk remains open until they complete or the SD defines non-overlapping
  file sections.

## 8. Risks

- **Sequencing risk**: concurrent modification of `interaction-presentation.js` and
  `agdf-interaction-locales.json` with `agdf-state-orientation` and
  `agdf-human-decision-surface`. Mitigated by additive-only JSON keys and a separate
  retrieval function; the SD must name exact keys/functions.
- **Locale budget**: rationale strings must stay within `lengthBudgets.description`
  (160 chars). The example rationales are 80–100 chars, so this is low-risk but must be
  enforced by the existing budget check.
- **"Why?" non-overlap**: the "Why?" response must never enter the `gate_approval` option
  list or the `APPROVAL_SEQUENCE`. The SD must define the separation contract and the
  tests must assert it.
- **Locale parity**: adding `gateRationale` to `en` and `de` makes it mandatory for any
  future locale pack (enforced by `flattenKeys` baseline comparison). This is intended
  behaviour.

## 9. Required Next Step

Record the Mode/Slice Decision (`structured_slice`) in the selected `RUN_STATE.md`,
then draft the compact PRD at the smallest justified depth.
