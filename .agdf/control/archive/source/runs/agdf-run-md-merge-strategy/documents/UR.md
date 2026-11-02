# UR: Reduce Concurrent-Edit Conflict Risk On AGDF_RUN.md

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`.agdf/control/AGDF_RUN.md` is a single, global, frequently-rewritten "current run" dashboard. It is
git-tracked because `.github/workflows/agdf-guardrails.yml` runs
`node create-agdf/bin/create-agdf.js delivery-map --dir .` against a fresh checkout, which requires the
file to exist (confirmed: without it, `doctor`/`delivery-map` would report `AGDF_CONTROL_FILE_MISSING`,
block-level). This was discovered live in this session: while a governed run
(`agdf-micro-tier-below-quick-task`) was actively rewriting `AGDF_RUN.md` in this session, two commits
appeared that this session never made — one (`2fff2c8`) committed this session's exact in-progress
state under the configured local git identity, and a second (`5292f62`, different email identity) was
fast-forward-merged in from `origin/main`, confirmed by the user to originate from another machine.
This time the two didn't collide on content, but the scenario is a real, demonstrated case of
concurrent, out-of-band edits to the same git-tracked, single-mutable-slot file.

## 2. Goal

Reduce or eliminate blocking git merge conflicts on `.agdf/control/AGDF_RUN.md` caused by concurrent
edits from different machines or sessions, without breaking the existing CI dependency that requires
the file to exist in a checkout.

## 3. Scope

- Add a `.gitattributes` entry scoping a merge strategy to exactly `.agdf/control/AGDF_RUN.md` (exact
  strategy — e.g. `merge=ours` vs. a union/text driver — to be decided in Brownfield
  Review/SD, weighing silent-discard risk against garbled-markdown risk).
- Document explicitly (Runtime Contract or `.agdf/control/README.md`) that `doctor`/`gate-check` must
  be re-run after any merge or pull that could have touched `AGDF_RUN.md`, to catch and reconcile any
  resulting inconsistency — reusing the same self-correcting mechanism this session's own CR step just
  demonstrated (5 findings caught and fixed down to 0).
- Verify `.github/workflows/agdf-guardrails.yml` still passes with the file present after a simulated
  concurrent-edit merge under the new strategy.

## 4. Non-Goals

- No change to `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, or `.agdf/control/artefacts/**` merge behavior
  — these are structurally multi-writer-friendly (per-row, per-run-key) and stay on default git merge.
- No removal of `AGDF_RUN.md` from git tracking — confirmed infeasible without breaking CI.
- No change to `doctor`'s validation logic itself.
- No attempt to solve true simultaneous editing of the *same* active run by two people/machines at
  once — that remains a coordination problem, not something a merge driver can resolve.
- No change to the `create-agdf` scaffold's shipped defaults for consumer repositories unless this UR's
  acceptance signals explicitly extend to that (default: this repository only).

## 5. Acceptance Signals

- `.gitattributes` correctly scopes the chosen merge strategy to `.agdf/control/AGDF_RUN.md` only.
- A simulated concurrent-edit test (two branches independently editing `AGDF_RUN.md`, then merged)
  resolves without a blocking conflict.
- `agdf-guardrails.yml` continues to pass after the change and after the simulated merge.
- Runtime Contract or `.agdf/control/README.md` explicitly instructs re-running `doctor`/`gate-check`
  after any merge or pull that could affect `AGDF_RUN.md`.

## 6. Existing Source Of Truth

- `.github/workflows/agdf-guardrails.yml` — confirmed CI dependency on `AGDF_RUN.md` presence.
- `plugin/control/templates/AGDF_RUN.md`, live `.agdf/control/AGDF_RUN.md`.
- `plugin/meta/agdf-runtime-contract.md` (`Control Scaffold` section).

## 7. Risks And Unknowns

- Choice of merge strategy carries a real tradeoff: `merge=ours` silently discards the incoming
  branch's dashboard state (could hide that the other side's run was actually more current), while a
  union/text merge risks producing structurally invalid Markdown if both sides changed overlapping
  sections. Brownfield Review/SD must weigh this explicitly, not default silently.
- Relying on "re-run `doctor` after merge" is a process discipline, not a guarantee — needs to be
  visible and named, not assumed to always happen.
- Whether this should ever extend to the `create-agdf` scaffold template (shipped to other
  repositories) is explicitly out of scope for this UR and would need its own follow-up UR if desired.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
