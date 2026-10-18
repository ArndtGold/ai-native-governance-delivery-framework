# Native teardown diagnosis and chat-switch retest

Date: 2026-10-18
Run: agdf-cockpit-plugin-integration-20261016-01
Observed revision: 445a5450-d4dd-47db-8b8b-674f396e3e83 (23)
Authorizes: false
Result: partial; native teardown remains unproven

## Actual native observation

The user opened the freshly generated plugin Cockpit on the right. The selected native App tab was 4, with trace `65cd33aa-8d77-4912-a879-85d50685d669`, Core view session `c7cebf2b-4331-41b3-9c52-c7f03d224787`, host App `session:9f70e6a7-5a91-4178-a678-1f047eeb8fb5`, invocation `exec-3a55b16c-584b-4c04-9cbc-605c2f084f27`, and sandbox init `d31634b3-7d9f-414e-a7b1-1bcb5301da6a`. Native host creation is logged at 06:53:54.697Z. The host is chatgpt 26.1013.40934; its installed bundle is `/Applications/ChatGPT.app`, identifier com.openai.codex, build 20770.

The visible Run was correct. The DOM-observed module has 848527 UTF-8 bytes and SHA256 `6c936527c4eaf515dce8dbc21f0d4b8306d516e29117fd98fb0c689a890d5a96`, matching the installed candidate. JavaScript character count differs from UTF-8 bytes and is not a payload mismatch. Initialization request/reply and initialized notification were captured. After the actual refresh, the visible view returned to its Run content and showed a refreshed timestamp.

Using the supported Codex navigation tool, the agent switched to the existing idle chat `AGDF Cockpit: nativer Lesetest` (01a14a53-1091-7fa1-9145-287353b8dac1), checked the App inventory, and returned to the original chat 01a1447b-443a-7431-a44d-cd04195c07ad. Both navigation calls returned navigated=true. No message was sent to the other chat. The inventory still contained tab 4; after returning the same view and same trace remained. The bounded trace grew from 116 to 132 events, was not truncated, and contained no teardown method. The observed Core session still returned state=available at 06:57:54.388Z. Therefore this supported chat-switch operation did not establish widget destruction or native cleanup.

After preserving that result, the exact Core view session was explicitly closed using the owning plugin reader. Core returned closed=true and a subsequent read returned session_expired. This is compensating cleanup only, not a native teardown pass. The native shell may remain visible with an expired session.

## Installed Host source diagnosis

Read-only inspection of the installed ASAR produced bounded source excerpts and hashes. No Host code was executed or modified and no private Host RPC was invoked.

- In `webview/assets/app-initial-90eb42395b7d.js`, SHA256 `2687d59e8c67ccf81c7efb3820211070df303c6a200c9e0e8d604f26253f2f5e`, offset 7925746, the tab-close path explicitly changes the display mode to inline when inline is available and the sandbox has no error. This explains the previous fullscreen-to-inline observation in NATIVE_CLOSE_OBSERVATION_20261018.md. Panel X is not evidence of disposal in that branch.
- The same source has a separate registration-removal path that removes an owned session and calls disposal callbacks. That path was not observed for the fresh test session.
- `webview/assets/widget-2822a44259e7.js`, SHA256 `5182c5c46535bfc101391087036bf47652689440b06ac0951a706e3ee0820c04`, contains an actual cleanup path calling requestMcpAppsResourceTeardown with timeoutMs=500, followed by element removal/destruction. The visible excerpt does not await that request before removal. A timing race is a source-supported hypothesis, not a demonstrated runtime defect: this test did not trigger that cleanup path.
- `webview/assets/mcp-sandbox-rpc-de24f095d1b4.js`, SHA256 `876dc370c20783c061c2f59fc129b93e7164e99d835247cfbd427ee80452d955`, wraps that teardown RPC without the ordinary abort signal. A search for literal protocol names alone would miss the camel-case implementation. This diagnosis does not claim the Host has no teardown implementation.

Exact App/invocation and init-ID host-log subsets contain no matching teardown-request or sandbox-removal observation for this bounded test. The init-ID subset also retains unrelated sandbox console warnings verbatim; those warnings are not evidence of a teardown defect.

## Supported route and remaining limit

The public installed ext-apps SDK exposes App.requestTeardown() (app.d.ts:1060-1097). It sends ui/notifications/request-teardown without a reply; the Host decides whether to accept, then sends ui/resource-teardown. Sending the notification alone would not prove closure. The installed Cockpit diagnostics currently expose recording, not a requestTeardown action; that alternate public SDK route has not been exercised here. The available MCP-App automation exposes neither native card deletion nor Host disposal, and chat navigation demonstrably retained this instance. No private bridge call or injected protocol message was used as a substitute.

A subsequent native proof requires a real supported disposal event, or an instrumented public SDK teardown request followed by an observed Host teardown, context invalidation and Core session expiry. The latter is a candidate diagnostic change with its own changed-source installation and verification, not a result obtained by this retest. Neither a Host defect nor a Cockpit defect is confirmed by the present observations.

## Disposition and continuity

Raw observations, trace, visible screenshot, payload comparison, bounded source excerpts, and checksums are in `evidence/native-unmount-20261018/`. CPI-E01 remains an open evidence_gap; CD+Tests remains revise. This supplementary evidence does not qualify native lifecycle, waive TP T008, retire agdf-cockpit-local, settle publication, or complete mandatory final CR. The previous safe owner refusal and current source review remain in LEGACY_CUTOVER_REVIEW_20261018.md and CODE_REVIEW_SOURCE_20261018.md. Isolated CLI lifecycle evidence remains in CLI_LIFECYCLE_EVIDENCE_20261018.md; it is not relabelled as Desktop evidence. Earlier successful native rendering/context evidence remains in NATIVE_PANEL_EVIDENCE_20261018.md.

No product source, approved source artefact, installation, or legacy configuration was changed by this diagnosis. Only new bounded evidence is registered.
