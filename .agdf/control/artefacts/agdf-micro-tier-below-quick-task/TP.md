# TP: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided in session on 2026-07-10
Based on: SD (.agdf/control/artefacts/agdf-micro-tier-below-quick-task/SD.md)
Date: 2026-07-10
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T1 | Amend `plugin/meta/agdf-runtime-contract.md`'s "Quick Task Output" section: add the exact path-prefix boundary (`plugin/skills/**`, `plugin/control/templates/**`, `plugin/meta/**`, `create-agdf/lib/**`, `create-agdf/bin/**`, any other code file) and state that a `quick_task` fully outside it may close with only the compact shape, must not rewrite/expand `AGDF_RUN.md`'s 14 core sections, and needs a `MASTER_BACKLOG.md` entry only when otherwise "relevant." | PRD Acceptance Criteria 1 | Diff of the section |
| T2 | Amend the same file's "Relevant Run" section: cross-reference the boundary and state the `Prior Run Pointers` one-line-append rule (only when another run is currently reflected in `AGDF_RUN.md`); state explicitly that anything not fully outside the boundary fails closed to today's ceremony. | PRD Acceptance Criteria 1-2 | Diff of the section |
| T3 | Run `node plugin/scripts/check-runtime-integrity.mjs` before and after T1/T2. | PRD Evidence Requirements | Command output, both runs |
| T4 | Run `npm --prefix create-agdf run sync-package-assets`, then grep the amended wording across the four generated surface variants (Codex, Claude, Copilot, OpenCode) to confirm propagation. | SD Integration Points | Grep output per surface |
| T5 | Run the existing `create-agdf` checks (`test:delivery-path-search`, `test:delivery-path-search-unit`, `test-routing.js`) to confirm no regression. | SD Test And Evidence Strategy | Command output |
| T6 | Identify one genuine, currently-pending, non-normative documentation nit (via inspection of `docs/`, `README.md`, `INSTALL.md`, `examples/` — not manufactured) and apply the new rule to it end-to-end as the worked example: produce only the compact Quick Task Output, leave `AGDF_RUN.md`'s core sections untouched, and append exactly one `Prior Run Pointers` line noting it (since this run is currently reflected in `AGDF_RUN.md`). | PRD Acceptance Criteria (worked example) | The actual trivial change, its compact output, and the diff showing `AGDF_RUN.md` core sections unchanged |
| T7 | Create the Context Graph node deferred from Brownfield Review (`context_graph_impact: new_node_required`), recording the structural-ceremony finding and the path-based boundary decision. | Brownfield Review Context Graph Impact | `CONTEXT_GRAPH.md` diff |

## 2. Test Plan

- T3-T5 are automated/scripted checks, run and captured as command output.
- T6 is an inspection + live-execution check: the worked example must be a real pending nit, not a
  staged one, so it is genuine evidence that the new rule behaves as intended.
- No new automated test suite is introduced; this change amends prose rules, not executable logic, so
  existing runtime-integrity and smoke checks are the correct and sufficient net.

## 3. Brownfield Scope

- Confirm (already done via grep in SD) that no `plugin/skills/**` file duplicates Quick Task
  Output/Relevant Run rules; re-verify at Brownfield Analysis immediately before CD+Tests in case this
  session's edits changed anything.
- Confirm `create-agdf/bin/create-agdf.js`'s `liveControlFiles` and doctor finding codes are unaffected
  (no code path reads the specific prose being amended).

## 4. Out Of Scope

- No changes to `doctor` validation logic, `liveControlFiles`, or any finding code.
- No changes to any `plugin/skills/**` file.
- No new Mode/Slice Decision value.
- No changes to any file within the listed normative path prefixes themselves (only the contract text
  that references them).

## 5. Risks And Blockers

- Risk: the path-prefix allow-list might not be exhaustive (e.g., a future `plugin/` subdirectory not
  yet covered). Mitigation: T1 explicitly states the fail-closed default so an incomplete list is safe
  by construction, not a silent gap.
- Blocker condition: if no genuine pending non-normative nit can be found for T6, escalate back to SD
  rather than manufacturing one — a fabricated example would weaken the evidence.

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
