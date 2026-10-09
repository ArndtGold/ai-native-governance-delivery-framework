# UI and adapter evidence
Date: 2026-10-08. Scope: T-003/T-004/T-005; SCN-003/004/006/008/009/011/013/016/017/018/019/020/021.

`npm --prefix packages/control-ui test`: exit 0; 7 service tests and 129 Vitest tests across 13 files passed. Log: evidence/ui-final.log. `npm --prefix packages/control-ui run typecheck`: exit 0 (evidence/typecheck-final.log).

The suites verify shared compact/expanded projection, controlled query retention and area reset, first-five rendering after full search, exact key navigation, initial Run binding, invalid/duplicate disabled rows, removed-versus-preview-hidden feedback and return focus, partial/unavailable counts and per-field search. SCN-016 explicitly rejects contradictory counts through both snapshot and title-response adapter validation.

Supplementary UR completion, failure and cancellation cannot change the stored primary title/search. Existing title batching/cache/cancellation and scoped recovery regressions pass. Overview source changes remain stale with disabled selection until deliberate reload; selected Run background refresh and document deliberate reload remain separately covered.

Browser suite: initial full run 19 passed / 1 failed out of 20 (evidence/browser-first.log). The sole failure was an obsolete title-batch synchronization expectation: stored primary titles now render before asynchronous supplementary headings. The test now awaits the heading before measuring bounded batches; its focused retry passed (evidence/browser-retry.log). No production behavior was changed for that retry. After the resolved CR-001 focus correction, the final complete browser rerun passed all 20 cases (evidence/browser-final.log). The four deliberate-reload cases also pass with explicit closed-source-disclosure assertions (evidence/changes-browser-final.log).

SCN-021's existing committed-title capture barrier is in test/browser/scoped.spec.mjs (the approved TP mentions backlog-titles.spec.mjs). The full run executed this existing scenario successfully. This is an evidence-location clarification, not a change to approved behavior or scope.
