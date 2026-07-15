# UAT Report: Human Decision Surface

Status: pending_live_runtime_evidence
Date: 2026-07-15
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

## Current Evidence

- Repository QA: pass and exactly approved on 2026-07-15.
- Full package smoke, integrity, negative, routing and package-content checks: pass.
- Current conversation native QA attempt returned no response and correctly
  fell back to exact text; this validates the fail-closed outcome distinction,
  but it does not validate the newly built candidate because the active skill
  comes from the cached `0.8.0` installation.

## Decision

- decision: pending
- missing_evidence: Fresh candidate installation/reload and deliberate live host acceptance.
- required_next_step: Install or reload the candidate plugin, run the live checks above, then request exact `Approval: UAT` only if accepted.
