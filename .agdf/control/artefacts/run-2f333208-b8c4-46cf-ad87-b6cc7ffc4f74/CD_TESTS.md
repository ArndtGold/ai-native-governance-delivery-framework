# CD+Tests: Planned URs and backlog-free Core

Decision: pass
Date: 2026-10-31
Reviewer: Codex implementation owner (AI-assisted; no independent human acceptance)
Run: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74

## Scope and approved sources

Implemented approved TP T-001 through T-012 after recorded implementation-preparation Brownfield Analysis. TP digest sha256:91f1d9e72388a7baf9a47266c22b7d62afbe898a2e1bae47726791e0cd97244f; PRD/SD and UR remain unchanged. T-013 reviews and QA follow this evidence; this record does not approve them. Base Git HEAD 8e482d913289f0d2b466128d6d2a0d8b5815f0a3; changes remain uncommitted in the dedicated worktree.

## Delivered result

Independent digest-bound planned URs and priority; shared Core UR authoring; explicit idempotent selected-source handoff with immutable origin/snapshot; derived combined inventory; CLI/MCP/passive Cockpit integration; optional skill-only Codex Planning package. New initialization uses planned-urs-v1, v3 Runs and strict v6 Run-local journals. Legacy v2/journals 1-5 keep their predicates. Ordinary admission is per operation; explicit bounded migration uses snapshot proof, freeze/drain and recoverable cutover. No actual repository migration was applied.

## Actual checks and evidence

Paths below are relative to this Run artefact directory. IMPLEMENTATION_STATUS.md details executed commands, retained failures, applicability and limits; evidence/implementation/source-snapshot-summary.json binds source bytes and native-candidate.json binds packaged candidates.

- G-01/G-02/G-03/G-04: 76/76 planned Core/CLI tests pass (evidence/implementation/core-cli.log), including capture/CAS/negative input, process interruption, independent progress/contention, handoff/replay/origin and explicit lossless migration/recovery. Legacy approval and changed versioned recovery/closeout/source-revision paths pass their targeted regressions. The earlier failed chain is retained with corrections and focused rechecks, not called a passing full suite.
- G-05: HTTP 8/8 and UI 25 files/283 tests pass, typecheck passes. Affected real browser cases and final assembled-Core handoff visibility cases pass. Browser duplicate-close defect fixed and rechecked. See ui.log, ui-typecheck.log, browser-affected.log, browser-palette.log and browser-final-candidate.log.
- G-06: actual STDIO both protocol eras pass. Native-discovered planned Inspect classification/availability defect reproduced on old candidate (0/2) and corrected runtime passes 2/2, including stale-digest/unreadable-store negatives; error contracts and Core authoring 4/4 pass. See native-read-regression-before.log, native-read-regression-after.log, native-read-errors.log, native-read-core.log. Schema parity covers 3036 cases; material/request/result budgets retain their existing bounds.
- G-07: generation/assembly/package/payload checks pass; 1538 package files; current Copilot payload 452 files/4,925,832 bytes. CI verification plan 27/27 passes; new tests registered through existing domains/smoke/MCP inventory. Final compatibility 56/56 passes, source fingerprint a9e98d060ad2af2390e464ee3c266bd3589ced503451248f1d3d3dad7d53a407, freshness passes. Actual remote CI remains required before any later merge, not claimed executed here.
- G-08: NATIVE_QUALIFICATION_REPORT.md and evidence/implementation/native/manifest.json retain actual Core-only and Core+Planning Codex CLI/macOS tool exchanges and stored outcomes on unchanged Core 0.20.2+codex.local-826ca9884801. Both pass, including incomplete-to-complete same-UR dialogue, priority, exact handoff/status/replay, direct Core Run creation and missing approvals. Previous global Core/config restored exactly. Existing ChatGPT login only; no credentials acquired/read/copied.
- Real Worktree preview: 156 Runs; all 316 backlog lines accounted; 3 drafts; 0 blockers; 105 explicit findings. All 14,240 Control entries/631,450,625 file bytes unchanged. See worktree-preview.json/worktree-readonly.json. This is read-only preview, not completed cutover or trusted repair of unresolved history.

## Brownfield preservation and corrections

Preserved prerequisite routing repair, unrelated dirty work and primary checkout. Verified Change now excludes only the active writer's exact admission claims from foreign-path detection; 8/8 targeted checks pass and foreign/replaced claims remain visible. Interrupted partial preview publication with foreign bytes remains effect_unknown without cleanup; exact fixture restoration permits supported resume. Initial native candidate failure was fixed in the existing MCP classifier/Inspect owner, regenerated, and qualified under normal Codex workspace permissions. Failed startup/attempt evidence remains retained.

## Context Graph and limits

- memory_target: context_graph
- memory_reason: reconcile existing inventory/closure ownership after verified new-layout implementation
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; run_inventory_20261030; run_closure_20261029
- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: existing two nodes now state legacy/new-layout distinctions, shared derived inventory, immutable origin and actual CLI evidence/limits

No Desktop/Cockpit-native, other-host/native Windows, human QA/UAT, remote CI, permanent installation, actual migration or release claim. Migration limits are explicit (256 Runs/32 MiB journal); unknown/foreign state refuses. Temporary fixture clarification is synthetic test input. Mandatory TP/Clean/Code reviews and sole QA decision remain separate. No commit/push/PR/merge was performed.

## Next step

Complete mandatory Task Plan Review, Clean Implementation Review and Code Review, then the sole qa-gate assessment using retained candidate-bound proof. Do not infer human QA/UAT or publication authority.
