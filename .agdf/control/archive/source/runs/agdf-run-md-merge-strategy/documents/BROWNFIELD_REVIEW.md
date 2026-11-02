# Brownfield Review: Reduce Concurrent-Edit Conflict Risk On AGDF_RUN.md

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-run-md-merge-strategy
- related_ur: .agdf/control/artefacts/agdf-run-md-merge-strategy/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Confirm the safest, most portable merge-strategy choice for `.agdf/control/AGDF_RUN.md`, identify
existing owners, and size the work.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | Git plumbing convenience; no new allowed values, no behavior change to gates | none |
| Source of truth | No `.gitattributes` exists at repo root yet | `find . -maxdepth 1 -iname ".gitattributes"` returned nothing | low |
| Runtime path | `.github/workflows/agdf-guardrails.yml` (`delivery-map --dir .`) | Confirmed dependency on `AGDF_RUN.md` presence in a fresh checkout | medium |
| UI / UX | none | | none |
| Persistence / data | `plugin/control/README.md` (template, propagated to consumer repos via `init`); this repo's own `.agdf/control/` has no live `README.md` copy | Confirmed via `ls`/`find` — no live README exists in this repo's `.agdf/control/` today | low |
| Tests / QA | none directly test `.gitattributes` behavior | No existing test regresses from adding the file | none |
| Release / operations | none | | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Git's per-path custom merge **driver** mechanism (`merge=<name>` + `.git/config` `[merge "<name>"] driver = ...`) is NOT distributable via `.gitattributes` alone — every clone and every CI runner would need a separate, un-versioned local `git config` step to register the driver (e.g. `git config merge.ours.driver true`), or the merge falls back to a normal 3-way conflict anyway | Git documentation behavior for custom merge drivers; `.gitattributes` can only reference a driver name, not define it | revise | Do not choose a custom named driver (e.g. `ours` via a self-registered driver) as the default recommendation — it silently fails to protect anyone who has not separately run the local `git config` step, including CI unless a workflow step is added |
| Git's built-in `merge=union` attribute value requires **no separate driver registration** — it is a built-in merge type that works automatically for any clone or CI runner the moment `.gitattributes` is committed | Git core documentation; `merge=union` is listed alongside `text`/`binary` as a built-in attribute, not a custom driver name | none | Use `merge=union` instead — it is what actually achieves "no blocking conflict, works everywhere out of the box" without an undocumented, easy-to-forget setup step |
| `union` merge on a structured Markdown/table file can produce duplicated or overlapping content when both sides changed the same section (e.g. two different `current_gate` lines both surviving) | Reasoning from `union`'s line-level concatenation behavior; matches the "garbled Markdown" risk already flagged in the UR | warn | Explicitly require re-running `doctor`/`gate-check` after any merge touching `AGDF_RUN.md`, since `doctor` is already proven (this session, moments earlier) to catch exactly this class of control-file inconsistency |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: none
- scope_reason: The resolved approach is narrower than the UR anticipated — a single new `.gitattributes`
  file (one line) plus one short bullet added to `plugin/control/README.md`'s existing "Operating Rules"
  section (a natural, already-existing home for exactly this kind of control-file guidance). No change
  to `plugin/meta/agdf-runtime-contract.md`, no change to any skill, no change to `doctor` logic, no CI
  workflow change needed (unlike the rejected custom-driver approach, `union` requires no CI setup step).
  Fully reversible by deleting the `.gitattributes` line. No new product semantics, no new Mode/Slice
  Decision value, no architecture/policy/persistence expansion beyond this repo's own git configuration.
- evidence: Existing-System View and Reuse/Parallel-Structure Risk tables above; confirmed no live
  `.agdf/control/README.md` exists in this repo today, so the note is added to the shared template only
  (`plugin/control/README.md`), consistent with the UR's non-goal of not expanding scope to the
  `create-agdf` scaffold's shipped defaults beyond documentation.
- transparency_note: Quick Task Execution may now add `.gitattributes` at the repo root and one bullet
  to `plugin/control/README.md`'s "Operating Rules" section; nothing else.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: none yet — will link to a new node only if this pattern needs to generalize beyond this repo
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Narrow, repo-local git-configuration fix; not a durable cross-run product decision on its own.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — add `.gitattributes` (`\.agdf/control/AGDF_RUN\.md merge=union`), add one Operating Rules bullet to `plugin/control/README.md`, verify with a simulated concurrent-edit merge test and `check-runtime-integrity.mjs`/package smoke tests.
- forbidden_until_then: Any change to `agdf-runtime-contract.md`, any skill, `doctor` logic, or CI workflow.

## Quality Outlook

- quality_outlook: Resolves the concurrency risk this session directly observed, using git's built-in, zero-setup `union` driver rather than a custom driver that would have silently failed to protect anyone who skipped a manual `git config` step — a more honest, actually-portable fix than the approach first sketched in the UR.
