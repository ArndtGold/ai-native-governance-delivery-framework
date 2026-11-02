# Task Plan: Product-Style Gate Transition Card

Status: approved
Gate: TP
Gate approval: `Approval: TP` (2026-07-14, deliberate native selection after transition-card UX revision)
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
| NGB-06 | Add deterministic locale resolution: configured `chat=de` uses German, absent/unsupported locale uses English, and one question never mixes locales. | Runtime contract, canonical skill and generated surfaces | Locale fixtures prove German and English-default output with identical gate semantics. |
| NGB-07 | Add or extend deterministic regression coverage for ready artefact, unavailable adapter, non-deliberate response, empty response, revise, decline, stale gate and changed run. | Control-state and routing tests | Every rejection leaves state unchanged; valid exact text remains accepted. |
| NGB-08 | Verify same-run, same-gate and durable-artefact revalidation immediately before persistence. | Control-state workflow | Regression evidence proves native presentation cannot write state directly. |
| NGB-09 | Run a bounded live Codex probe covering first eligible invocation, native rendering when callable and immediate exact-text fallback when unavailable. | Codex runtime evidence | Supporting evidence recorded without mutating AGDF state. |
| NGB-10 | Run a bounded live Claude Code probe covering first eligible invocation, the observed non-application case and immediate exact-text fallback. | Claude runtime evidence | Supporting evidence records whether the host applies the control without a second prompt. |
| NGB-11 | Synchronize generated assets and run runtime-integrity, control-state, routing, package smoke and whitespace checks. | Package and release checks | All required checks pass or limitations are explicitly classified. |
| NGB-12 | Review implementation against this TP, then run Clean Implementation Review and Code Review before QA. | AGDF review chain | Complete task-to-diff-to-test evidence map with no unexplained deviations. |
| NGB-13 | Replace the approval-time dashboard/status-table presentation with the localized three-part transition card after canonical readiness evaluation and before every user-gate approval request (`UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`). | Runtime Contract and canonical `gate-check` skill | Ready-gate evidence shows a human-readable title plus exactly the decision effect and next transition before buttons or exact text; it does not expose a table or raw control-state vocabulary. |
| NGB-14 | Keep the machine-readable Run Status Card and CLI status projection as audit/diagnostic outputs, while explicitly preventing them from becoming the primary approval-time user experience. | Runtime Contract, CLI and canonical `gate-check` skill | Contract and skill distinguish the audit projection from the user-facing transition card; CLI JSON compatibility remains unchanged. |
| NGB-15 | Add deterministic German and English-default transition-card composition for every user gate, including exact approval token, important remaining boundary, immediate internal action and next actual user decision when one exists. | Runtime Contract, canonical skill and generated surfaces | Fixtures prove `chat=de`, unsupported-locale English fallback, stable approval tokens and correct TP-to-Brownfield-Analysis semantics. |
| NGB-16 | Add negative presentation tests that reject Markdown tables, dashboard rows, raw keys, diagnostic codes, evidence lists, duplicated gate questions and false user gates in approval-time card guidance. | Runtime integrity and package smoke tests | Each prohibited approval-time pattern has an assertion; machine-readable CLI output remains permitted and tested separately. |
| NGB-17 | Update canonical-source integrity assertions and synchronize generated plugin/package mirrors without introducing a second renderer or approval authority. | Runtime integrity, package generation and mirrors | Canonical and generated assets agree; integrity and whitespace checks pass. |
| NGB-18 | Refresh CD+Tests, TP Review, Clean Implementation Review, Code Review and QA for NGB-13 through NGB-17, then present the revised experience for deliberate UAT. | AGDF review chain | Full task-to-diff-to-test traceability exists and UAT sees the product-style card before its native decision control. |

## 2. Scope constraints

- No custom UI, MCP/app renderer, hook-supplied approval or alternate store.
- No host configuration mutation as part of implementation.
- Native controls remain presentation adapters only.
- Exact textual approval remains authoritative and universal.
- `Approval: <GateName>` remains exact English in every locale; only presentation text is localized.
- Localized action labels map to stable internal `revise`, `decline` and `cancel` outcomes.
- German is used when `chat=de`; English is the default for absent or unsupported locales.
- No host-provided free-text or `Überspringen` action may advance a gate.
- The machine-readable Run Status Card remains informational, stable and
  available for audit or CLI use; it is not the approval-time product surface.
- The user-facing transition card answers only where the user is, what the
  decision does and what happens next.
- Approval-time presentation must not use a Markdown table, dashboard rows,
  raw control-state keys, diagnostic codes or evidence lists.
- The transition card distinguishes the internal next action from the next
  actual user decision in natural language and omits a user-gate claim when no
  further user approval is required.
- For TP approval, pre-implementation Brownfield Analysis is an internal next
  step, never a user gate and never a separate approval request.
- OpenCode changes are out of scope unless NGB-05 proves shared ownership.
- Live probes are supporting evidence and cannot replace deterministic tests.

## 3. Verification sequence

1. Reconfirm the existing presentation owners and preserve the CLI/API status
   projection boundary.
2. Update the canonical runtime and gate-check guidance for the three-part
   transition card.
3. Add German, English-default, per-gate transition and prohibited-pattern
   fixtures.
4. Synchronize generated surfaces and run runtime-integrity, control-state,
   routing, package smoke and whitespace checks.
5. Run bounded Codex and Claude presentation probes with zero approval-state
   mutation.
6. Refresh TP Review, Clean Implementation Review and Code Review.
7. Run QA and, if passed and approved, present the revised experience for UAT.

## 4. Completion criteria

- NGB-01 through NGB-18 have explicit implementation and evidence status;
  NGB-01 through NGB-12 may reuse still-valid baseline evidence, while NGB-13
  through NGB-18 require fresh evidence for this revision.
- Both Codex and Claude have a first-attempt native-or-immediate-fallback
  result, including a disclosed host limitation where applicable.
- Locale fixtures prove German `chat=de`, English default fallback and stable
  exact approval tokens across both outputs.
- The gate question communicates the decision, next step, revision path and
  no-decision exit without suggesting a bypass.
- The product-style transition card is visible before the native question and
  communicates the current decision, authority boundary and next transition
  without an internal dashboard/table presentation.
- The machine-readable Run Status Card remains available and backward
  compatible outside the primary approval interaction.
- Deterministic tests prove fail-closed authority and exact-text compatibility.
- Generated surfaces and package checks are clean.
- Reviews and QA are recorded before any UAT or delivery closeout decision.

## 5. Next gate

The revised TP was approved through the deliberate native `Approval: TP`
option on 2026-07-14. The next required step is the internal
pre-implementation Brownfield Analysis; no separate user approval is required
for that step and implementation remains forbidden until the analysis passes.
