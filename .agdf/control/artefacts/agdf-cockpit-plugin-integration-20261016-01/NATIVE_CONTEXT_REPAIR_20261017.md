# Native panel test and context/document availability repair — 2026-10-17

Run: `agdf-cockpit-plugin-integration-20261016-01`.
Approved delivery binding: revision 15, `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`, CD+Tests.
Scope: continue the approved plugin integration and repair defects found during its native read/context test. Existing sealed reports remain unchanged.

## Actual Desktop observations

The user expanded the Cockpit into the right-hand MCP App panel. The `mcpapps` backend then exposed that existing panel in this chat, permitting direct DOM-based observation and permitted read-only UI actions without controlling the ChatGPT application shell.

The expanded view displayed the integration Run, its four approved gate documents and registered evidence. The agent opened **Host-Verbindung prüfen**, then the approved TP document, refreshed it, and expanded its linked context. The host reported `name: chatgpt`, `version: 26.1013.40934`, `display: fullscreen`, and server-tool/server-resource/context capabilities. These are actual host-reported metadata, not independent proof of each capability or raw protocol traffic.

Document opening and refresh succeeded, including the registered TP source, approval receipt and source digest. Expanding an empty linked-context graph then made the already read document display **Keine Einträge**, hid its original text and prevented document context handoff. Collapsing the graph and refreshing restored the readable document. The native defect is recorded in `evidence/native-manual-20261017/panel-context-empty.dom.txt` and `.png`; the successfully read document and host metadata are in `panel-task-plan.dom.txt` and `.png`. A later screenshot capture timed out; it is not counted as a successful screenshot.

These native observations concern the previous installed `3753a404b41f` tuple. They do not qualify the corrected tuple below. Raw UI initialize events, accepted context publication and teardown are not established by these observations.

## Cause and correction

Core's successful `context` response includes a freshly read Run/document, but its envelope availability describes the graph: `empty` for no nodes and `partial` for unavailable references. The existing UI `onScope` callback copied that graph availability onto the Run and document projections. `DocumentView` consequently treated successfully read source text as unavailable.

`packages/control-ui/src/App.tsx` now projects Run/document availability separately for successful context responses. It uses the fresh returned document and selectors; it does not retain stale text. Graph state remains intact in the context scope/panel. Blocked/error responses and non-null error codes are not promoted. Approval semantics and all Core/MCP contracts remain unchanged.

Three regression cases were added at the existing scoped-reading test owner: empty graph, partially unavailable graph, and a blocked response that must remain unconfirmed. The first two reproduced the defect before the correction. No new cache, lifecycle owner, source of authority or UI feature was added.

## Verification

- Scoped-reading file: 14/14 passed, including the three new cases.
- HTTP suite: 8/8 passed.
- Complete component suite: 239/239 passed in a final uninterrupted run.
- Built browser suite: 44/44 passed; zero skipped, unexpected or flaky results.
- Typecheck, web build, MCP resource build, plugin UI packaging tests and payload-budget tests passed.
- Compatibility check: 56 evaluated, zero failed; source fingerprint remains `6590756d05f858dcff08ba18c7f4cdb83d47ed595d37abb53de07059f1edd47e`.
- `git diff --check` passed. Only `App.tsx` and its existing scoped-reading test file changed in implementation/test source.

The first default-sandbox HTTP run failed because loopback listening was prohibited; the host-permitted run passed. An initial full component run had one timing failure in an unchanged draft-check test; that file passed 6/6 in isolation and the complete final 239-test run passed. Logs of unsuccessful attempts are retained. No timeout, budget or assertion was weakened.

The previous full canonical `verify:ci` lane remains historical evidence for the preceding candidate. This UI-only change was checked through its affected complete UI/browser/build/package lanes and the unchanged compatibility fingerprint. No new full 26-stage `verify:ci` result, final CD+Tests pass or QA decision is claimed.

## Controlled replacement and installed identity

The unqualified previous publication was rolled back through `settleCodexCockpitPublication` with its exact target/candidate/previous digests. This restored owned marketplace bytes but left Codex's native registry/cache at the previous candidate identity. The next normal installer correctly refused the incoherent same-key offering. Its failed result is retained.

The exact owned local marketplace registration was then refreshed with the same native remove/add commands used by the existing installer, followed by native `plugin add agdf@agdf` to restore the prior host identity. Ownership and exact local root were checked first. The unchanged normal AGDF installer was retried; no conflict/admission check was bypassed and no plugin cache was patched manually.

Installed and enabled: **`0.14.5+codex.local-c3bfb8c791e6`**.

- Source: `c3bfb8c791e68cf2a681d3edb3860e632716b4183439d0669001ab65a0183a5c`.
- Core runtime: `7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2`.
- MCP server: `caffe3779119a1f25f68b2a491c814556c34f80bf7aa1b3f1a1aa0335e3e337b`.
- Dispatcher: `41c93fd4a43388e873187c6f5364e7b570503b03921b4cd30352e82e5c090edc`.
- SDK: `b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb`.
- UI: `sha256:3afd5e86b7793ef0225490dfbe8805ffefef53bb1655a52553f7617e4feee2f7` (1,235,741 bytes).
- UI source: `sha256:b7a42566b0fdbba88ca45cc1fdd924c4f0948343fde84cfdf53b124acaf7b3f4`.
- Prepared immutable generation: `0c6f92936e9831c2ed88f2ff473e5f7aaa76833fd637b1765fcc57e0e4731630/0.14.5`.

Marketplace, Codex cache and prepared runtime all match the reviewed repaired candidate. The final normal installer exited 1 with structured `partial`, `failure: null`, `mcp_ready_hook_verification_pending` and restart required. Installation succeeded; fresh Desktop activation is pending.

All 736 inventoried existing control files and both config files remain byte-identical to the native-read baseline; Run evidence files are excluded from this preservation comparison. The legacy `agdf-cockpit-local` entry remains active. The original owned `fb1def114314` marketplace backup and the new exact `cockpit_qualification_pending` journal are retained. No legacy retirement or publication settlement occurred.

## Next native step

The user must fully quit/reopen the Desktop app. Then invoke a fresh plugin Cockpit for the original target and this exact Run, and repeat the document/context interaction with the new tuple. The existing MCP App panel can be observed directly once exposed; additional manual screenshots are not required for accessible panel content. Native shell-only actions still need the user.

Context publication, teardown and matching transition validation must pass before legacy retirement. Separate clean/same-key/disposable lifecycle scenarios remain outstanding. This record grants no approval and claims no QA, UAT, OR, commit, push or release.

Repair logs, exact installed tuple and preservation results: `evidence/native-context-repair-20261017/`.
