# PRD: Reduce AGDF's Own Framework-Maintenance Overhead (Narrowed Slice)

Status: approved
Gate: PRD
Gate approval: Valid post-artefact `Approval: PRD` provided on 2026-07-13
Based on: approved UR and completed Brownfield Review (`structured_slice`)
Date: 2026-07-13
Owner: agent

## 1. Product Scope

Deliver exactly the two candidates Brownfield Review found still open (the other two already exist in
the codebase and are out of scope for implementation, only referenced as prior art):

### 1.1 Backlog Scope Visibility

`MASTER_BACKLOG.md` rows gain a visible distinction between `framework-maintenance` and
`external-delivery` scope, reusing the existing canonical-vocabulary enforcement pattern already used
for `Status` and `Artefacts` labels (`backlogStatusLabels`/`backlogArtefactLabels` in
`create-agdf/bin/create-agdf.js`, enforced via `doctor`).

- A new canonical vocabulary, e.g. `backlogScopeLabels`: `framework-maintenance` | `external-delivery`.
- A new `doctor` finding code (e.g. `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN`) fires only when a `Scope` value
  is present but not in the canonical vocabulary — an absent value on existing historical rows is not an
  error (see Non-Goals).
- The `MASTER_BACKLOG.md` template's Rules section documents the new vocabulary, mirroring how Status
  and Artefact label rules are documented today.

### 1.2 Trivial Change Boundary: Narrow Code-Fix Criterion

Extend the existing Non-Normative Trivial Change Boundary in `plugin/meta/agdf-runtime-contract.md` with
one additional, explicit, fail-closed, mechanically-checkable allow-list criterion for narrow code fixes,
so that a defect fix does not automatically require the full CR → Clean Review → Task Plan Review →
QA-gate → OR chain when all of the following hold:

1. The diff is confined to a single function or single clearly-bounded block in one file.
2. The change is accompanied by a new or updated automated regression test that exercises the fixed
   behavior and passes.
3. No PRD, SD, TP, gate name, approval formula, or documented CLI/output-schema contract is touched —
   only internal correctness of already-approved behavior.
4. `doctor`/`check-runtime-integrity.mjs` and the relevant existing test suite pass unchanged in shape
   (no suppressed or skipped assertions beyond what the fix itself introduces).

A change meeting all four criteria may close with **Code Review still mandatory** (not skippable — it is
the cheapest step and the one most likely to catch exactly this class of issue) but may skip Clean
Implementation Review, Task Plan Review, a separate QA-gate delta decision, and OR, closing instead with
the Runtime Contract's compact Quick Task Output shape plus a one-line note in the relevant durable
artefact (if one exists) recording what was fixed and why it qualified.

If a change does not meet all four criteria, the existing full ceremony is unchanged — this criterion is
additive, not a replacement for judgment-based escalation.

## 2. Acceptance Criteria

1. `MASTER_BACKLOG.md` template documents the new `Scope` vocabulary in its Rules section, consistent in
   style with the existing Status/Artefact label rules.
2. `create-agdf/bin/create-agdf.js` defines `backlogScopeLabels` and a corresponding `doctor` finding
   code that fires only on an unrecognized (not absent) value.
3. Existing historical `MASTER_BACKLOG.md` rows without a `Scope` value do not trigger a new `doctor`
   finding.
4. This repository's own live `.agdf/control/MASTER_BACKLOG.md` adopts the new field for at least its
   currently active/planned rows as a worked example.
5. The Trivial Change Boundary subsection in `plugin/meta/agdf-runtime-contract.md` states the new
   four-part criterion as an explicit, fail-closed allow-list addition, not a prose judgment call.
6. The four-part criterion requires CR and a regression test in all cases; it never allows a fix to close
   with zero test evidence.
7. Applying the new criterion to this session's own two prior fixes (Windows `fsyncDirectory` guard; CLI
   ambiguous-selection crash fix) is used as a worked evaluation: PRD documents whether each would now
   qualify under the new criterion, as a concrete sanity check before SD/TP proceed.
8. `check-runtime-integrity.mjs`, `create-agdf` and `@agdf/cli` smoke suites, and `doctor --json` all
   pass after the change, with no new finding introduced for this repository's own control state.
9. Context Graph node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` is updated (not replaced) to record the new
   criterion and its rationale.

## 3. Non-Goals

- No automated computation of a framework-maintenance-vs-external-delivery *ratio metric* — the Scope
  field makes the distinction human-scannable; a computed dashboard/ratio is out of scope for this slice.
- No retroactive requirement to label historical Completed/Superseded rows with `Scope`.
- No change to CI running on Windows — flagged in Brownfield Review as a separate, unrelated follow-up.
- No weakening of Code Review, gate approvals, or ceremony for any change that does not meet all four
  criteria in section 1.2.
- No new parallel vocabulary-enforcement mechanism — both changes reuse the existing `doctor`/canonical
  vocabulary pattern.

## 4. Users And Roles

| Role | Need | Authority |
|---|---|---|
| Framework maintainer | See at a glance how much backlog work is self-maintenance vs external delivery | Adds `Scope` to backlog rows; decides the criterion's wording |
| Contributing agent | Know whether a narrow fix qualifies for the lighter path | Must self-check against the four-part criterion; CR remains mandatory regardless |
| Adopting team (downstream) | Understand this criterion does not apply to their own product-delivery ceremony | Unaffected — this PRD only touches AGDF's own repository/template files |

## 5. Constraints

- The Runtime Contract remains the single canonical owner of gate/ceremony rules; this PRD adds one
  allow-list criterion to an existing subsection, it does not introduce a second ceremony model.
- `MASTER_BACKLOG.md`'s vocabulary enforcement stays owned by `create-agdf/bin/create-agdf.js`'s existing
  `doctor` finding mechanism; no new enforcement code path.
- Both changes touch normative `plugin/control/templates/**` and `plugin/meta/**` paths and therefore
  cannot themselves use the lightweight path they are creating — full SD/TP/CR/QA/UAT/OR ceremony applies
  to this run, consistent with Brownfield Review's finding.

## 6. Evidence Requirements

- `doctor` fixture/test proving the new `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` finding fires only for an
  unrecognized (not absent) value.
- Runtime integrity check passes with the amended Runtime Contract and template.
- A worked, genuine example: this repository's own `MASTER_BACKLOG.md` demonstrates the new `Scope`
  field on real rows (not a synthetic fixture only).
- The section 2.7 worked evaluation (today's two fixes against the new criterion) is persisted as visible
  reasoning, not just an implicit assumption.

## 7. Risks And Open Questions

- SD must decide the exact `doctor` finding severity (`warn` vs `block`) for an unrecognized `Scope`
  value, and whether a `Scope` column is a distinct table column or an inline row annotation.
- SD must decide precisely how "single function or clearly-bounded block" is worded to stay
  mechanically checkable rather than becoming a new prose judgment call — this is the highest-risk part
  of this PRD and must not be softened during SD/TP.
- TP must enumerate every place the Trivial Change Boundary's path-list and criteria are duplicated
  across generated surfaces (Codex/Copilot/OpenCode), consistent with how the original boundary's
  propagation was verified.
- Whether today's two fixes would have qualified is informative but not dispositive — the criterion must
  be judged on its own general merits, not reverse-engineered to fit exactly those two cases.

## 8. Next Step

Review this PRD and approve only after it exists with:

`Approval: PRD`

The earlier pre-artefact `Approval: PRD` was not accepted, per AGDF's separation of approval text from
durable artefact presence. A new valid post-artefact `Approval: PRD` is needed.
