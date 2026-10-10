# Verification boundary

Implementation, real shared Core authoring checks, session/source/pool transitions, authenticated browser route, App reducer/controller and built UI are tested. Evidence contains actual command output, captured baseline/current source hashes, qualified runtime/UI identities and rendered images. Stdio testing uses the final MCP_PREPARATION.json on both supported protocol variants and explicitly reports native_ui_observation=false.

The final incremental source scope contains 26 paths. Public runtime assets are produced by the official sync/assembly owners. Copilot's measured exact cap is 215 files/1794066 bytes: MCP README +1270 bytes, shared authoring extraction -53 bytes; private UI/dependencies and cockpit-only source remain excluded. No speculative allowance or assertion weakening was introduced.

Protected UR/PRD/SD/TP, other Run states and earlier review/QA history: 15 exact files checked unchanged in PROTECTED_AFTER.json. Current Run progression and its own new evidence are permitted separately. No Git commit, push, PR, publish, global installation or registered native-runtime replacement occurred.

The original sandbox failures (loopback EPERM; native fs-watch notification) are retained. HTTP tests passed outside sandbox, and the exact fs-watch suite passed two cases on host. This does not relabel the failed sandbox execution as passing.

## Actual scenario evidence pointers

- SCN-001/002/004/006/010/011/019: standalone artifact-readiness cases and core-draft-check.log, plus Core source/race and report parity inspection.
- SCN-003/004/005/007/009/010/020: core-draft-check.log; inherited actual session/pool/publication/capture regression suite; core-changes-host.log; final scoped-mcp.log and MCP contract/safety/protocol regressions. Generic worker limits remain under the unchanged bounded pool owner.
- SCN-008/010: browser-service.log, exact authenticated route/method/origin/query cases and before/after fixture byte equality.
- SCN-011/012/013/014/015/016/017/020: ui.log and final ui-draft-check.log, validated data/guarded reducer, explicit action/duplicate/focus, delayed navigation completion, busy/retry/reload, finite unresponsive deadline and rejected late success; existing reading/context lifecycle regressions.
- SCN-015/016/017/018: browser-draft-check.log and 24-case browser-regressions.log; inspected compact/expanded 390/1100 images and long actual Core correction images; keyboard focus, source disclosure, no horizontal overflow, scroll/resize/reload and operation byte invariants.
- SCN-021: Source/build/packaged stdio/protected evidence present. Fresh exact-build native sequence present in NATIVE_FINAL_OBSERVATION.json/md; NATIVE-001 resolved. Actual host initialization, enforced UI capability, native busy/retry/source recovery, attributed user controls, explicit native close/expired and user view closure are distinct from stdio/browser proof.
- SCN-022: BASELINE.json/patch/files, PROTECTED_SOURCES.json, SCOPE_LEDGER.md, SCOPED_DELTA.json/patch.

Browser/DOM emulation and source reasoning do not prove native host behavior. No previous user confirmation or older screenshot is assigned to this build. Read TASK_PLAN_REVIEW.md for fulfillment and evidence limits; only qa-gate decides final quality readiness.


## Final native completion

NATIVE_FINAL_OBSERVATION.json/md and PROTECTED_FINAL.json verify unchanged 26 source/build identities and 15 protected files. Temporary probe startup restored via bounded original connection block (NATIVE_PROBE_ROLLBACK.json). Host SDK callback firing not claimed; actual native MCP close/expired and user view closure recorded separately. Earlier proofs keep original attribution.
