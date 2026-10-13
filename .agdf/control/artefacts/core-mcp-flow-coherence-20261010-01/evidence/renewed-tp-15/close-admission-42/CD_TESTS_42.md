# CD+Tests: bounded close admission repair
- decision: pass

Run: core-mcp-flow-coherence-20261010-01. All approved source bytes and TP15 remain unchanged. Canonical review identified TP42-CLOSE-QUEUE and fresh routing explicitly permitted implementation under this TP; no UR/PRD/SD/TP approval was revoked or transferred.

## Implemented correction
The existing CockpitBridge owns the correction. Normal requests retain eight in-flight admissions. Close has an independently bounded, session-coalesced lane, so eight active reads cannot reject cleanup before dispatch. Shared ten-second acknowledgement deadlines remain. Additional close fields are rejected; late old-session replies do not retarget a replacement. Replies still require confirmed structured results, and neither timeouts nor errors claim backend closure. The existing Core close owner and session/worker capacity remain unchanged; no new tool, authority, timer policy, heartbeat or automatic business retry was added. The previously present named constructor is retained, not introduced by this repair.

## Actual executed checks
Red reproduction established busy rejection and duplicate close dispatch. Four new meaningful cases verify saturation, read-capacity retention, same-session coalescing, different/late-session ownership, bounded close capacity, unchanged deadline and honest error handling. All 230 UI tests and typecheck pass. Fourteen SDK/browser cases cover both locales and actual built resource; both actual assembled-Core tests pass after package refresh, including undecided iframe teardown with closed/session_expired and independent view preservation. These remain a synthetic browser Host. Package prepare passes with verified assets. Exact logs, source hashes and new UI digest 171a4a6d are in VERIFICATION.json.

Previous complete implementation evidence is retained in PREVIOUS_CD_TESTS.md and its original cited logs; unchanged business writers/revision/recovery proofs are not rerun. The seven-family controlled Core comparison remains fulfilled in matched-flow-41. This report is implementation/test pass only, not whole TP completion or QA pass.

## Remaining native boundary
The prior actual native candidate used UI b923b7e, not this new 171a4a6d resource. Its undelivered Host teardown is not explained by the saturated-read defect and is not claimed repaired. New actual native proof and remaining all-gate/locale/permission/cross-view/model observations remain open. Installed Codex Host binary is unchanged. Production and foreign MCP registration remain unchanged; no VCS action occurred.
