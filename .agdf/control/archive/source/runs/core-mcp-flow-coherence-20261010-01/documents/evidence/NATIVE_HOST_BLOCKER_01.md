# Native close blocker: Codex cancels teardown tool mediation

Run: `core-mcp-flow-coherence-20261010-01`  
Implementation revision: `2b1b6d04-eceb-4a7e-bc56-e92344b934ae`  
Observed client: `codex-mcp-client`, `0.162.0-alpha.17.2`  
Candidate: `NATIVE_PROBE_CANDIDATE.json`; disposable test runtime only.

## Expected behavior

Closing the inline card and its larger view retires local state and lets the existing scoped MCP close reach Core. The host must keep tool mediation alive while the App completes resource teardown. Subsequent access must reject with `session_expired`. Closing never saves an unsent comment or records a business decision.

## Actual native sequence

The user opened the exact English request-change card. Two synthetic App document/read-return cycles, sources and retained unsent comment worked. The user then reported the sidebar closed and the inline card collapsed; accessible App tab inventory was empty.

The exact Codex sandbox log reports:

| UTC time | Observation |
|---|---|
| 06:59:18.952 | Sandbox disposal starts |
| 06:59:18.953 | `requestMcpAppsResourceTeardown` is sent |
| 06:59:18.990 | An App `callMcp` starts |
| 06:59:18.993 | That call is cancelled: `AbortError`, signal aborted |
| 06:59:48.956 | Teardown fails with MCP sandbox RPC timeout |
| 07:05:58.497 | Independent same-view Core snapshot remains `available` |

No close request for the exact reader reached the probe. The host log does not include tool arguments; identify the failed boundary from its exact sandbox/init/operation IDs together with the server observations and post-timeout read. Do not claim unlogged host internals. Detailed redacted extraction and bindings are in `NATIVE_CLOSE_PATH_HOST_ABORT_DIAGNOSIS_01.json` and `NATIVE_CLOSE_PATH_HOST_ABORT_EXTRACT_01.json`.

## Implemented and verified AGDF behavior

The decision entry now shares one retirement promise across SDK teardown, React unmount and pagehide, clears its local session synchronously and issues only the existing reader close. Overlapping signals cannot duplicate cleanup, and delayed bootstrap/document responses cannot restore the retired view. Normal visibility/context updates leave a usable view live.

Full UI verification passed 20 files/194 tests. Four actual SDK/browser tests passed. The assembled resource, actual SDK and STDIO/Core integration passed iframe removal followed by automatic `closed: true` and `session_expired`; an independent view stayed available and the Run was unchanged. Abrupt navigation failed to deliver asynchronous close in the initial browser experiment; that result remains retained, without claiming it passed.

The new actual Core/shared-reader regression verifies the existing 30-minute idle boundary with an advanced test clock, scoped retirement, expired read/action rejection, an independent live view and unchanged Run bytes. It passed. This is synthetic clock evidence, not native expiry.

## Required repair and current disposition

The host must preserve App-to-MCP mediation until resource teardown completes, with bounded timeout cleanup afterward. Updating AGDF's close endpoint cannot repair an already-aborted host bridge. Do not patch the installed Codex application or introduce a second MCP lifecycle endpoint, heartbeat or shortened timeout as an isolated workaround.

Existing Core bounded idle/lifetime expiry remains the approved fallback when the host cannot deliver cleanup. Native idle expiry has not been observed. The diagnostic read at 07:05:58 renews its idle clock; absent later reads its next idle boundary is around 07:35:58 UTC. No model close was issued for this view, and no decision or unsent comment was persisted.

Native immediate-close qualification fails. QA remains open. Required human gate/locale/permission/accessibility coverage and formal reviews remain separately listed in `QA_INDEX.json`; resolving this blocker alone does not complete the whole Run. Repeat the native close proof after a host repair or a reviewed supported-host disposition, rather than repeating the same unchanged host-close sequence.


Native fallback follow-up: NATIVE_IDLE_EXPIRY_01.json establishes actual same-server idle expiration after the user closed the exact view. Snapshot and original document both reject session_expired; no model close or decision occurred and Run bytes remain unchanged. This contains retained backend lifetime within the approved policy but does not repair the Host's premature AbortError.
