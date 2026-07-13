# SD: Reduce AGDF's Own Framework-Maintenance Overhead (Narrowed Slice)

Status: approved
Gate: SD
Gate approval: Valid post-artefact `Approval: SD` provided on 2026-07-13
Based on: approved PRD
Date: 2026-07-13
Owner: agent

## 1. Solution Overview

Two independent, small changes, both extending existing mechanisms rather than introducing new ones:

1. A lightweight, non-restructuring `Scope` tag on `MASTER_BACKLOG.md` Active/Planned rows.
2. One new, explicit, fail-closed sub-criterion appended to the existing Trivial Change Boundary in
   `plugin/meta/agdf-runtime-contract.md`.

## 2. Ownership And Source Of Truth

- `plugin/control/templates/MASTER_BACKLOG.md` remains the canonical template; this repository's own
  `.agdf/control/MASTER_BACKLOG.md` is a live instance, not a second template.
- `create-agdf/bin/create-agdf.js` remains the single owner of backlog-vocabulary enforcement
  (`backlogStatusLabels`, `backlogArtefactLabels`, and the new addition below).
- `plugin/meta/agdf-runtime-contract.md` remains the single normative owner of the Trivial Change
  Boundary; `create-agdf/scripts/sync-package-assets.js` remains the single propagation mechanism to
  generated Codex (`plugins/agdf/meta/agdf-runtime-contract.md`), Copilot
  (`.github/skills/agdf-runtime-contract.md`) and OpenCode (`.opencode/agdf-runtime-contract.md`) copies.
  Claude reads `plugin/` directly — no separate generated copy exists or is needed.

## 3. Architecture Decisions

### 3.1 Backlog Scope Tag Format

Reject a new table column (it would require restructuring three differently-shaped tables — Active
Backlog, Planned/Parking Lot, and Completed/Superseded Pointers — for a field the PRD explicitly does not
require retroactively). Instead: a leading bracketed tag at the start of the `Work item` cell text, one
of exactly:

- `[framework-maintenance]`
- `[external-delivery]`

Example: `[framework-maintenance] Fix Codex/Claude plugin manifest drift`.

This is the smallest durable intervention: no table restructuring, human-scannable at a glance, and
mechanically greppable via a simple leading-bracket regex.

### 3.2 Backlog Scope Enforcement

- New vocabulary map `backlogScopeLabels` in `create-agdf/bin/create-agdf.js`, parallel in shape to
  `backlogStatusLabels`/`backlogArtefactLabels`: accepts `framework-maintenance` and `external-delivery`
  (case-insensitive, hyphen or space separated, matching the existing normalization pattern).
- New `doctor` finding code `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN`, severity `revise` — consistent with the
  existing `AGDF_BACKLOG_STATUS_UNKNOWN`/`AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN` severity, since an
  unrecognized label is a fixable authoring mistake, not a blocking integrity failure.
- The finding fires **only** when a `Work item` cell starts with a bracketed tag that does not match
  either canonical value (e.g. `[Framework]` or `[misc]`). A `Work item` cell with **no** leading bracket
  at all is not an error — the field is optional per PRD Non-Goals (no retroactive requirement).
- Applies only to `Active Backlog` and `Planned / Parking Lot` sections; `Completed / Superseded
  Pointers` rows are never checked for this tag (historical rows, PRD Non-Goal).

### 3.3 Trivial Change Boundary: Narrow Code-Fix Criterion

Append one new sub-bullet to the existing "Non-Normative Trivial Change Boundary" subsection in
`plugin/meta/agdf-runtime-contract.md`, immediately after the existing path-based allow-list paragraph,
using the same fail-closed framing:

> A change that touches one of the otherwise-excluded code paths above may still close with only the
> compact Quick Task Output shape — Code Review remains mandatory regardless — when **all** of the
> following hold. Any single condition failing, or any ambiguity about whether a condition holds, keeps
> the full existing ceremony unchanged:
>
> 1. The diff is confined to a single function, single exported symbol, or one clearly-bounded block in
>    exactly one file.
> 2. A new or updated automated regression test exercises the fixed behavior and passes.
> 3. No PRD, SD, TP, gate name, exact approval formula, or documented CLI flag/output-schema field is
>    added, removed, or changed — only internal correctness of already-approved behavior.
> 4. `doctor` (or the locally available equivalent) and the directly affected existing test suite both
>    pass unchanged in shape after the fix, with no assertion skipped or weakened beyond what the fix
>    itself introduces.

This mirrors the original boundary's own explicit-allow-list character (rejecting a prose "obviously
small" judgment call) and stays additive: it does not alter the existing path-list, existing exit
criteria, or any other gate.

### 3.4 Worked Evaluation (PRD Acceptance Criterion 7)

Applying section 3.3's criterion to this session's own two prior fixes:

- **Windows `fsyncDirectory` guard** (`create-agdf/lib/control-state/run-state-writer.js`): condition 1
  holds (single function, one line added). Condition 2 holds only after the fact — no regression test
  existed until this session's own follow-up work added one. Condition 3 holds. Condition 4 holds
  (`doctor`/`test:control-state` passed unchanged in shape, plus the fix's own new assertions). **Net: at
  the time the fix was made, it would NOT have qualified (condition 2 was not yet satisfied); once the
  accompanying regression test was added, it would qualify going forward for a similarly-shaped future
  fix.**
- **CLI ambiguous-selection crash fix** (`create-agdf/bin/create-agdf.js`): condition 1 holds (one
  function gained a try/catch; one caller gained a branch — arguably two clearly-bounded blocks in one
  file, borderline against a strict "single function" reading). Condition 2 holds (permanent regression
  test added in the same session). Condition 3 holds. Condition 4 holds. **Net: this one is a genuine
  borderline case — it shows condition 1's wording needs to explicitly allow "one function plus its
  direct caller" as a single bounded change, not only a literal single function, or this exact class of
  fix would be excluded by an overly strict reading.**

Conclusion: condition 1's wording in section 3.3 is revised from "single function" to "single function
or a function together with its direct, necessarily-coupled caller" to avoid excluding exactly the kind
of narrow fix this criterion is meant to cover, based on this concrete worked test.

## 4. Integration Points

- `create-agdf/scripts/sync-package-assets.js`: no code change needed; it already propagates
  `plugin/meta/agdf-runtime-contract.md` verbatim to all three generated copies.
- `plugin/scripts/check-runtime-integrity.mjs`: no change needed — it does not currently assert on
  Trivial Change Boundary wording or backlog vocabulary contents, and TP does not add such an assertion
  (out of scope; the existing doctor finding mechanism is the enforcement layer for the backlog tag,
  and the Runtime Contract text itself is the enforcement layer for the boundary criterion).
- `.agdf/control/CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY`: updated (not replaced) to
  record the new criterion, its rationale, and the worked-evaluation finding from section 3.4.

## 5. Constraints And Compatibility

- No existing `MASTER_BACKLOG.md` row is required to change; the tag is opt-in going forward.
- No existing `doctor` finding changes severity or meaning.
- No change to gate order, approval formulas, or any other Runtime Contract section.
- Backwards compatible: a repository using an older generated Runtime Contract copy simply does not yet
  have the new criterion available — no breaking change, purely additive.

## 6. Test And Evidence Strategy

### Focused checks

- `doctor` fixture proving `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` fires for an unrecognized bracketed tag and
  does not fire for an absent tag or either canonical value.
- `check-runtime-integrity.mjs` passes after the Runtime Contract amendment.
- Manual/worked verification: this repository's own `MASTER_BACKLOG.md` Active Backlog row for this very
  run item adopts `[framework-maintenance]` as a genuine, non-synthetic example.

### Required validation

- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run test:control-state` (unaffected, run as regression safety net)
- `node create-agdf/bin/create-agdf.js doctor --json` on this repository, expect `pass`, 0 findings
- `npm --prefix create-agdf run sync-package-assets` then a propagation diff check across the three
  generated Runtime Contract copies

## 7. Risks And Open Questions

- The revised condition 1 wording ("function together with its direct, necessarily-coupled caller") is
  itself a judgment call about what counts as "necessarily coupled" — TP must phrase this as concretely
  as possible and flag if it cannot be made more mechanically precise without becoming a second prose
  loophole.
- If TP finds any other generated-surface location duplicating Trivial Change Boundary wording beyond the
  three already identified, it must be added to the propagation check.

## 8. Context Graph Reconciliation Plan

- Update `CG-DOCUMENTATION-CEREMONY-BOUNDARY`: add the new criterion, its rationale, and the section 3.4
  worked-evaluation finding (including the condition-1 wording correction) as new evidence/invariants.
- No new Context Graph node created — this extends the existing one, consistent with Brownfield Review.

## 9. Next Step

Review this SD and approve only after it exists with:

`Approval: SD`
