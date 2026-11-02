# Brownfield Analysis: Four AGDF approval-chain defects

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-10-17
Reviewer: Claude Code (agent), cooperative local analysis

## Scope

Renewed approved TP (after TP source revision 16da48f8) tasks T-001 to T-010 for D1 to D4, against the existing system on branch `fix/agdf-core-approval-defects-20261017` (base `main` 16d08888).

## Existing Owners And Reuse Path

| Task | Existing owner | Current coverage | Reuse strategy | Evidence |
|---|---|---|---|---|
| T-001 | `packages/core/lib/control-evaluation/report-decision.js` `readAuthoredContent` | partially_done: localized profile stops at the first unknown or non-matching label | extend the localized branch only | Lines 167-201; the key regex rejects `Problem (Messlücke)` and `summaryFields` lacks `nicht-ziele` |
| T-002 | `decision-content-readiness.js` `observeDecisionContent`; `run-presentation-render.js` `requiredLocalizedSummary`/`evaluateApprovalSummaryReadiness`/`renderApprovalSummaryIssue`; `ur-readiness.js`; `control-inspect/artifact-readiness.js` | not_done: presentation validates size, ellipsis and PRD ids only | extract the UAT field checks into one exported function and call it from `requiredLocalizedSummary` | `decision-content-readiness.js` lines 56-94; `run-presentation-render.js` lines 142-188; `ur-readiness.js` line 35; `gate-check.js` lines 413-421 block UR presentation through `AGDF_UR_REQUIREMENTS_INCOMPLETE` |
| T-003 | `gate-check.js` `statusFromReviewArtefact` | partially_done: keyword scan only | extend in place | Lines 263-270; writer mapping `run-steps.js` lines 214-240 |
| T-004 | `run-state-writer.js` `withOwnedFileLock`, `reclaimAbandonedLock`, `ownerState`, `lockError` | not_done: no ownership announcement, no own-token release | extend; reuse the reclaim guard and compare-then-unlink protocol | Lines 96-232; `packages/cli/lib/mcp-dispatch-runtime.js` imports Core through `#agdf-core` |
| T-005 | `packages/mcp-server/src/worker.js`, `worker-entry.js`, `server.js` | not_done: executor tracks no locks | extend message handling and `release()`; inject release function | `worker.js` lines 24-90; `main.js` already loads `create-agdf/mcp-dispatch-runtime` in the main thread; tests `safety.test.js` (draining, hung) and `run-command.test.js` (held worker) cover capacity |
| T-006 | `gate-policy.js` `gateDecisionForRunState`; `closeout-readiness.js`; locale registry `plugins/agdf/meta/agdf-interaction-locales.json` | not_done: no review requirement before QA | add one branch after the CR check and the QA non-pass branch; shared constant; new `operationalValues` keys in en and de (English value equals the canonical text) | `gate-policy.js` lines 275-340; `closeout-readiness.js` line 41; `isInternalStepSatisfied` in `run-state.js` lines 284-292 |
| T-007 | `run-operation-proof.js` `internalStepEligibility`; `presentation-decision.js` `approvedMaterialFindings`; `evidence-bindings.js` `evidenceApplicability`; `closeout-readiness.js` | not_done | extend eligibility with one guarded branch; recompute material version and QA association only for absent late review types | `run-operation-proof.js` lines 36-48; `presentation-decision.js` lines 72-82; `evidence-bindings.js` lines 69-97 (a source recorded as missing that is now present makes QA `applicability_unknown`); `gate-policy.js` line 370 blocks on `approved_material_sources_changed` |
| T-008 | Existing tests and fixtures | partially_done | update only fixtures that the stricter checks reject | Structured fixtures that reach QA: `packages/mcp-server/test/structured-flow.test.js` and `packages/core/test/run-closeout-command-test.js` already record both reviews; others found by running the suites |
| T-010 | `scripts/payload-budget.js` (review and `--accept`), `plugins/agdf/meta/copilot-payload-baseline.json`, `scripts/public-plugin/copilot-profile.js` | done (tooling exists) | reuse | Baseline 260 files/2256982 bytes has zero headroom; current measurement 260 files/2270071 bytes (+13089); the tool keeps digest, source, inventory and version checks and only re-pins the ceiling |
| T-009 | `scripts/verify-ci.mjs` stages `generate`, `assemble`, `prepare`, `mcp-dependencies`; `packages/cli/package.json` `smoke-test`; `packages/mcp-server/package.json` `test` | done (tooling exists) | reuse | Prepare profile built once in this worktree; mcp-server dependencies install from `dist/npm/create-agdf` |

## Interfaces And Data

- No persisted schema changes: lock owner record, RUN_STATE sections, receipts and evidence bindings keep their formats.
- New additive Core exports: `localizedDecisionFieldGaps`, `releaseAbandonedOwnedLock`, `STRUCTURED_REQUIRED_REVIEWS`, an exported per-source association comparison. New additive diagnostic reason `approval_summary_field_unreadable` and one new worker message type `lock`.
- `packages/cli/lib/mcp-dispatch-runtime.js` re-exports `releaseAbandonedOwnedLock`; the MCP server keeps importing only `create-agdf/mcp-dispatch-runtime`.
- Package boundaries (`scripts/check-package-boundaries.mjs`) allow `node:diagnostics_channel` in Core.

## Regression Risks And Test Impact

- D1 stricter UR/QA presentation: existing localized fixtures without a readable goal or QA fields may now fail; the CLI `artifact-language-test.js`, `intake-continuation-test.js`, Core `decision-content-test.js`, `artifact-readiness-test.js` and mcp-server `whole-flow.test.js` exercise localized summaries and must be rerun.
- D1 reader widening: report-decision context matrix in `report-decision-test.js` and `decision-content-test.js` must stay green; only the localized profile changes.
- D4 prevention: any test that expects `Approval: QA` presentation on a structured route without review rows changes behaviour; `interaction-presentation-test.js`, `control-state-test.js`, `cli-gate-scenarios-test.js`, `qa-deviation-acceptance-test.js` and mcp-server `structured-flow.test.js` are the candidates.
- D4 integrity exception: `presentation-decision-test.js`, `evidence-bindings-test.js` and the closeout tests must keep rejecting every other change.
- D3: `run-lock-test.js` assertions stay unchanged; `safety.test.js` capacity semantics stay unchanged; the new real-thread test needs the rebuilt prepare profile.
- Operational localization: `test:operational-localization` scans control-evaluation strings; new next-action text needs en/de entries.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-MCP-DISPATCH-ADAPTER; CG-RUN-STATUS-CARD
- context_graph_required_action: link

## Minimal Clean Implementation Path

T-001 to T-007 are implemented in the worktree (retained across the TP revision); next T-008 fixture fallout, then T-010 exact re-pin after the last code change, then T-009 rebuild and suites. No parallel structure is introduced; every change extends its existing owner.

## Decision

Decision: pass
