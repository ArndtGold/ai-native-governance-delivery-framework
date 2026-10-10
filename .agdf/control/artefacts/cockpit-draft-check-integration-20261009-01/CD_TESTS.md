# CD+Tests: Cockpit bound draft-check integration

- Status: done
- Decision: implementation, automated checks and approved exact-build native observation complete
- Run: cockpit-draft-check-integration-20261009-01
- Approved plan: TP.md, sha256:541fef03c6192ee7a567ce2b9067a7a1feeb540f7b83cfe74069988adae9a44b
- Scope: exact approved shared Core projection, scoped MCP/browser read, coordinated session/worker/source observation and central App commit with reusable draft-context presentation.
- Evidence: evidence/BASELINE.json, SCOPED_DELTA.json, BUILD_IDENTITY.json, PROTECTED_AFTER.json and tests/*.log.

## Implemented behavior

The selected supported canonical UR/PRD/SD/TP source is observed before capture freezes, including absence and supported pre-registration drafts. An explicit check uses the one shared authoring projection, checks exact old and recaptured source/revision/gate binding and publishes a replacement read scope. Existing session, worker/pool generation, resource and source-change owners adopt it together. Existing publication cleanup uncertainty blocks the new operation too.

The authenticated browser route and strict MCP schema accept only the designed selectors. The App validates original report/binding, cancels obsolete requests, coordinates existing freshness/context cleanup, and installs only an exact-current replacement via the central reducer. One inline keyboard-usable component supports compact and expanded views, original findings, bounded recovery, focus/disclosure/scroll restoration and no automatic checking. No canonical source or approval is written by this action.

## Actual automated results

- Standalone authoring checks: passed, all four gates and actual validator parity.
- New Core draft-check suite: five passed; actual validators, same-revision/atomic/absence/symlink changes, capture/replay/publication races, no writes, real session/worker resources/observation, owned publication and cleanup quarantine.
- Existing Core reader/session/context/publication/capture suites: 49 passed and one native filesystem notification failure inside sandbox; exact failing suite repeated on host outside sandbox: two passed. No test assertion or production observer was weakened; retain original logs and environment distinction.
- UI regression suite: 142 passed; final focused draft suite: six passed, including finite deadline on an unresponsive transport, guarded old completion, explicit action/duplicate prevention, focus, busy retry and reload, malformed/authority-changing DTO and central stale/foreign commit rejection.
- Existing plus new authenticated HTTP suites: nine passed outside sandbox. Initial loopback permission failure is environment evidence, not a passing test.
- Browser suite against the actual build: 24 passed, including new compact/expanded narrow/wide keyboard/source-disclosure/long-result and no-write observation. Rendered images inspected and preserved under evidence/.
- Existing MCP contract/safety/protocol suites: three passed; scoped packaged runtime check passed both protocol versions with actual new Core authoring result and old operation/resource/session compatibility.
- Browser/MCP App builds, public plugin assembly, plugin variant and payload-budget checks passed. Typecheck passed. Runtime uses the exact already verified SDK digest; no dependency upgrade or global host activation.

## Fulfillment boundary

T-001 through T-006 are fulfilled within approved source/Core/build/browser/native boundaries. Exact-build native action, actual Core busy/retry, same-revision source invalidation/recovery, manual compact/expanded controls and explicit read-session close: evidence/NATIVE_FINAL_OBSERVATION.json/md. All 26 product-source and 15 protected hashes unchanged. T-007 reviews support separate qa-gate decision; CD+Tests status grants no QA approval or release readiness.

## Normalized findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| NATIVE-001 | evidence_gap | evidence_obligation | resolved | evidence/NATIVE_FINAL_OBSERVATION.json/md; native initialize acknowledgement, actual busy/retry/close/expired and attributed user observations | Consume resolved native evidence in qa-gate |

## Next step

Refresh mandatory owner reviews and evaluate QA against exact approved TP. Approval: QA remains separate new deliberate response after passing report recorded and presented.
