# UAT Report: Human Decision Surface

Status: accepted
Date: 2026-07-17
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/QA_REPORT.md`

## Acceptance Scope

Validate the implemented candidate on a freshly installed or reloaded AGDF
runtime, not the current cached `0.8.0` skill copy.

## Required Live Checks

1. A ready user gate shows a localized human gate title and keeps the exact
   `Approval: <GateName>` value unchanged.
2. The primary card shows working `UR · PRD · SD · TP` links in stable order.
3. Native options appear in stable approve, revise, decline order with German
   labels/descriptions and no preselection or auto-resolution.
4. Dismissal or missing response is reported as cancel/no response, not decline.
5. If the native control is not rendered or returns no response, exact-text
   fallback appears once and carries identical semantics.
6. A status or internal-step query does not show approval buttons or raw process
   keys and does not mix German primary copy with English machine detail.
7. Keyboard and screen-reader names remain distinct with the host's own chrome
   language left untouched.
8. The first visible line is the localized action-oriented gate or internal-step title as a
   level-two Markdown heading or equivalent accessible host heading; generic AGDF/status labels are
   secondary only and the primary title appears exactly once.
9. A native adapter call that returns a value without a user-visible control or deliberate choice is
   reported as `attempted_not_applied`, persists nothing and falls back once to exact text. Decorated
   labels do not become exact approval values.
10. Every ready gate visibly renders the compact Run Status Card first, the separate Gate Transition
    Card second and only then the native control or exact-text fallback; neither card is merged,
    omitted, reversed, duplicated or hidden in tool context.

## Current Evidence

- Repository QA: pass and exactly approved on 2026-07-15.
- Full package smoke, integrity, negative, routing and package-content checks: pass.
- Current conversation native QA attempt returned no response and correctly
  fell back to exact text; this validates the fail-closed outcome distinction,
  but it does not validate the newly built candidate because the active skill
  comes from the cached `0.8.0` installation.
- Live user feedback on 2026-07-15 found that `AGDF-Status` was presented as the visual primary title
  while the understandable gate title appeared only as ordinary text. The existing PRD required a
  localized title but did not make first-line position, heading level or generic-title exclusion
  mechanically mandatory.
- Two live native attempts returned structured values while the user reported no visible button or
  deliberate choice. Internal adapter return was therefore incorrectly stronger than visible
  presentation evidence and must be handled as `attempted_not_applied`.
- Live feedback on 2026-07-15 found that the agent collapsed the required Run Status Card and Gate
  Transition Card into one combined block before the native attempt. The existing UR/PRD named the
  components but did not state the complete visible order and non-merging rule as a mechanical MUST.
- A live QA interaction after the revision-2 implementation rendered Quality Readiness and then
  invoked the native control without the required intervening Run Status Card and Gate Transition
  Card. The adapter also returned the decorated label `Approval: QA (Recommended)`. No QA approval
  was persisted. This proves repository snapshot/preflight tests do not by themselves enforce the
  actual agent-to-host tool-call order; end-to-end conformance remains unresolved UAT evidence.
- After exact QA approval, `gate-check` projected UAT as an eligible `gate_approval` with
  `native_attempt_required: true` even though this durable UAT report remains `Status: revise` and
  names failing end-to-end evidence. The projection is non-authoritative and must fail closed; no UAT
  control was shown.
- Fresh AGDF 0.9.8 UAT on 2026-07-17 visibly rendered the localized action-oriented Run Status Card
  first, the separate Gate Transition Card second, stable `UR · PRD · SD · TP` links, and then one
  exact-text fallback. The fallback visibly reported `unavailable_before_invocation`, preserved the
  undecorated `Approval: UAT` value and did not invoke a decorated native option.
- The user then supplied exact `Approval: UAT` for `agdf-human-decision-surface` after same-run,
  same-gate and revision-14 revalidation.

## Decision

- decision: accepted_with_disclosed_limitations
- accepted_evidence: The fresh 0.9.8 task visibly demonstrated the required two-card order followed
  by one safe exact-text fallback, and the user deliberately provided exact `Approval: UAT` after
  revalidation.
- missing_evidence: Native approve/revise/decline rendering, dismissal mapping and screen-reader
  behavior were not live-proven because native preflight was unavailable; repository tests remain
  the evidence for those branches and no host-visible native pass is claimed.
- required_next_step: Produce OR with the native-host evidence boundary retained; VCS and release
  actions require separate explicit instruction.
