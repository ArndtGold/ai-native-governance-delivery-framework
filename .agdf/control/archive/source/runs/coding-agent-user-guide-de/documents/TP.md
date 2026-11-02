# TP: German User Guide for AGDF in Coding Agents

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided on 2026-07-12
Based on: approved SD
Date: 2026-07-12
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| GDE-01 | Perform implementation-preparation Brownfield Analysis and freeze the documentation/link ownership boundary | AC 6-8 | Persisted pre-implementation Brownfield Analysis with call-site and dirty-worktree boundary |
| GDE-02 | Create `docs/agenten-handbuch/README.md` as the guide index and newcomer orientation | AC 1, 7 | Rendered Markdown review; working relative navigation links |
| GDE-03 | Create quick-start and gates/approvals chapters that reuse the Banking example as the complete structured scenario and add exact approval examples | AC 1-3 | Manual newcomer-path review; Banking and canonical runtime links |
| GDE-04 | Create workflows and multiple-runs chapters covering Quick Task, Structured Delivery, selection, ambiguity and lifecycle | AC 2, 4 | Manual scenario review; link/reference evidence |
| GDE-05 | Create closeout and troubleshooting chapters covering QA/UAT/delivery boundaries and common recovery actions | AC 5, 10 | Manual scenario review; no copied full command or gate table |
| GDE-06 | Add a single root README entry point and only necessary contextual links | AC 7, 8 | Diff review; no relocation of existing docs |
| GDE-07 | Run link, duplicate-source and wording scans; resolve every in-scope finding | AC 6, 8-10 | Command log, Markdown inspection and `git diff --check` |
| GDE-08 | Run TP Review, Clean Implementation Review, Code Review and QA Gate before UAT | Governance coverage | Persisted review and QA reports with no unresolved blocker |

## 2. Test Plan

- Verify each guide index and chapter link resolves to an existing local document.
- Verify the README entry point reaches the guide index.
- Search for duplicated complete approval/gate tables, installation command matrices and conflicting
  claims about approvals, run selection, QA or UAT.
- Read the request-to-UAT path as a newcomer and confirm every approval boundary is explicit.
- Inspect the diff to confirm existing `docs/00-07` files were not moved and no website documentation
  architecture was introduced.
- Run `git diff --check`.
- Run the smallest relevant existing runtime/package checks for touched documentation owners.

## 3. Brownfield Scope

- `README.md` reading path and project structure section.
- `docs/00-07` and `docs/glossar.md` for terminology and contextual links.
- `INSTALL.md`, `agdf/README.md`, `create-agdf/README.md` for link-only boundaries.
- `plugin/meta/agdf-runtime-contract.md`, `plugin/meta/agdf-agent-router.md`, `plugin/skills/` and
  `plugin/control/README.md` for authoritative operational wording.
- Current staged/unstaged worktree boundary; unrelated run-scoped control-state UAT work must remain
  intact.

## 4. Out Of Scope

- Runtime, skill, CLI, installer, package or plugin-manifest changes.
- Moving or rewriting existing numbered framework documents.
- Website documentation architecture or full content duplication.
- English translation and surface-specific guide forks.
- Commit, push, PR, release or publication.

## 5. Risks And Blockers

| Risk | QA effect | Required evidence |
|---|---|---|
| Guide duplicates a normative owner | block | Link/source scan and review prove one owner per rule class |
| Approval examples imply implicit consent | block | Newcomer scenario explicitly distinguishes intent from `Approval: <Gate>` |
| Run-selection explanation contradicts resolver behavior | revise | Manual scenario cross-check against canonical control README/runtime wording |
| Existing docs are relocated or broken | revise | Diff and local-link checks |
| Guide becomes a second website source | revise | Diff confirms a link-only website boundary |

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
