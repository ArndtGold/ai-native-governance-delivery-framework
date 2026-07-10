# SD: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided in session on 2026-07-10
Based on: PRD (.agdf/control/artefacts/agdf-micro-tier-below-quick-task/PRD.md)
Date: 2026-07-10
Owner: agent

## 1. Solution Overview

Amend exactly one normative file, `plugin/meta/agdf-runtime-contract.md`, in its two already-existing
sections "Quick Task Output" (current lines 18-28) and "Relevant Run" (current lines 177-182). No
other skill file needs a change: a grep across `plugin/skills/**` confirms no skill duplicates Quick
Task Output or Relevant Run rules — they only reference the Runtime Contract, consistent with the
"Do Not Duplicate" rule already in the contract. This keeps the change to a single source-of-truth
edit that then propagates through the existing `sync-package-assets.js` pipeline to all four generated
surfaces, the same pattern already proven by `agdf-backlog-vocabulary-visibility`.

Concrete wording additions:

- In "Quick Task Output": name the exact path-prefix boundary from the PRD (`plugin/skills/**`,
  `plugin/control/templates/**`, `plugin/meta/**`, `create-agdf/lib/**`, `create-agdf/bin/**`, any
  other code file) and state that a `quick_task` whose full diff stays outside all of them may close
  using only this compact shape, must not rewrite or expand any of `AGDF_RUN.md`'s 14 core sections,
  and needs a `MASTER_BACKLOG.md` entry only when the run is otherwise "relevant."
- In "Relevant Run": add one sentence cross-referencing the same boundary, and state the resolved
  `Prior Run Pointers` rule: if such a trivial change happens while `AGDF_RUN.md` currently reflects
  another run, append exactly one line to the existing `Prior Run Pointers` section noting what
  happened and that it is unrelated — no other section changes.
- Anything not clearly and fully outside the listed prefixes fails closed to today's existing
  (unchanged) ceremony — this is stated explicitly to prevent ambiguity from being read as permission.

## 2. Ownership And Source Of Truth

- `plugin/meta/agdf-runtime-contract.md` remains the single normative source for this rule; no skill
  file gets a duplicate copy, only implicit reliance via existing "consumes the Runtime Contract"
  language already present in `gate-check`, `release-or`, `brownfield-analysis`.
- `create-agdf/bin/create-agdf.js`'s `liveControlFiles` / `doctor` logic is explicitly NOT touched —
  confirmed unnecessary in PRD; `AGDF_RUN.md` keeps existing as the required live file, just without
  being rewritten for in-boundary trivial changes.
- `plugin/control/templates/AGDF_RUN.md`'s existing `Prior Run Pointers` section is reused as-is, no
  template change needed — it is optional free-text today and already used exactly this way in the
  current live `AGDF_RUN.md`.

## 3. Architecture Decisions

- No new Mode/Slice Decision value. This is a within-`quick_task` behavior clarification, not a new
  process tier — avoids the "second gate model" risk flagged in Brownfield Review.
- The path-prefix boundary is expressed as an explicit allow-list in the contract text (fail closed),
  not as a prose heuristic — directly addresses the "loophole" risk flagged in both Brownfield Review
  and PRD.
- The `Prior Run Pointers` line is additive-only (append, never edit/replace existing lines) to avoid
  silently erasing other agents' or sessions' pointers.

## 4. Integration Points

- `create-agdf/scripts/sync-package-assets.js` — propagates `plugin/meta/` into the generated Codex,
  Claude, Copilot and OpenCode surfaces; no code change needed here, only confirmation that the amended
  contract text reaches all four after a sync run (same verification pattern as the vocabulary-
  visibility precedent).
- No CLI (`create-agdf/bin/create-agdf.js`), no `doctor` checks, no CI workflow (`agdf-guardrails.yml`)
  needs a change.

## 5. Constraints And Compatibility

- Must not alter any existing doctor finding code, behavior, or the `liveControlFiles` list.
- Must not change ceremony for any change touching the listed normative prefixes — verified by keeping
  those paths unchanged in the amendment itself.
- Must remain backward compatible with every existing completed run's `AGDF_RUN.md`/`MASTER_BACKLOG.md`
  content — this is a forward-looking behavior rule, not a retroactive reformatting of history.

## 6. Test And Evidence Strategy

- `node plugin/scripts/check-runtime-integrity.mjs` before and after the edit.
- `npm --prefix create-agdf run sync-package-assets` followed by a grep-based propagation check across
  the four generated surface variants, mirroring the exact method used in
  `agdf-backlog-vocabulary-visibility`.
- Existing `create-agdf` test suite (`test:delivery-path-search`, `test:delivery-path-search-unit`,
  `test-routing.js`) run to confirm no regression, since none of them touch this contract text
  directly.
- The PRD's required worked example: a real docs-only wording fix (candidate: a small clarification in
  `docs/glossar.md` or similar, chosen at TP time) carried out under the new rule end-to-end, showing
  the compact output shape used and `AGDF_RUN.md`'s core sections left untouched.

## 7. Risks And Open Questions

- Risk: a future normative location gets added under a new top-level directory and is forgotten in the
  path-prefix list. Mitigation: TP should include a check for any other `plugin/` or `create-agdf/`
  subdirectory not yet covered by the list, so the allow-list is deliberately exhaustive at delivery
  time, not just plausible.
- Open question for TP: which concrete file should serve as the worked example — needs a real,
  genuinely trivial, currently-pending docs change, not a manufactured one, so the demonstration is
  authentic evidence rather than a staged example.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
