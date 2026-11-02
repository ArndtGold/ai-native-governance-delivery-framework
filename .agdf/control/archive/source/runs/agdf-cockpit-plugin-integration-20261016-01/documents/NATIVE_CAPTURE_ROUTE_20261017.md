# Native capture route assessment — 2026-10-17

Run: `agdf-cockpit-plugin-integration-20261016-01`, revision 16 (`845aa755-b849-4230-b81b-b5f3892689ab`), CD+Tests. Supplementary execution evidence only; no approval, source amendment or transition qualification.

## Result

No currently exposed, supported route was found that captures **all** missing native UI/provider/teardown evidence on the installed c3 candidate. The legacy transition was therefore not applied. This is a concrete execution limitation, not a need to approve TP again. The successful existing automated/native observations remain valid within their recorded limits.

## What was checked

| Route | Supported scope and observed result | Remaining limit |
|---|---|---|
| Official Desktop diagnostics | Documented local logs, previously captured for the exact native app sessions; an additional bounded search of the known 2026-10-17 log directory again found zero `ui/initialize`, `ui/resource-teardown` or `agdf_cockpit_read` matches | Generic app initialization/handler events are not the missing protocol exchange or provider connection identity |
| Browser developer mode / full CDP | Official documentation covers Chrome and built-in browser debugging; current MCP Apps backend advertises only WebMCP as an additional tab capability | No CDP or console/network/bridge trace interface is exposed for this native panel; enabling a browser setting is not established to change that |
| Actual panel / WebMCP | Existing panel tab 2, exact Run, actual host `chatgpt` `26.1013.40934`, fullscreen; opened existing Host-Verbindung prüfen details. `logging: {}` is visibly advertised. WebMCP reports no tools available | Capability advertisement establishes support for receiving logs, not a recorded or durably exported trace |
| Public MCP Apps SDK | Installed ext-apps 2.0.3 and official API expose `App.connect(transport)`, `PostMessageTransport.send/onmessage`, `App.sendLog` and `onteardown` | A possible implementation route for app-side trace instrumentation, not an existing capture facility. `sendLog` promises sending, not guaranteed host persistence. It does not expose the host MCP-provider connection identity |
| RUST_LOG | Official documentation supports Rust log filtering for CLI and app-server | Does not document capture of Desktop iframe UI messages, an attachment to the current Desktop provider connection, or Desktop profile isolation. No claim that a CLI trace would qualify the native panel |
| MCP Inspector / API Playground | Officially supported protocol/server testing | A separate client/connection; does not capture this actual native Desktop bridge or satisfy clean/same-key/lifecycle Desktop scenarios |
| App Server API | Public documentation describes thread-scoped server discovery/tool calls | No supported attachment endpoint to this running Desktop process was established. A new app-server process would create separate connections. No private socket, app bundle patch or injected browser code was used |

The new DOM observation also shows that the long-lived panel's refresh has failed and previous data is retained. This is recorded as an observed current limitation; it does not invalidate earlier successful handoffs or establish a new implementation root cause. The screenshot attempt timed out, and one rebind attempt timed out too. No new screenshot was produced, no success was claimed, and there was no further UI retry. Native APIs remained disabled. No new UI initialization/read/teardown packet or provider connection ID was manufactured.

## Supported SDK route: feasibility, not completion

For a future scoped implementation, a recorder at the existing `CockpitBridge`/public Transport boundary could observe actual inbound/outbound initialization, read and teardown packets without private host APIs or changing existing protocol names. It would need bounded storage, explicit collection semantics, preservation of source validation, request correlation, teardown behavior and errors, and an independently retrievable local export. The existing HostProbe is currently metadata-only. Adding such instrumentation changes shipped UI bytes and invalidates final installed-tuple qualification; it must use normal build/publication/testing owners. `sendLog` alone cannot be treated as durable capture. Native provider attribution and separate native-context availability must still be established; implementing the recorder alone would not qualify retirement.

There is consequently no evidence-backed instruction to merely toggle an existing setting, reopen the card or rerun the Inspector and then retire the old connection. The next prerequisite is an actual supported native trace/discovery export including provider attribution, or a scoped observable diagnostic implementation plus a supported native qualification context. The current evidence requirements and validator are unchanged.

## Legacy safety and retention

TP Native execution procedures require matching native qualification before the real owned legacy section is disabled, and explicitly retain the old route if the required native access/isolation/protocol observation is unavailable. No `mcp disable --retire-cockpit`, installation rollback/update, publication settlement, alias or direct configuration edit was attempted. No qualified transition record was created.

Both project and user configurations still match their recorded baseline hashes; see `evidence/native-capture-route-20261017/preservation.json`. The c3 publication journal and owned rollback backup remain intact. UR/PRD/SD/TP, previous indexed evidence and sealed CD+Tests reports were not edited. No product source changed in this investigation, so the passing final automated lane was not repeated. QA/UAT/OR and VCS/publication remain unperformed.

## References

- https://learn.chatgpt.com/docs/reference/troubleshooting
- https://learn.chatgpt.com/docs/developer-settings
- https://learn.chatgpt.com/docs/browser?surface=app#app-developer-mode
- https://learn.chatgpt.com/docs/config-file/environment-variables
- https://learn.chatgpt.com/docs/app-server
- https://developers.openai.com/plugins/deploy/connect-chatgpt
- https://developers.openai.com/plugins/deploy/troubleshooting
- https://apps.extensions.modelcontextprotocol.io/api/classes/app.App.html
- https://apps.extensions.modelcontextprotocol.io/api/classes/message-transport.PostMessageTransport.html

These references support their documented interface scope. The conclusion that they do not currently provide a complete exposed capture route here is an assessment combining those documents with current tool capability and actual panel observations, not a claim that the vendor has no internal diagnostic mechanism.
