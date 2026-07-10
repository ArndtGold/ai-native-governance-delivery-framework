# UR: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`plugin/control/templates/AGDF_RUN.md` is a single, one-size-fits-all template (Run Meta, Objective,
Current Control State, Source And Scope State, Run Status Card, Approvals, Artefacts, Mode/Slice
Decision, Artefact Chain, Evidence, Missing Evidence, Risks, Context Graph Impact, Knowledge
Persistence Decision, Closeout — 14 sections) applied identically regardless of change size. The
Runtime Contract already defines a lightweight "Quick Task Output" shape (`result` / `evidence` /
`risk` / `next_step`, `agdf-runtime-contract.md` lines 18-28) for cases where "no formal gate
artefact is required," but there is no explicit, mechanically checkable criterion for when a quick
task qualifies for that compact shape instead of filling the full `AGDF_RUN.md`. The "Relevant Run"
definition (lines 177-181: changes durable state, creates/updates an AGDF artefact, changes
code/runtime behaviour, ...) is broad enough that most deliberate changes end up producing the full
ceremony, observed directly in this session's own `agdf-backlog-vocabulary-visibility` run.

## 2. Goal

Give trivial, non-normative changes (wording clarification in end-user docs, typo fixes, non-normative
example/asset edits) an explicit, narrow path that uses only the existing compact Quick Task Output
shape without creating or filling a full `AGDF_RUN.md`, while keeping every runtime-governing change
(skills, templates, meta, code) on today's full ceremony unchanged.

## 3. Scope

- Define an explicit, path-based boundary for a "non-normative trivial change": no edits under
  `plugin/skills/**`, `plugin/control/templates/**`, `plugin/meta/**`, `create-agdf/lib/**`,
  `create-agdf/bin/**`, or any other code file; no new or changed allowed values, gate semantics, or
  vocabulary.
- Amend the Runtime Contract's "Quick Task Output" and "Relevant Run" sections to name this boundary
  explicitly and state that changes fully inside it do not require a durable `AGDF_RUN.md` file, only
  the compact output shape plus, if relevant, a one-line `MASTER_BACKLOG.md` pointer.
- Confirm whether `doctor` needs adjustment so it does not flag the intentional absence of
  `AGDF_RUN.md` for such runs.

## 4. Non-Goals

- No change to the ceremony for anything touching skills, templates, meta, or code — that stays
  exactly as heavy as today.
- No new Mode/Slice Decision value beyond clarifying when the existing `quick_task` tier may skip the
  durable file.
- No change to the UR/PRD/SD/TP/QA/UAT gates themselves.

## 5. Acceptance Signals

- The Runtime Contract names the exact non-normative boundary and states explicitly that changes fully
  inside it use only Quick Task Output, with no `AGDF_RUN.md` file required.
- `doctor` does not produce a false "missing `AGDF_RUN.md`" finding for a run intentionally using this
  path.
- Existing full-ceremony behavior for skill/template/meta/code changes is unchanged, verified via
  `check-runtime-integrity.mjs` and package smoke tests.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md` ("Quick Task Output", "Relevant Run", "Mode Selection")
- `plugin/control/templates/AGDF_RUN.md` (single template, no size variants)
- `create-agdf/bin/create-agdf.js` (`doctor` validation logic)

## 7. Risks And Unknowns

- The non-normative boundary must stay narrow and mechanically expressible (file path prefixes), or it
  becomes a loophole through which larger changes get waved through as "trivial" — flagged already when
  this idea was first proposed in chat.
- Unconfirmed whether `doctor` currently assumes `AGDF_RUN.md` must exist whenever `.agdf/control/` is
  live; needs Brownfield Analysis / PRD-stage confirmation.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
