# UR: Make Canonical Backlog Status/Artefact Vocabulary Visible And Verified At Write Time

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`create-agdf/bin/create-agdf.js` defines a fixed, canonical vocabulary of human-readable backlog
status labels (`backlogStatusLabels`: `needs ur`, `awaiting brownfield review`, `blocked`,
`in progress`, `completed`, `superseded`, `abandoned`, etc.) and artefact link labels
(`backlogArtefactLabels`: `ur`, `brownfield`, `prd`, `sd`, `tp`, `qa`, `or`), enforced by `doctor`
(`AGDF_BACKLOG_STATUS_UNKNOWN`, `AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN`). This vocabulary exists only
in the CLI source code — not in `plugin/control/templates/MASTER_BACKLOG.md`, not in
`release-or/SKILL.md` (which references "the canonical human-readable table" without enumerating it
in rules 11-12), not in `gate-check/SKILL.md` (which says "use ... readable status labels" without
naming them). An agent maintaining `MASTER_BACKLOG.md` has no way to know the allowed vocabulary
without reading CLI source, and nothing instructs running `doctor` after a backlog edit to catch
drift before it reaches the user. This was discovered live in this session: an invented status label
("Parked, contingent") and an invented artefact label ("QA_REPORT") were both written into
`MASTER_BACKLOG.md` and went unnoticed until the user asked about it; `doctor --json` confirmed both
as findings immediately once run.

## 2. Goal

Make the canonical vocabulary visible at the point an agent drafts or edits a backlog row, and make
verifying conformance (via `doctor`) an explicit, named step after such edits — so this class of
silent drift is caught before the user has to find it.

## 3. Scope

- In scope: enumerate the canonical status labels and artefact labels in
  `plugin/control/templates/MASTER_BACKLOG.md`'s Rules section, as the single documented source
  (avoiding duplicating the list separately in multiple SKILL.md files).
- In scope: add an explicit rule to `release-or/SKILL.md` (which already has backlog-specific rules
  11-12) requiring `doctor --json` (or the locally available equivalent) to be run after any
  `MASTER_BACKLOG.md` write, with backlog-specific findings resolved before closeout.
- In scope: a corresponding cross-reference in `gate-check/SKILL.md`'s existing backlog-maintenance
  rule (rule 18), pointing to the template as the source of the vocabulary rather than restating it.

## 4. Non-Goals

- No change to the actual set of allowed status or artefact labels — this UR only documents and
  surfaces the existing ones, it does not add, remove or redefine any value.
- No change to `doctor`'s validation logic itself.
- No change to any other skill's rules beyond the two named above.

## 5. Acceptance Signals

- `plugin/control/templates/MASTER_BACKLOG.md` lists the exact canonical status and artefact labels
  currently enforced by `create-agdf.js`, kept in sync (a follow-up drift check, not new tooling).
- `release-or/SKILL.md` explicitly instructs running `doctor` after a backlog write and resolving
  backlog-specific findings before closeout.
- `check-runtime-integrity.mjs` and package smoke tests still pass.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js` (`backlogStatusLabels`, `backlogArtefactLabels`,
  `normalizeBacklogStatus`) — authoritative for the actual values.
- `plugin/control/templates/MASTER_BACKLOG.md`, `plugin/skills/release-or/SKILL.md`,
  `plugin/skills/gate-check/SKILL.md` — the docs to be brought in sync with it.

## 7. Risks And Unknowns

- Duplicating the vocabulary as plain text in the template risks drifting from the CLI source over
  time; Brownfield Review should consider whether to phrase the template rule as "matches
  `backlogStatusLabels`/`backlogArtefactLabels` in `create-agdf/bin/create-agdf.js`" to make future
  drift detectable rather than silently duplicating a list that can go stale.
- `create-agdf/scripts/sync-package-assets.js` copies `plugin/skills/` and `plugin/control/` into
  generated Copilot/OpenCode output — confirm the skill/template edits propagate correctly through
  the existing sync, not requiring separate generated-output edits.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
