# Brownfield Analysis: Approved review remediation

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery` (unchanged)
- required_next_gate: `none`; next internal step is `CD+Tests`
- run_id: `agdf-review-remediation-20260929-01`
- approved_scope: PRD AC-001–AC-011, SD SDD-001–SDD-011 and TP T-001–T-013 / SCN-001–SCN-024
- reviewed_at: 2026-09-29
- reviewer: Codex

## Scope And Existing-System Evidence

| Workstream | Current coverage | Existing owner and evidence | Reuse strategy |
|---|---|---|---|
| Run, OR and Backlog | `partially_done`: single-file atomic Run writer and seal exist; closeout writes OR before Run and Backlog afterward; shared Backlog update lacks a lock. | `create-agdf/lib/control-state/run-state-writer.js`, `run-seal.js`, `run-steps.js`; `control-state-test.js`, `run-revision-test.js` | `extend` the control-state owner with a bounded recovery journal and shared lock; refactor its locked writer internally, without a second run state. |
| Locks and approval authority | `partially_done`: exclusive lock exists but carries no recoverable owner identity; `writeRun` accepts an unsealed state and skips approval-seal comparison. | `run-state-writer.js`, `run-seal.js`, doctor; exact approval remains `run-approve` | `extend` lock metadata and strict normal-write seal check; preserve explicit migration authority. |
| Trusted file reads | `partially_done`: seal checks canonical containment, while Run/Verified Change readers have host-dependent path validation. | `control-evaluation/run-state.js`, `verified-change.js`, `control-state/run-seal.js` | `refactor` one shared path predicate and reuse it at each read boundary. |
| Host config and deletion | `partially_done`: plans carry ownership intent, but `applyLifecyclePlan` writes and removes directly; OpenCode writes directly. | `lifecycle/operations.js`, `installers/opencode.js`, host adapters; existing lifecycle/OpenCode tests | `extend` current adapters with atomic replacement and execution-time ownership checks; no new installer policy. |
| Marketplace transaction | `partially_done`: stage, stable, backup and provenance exist; startup recovery treats backup presence as rollback evidence. | `installers/local-marketplace.js`, `local-marketplace-test.js` | `extend` existing transaction phase and provenance. The separate `legacy-profile-upgrade-recovery` run is at QA `revise` and retains historical-profile/Claude cache work. |
| npm package contents | `partially_done`: tarball inventory exists; legal files are absent from package sources. | Three package manifests, `create-agdf/scripts/package-contents-test.js`, MCP package test | `extend` package-local legal files and one existing inventory suite. The separate `agdf-npm-package-payload-cleanup` run remains at PRD and retains payload inclusion/exclusion. |
| Coupled release and CI | `partially_done`: `publish-agdf.yml` already publishes three packages, but `publish-create-agdf.yml` also has a standalone tag, publish validation lacks root `npm ci`, and version coherence omits the CLI lock. | Publish workflows, `version-coherence.js`, `.github/workflows/agdf-guardrails.yml`, `RELEASE.md` | `refactor` one coupled route and add exact registry read-back; reuse release preparation and clean-checkout CI. |
| Guard and public evidence | `partially_done`: canonical activation contract and generator exist; installed path and public evidence claims need exact-layout checks. | `plugin/meta/contracts/request-activation.md`, instruction-footprint generator, Eval runner and public documents | `extend` source/build/pack checks and narrow claims; no parallel rules or Eval system. |

## Owner And Parallel-Structure Assessment

- The selected run owns C1–C6, C7 post-commit cleanup, legal-file inclusion, coupled publish and bounded contract/claim fixes. It does not inherit approvals from either neighboring run.
- `legacy-profile-upgrade-recovery` revision 41 is at QA `revise`; its immutable snapshot and historical profile classification remain untouched. Any edit to `local-marketplace.js` is restricted to transaction commit/recovery behavior and must rerun its regression suite.
- `agdf-npm-package-payload-cleanup` revision 2 is at PRD; its proposed payload retention/removal is not implemented here. Legal files use the existing package-content test, without a second inventory owner.
- A closeout intent is temporary recovery metadata owned by control-state. Its values are checked against the canonical sealed Run and current file bytes; it cannot approve a gate or become a parallel source of truth.
- The existing guard contract, source-of-truth registry and Context Graph remain the normative owners. Generated guards, docs, diagrams and tarball inventories are projections or evidence.

## Architecture, Compatibility And Regression Impact

- Persistence: a closeout transaction spans Run, OR and shared Backlog. Single-file rename remains the durability primitive; a fixed run-then-Backlog lock order and recoverable intent cover cross-file interruption. T-001 must identify all direct readers and make each block or recover on pending intent before T-002 changes the write path.
- Approval and security: normal writes must require a valid current seal. Lock reclamation must prove the exact owner ended; time-only expiry and PID-only identity are insufficient. An ambiguous case stops with a named recovery action.
- Filesystem: POSIX and Windows lexical forms are validated independent of the current host; real paths and ownership are rechecked at execution. Existing public command names and successful JSON outcomes remain compatible.
- Release: package/version checks may reject previously tolerated stale lockfiles and missing legal files. The legacy standalone tag loses publish authority. Registry state, GitHub credential policy and a loaded host are external evidence, not inferred from a local test.
- Regression: use the existing control-state, Verified Change, lifecycle, marketplace, release-coherence, package, instruction-footprint and MCP suites named in TP. Keep fault injection and concurrency in isolated temp roots; run the Linux/Windows clean-checkout matrix before QA.

## Risks And Missing Evidence

- C1–C7 still need the isolated reproductions or counterexamples in T-001; this is an implementation task dependency, not permission to apply an unproven fix.
- The direct-reader inventory, exact fault points, Windows process-identity probe, simulated partial registry result and fresh host observations are not yet complete. T-001 and the mapped TP scenarios own them. If a supported direct reader cannot observe pending intent, or a process-identity probe cannot be made safe, stop T-002/T-003 and revise SD rather than bypassing it.
- Current uncommitted MCP inspect documentation and diagram edits belong to the separate inspect slice. They are kept outside this remediation's implementation evidence and QA verdict.

## Context Graph And Knowledge

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`, `CG-PUBLIC-PLUGIN-DISTRIBUTION`, `CG-REQUEST-ACTIVATION-AUTHORITY`
- context_graph_required_action: `link`
- context_graph_gate_effect: `warning` until final closeout reconciles exact decision evidence
- context_graph_evidence: Existing nodes own run state, public distribution and activation; this analysis chooses extensions within them and does not establish a new owner.
- memory_target: `scope_artifact`
- memory_reason: C1–C7 reproductions and fault logs are run-specific; durable invariant changes should later update existing Context Graph nodes after tests.
- memory_refs: this analysis, TP and future CD+Tests evidence for `agdf-review-remediation-20260929-01`

## Minimal Clean Next Step

Execute T-001 against the current source and isolated temp roots. Record the C1–C7 baseline and direct-reader inventory. For confirmed paths, implement T-002–T-012 in their named existing owners, keeping each regression scenario tied to TP. Do not mark CD+Tests done, claim QA or release readiness, or mutate a live installation from this analysis alone.
