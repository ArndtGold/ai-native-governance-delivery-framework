# Task Plan: Reliable Native Gate-Approval Invocation

Status: draft
Run: `native-gate-buttons-live`
Derived from: `.agdf/control/artefacts/native-gate-buttons-live/SD.md`
Date: 2026-07-14

## 1. Task list

| task_id | Task | Owner area | Evidence / acceptance |
|---|---|---|---|
| NGB-01 | Trace the existing gate-check native-interaction decision point and confirm the first-attempt boundary has one owner. | `plugin/skills/gate-check/`; runtime contract | Reviewed source map; no parallel prompt or approval path. |
| NGB-02 | Specify the shared first-attempt outcome: native question rendered, or immediate exact-text fallback; no retry loop. | Runtime contract and canonical skill | Contract/integrity assertions cover both outcomes. |
| NGB-03 | Apply the Codex adapter wording and invocation guard for `request_user_input` without changing host configuration or approval authority. | Codex surface guidance and canonical metadata | Codex first-attempt and unavailable-capability behavior is explicit and generated surfaces remain aligned. |
| NGB-04 | Apply the Claude adapter wording and invocation guard for `AskUserQuestion`, treating delayed/non-applied controls as unavailable for that attempt. | Claude surface guidance and canonical metadata | Claude first-attempt, immediate fallback and no-retry behavior is explicit. |
| NGB-05 | Preserve OpenCode behavior and verify no shared change accidentally alters permission-question handling. | OpenCode mapping/config generation | Existing explicit allow/deny and fallback tests remain passing. |
| NGB-06 | Add or extend deterministic regression coverage for ready artefact, unavailable adapter, non-deliberate response, empty response, revise, decline, stale gate and changed run. | Control-state and routing tests | Every rejection leaves state unchanged; valid exact text remains accepted. |
| NGB-07 | Verify same-run, same-gate and durable-artefact revalidation immediately before persistence. | Control-state workflow | Regression evidence proves native presentation cannot write state directly. |
| NGB-08 | Run a bounded live Codex probe covering first eligible invocation, native rendering when callable and immediate exact-text fallback when unavailable. | Codex runtime evidence | Supporting evidence recorded without mutating AGDF state. |
| NGB-09 | Run a bounded live Claude Code probe covering first eligible invocation, the observed non-application case and immediate exact-text fallback. | Claude runtime evidence | Supporting evidence records whether the host applies the control without a second prompt. |
| NGB-10 | Synchronize generated assets and run runtime-integrity, control-state, routing, package smoke and whitespace checks. | Package and release checks | All required checks pass or limitations are explicitly classified. |
| NGB-11 | Review implementation against this TP, then run Clean Implementation Review and Code Review before QA. | AGDF review chain | Complete task-to-diff-to-test evidence map with no unexplained deviations. |

## 2. Scope constraints

- No custom UI, MCP/app renderer, hook-supplied approval or alternate store.
- No host configuration mutation as part of implementation.
- Native controls remain presentation adapters only.
- Exact textual approval remains authoritative and universal.
- OpenCode changes are out of scope unless NGB-05 proves shared ownership.
- Live probes are supporting evidence and cannot replace deterministic tests.

## 3. Verification sequence

1. Brownfield/owner trace and canonical contract update.
2. Deterministic control-state and routing tests.
3. Generated-surface synchronization and runtime integrity.
4. Bounded Codex and Claude live probes with zero approval-state mutation.
5. Package smoke and whitespace checks.
6. TP Review, Clean Implementation Review and Code Review.
7. QA gate and, if passed, UAT.

## 4. Completion criteria

- NGB-01 through NGB-11 have explicit implementation and evidence status.
- Both Codex and Claude have a first-attempt native-or-immediate-fallback
  result, including a disclosed host limitation where applicable.
- Deterministic tests prove fail-closed authority and exact-text compatibility.
- Generated surfaces and package checks are clean.
- Reviews and QA are recorded before any UAT or delivery closeout decision.

## 5. Next gate

Implementation may begin only after valid `Approval: TP`.
