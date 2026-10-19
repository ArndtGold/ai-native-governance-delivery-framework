# Native public SDK teardown result and retained legacy transition

Date: 2026-10-18
Run: agdf-cockpit-plugin-integration-20261016-01
Observed revision: a2e16494-69f9-44fe-ac21-d7471249401e (25)
Authorizes: false
Native teardown: not qualified; public action returned to inline
Legacy transition: rejected by existing owner; configuration retained

## Actual native binding

After the requested Desktop restart, the user opened the fresh Cockpit on the right. Supported App inventory contained tab 1. Its DOM displayed the exact selected target/Run and the new diagnostic action. The DOM-observed module had 849220 bytes and SHA256 37fbd1ee7c62e3eabe946d1b13addf2a0f423020085fa6267cb890889dfa295a, byte-identical to the installed immutable candidate. Actual initialization, initialized notification and render result were captured in the per-view SDK trace.

- Installed candidate: 0.14.5+codex.local-a37fccf9eb2b; source a37fccf9eb2b8cf303a43a69e3b2bc279e114bd4bf588bc4ad98c9e550264022.
- UI: sha256:3524697a2bf6157279c6c6aa670c8c5395e0155e557bd8d4ccfb622e397b4c11.
- Actual provider SDK-server instance: 50e2000c-c5ca-4de6-8428-578cec87fdf9. Its observed server_module is in immutable generation 4ade72c5c11601d9e6835d985b0c689ff885aff16e4c63ac85855a5a654cdbcd/0.14.5, matching the installed tuple. This UUID is server-issued, not a fabricated native connection identity.
- Native Host: chatgpt 26.1013.40934; MCP peer codex-mcp-client 0.163.0-alpha.10.2 with the actual UI extension capability.
- Core view session: 605d7994-f0fb-40bd-874f-18de6341c005, render generation 1.
- SDK trace: 0a0f90a8-348b-426d-bf08-a1f86c946ed4.
- Host App: session:f7ec0a35-ac1e-46a1-8cba-58eb7e94a23b, invocation exec-de0a2106-5b11-4ae0-a9a2-696f23b5601b, sandbox init 94fdd163-3701-4262-bc77-d2c0dfcda0a1. Creation logged at 07:31:30.423Z.

This is fresh native evidence for this exact candidate, not a transfer from the previous dc02 build.

## Native interaction and public close attempt

The agent enabled diagnostic recording through its visible button, opened the approved TP and its linked context, then published the selected TP through the existing ownership controller. The visible Host confirmation read “Kontext vom Host bestätigt. Die Frage wurde noch nicht gesendet.” The before-action trace has 63 events and retains the real ui/update-model-context publication (request id 31, context bcedebc4-075d-4373-92e8-60773b9dfd50, generation 8) and its response. No model question or approval action was sent.

The agent saved the visible state and invoked the new visible “Beenden beim Host anfordern” button, whose tested implementation calls the public App.requestTeardown(). The ensuing UI operation was cancelled when its panel disappeared; no DOM completion response was available. The correlated native log records:

- 07:33:33.540Z: method=requestClose for the exact observed sandbox init ID.
- 07:33:33.541Z: fullscreen to inline, reason=tab_close, for the exact Host App/invocation.
- 07:33:33.542Z: session_opened with displayMode=inline, previousDisplayMode=fullscreen.
- Further callMcp handling continued for that sandbox afterwards. Supported right-panel inventory returned no tabs.

At 07:33:40.884Z, a reader snapshot on the same actual provider/session returned state=available. That snapshot replaces the session's reading snapshot and can invalidate an existing prepared packet; it is not a pure observation of the previous packet. It neither closes the view nor proves prior Host context removal. The result decisively disproves completed native Core-session teardown before compensation.

The public SDK UI action and the resulting Host requestClose/inline behavior are correlated native observations. The exact outgoing ui/notifications/request-teardown packet is not claimed as retained native raw evidence: the Host console capture had already stopped. There is no captured native ui/resource-teardown request/reply or successful native Core close in this attempt. The public SDK permits the Host to decide whether to accept teardown; this observation is not proof of a Host protocol defect. It also does not reproduce the separate source-level cleanup timing-race hypothesis from NATIVE_TEARDOWN_DIAGNOSIS_20261018.md, because the actual observed action preserved an inline instance.

## Newly established Host logging bound

At 07:33:07.924Z the native Host logged console_limit_reached for this exact init ID: it stopped capturing console warnings/errors after 50 messages for the sandbox webview. Existing sandbox warnings and background SDK traffic consumed that allowance before the close action. Some retained source-bearing log messages are also truncated and cannot be parsed as complete JSON. The collector's own retained-line count and dropped=0 do not establish complete protocol capture; native-host-packets.json is only the successfully parsed subset.

The DOM before-action trace remains separately complete for its 63 captured events. The warning-level instrumentation did improve durable initial capture, but it does not guarantee lifecycle capture after the Host's 50-message ceiling. No missing event is reconstructed or treated as proof merely from source code.

## Separate cleanup

After the raw failure observations were saved, an explicit invalidate_context call returned invalidated=true and host_publication_required=false. Thus Core required no additional Host publication at that cleanup check; this alone is not an independently captured Host-context-clear acknowledgement. The exact view was then explicitly closed through the owning plugin reader, which returned closed=true. A subsequent read returned session_expired. These are compensating Core operations, not native teardown success. A rejected diagnostic validation probe used an invalid UUID and changed no state.

## Guarded legacy attempt and disposition

A new exact-candidate partial transition record deliberately omits teardown, declares result=partial and inventory.complete=false. Its validator reports record/observations/inventory errors. The existing normal CLI owner was actually invoked with mcp disable --surface codex --scope project --retire-cockpit agdf-cockpit-local and that evidence. It exited 1, result=failed, changes=[], with cockpit_legacy_retained / AGDF_MCP_COCKPIT_EVIDENCE_INVALID. Project config SHA256 remains 20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8; publication journal bytes are also unchanged. No direct configuration edit, fake qualified record or publication settlement was used.

The native public SDK route has now been executed; its observed Host outcome does not satisfy the approved closing proof. This replaces speculation with a concrete execution result. CPI-E01 remains open and CD+Tests remains revise. Complete effective provider/origin inventory and the other required native scenarios remain unqualified. The actual legacy registration and owned rollback route remain active/retained. Mandatory final CR, QA, UAT and closeout are not completed by this evidence.

A further identical panel-close/restart loop is not a remedy for this observed behavior. Successful retirement still requires a supported actual teardown with confirmed cleanup, or a deliberately reviewed change to the approved closing design/acceptance through its existing source owner. This report grants neither such a source change nor approval to bypass the migration predicate.

Evidence: evidence/native-public-sdk-20261018/ contains the DOM-observed opening metadata/module comparison, before-action DOM/trace/screenshot, exact-ID raw Host logs, parsed subset, Core failure observation and compensation responses, partial transition and validator result, actual lifecycle-owner response, before/after config/journal hashes and SHA256SUMS. Installation and focused verification remain in PUBLIC_SDK_TEARDOWN_PREPARATION_20261018.md. Earlier source review and CLI lifecycle proof remain separately scoped; they do not substitute for this failed native closing result.
