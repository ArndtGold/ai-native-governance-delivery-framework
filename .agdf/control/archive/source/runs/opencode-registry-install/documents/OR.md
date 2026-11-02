# OR: OpenCode Registry Installation and Runtime Integrity

Status: pass
Gate: OR
Report mode: OR-full
Date: 2026-07-15
Owner: agent

## OR

- gate: `OR`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/opencode-registry-install/OR.md`
- status: `pass`
- delivered: Exact registry installation and migration away from fragile npx-cache `file:` dependencies, cache-independent package resolution, loadability/version transparency, global-surface preservation and repository activation boundaries.
- intentionally_not_delivered: Native Windows execution, future package publication, repository-local OpenCode activation, commit, push, pull request or release.
- evidence: Brownfield Analysis, TP Review, Clean Implementation Review, Code Review and QA pass; `Approval: UAT` accepted on 2026-07-15; real registry migration, package loadability, status checks, package smoke, Runtime Integrity, doctor and diff checks pass.
- missing_evidence: Native Windows execution remains a disclosed platform-validation gap.
- risks: An already-running OpenCode process still requires restart to reload an updated global package; this is expected session behavior.
- retained_fallbacks: Repository-local activation remains explicit via `opencode-repo`; no silent repository state was installed.
- context_graph_impact: `none`
- context_graph_reconciliation: `not_applicable`
- required_next_step: Offer delivery closeout; VCS and release actions require separate explicit instruction.
- quality_outlook: UAT accepted and the approved OpenCode scope is ready for handoff.
