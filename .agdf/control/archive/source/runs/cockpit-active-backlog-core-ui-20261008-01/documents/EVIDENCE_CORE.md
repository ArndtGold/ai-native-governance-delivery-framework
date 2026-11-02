# Core evidence
Date: 2026-10-08. Scope: T-002; SCN-001/002/005/007/008/015/016/019 and regression boundaries.

Final command: `node --test --test-concurrency=1 packages/core/test/cockpit-list-test.js packages/core/test/control-cockpit-projection-test.js packages/core/test/cockpit-backlog-title-test.js packages/core/test/cockpit-session-test.js packages/core/test/cockpit-scoped-read-test.js packages/core/test/cockpit-changes-test.js packages/core/test/cockpit-context-test.js packages/core/test/cockpit-publication-test.js`.
Exit 0, 63 passed, 0 failed. Full log: evidence/core-final.log.

Seven new pure-policy tests cover selected-section reverse order, Active Completed preservation, raw array and opaque selector immutability, per-field search including cross-field exclusion, known/unknown prefixes and provenance, source-bound original-position identity across title capture replacement, unavailable null counts, scoped/unscoped diagnostics, cross-section duplicate selectability, contradictory counts, and whole-area search before preview slicing. Existing projection/session/scoped/context/publication suites remain passing.

The initial concurrent run reported a watcher timeout in atomic backlog replacement (evidence/core.log). Its focused unchanged retry passed (evidence/changes-retry.log); the final sequential-file run above also passed. No watcher assertion, timing or implementation was weakened.
