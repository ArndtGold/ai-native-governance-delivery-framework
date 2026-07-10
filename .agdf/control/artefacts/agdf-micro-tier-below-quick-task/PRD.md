# PRD: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided in session on 2026-07-10, confirmed against this final content
Based on: UR (.agdf/control/artefacts/agdf-micro-tier-below-quick-task/UR.md)
Date: 2026-07-10
Owner: agent

## 1. Product Scope

Amend `plugin/meta/agdf-runtime-contract.md` so a `quick_task` whose entire diff stays fully outside
a fixed set of normative path prefixes may close using only the existing compact "Quick Task Output"
shape (`result` / `evidence` / `risk` / `next_step`, plus a one-line `MASTER_BACKLOG.md` pointer when
the run is "relevant"), without rewriting or expanding `.agdf/control/AGDF_RUN.md` for that run.

Confirmed during PRD drafting: `.agdf/control/AGDF_RUN.md` itself stays a required live control file
(`create-agdf/bin/create-agdf.js` `liveControlFiles`, enforced by `doctor`'s `AGDF_CONTROL_FILE_MISSING`
block-level check) whenever `.agdf/control/` exists — this PRD does not remove that requirement. The
file continues to reflect the last substantive run; a trivial non-normative change simply does not
need to become that run or expand that file.

Normative path-prefix boundary (a change qualifies only if its entire diff avoids all of these):

- `plugin/skills/**`
- `plugin/control/templates/**`
- `plugin/meta/**`
- `create-agdf/lib/**`
- `create-agdf/bin/**`
- any other executable code file (any language) anywhere in the repository

Everything else (docs/, examples/, assets/, README/INSTALL prose not defining gate semantics, pages/
content, comments) is in scope for the lighter path, provided it also introduces no new or changed
allowed vocabulary, gate semantics, or product-visible behavior.

## 2. Acceptance Criteria

- The Runtime Contract's "Quick Task Output" and "Relevant Run" sections name the exact path-prefix
  boundary above and state explicitly: a `quick_task` fully inside this boundary uses only the compact
  output shape; it must not rewrite or expand any of `.agdf/control/AGDF_RUN.md`'s core sections (Run
  Meta, Current Control State, Source And Scope State, Run Status Card, Approvals, Artefacts,
  Mode/Slice Decision, Artefact Chain, Evidence, Missing Evidence, Risks, Context Graph Impact,
  Knowledge Persistence Decision, Closeout), and needs a `MASTER_BACKLOG.md` entry only when the change
  is otherwise a "relevant run" per the existing definition.
- When such a trivial change happens while another run's state is current in `AGDF_RUN.md`, it gets
  exactly one appended line in the existing `Prior Run Pointers` section (already used today for this
  purpose) noting what happened and that it is unrelated to the current run — no other section is
  touched. This keeps the "Quick Tasks... must not become invisible" guarantee from the Runtime
  Contract intact without reintroducing full ceremony.
- The amendment is phrased as a boundary clarification inside the existing sections — no new named
  tier, no new Mode/Slice Decision value, no second gate model.
- `doctor`'s existing `AGDF_CONTROL_FILE_MISSING` / `AGDF_CURRENT_GATE_MISSING` / etc. checks continue
  to pass unchanged, since `AGDF_RUN.md` keeps reflecting the last substantive run rather than being
  deleted or left structurally incomplete.
- `check-runtime-integrity.mjs` and the existing `create-agdf` smoke tests still pass after the
  Runtime Contract wording change propagates through `sync-package-assets.js` to all four generated
  surfaces (Codex, Claude, Copilot, OpenCode).
- A worked example (a docs-only wording fix) is walked through in the amended text or in this run's
  own closeout, showing the lighter path actually applied to a concrete case.

## 3. Non-Goals

- No change to `doctor`'s validation logic or to the `liveControlFiles` requirement — confirmed
  unnecessary during this PRD.
- No new Mode/Slice Decision value; `quick_task` remains the only mode this applies to.
- No change to ceremony for any change touching the listed normative path prefixes.
- No change to UR/PRD/SD/TP/QA/UAT gates.

## 4. Users And Roles

- Affected: any agent (Codex, Claude Code, Copilot, OpenCode surfaces) performing a `quick_task` in a
  repository with live `.agdf/control/` state.
- Decides: the repository owner/user approves this PRD and, later, reviews the worked example before
  the amendment is treated as done.

## 5. Constraints

- Must not weaken ceremony for runtime-governing changes — this was an explicit non-goal from the UR.
- The path-prefix list must be exact and exhaustive enough to avoid ambiguity; anything not clearly
  outside all listed prefixes defaults to the current, heavier path (fail closed).
- Must propagate correctly through the existing `sync-package-assets.js` pipeline to Codex, Claude,
  Copilot and OpenCode without surface-specific forks of the rule text.

## 6. Evidence Requirements

- Diff of the Runtime Contract amendment.
- `check-runtime-integrity.mjs` output before/after.
- Propagation check (grep across the four generated surface variants) after
  `npm --prefix create-agdf run sync-package-assets`.
- The worked example from Acceptance Criteria, showing the compact output shape used end-to-end for a
  real docs-only change without touching `AGDF_RUN.md`.

## 7. Risks And Open Questions

- Risk: the path-prefix list could miss a normative location added later (e.g. a new `plugin/`
  subdirectory) — mitigation to be addressed in SD/TP: phrase the rule to fail closed for anything not
  on the explicit allow-list, not fail open.
- Resolved during PRD drafting: a trivial change occurring alongside another current run gets exactly
  one appended `Prior Run Pointers` line in `AGDF_RUN.md`; no other section is touched. A
  `MASTER_BACKLOG.md` entry is added only when the change is otherwise a "relevant run." Chosen over
  leaving zero trace because the Runtime Contract's "must not become invisible" guarantee is exactly
  the property that this session's own `agdf-backlog-vocabulary-visibility` bug (silently invented
  backlog vocabulary) violated — zero trace would reopen the same failure mode.

## 8. Next Step

Review this PRD and approve only with:

`Approval: PRD`
