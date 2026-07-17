# TP Coverage: Single-Install OpenCode Activation

Decision: pass
Date: 2026-07-17

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| OSA-01 | fully_done | `opencode-activation.js`; missing, invalid, valid and legacy fixtures in `lifecycle-test.js` | none | none |
| OSA-02 | fully_done | `opencode-plugin.js`; system-transform, compaction and shell-env fixtures | live host rendering is intentionally unverified | disclosed UAT limitation |
| OSA-03 | fully_done | `opencode.js` additive status contract and smoke assertions | none | none |
| OSA-04 | fully_done | scaffold plan/presentation; smoke fixtures prove no new `.opencode/**` or config fragment and legacy preservation | no explicit deletion command is introduced | none |
| OSA-05 | fully_done | sync owner, generated assets, `create-agdf/README.md`, `INSTALL.md`, Runtime Integrity | none | none |
| OSA-06 | fully_done | focused lifecycle, smoke, routing, integrity, skill-eval and whitespace evidence in `CD_TESTS.md` | live OpenCode observation is outside repository verification | disclosed UAT limitation |

## Summary

- fully_done: 6/6
- partially_done: none
- not_done: none
- out_of_scope_changes: no global skill rename, no deletion/migration command, no gate-authority change.
- risks: OpenCode host rendering and skill precedence remain an explicit UAT observation boundary.
- required_next_step: QA gate decision.
