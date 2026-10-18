# CD+Tests: SDK diagnostics, verified installation and autonomous native test

- decision: revise
- Run: agdf-cockpit-plugin-integration-20261016-01
- Target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework
- Binding before recording: revision 16, 845aa755-b849-4230-b81b-b5f3892689ab
- Workspace HEAD: 568b2545b2b50fa29027da6bad6b60a84aaae8f2
- Approved UR, PRD, SD and TP remain byte-identical; the existing TP approval remains valid.

SDK instrumentation is implemented, the final automated repository lane passes, and the matching diagnosis build is installed. A separately authorized projectless native test confirms plugin discovery and two actual opening calls without the project legacy offering. Full native qualification remains unavailable because the supported interface cannot reach the new inline App view. Legacy retirement and final publication settlement were therefore not performed. This is an implementation execution report, not QA, acceptance or release authority.

The preceding canonical c3 report is preserved byte-identically as `CD_TESTS_PRIOR_SDK_20261017.md`, SHA-256 `35cc00876c1a618a9ed9309b7da0cf749e99586ea757ebf0fcd68319c5d3c6d0`. The earlier `SDK_INSTRUMENTATION_20261017.md` is an unchanged checkpoint; its running-test, installation and authorization status is superseded here.

## Implementation

The existing Codex plugin Cockpit server adds hidden `agdf/provider` and `agdf/peer` response metadata. The connection identity is a server-issued UUID for the actual SDK server instance, pinned by the supported STDIO entry; it is not a host-assigned connection ID. The observed module path, canonical version, SDK client information and capabilities accompany it. Modern request-envelope capability precedence and legacy negotiated capabilities retain their existing behavior. Other host profiles and regular governance responses keep their behavior.

The Cockpit entry decorates the public SDK Transport and original PostMessageTransport. Original source validation, callbacks, send options, lifecycle and failures remain effective. The ephemeral recorder retains opening/initialization before deliberate activation; background reads and non-opening source-bearing tool results are not collected before activation. The existing HostProbe starts bounded capture through “SDK-Nachweis aufzeichnen”. Actual received and successfully sent logical JSON-RPC objects are then emitted to console and public App.sendLog when logging is advertised. Own logging notifications are excluded to prevent recursion; sink errors cannot fail transport operations. The limits are 256 events / 1 MiB with explicit truncation. This is neither a raw STDIO byte capture nor a guarantee that the native host durably exports logging.

No new collector service, control writer, installer, lifecycle registry, model question or selection cache is introduced. The shared CockpitBridge and Decision HTML remain byte-identical to c3. The architecture documentation records the diagnostic scope and limitations. The shared shipped server/helper grow by exactly 1,071 bytes; the existing budget owner records the measured 260 files / 2,264,072 bytes with zero additional headroom. No behavioral assertion, sample count or performance threshold was weakened.

## Final automated verification

| Check | Actual result | Evidence |
|---|---|---|
| UI typecheck, HTTP and all component tests | Passed; HTTP 8/8, components 246/246 | evidence/sdk-instrumentation-20261017/sdk-final-checks.json and final focused logs |
| Complete browser suite | 45/45; no skipped, flaky or unexpected results | browser-all-sdk-final-report.json |
| New browser SDK route | Built UI, actual public SDK bridge/server/Core; initialization, provider correlation, read, logging, teardown reply and expired Core session verified in a synthetic host | cockpit-sdk-trace-browser-final.json; explicitly not native qualification |
| MCP capability/identity tests | Both 2025-11-25 and 2026-07-28 pass; same instance identity across render/read/close, fresh identity on a fresh STDIO connection | mcp-gating-sdk-final.log |
| Fresh compatibility record | 56 evaluated, zero failed; reviewed fingerprint d85965bdadb25cd4ac75168bf0bae9356c9d4098515d77519f8b79138cd3e2ec | compatibility-final-review.json and final recording log |
| Final fresh build | Exit 0, 2026-10-17 13:36:31–13:37:29 UTC | final-build.log; final-canonical-result.json |
| Full canonical repository lane | All 26 stages passed in one uninterrupted execution, exit 0; 13:37:29–14:42:05 UTC | final-canonical.log; canonical-verification-ledger.json |
| Unchanged canonical MCP performance | 20 samples each; cold p95 862.227 ms <1,500; warm p95 717.896 ms <1,000 | canonical-performance.json |
| Source coherence | 1,831 files (1,826 tracked source/document files, four new SDK files, one reviewed observation) identical across workspace, tested snapshot and installer source | final-pre-install-preservation.json |
| Preserved control/config baseline | All 8,512 pre-existing inventoried control files unchanged before installation; both host config hashes unchanged before and after installation | final-pre-install-preservation.json; native upgrade post-install-state.json |
| Whitespace | git diff --check passed | final record checkpoint |

The 84-file SDK evidence inventory is sealed in `evidence/sdk-instrumentation-20261017/SHA256SUMS.json`. Earlier failed attempts are retained: sandbox loopback refusal followed by permitted full pass; stale generated runtime before normal preparation; initial exact payload growth before budget review; SDK fixture activation omission; browser fixture wrong result field; one existing browser focus failure followed by three unchanged focused passes and a complete 45-test pass. The separate installer copy initially lacked Vite; normal pinned dependency installation, UI build and Codex preparation then passed and produced the exact tested HTML. No product repair or weaker assertion was used to hide those attempts.

## Regular installation and exact candidate

The prior c3 publication was still qualification-pending. Its existing settlement owner first restored the exact original owned fb1 backup. The existing public Codex CLI then refreshed only the owned AGDF marketplace registration and installed its actual restored version. Foreign marketplace rows remained unchanged. The normal `install:codex -- --dir <target> --accept-plugin-capabilities --json` owner subsequently installed the tested SDK candidate. No cache or transaction journal was edited manually.

Installed/cache-verified version: `0.14.5+codex.local-dc02ea9eae18`; canonical version `0.14.5`.

- Source: dc02ea9eae188c0af7f20d331a581523ce246f17474f1e5654b9101b4fc18a89
- Core runtime: 7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2
- MCP server: 3b9588378c4078bea7781f6cac6c55b5382b5455b730c7c35973019f7fee3bea
- Dispatcher: 41c93fd4a43388e873187c6f5364e7b570503b03921b4cd30352e82e5c090edc
- SDK: b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb
- Cockpit HTML: sha256:706955ccb5e1f8fd988ab5939c696beb1ab20fb93beddeea2f2a45dda1a9bf68; 1,238,897 bytes
- Cockpit source: sha256:9032484cfa40e5b53c00d1b6c5728d263e8110db5f238cd7bb3d41bf48d9f9a6
- Decision HTML unchanged: sha256:6d7e10586a1fc46eacd56b990e37e1774e1607147a4bd6a81ba066f7c61ecaef
- Verified immutable runtime generation: 511e28ab67dc4d925b967a272ce4fe4cf79a14d72ebbdb8aaeede5b880f361a2/0.14.5

Marketplace, native cache and published runtime agree. The installer exits 1 with its documented partial activation outcome: `mcp_ready_hook_verification_pending`, installed version verified, failure null, `pending_restart`. This is a verified installation with activation still unconfirmed, not a passed native session. Exact command, timestamps, output, tuple and owner rollback/refresh records are retained in `evidence/native-sdk-upgrade-20261017/`.

The new journal remains `cockpit_qualification_pending`, source dc02, previous source fb1. The real distinct-key legacy entry is retained. Project configuration SHA-256 remains `20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8`; user configuration remains `0155a9c155fecdba26b1c9a5e595832c3ee0175fdfbb7aed569182d5c5d52b17`.

## Autonomous native test and unavailable capability

The user explicitly authorized one separate projectless read-only test chat after installation. Chat `01a14a53-1091-7fa1-9145-287353b8dac1`, “AGDF Cockpit: nativer Lesetest”, ran under local Codex in `/Users/arndtgold/Documents/Codex/2026-10-17/agdf-sdk-native-proof-20261017`. The test request prohibited product/config/control changes and further manual user steps. After the user objected to repeated click tasks, the earlier close-panel/card request was withdrawn. The parent opened the test chat through the supported app navigation, requested the same read-only check again, and restored the original chat afterwards.

Actual observations: the fresh native tool catalogue offers the two plugin Cockpit tools and no `agdf_cockpit_local`. Two native `agdf_cockpit` calls, including one after the chat was shown, succeed with the explicitly bound repository and exact Run arguments. Their public return confirms the exact target ID and `authorizes:false`. The provider offers the MCP App URI and MIME type. A resource read succeeds but its returned HTML is explicitly truncated; it cannot establish complete code identity or DOM rendering.

The MCP-App inventory remains empty before opening, after opening/resource reading, and after supported navigation to the test chat and a second opening call. Native app control is disabled, and the documented MCP-App backend can operate existing sidepanel tabs but cannot expand/create/navigate an inline App view. Thus the new view's rendered DOM, SDK capture button, actual initialization/read/teardown packets, provider instance metadata, context acknowledgement/clearance, and loaded host version remain unobserved. No trace ID or App-session ID was invented to run the host-log collector. Logging durability remains untested, rather than falsely reported absent. The old c3 panel's successful DOM comparison demonstrates a method only; its results are not transferred to dc02.

The separate test freshly verifies the installed package/runtime and the complete HTML/script/style on disk. Those are package observations. It also confirms the expected TP file hash on disk; that is not native Cockpit reading. Its 8,602 initially inventoried entries remain unchanged; 32 parent-created evidence additions appeared during its window. The entire control tree is therefore not described as unchanged. The original absolute-path evidence index is retained; the parent's contained copy mapping verifies all 27 indexed files. The initial parent copy check assumed relative index paths and stopped before copying; the corrected check confines the observed absolute paths to the exact source directory and preserves the index unchanged.

Native report and raw evidence: `evidence/native-sdk-test-chat-20261017/report.txt`, tool history, before/after inventories, CUA inventories, failed lookups and copy-verification.json. No CLI/browser fixture, tool advertisement, resource text, model answer or guessed ID is promoted to native UI qualification.

## TP and finding disposition

T-007 is complete for the final SDK source. T-008 remains incomplete. N-CLEAN has fresh native discovery and opening observations but lacks the actual UI/SDK/context/teardown qualification. N-LEGACY has no matching final-tuple qualification, so its guarded retirement and fresh normal-context cutover are unexecuted. N-SAMEKEY and N-LIFECYCLE still lack the required supported isolated/disposable native contexts. SCN-025 regular Decision/Cockpit native routing is not newly qualified. T-009 records actual outcomes and the precise remaining gap.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-E02 | evidence_gap | evidence_obligation | closed | Complete final UI, protocol and 45-test browser pass | Retain original failures and passing final evidence. |
| CPI-E03 | evidence_gap | evidence_obligation | closed | Fresh build and all 26 canonical stages pass on matching final source | No automated repository command remains pending for dc02. |
| CPI-E04 | evidence_gap | evidence_obligation | closed | Canonical 20-sample cold/warm p95 pass with unchanged limits | Preserve exact samples. |
| CPI-E01 | evidence_gap | evidence_obligation | open | Verified dc02 installation; fresh native tool discovery/opening without legacy; supported view access remains unavailable even after app navigation | Obtain supported access to the actual new App view and capture final-tuple initialization, provider, read/context/teardown evidence. Then use the existing evidence validator and guarded legacy owner, verify the fresh normal context, and settle the pending publication. Do not ask for another TP approval or substitute synthetic proof. |

No qualified transition record, legacy disablement, final publication commit, CR/QA/UAT/OR, Git commit/push or release is claimed. Missing native access is an execution limitation under the existing approved scope, not a missing human approval.
