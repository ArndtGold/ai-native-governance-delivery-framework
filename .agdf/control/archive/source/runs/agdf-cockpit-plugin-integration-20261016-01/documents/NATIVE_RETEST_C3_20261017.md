# Native retest of the repaired Cockpit — 2026-10-17

Run: `agdf-cockpit-plugin-integration-20261016-01`; revision 15, `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`; CD+Tests remains open. This supplements the sealed reports and grants no approval.

## Installed candidate and actual observations

After the user restarted Desktop, the plugin provider `mcp__agdf_cockpit` opened the established target and exact Run. The installed candidate is `0.14.5+codex.local-c3bfb8c791e6`, source digest `c3bfb8c791e68cf2a681d3edb3860e632716b4183439d0669001ab65a0183a5c`, with UI digest `sha256:3afd5e86b7793ef0225490dfbe8805ffefef53bb1655a52553f7617e4feee2f7`. Fresh dispatch reported the matched immutable runtime generation `0c6f92936e9831c2ed88f2ff473e5f7aaa76833fd637b1765fcc57e0e4731630/0.14.5`.

The user expanded the real MCP App into the right panel. DOM observation and screenshots confirmed the correct Run, read-only state, four approved documents, TP source digest and approval receipt. Opening the TP's empty linked context retained the document and its approval association; context handoff remained enabled. The host accepted the handoff with the visible status **Kontext vom Host bestätigt. Die Frage wurde noch nicht gesendet.** No question was sent.

The actual accepted packet is retained in `accepted-context-packet.json`. It refers to this Run, revision `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`, registered TP and snapshot `2ae162de-1b87-4e49-9563-68abdf574928`; `authorizes` is false. The host reported `chatgpt` version `26.1013.40934`, fullscreen display and updateModelContext capabilities. These metadata do not substitute for raw protocol events.

Leaving the document and reopening it reset the handoff status to **Noch kein Kontext übergeben**. A second context handoff was accepted. The user then closed both panel and inline card; the MCP App tab inventory was empty. A new plugin invocation and manual expansion exposed a new tab (`2`, replacing closed tab `1`). Opening the same TP and its empty context again allowed another host-confirmed handoff. This is direct black-box evidence that the closed view did not keep the publication slot blocked. It does not establish a captured server teardown callback or prove that all prior host context was cleared. The agent finally returned the new view to the Run without sending a question.

One observation attempt waited for an incorrectly remembered empty-graph label and timed out before any handoff click. A fresh DOM snapshot showed the actual label **Für dieses Vorhaben sind keine Knoten referenziert.** The subsequent handoff succeeded. This was an observation-selector error, not an observed product failure.

## Evidence boundary and legacy transition

Evidence is in `evidence/native-retest-c3-20261017/`, indexed by `SHA256SUMS.json`. Existing config/control byte preservation is checked against `before-open.json` in `after-reopen-preservation.json`; evidence files are outside that comparison.

The repaired native document/context journey and close/reopen behavior pass. Full native transition qualification remains incomplete: this is the existing distinct-key, legacy-bearing Desktop context; it is not a clean native installation or a supported isolated same-key/disposable lifecycle context. Raw `ui/initialize` and read/teardown protocol events, together with the actual Desktop MCP provider connection identity, are not exposed by the panel automation interface used here. A tab ID, chat ID, opaque packet context ID or CLI connection must not be substituted for that MCP connection identity.

The existing transition validator requires complete provider attribution and discovery, initialize, render, interaction and teardown observations. No `result: qualified` transition record was fabricated, no guarded retirement command was invoked, and `agdf-cockpit-local` remains active. The exact pending publication journal and original marketplace backup remain retained. Separate N-CLEAN, N-SAMEKEY and destructive N-LIFECYCLE scenarios remain unexecuted pending supported native contexts and matching diagnostics. The final source also still needs its required V-FINAL canonical lane; earlier full-pipeline evidence is historical, while affected repaired UI/build/package checks are documented separately.

Next executable transition step requires supported native host diagnostics supplying provider origin/connection and actual UI/read/teardown events for this installed tuple. A separate supported native test context is required for clean/same-key/destructive lifecycle scenarios. This is a host-evidence boundary, not a missing TP approval. Existing test claims, previous reports and gate decisions are unchanged.
