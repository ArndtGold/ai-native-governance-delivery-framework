# Brownfield Analysis — renewed TP 15

- mode: pre_implementation_analysis
- decision: pass
- run_id: core-mcp-flow-coherence-20261010-01
- source_revision_id: 74bbd9f0-9f8a-4059-9b08-c950912b6c32
- TP_digest: sha256:f64d2aa07acead86ce8176a9062f43c87b0d2df7b4d7df82851db1b18fcb5ce3
- scope: T-001 through T-019; implementation preparation only, no QA decision

## Existing system and reuse

The current dirty checkout already contains the fixed-group Core command flow, exact approval/presentation ownership, operation receipts and recovery, sealed source history, snapshot document reader, cooperative human-intent boundary, React decision entry, and runtime generation facade. Reuse these owners and their tests. Earlier reports declaring generation facade or immutable package retention absent are historical and do not describe this baseline. Their actual current implementations are present, but renewed tests and real native proof remain required.

| Boundary | Current coverage | Strategy and owner |
|---|---|---|
| Core read/write, receipts, material-version decision guard | partially_done for renewed intent | extend existing command/service/approval owners, no second ledger |
| Source revision | partially_done: legacy CD+Tests and early UR/SD predicate | extend existing boundary, proposal, history and transaction owners with explicit policy 2; preserve legacy semantics |
| QA invalidation | not_done for complete pre-UAT matrix | withdraw affected report and approval together through existing revision writer and evidence bindings |
| Native card and Chat | partially_done: exact reader and guarded three-action card exist | simplify product projection to approval-only; display-aware Chat and exact remote document access through existing presenter/session |
| Host continuation | not_done: DecisionEntry port has document, submit, inspect and expand only | show truthful next-step information and Chat continuation when no supported host-to-agent path exists; do not invent a working action |
| Runtime generations and executable retention | partially_done for renewed qualification | reuse generation.js and mcp-lifecycle/package.js; qualify bounded three slots and claims |
| Required reviews, localization, native/iPad and flow measurements | not_done against renewed TP | fresh evidence/renewed-tp-15 namespace; historical reports do not fulfill new source |

## Risks and clean implementation sequence

1. Pin new proposal schema 2 and receipt schema 3 to policy version 2. Share the live/archive validator and original initiating phase. Keep legacy schema 1 proposals and receipt 1/2 interpretation byte compatible. Exercise all 18 source/phase cells, unsupported lifecycle, stale/foreign intent, interrupted write and replay.
2. Reuse exact Run then Backlog lock order and existing transaction/recovery. Use registered evidence bindings for quality applicability; unknown dependency is renewed, never retained as current. Archive exact QA and presentations before withdrawing affected approval.
3. Keep Core request-change/reject capability but remove these controls and decision comment form from user UI. Discussion remains ordinary Chat. Preserve single effect for one presentation across Chat and native card.
4. Separate actual current-surface display from advertised host capability and Mac visibility. Unsupported/unconfirmed surface gets one complete Chat decision card. Full exact snapshot text remains private and bounded; no public upload or second store.
5. Reuse all shared view meanings/locales. Verify contextual primary action, document return/focus and stale/uncertain recovery. Browser/source tests cannot prove native keyboard, iPad accessibility or Host teardown.
6. The Host close-before-disconnect defect remains external. Verify Core close and expiry separately, and keep unproved Host behavior open. No automatic installation synchronization, restart, foreign MCP edits, forced process termination or VCS action.

## Baseline and parallel work protection

Fresh BASELINE.json, BASELINE_WORKTREE.patch and BASELINE_INDEX.patch capture HEAD 01731da1be90659c25706b89c2d7acd494e0862f, all existing dirty files and foreign control hashes before product changes. ACTIVE_INVENTORY.json is a complete 53-active-Run inventory: this Run has no findings; unrelated findings/warnings remain untouched. Approved UR/PRD/SD/TP and historical evidence are protected. No reset, staging or commit is part of this implementation.

## Missing proof and authority

The preparation path is understood and has no unresolved source/ownership decision blocking implementation. This pass means preparation is complete; it does not mark any implementation task, test, native capability, QA, UAT or closeout fulfilled. Execute the approved TP, then register only actual results with exact source bindings. The productive installed runtime is not yet the renewed candidate and native qualification remains unproved.

## Inspected owner identities

- packages/core/lib/control-state/run-revision-boundary.js: sha256:dd17b8b12283c22cc7bfa23ae274920713336075e30935230941d019ea348317
- packages/core/lib/control-state/run-revision.js: sha256:1b0b6a0ff4a95576c710e8cad14f8b21c2948f7fa72a860cd38290074b2c022a
- packages/core/lib/control-state/run-source-revisions.js: sha256:3c1076ec8fd19f8da449befda60fa4ddd9f5d79973cea7548b557e9427ec2602
- packages/core/lib/control-state/run-revision-history.js: sha256:8c3d7a56bd9ff2c9bb3117d5739b316edbfa83334746edcab525c819f7f773ce
- packages/core/lib/control-state/evidence-bindings.js: sha256:3a05450e6089180f1677b6e97e4b59a8c1d3263c4081947513ec0fc776a05011
- packages/core/lib/control-state/run-command-contract.js: sha256:afd6595c860a97a175527ef68a39ff3cfbf8de800b9dda41144eec37474b1fde
- packages/core/lib/control-state/run-presentation-render.js: sha256:aef8f1a69d01c7efef6370d0bd3dfd9fb993745ddb8f81ae2fd782cfccf00f74
- packages/core/lib/control-inspect/decision-session.js: sha256:766742a0a782be15140311f86ef8355e3766cc1079a547f220fa4900b882ab72
- packages/control-ui/src/mcp/DecisionCard.tsx: sha256:bc24e09f2a0fcb271e5112ce594db06f7f0aecffca0adfac7b07f724adce52e9
- packages/control-ui/src/mcp/DecisionEntry.tsx: sha256:fd2e840e8981ceef9d9ffce02acf7fa8ad7d15733e38910b887dc924e09dc86e
- packages/mcp-server/src/generation.js: sha256:e9fb6e14b6dbccee77e25301f0a7762f385bce594dde33e29d7a98c07445dde6
- packages/cli/lib/mcp-lifecycle/package.js: sha256:46b3eb2f2b906f87469c2743785be8a3167730a93624fab1bbaaca8e4078f564
