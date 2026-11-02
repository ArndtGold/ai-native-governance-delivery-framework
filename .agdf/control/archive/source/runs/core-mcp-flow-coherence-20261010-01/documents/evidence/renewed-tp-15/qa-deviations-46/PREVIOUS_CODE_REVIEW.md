# Code Review: bounded lifecycle admission
- decision: pass

Reviewed actual added close-map/deadline/admission diff, saturation tests and measured payload budget; the named bridge constructor was pre-existing and retained. Prior broader review is preserved in PREVIOUS_CODE_REVIEW.md.

No remaining defect is evident in this additional scope. Close identity is the explicit read session, not mutable selected Run or current bridge.session. Coalescing covers only an identical unresolved close; foreign extra fields fail before dispatch. The ordinary pending counter increments/decrements once and remains capped at eight. The independent close Map is bounded and cleared on success/rejection/timeout. Shared ten-second deadlines and Core-side close validation/capacity remain. A late explicit old-session completion preserves its replacement; failed/oversized/absent structured results remain errors. No approval operation or shared process is canceled/replayed/shut down by this change. Sensitive bootstrap/session tokens are not rendered or added to logs. Four regression cases, 230 components, 14 SDK cases, two assembled-Core cases and types/build substantiate this assessment.

The delivered Host may still remove its bridge before teardown. This known external gap and missing fresh native/UI 171a4a6d evidence are outside this scoped code pass and remain formal TP/QA input. No independent model reviewer or native Host qualification is claimed. Payload growth is exactly measured; file count and zero-headroom policy are retained.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TP42-CLOSE-QUEUE | implementation_gap | CD+Tests | resolved | VERIFICATION.json and four transport regressions: close dispatch succeeds despite eight reads, coalesces exact session, preserves replacement/read limits/deadline and honest errors | Retain this correction and collect the separately required actual native evidence before QA. |
