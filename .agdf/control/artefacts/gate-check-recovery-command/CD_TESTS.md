# CD+Tests: Consistent Gate Recovery and Approval Eligibility

Status: done
Date: 2026-07-16
Run: `gate-check-recovery-command`
Approved plan: `.agdf/control/artefacts/gate-check-recovery-command/TP.md`

## Delivered

- Added one semantic ready-user-gate predicate shared by status-card classification and approval-snapshot attachment.
- Corrected approval-ready UR projection from `blocked` to `open` while preserving exact approval authority and implementation prohibitions.
- Made ambiguous-run recovery target-aware so `gate-check` offers only `--run` and `AGDF_RUN_ID`, while supported aggregate commands retain `--all-active`.
- Added one concise top-level CLI error boundary for expected invalid option/target input.
- Made decorated-only transport a non-invocation rule in the Runtime Contract and gate-check skill; the forbidden `(Recommended)` value is explicit.
- Extended Runtime Integrity and synchronized generated package assets through the canonical sync command.

## Test Evidence

| Check | Result | Coverage |
|---|---|---|
| `node create-agdf/scripts/control-state-test.js` | pass | Six ready user gates, ambiguous recovery, illegal option presentation, exact approval boundary |
| `node create-agdf/scripts/interaction-presentation-test.js` | pass | Eligible invocation, decorated-only zero invocation, canonical value and retry identity |
| `npm --prefix create-agdf run smoke-test` | pass | Package aggregate, routing, control state, interaction, verified change and delivery search regressions |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass | 9 skills and 15 control files; decorated-only instruction/capability parity |
| selected `doctor --run gate-check-recovery-command --json` | pass | Durable selected-run control state |
| `git diff --check` | pass | Whitespace integrity |

## Deviations

- `create-agdf/lib/interaction-presentation.js` required no production edit because its canonical capability preflight and invocation guard were already correct and directly tested.
- Context Graph reconciliation reused the existing resolver and native-interaction nodes; no duplicate node was created.

## Scope Control

No new public flag, schema, adapter, gate semantic, retry loop, fallback policy or parallel source of truth was introduced. Unrelated dirty-worktree changes were preserved.
