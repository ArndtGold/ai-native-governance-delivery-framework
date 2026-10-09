# PR11 old QA smoke expectation

After both text-count corrections, final smoke-test.js reaches late-gate qa-revise but expects the legacy generic implementation action. Its fixture has a QA pointer/status only and creates no QA report, normalized findings or referenced review files. Current Core correctly returns authoritative owner routing, forbids implement code and QA/UAT approval, and returns no generic implementation authority.

QF-006 implementation_gap -> CD+Tests, bounded T003/T006/T007 fixture correction. Keep the fixture deliberately missing required findings and rename it to state that negative purpose; assert the current owner-routing action and retain existing QA approval denial plus an explicit implementation/UAT denial. Do not loosen production checks or fabricate ready evidence. The existing full qa-follow-up integration matrix passed in the clean canonical chain, including positive implementation and evidence routes and invalid/upstream/external/block boundaries.

Failure retained at /private/tmp/pr11-clean-final-recheck.log, first recheck results. Reexecute final smoke/routing and remaining Wrapper/Pages commands after this actual fixture correction. Unchanged failed condition is not retried; the source fixture changes before reevaluation.
