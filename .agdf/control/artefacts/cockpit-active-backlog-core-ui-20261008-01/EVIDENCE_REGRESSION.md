# Regression evidence
Date: 2026-10-08. Scope: SCN-018/019/021/023.

Core: 63 passing targeted cases (EVIDENCE_CORE.md). UI: 7 service plus 129 component cases (EVIDENCE_UI.md). Browser: final full rerun 20 passed; initial 19/1 and successful focused synchronization retry retained as history. Coverage retains authentication/containment, exact session/selectors, initial-run routing, bounded 12-row reads, 128-entry/256KiB title cache, hidden/cancelled reads, committed-title capture navigation, retry/expiry, document/context and publication boundaries.

Fresh prepared actual stdio protocol tests pass for both supported protocols, including independent named sessions, explicit Run opening, source capture rotation, denied stale/foreign selectors, tool inventory without writer access, context invalidation and fixture control-tree byte equality. Logs explicitly classify this as actual_stdio_protocol_not_host_ui. It does not satisfy the separately required native app-only observation.

Runtime source/generated integrity and private package/capability/config checks pass. git diff --check passes. Existing approved UR/PRD/SD/TP bytes remain immutable.
