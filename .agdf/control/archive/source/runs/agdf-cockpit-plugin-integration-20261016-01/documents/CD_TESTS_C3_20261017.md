# CD+Tests: repaired plugin Cockpit and native Desktop retest

- decision: revise
- Run: agdf-cockpit-plugin-integration-20261016-01
- Target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework
- Binding before recording: revision 15, 7f1c99af-c944-4e17-a7d1-dc1de43dcce7
- Workspace HEAD: 568b2545b2b50fa29027da6bad6b60a84aaae8f2
- Approved UR, PRD, SD and TP remain byte-identical; their existing approvals remain valid.

The repaired candidate passes the required automated checks and the observed native document/context journey. Full native qualification and guarded legacy cutover remain incomplete. This is the implementation owner's actual execution report, not QA, human acceptance or release authority. The preceding canonical report is preserved as `CD_TESTS_PRIOR_C3_20261017.md`, SHA-256 `473fc7fbca5aaad39d902435a4f03f44469fd6005e1168bbaeaf53d71559a900`. Previous sealed evidence remains unchanged.

## Repair and installed candidate

The native panel test exposed a UI projection defect: a successful linked-context read with an empty or partially unavailable graph copied graph availability onto the successfully read Run/document. This hid the document and disabled handoff. The existing `App.tsx` scope callback now projects successful selected Run/document availability separately, using fresh returned data and retaining the original graph state. Blocked/error responses are not promoted. Three regression cases at the existing scoped-reading owner cover empty, partial and blocked responses. No Core contract, gate meaning, session owner or new cache was introduced.

Installed and enabled: `0.14.5+codex.local-c3bfb8c791e6`. Source digest: `c3bfb8c791e68cf2a681d3edb3860e632716b4183439d0669001ab65a0183a5c`; Core runtime: `7c746260ba2447d1d5322072c4ef40a2dce360ff264bc473f4302547009029b2`; server: `caffe3779119a1f25f68b2a491c814556c34f80bf7aa1b3f1a1aa0335e3e337b`; dispatcher: `41c93fd4a43388e873187c6f5364e7b570503b03921b4cd30352e82e5c090edc`; SDK: `b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb`.

UI: `sha256:3afd5e86b7793ef0225490dfbe8805ffefef53bb1655a52553f7617e4feee2f7`, 1,235,741 bytes. UI source: `sha256:b7a42566b0fdbba88ca45cc1fdd924c4f0948343fde84cfdf53b124acaf7b3f4`. Fresh dispatch after restart matched immutable generation `0c6f92936e9831c2ed88f2ff473e5f7aaa76833fd637b1765fcc57e0e4731630/0.14.5`. A later read-only installed-tuple check again matched the reviewed runtime and UI.

## Automated verification on the repaired source

| Check | Result | Evidence |
|---|---|---|
| Scoped regression suite | 14/14 passed; new empty/partial cases reproduced before repair; blocked case retained | evidence/native-context-repair-20261017/ |
| Complete HTTP/component UI and browser suites | HTTP 8/8; components 239/239; browsers 44/44, zero skipped/unexpected/flaky | evidence/native-context-repair-20261017/ |
| UI typecheck/build, plugin packaging and payload budgets | Passed; no weakened limit or assertion | evidence/native-context-repair-20261017/ |
| Fresh build preparation and build | Both passed; normally generated UI bytes match the installed/retested candidate | evidence/final-c3-verification-20261017/attempt1-prepare.log; final-build.log |
| Repaired compatibility binding | 56 evaluated, zero failed; fresh payload digest c3; source fingerprint 582c8bf3620810acf664471335eef15999a948f1aedcb9c28e9543de7ada64bc | compatibility-review.json; compatibility-record.log |
| Full canonical repository lane | All 26 stages passed in one uninterrupted retry, exit 0; 2026-10-17 11:05:47–12:15:25 UTC | final-canonical.log; final-result.json; verification-ledger.json |
| Unchanged MCP performance test in canonical lane | 20 samples each; cold p95 850.225 ms <1,500; warm p95 758.705 ms <1,000 | canonical-performance.json |
| Final workspace/snapshot comparison | 1,826 tracked non-control source/document files byte-identical; generated/control exclusions explicit | final-source-comparison.json |
| Final workspace compatibility check and diff whitespace | Passed | final-workspace-check.log |

Unsuccessful attempts are retained. The first canonical attempt diagnosed only `source_snapshot_changed`. The earlier compatibility check cited in `NATIVE_CONTEXT_REPAIR_20261017.md` had inspected an older generated profile: the participating code closure was unchanged, but payload digests still described candidate 3753. The regular fresh build exposed this stale binding. Existing `compatibility:record` re-executed all 56 scenarios, the generated evidence was reviewed and promoted, and normal build/check plus the entire canonical lane were rerun. Native inputs, historical records and native claims remain unchanged. The actual UI/server candidate stays c3; no extra plugin update is required. Earlier claims of an unchanged current compatibility fingerprint are superseded by this exact correction, not silently rewritten.

The preceding default-sandbox HTTP refusal and component timing failure are retained with their passing permitted/final reruns. No test, sample count, threshold, payload budget or compatibility gate was relaxed.

## Native Desktop observations and limits

The user restarted Desktop and expanded the actual plugin Cockpit into the right MCP App panel. Its host reported `chatgpt` version `26.1013.40934`, fullscreen display. The correct target/Run, read-only state, four approved documents, TP source digest and approval receipt were observed directly through panel DOM and screenshots.

With the repaired tuple, opening the TP's empty linked context preserves readable document content and approval association. The host confirmed context handoff. Leaving and reopening the document reset handoff state, and a second handoff succeeded. The user closed both panel and inline card; tab inventory became empty. A new plugin invocation/new exposed panel again accepted TP context handoff. Thus the closed view did not block the tested fresh publication. This black-box outcome does not establish a captured server close acknowledgement. No question was sent.

Officially documented local Desktop logs additionally record app initialization, fullscreen opening, tab-close display change, old app registration removal and new app session creation. A host-delivered `agdf_cockpit_invalid_selection` update after leaving the reopened TP had `current:false` and `authorizes:false`. These are bounded real host observations. AppServer transport, tab, app session, sandbox, chat and packet IDs are not substituted for the actual MCP provider connection identity. Generic `callMcp` handler events do not supply raw read arguments/responses; `initializeMcpApp` is not a captured `ui/initialize` request/response.

Detailed native records: `NATIVE_RETEST_C3_20261017.md`, `NATIVE_HOST_DIAGNOSTICS_20261017.md`, and their indexed evidence folders. The 16-file retest index, 4-file diagnostics index, 30-file repair index and all 81 prior automated evidence files were rehashed successfully before recording.

## TP and finding disposition

T-007 automated verification is complete for the repaired c3 source. T-008 is partially observed but incomplete: N-LEGACY has actual replacement rendering/read/context observations, while required full provider/protocol/teardown qualification, guarded retirement and final normal-context proof remain outstanding. N-CLEAN, N-SAMEKEY and destructive N-LIFECYCLE require supported separate native contexts and remain unexecuted. CLI/SDK/browser fixtures do not satisfy those native scenarios. T-009 preserves the exact results and gaps.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-E02 | evidence_gap | evidence_obligation | closed | Corrected original fixtures, complete repaired UI/browser suites and final canonical pass | Retain historical and repaired evidence. |
| CPI-E03 | evidence_gap | evidence_obligation | closed | Fresh 26-stage canonical pass after normal regeneration and reviewed compatibility correction | No automated repository command remains pending for this candidate. |
| CPI-E04 | evidence_gap | evidence_obligation | closed | Canonical cold/warm p95 pass with unchanged 20-sample limits | Retain exact samples. |
| CPI-E01 | evidence_gap | evidence_obligation | open | Actual repaired native document/context/close-reopen observations and selected Desktop logs; full strict native routing/teardown/context-isolation/lifecycle evidence still absent | Obtain supported native provider/connection and UI initialize/read/teardown diagnostics for the exact tuple, then validate transition evidence through the existing owner. Complete supported clean/same-key/disposable native scenarios. Preserve legacy until matching qualification and final cutover verification. |

Immediately before this recording, all 736 inventoried existing control files and both Host config files remain byte-identical to the native retest baseline. Project config SHA-256 is `20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8`; user config SHA-256 is `0155a9c155fecdba26b1c9a5e595832c3ee0175fdfbb7aed569182d5c5d52b17`. Evidence files are outside that preservation inventory. The authorized report writer may now change this Run/backlog through its normal transaction.

The real `agdf-cockpit-local` entry remains active. No qualified transition record was fabricated, no legacy retirement or publication settlement was performed, and the original owned marketplace backup plus exact pending c3 journal remain retained. Missing native host evidence is a concrete execution prerequisite, not missing TP approval. No CR, QA, UAT, OR, commit, push or release is claimed.
