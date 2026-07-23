# Code Review: OpenCode Surface Hardening and Evaluator Parity

Status: pass
Date: 2026-07-23

## Code Review

- decision: pass
- findings: none open
- reviewed_scope:
  - installed-package resolution and package-local declaration containment
  - additive status schema, human output and install degradation/warning behavior
  - static governance ownership and defensive experimental hooks
  - evaluator-agent collision, mode, permissions and uninstall ownership
  - subprocess arguments, environment overlay, preflight parsing and event-stream trust boundary
  - conditional capability provenance, typed failures, mutation handling and persistence boundary
  - docs, generated assets and regression fixtures
- resolved_during_review:
  - Changed the evaluator from `subagent` to `primary` after host source inspection proved
    `opencode run --agent` otherwise falls back to the default agent.
  - Prevented a preflight-only/no-evaluation result from claiming `tool_enforced`.
  - Corrected SDK discovery for installed packages that do not export their package root.
  - Classified OpenCode JSON error events with HTTP 401 as authentication failures.
- missing_evidence: Authenticated live model output remains open under TPR-01.
- risks: Experimental hook declarations remain host-owned and are correctly reported as declaration
  evidence only.
- required_next_step: Run QA Gate with TPR-01 as an open evidence obligation.

