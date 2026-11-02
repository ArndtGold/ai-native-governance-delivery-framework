# Code Review Report: Doctor and Presentation Identity-Validation Parity

Date: 2026-09-01
Decision: pass
Scope: `git diff` over `create-agdf/lib/**` and `create-agdf/scripts/**` (6 lib files incl. new
`run-identity.js`, 3 test scripts, `plugin/meta/copilot-payload-baseline.json`)
Owner: agent

## Code Review

- decision: pass
- findings:
  - [fixed during review] `lib/control-evaluation/run-state.js` — `extractField` does not strip
    backticks while the canonical `scalarFields` does, so a legacy `` - run_id: `example` `` would
    have been falsely flagged; extraction now strips wrapping backticks for parity. Evidence: strip
    behavior in `run-state-parser.js:16` vs `verified-change.js:6-9`; fix retested green.
  - [advisory] `extractField` matches the first `- run_id:` line anywhere in the content, not only
    the Run Meta section; a same-named list item in a later section could shadow the meta value.
    Canonical and template states always carry the meta occurrence first; no realistic fixture found.
    No change made (would widen scope beyond the approved slice).
  - [advisory, intentional behavior change] `renderOperationalStatusCard` and
    `buildApprovalOrientationSnapshot` now return `null` instead of throwing when the locale registry
    itself is invalid (the precondition validators catch and report `locale_unresolved`); this is
    strictly more fail-closed for callers and no test relied on the throw.
- correctness: no cycle in the new import graph (`run-identity.js` is a leaf); diagnostics arrays are
  always non-empty when the key exists (`snapshot_unavailable` floor); doctor mapping covers exactly
  the two codes the validator can produce; envelope/status fallback lines degrade to the original
  copy when no diagnostics exist (backward compatible).
- security/data: no new IO, no path handling, no user-controlled strings in the appended CLI codes
  (all codes are fixed internal identifiers).
- regression: JSON report changes are additive; healthy states render byte-identically (pre-existing
  snapshot assertions untouched and green); canonical parser behavior and finding order unchanged.
- maintainability: one identity owner, validators consumed by renderers, no duplicated guard logic
  remaining.
- missing_evidence: live-host rendering of the extended fallback lines on Codex/Claude/OpenCode is
  not claimed; repository print-level tests only.
- risks: severity tightening for legacy states is intended; disclosed in TP Review and for the OR.
- required_next_step: QA gate with TP Review coverage, Clean Review and this report.
