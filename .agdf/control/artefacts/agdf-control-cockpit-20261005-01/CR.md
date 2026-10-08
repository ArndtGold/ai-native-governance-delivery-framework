# Code Review: Local read-only AGDF control cockpit

Decision: pass
Owner: code-review
Run: agdf-control-cockpit-20261005-01
Reviewed revision: 2e7b77ca-6d8f-424c-beb4-e68efaeb15cf
Scope: approved TP implementation; actual new source plus audited Core read-import/memo seams and measured runtime payload growth. Existing language/config repair is independent, including its baseline portions on overlapping paths.

## Review judgment

No open defect prevents the approved local read behavior. Reviewed immutable capture/descriptor/ancestor containment and retry/revalidation, Core read graph/native defaults, original approval target/proofs, per-view memoization and denied-scope propagation, DTO/resource/session boundaries, queue/deadline/cancellation/shutdown, passive document output, generation/retry/stale state, focus, dependency/package ownership and reproduction. Code evidence is supported by 26 new automated tests, actual approved-run parity and ten affected existing regression suites. The UI has no write/approval/dispatch/Git path and no parallel gate evaluator; full membership/byte assertions pass.

## Normalized findings

Classification/routes follow the canonical quality contract, Normalized Review Gaps.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| COCKPIT-CR-001 | implementation_gap | CD+Tests | resolved | Removed-run DTO now includes resources; src/api.ts validates nested data; UI tests prove accepted removed shape and denied malformed shape; browser removal journey passes | Retain the corrected DTO behavior and regression assertions |
| COCKPIT-CR-002 | implementation_gap | CD+Tests | resolved | src/feedback.tsx explicitly marks unknown values unavailable with Original context; German feedback tests and browser invalid/missing/unsupported/stale/retry observations pass | Retain explicit source context for unknown Core values |
| COCKPIT-CR-003 | implementation_gap | CD+Tests | resolved | server/service.mjs reads fixed-size asset buffers, rejects short/growing/identity-changed files and symlink assets; HTTP startup/boundary tests pass | Retain bounded fixed asset capture |
| COCKPIT-CR-004 | implementation_gap | CD+Tests | resolved | control-read/fs.js refuses memoization after swallowed resource_denied; repeated denied memo test, isolated contexts and actual parity prove fail-closed results | Retain denied-scope propagation before caching |

## Evidence and limits

EVIDENCE/source-fingerprints.json, snapshot/provider/projection/ui-tests/browser logs, regressions-results.json, real-approved-run-parity.json and screenshots. Review performed by the implementing Codex agent; no independent human reviewer or separate-agent review is claimed. Source/Chromium/package results are local; cross-platform native host behavior and UAT remain outside this evidence. Two pre-existing outside-control references remain explicitly blocked. A coherent source observation does not lock external writers. No source-of-truth drift, mandatory evidence gap or newly accepted technical debt remains in this implementation scope.

Documentation/Context Graph impact: resolved in CONTEXT_RECONCILIATION.md. Impact code: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL (evaluated projection reuses Core).

Required next step: qa-gate consumes this review and supporting plan/integrity evidence; this review does not decide final QA or deliberate approval.
