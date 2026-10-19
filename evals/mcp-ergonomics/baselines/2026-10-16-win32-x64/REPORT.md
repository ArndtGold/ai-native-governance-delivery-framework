# MCP Ergonomics Baseline

Status: complete · Matrix v1 · Task set v1

## Provenance

| Field | Value |
|---|---|
| AGDF version | 0.14.5 |
| Git commit | 16d088885fc2d0383f3850a4bbd20789a8b8ff0f |
| Server digest | 0edb490c378b286ada3e5484d12a35d2a0f683941ac219d3239bb21a3e00e078 |
| Dispatcher digest | 38b66f89d16ad4706ea7df4d5b5568cc302283c34eb275f5edfe6335b44119d2 |
| SDK digest | b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb |
| Platform | win32-x64 |
| Protocol Node | v22.22.3 |
| Protocol | 2026-07-28 |
| Protocol recorded at | 2026-10-16T15:20:14.058Z |
| Claude Code | 2.1.296 |
| Native Node | v24.19.0 |
| Native git commit | 16d088885fc2d0383f3850a4bbd20789a8b8ff0f |
| Native recorded at | 2026-10-16T13:28:31.140Z |

## Protocol layer

Call matrix v1, 5 executions per call. Bytes are normalized (METRICS.md).

### Tools

| Server | Tool | Definition bytes | Documented params | Share | Description chars | Output schema | Annotations |
|---|---|---|---|---|---|---|---|
| agdf | agdf_dispatch | 10045 | 14/14 | 1 | 1123 | yes | ro=false d=false i=true |
| agdf | agdf_inspect | 4535 | 0/14 | 0 | 74 | yes | ro=true d=false i=true |
| agdf | agdf_prepare | 1716 | 0/11 | 0 | 254 | no | ro=false d=false i=false |
| agdf | agdf_record | 6755 | 0/11 | 0 | 338 | no | ro=false d=true i=false |
| agdf | agdf_approve | 1905 | 0/11 | 0 | 249 | no | ro=false d=true i=false |
| agdf | agdf_revise | 4467 | 0/11 | 0 | 344 | no | ro=false d=true i=false |
| agdf | agdf_closeout | 2466 | 0/11 | 0 | 269 | no | ro=false d=true i=false |
| agdf_cockpit_with_ui | agdf_cockpit | 1043 | 0/1 | 0 | 672 | no | ro=true d=false i=false |
| agdf_cockpit_with_ui | agdf_cockpit_read | 4710 | 0/0 | – | 231 | no | ro=true d=false i=false |

### Calls

| Call | Tool | Matrix class | Observed class | Outcome | isError | Text bytes | Est. tokens | Latency median ms | Latency p95 ms |
|---|---|---|---|---|---|---|---|---|---|
| D-VALID-STATUS | agdf_dispatch | valid | ok | control_result | false | 3683 | 921 | 586.035 | 1170.252 |
| D-SCHEMA-UNKNOWN-PROPERTY | agdf_dispatch | schema_invalid | sdk_validation | – | true | 106 | 27 | 1.701 | 1.777 |
| D-SEM-RELATIVE-DIRECTORY | agdf_dispatch | semantic_failure | agdf_failure | invalid_input | false | 1204 | 301 | 373.033 | 388.663 |
| D-SEM-UNRESOLVED-TARGET | agdf_dispatch | semantic_failure | agdf_failure | target_unresolved | false | 2753 | 689 | 386.826 | 390.326 |
| I-VALID-DOCTOR | agdf_inspect | valid | ok | inspect_result | false | 2222 | 556 | 420.088 | 425.994 |
| I-VALID-STATUS-CARD | agdf_inspect | valid | ok | inspect_result | false | 21374 | 5344 | 559.178 | 599.109 |
| I-VALID-DOCUMENT-PAGES p1 | agdf_inspect | valid | ok | inspect_result | false | 35003 | 8751 | 382.839 | 446.146 |
| I-VALID-DOCUMENT-PAGES p2 | agdf_inspect | valid | ok | inspect_result | false | 34994 | 8749 | 385.488 | 535.57 |
| I-VALID-DOCUMENT-PAGES p3 | agdf_inspect | valid | ok | inspect_result | false | 14299 | 3575 | 389.35 | 409.017 |
| I-SCHEMA-UNKNOWN-OPERATION | agdf_inspect | schema_invalid | sdk_validation | – | true | 122 | 31 | 0.904 | 1.116 |
| I-SEM-UNKNOWN-RUN | agdf_inspect | semantic_failure | ok | inspect_result | false | 10020 | 2505 | 467.202 | 487.393 |
| P-VALID-PREPARE-PRD | agdf_prepare | valid | ok | accepted | false | 6195 | 1549 | 859.704 | 907.149 |
| P-SCHEMA-MISSING-OPERATION-ID | agdf_prepare | schema_invalid | sdk_validation | – | true | 112 | 28 | 0.88 | 1.189 |
| P-SEM-STALE-REVISION | agdf_prepare | semantic_failure | agdf_failure | rejected | false | 1344 | 336 | 539.203 | 572.751 |
| R-VALID-EVIDENCE | agdf_record | valid | ok | accepted | false | 4096 | 1024 | 694.135 | 709.089 |
| R-SCHEMA-MISSING-COVERS | agdf_record | schema_invalid | sdk_validation | – | true | 2687 | 672 | 1.014 | 1.953 |
| R-SEM-TARGET-MISMATCH | agdf_record | semantic_failure | agdf_failure | rejected | false | 1100 | 275 | 545.596 | 558.146 |
| A-VALID-APPROVE-UR | agdf_approve | valid | ok | accepted | false | 5494 | 1374 | 966.431 | 1017.792 |
| A-SCHEMA-MISSING-RESPONSE | agdf_approve | schema_invalid | sdk_validation | – | true | 177 | 45 | 0.966 | 1.071 |
| A-SEM-UNKNOWN-PRESENTATION | agdf_approve | semantic_failure | agdf_failure | rejected | false | 2345 | 587 | 764.977 | 933.516 |
| V-VALID-PREVIEW-UR | agdf_revise | valid | ok | accepted | false | 8461 | 2116 | 608.846 | 813.411 |
| V-SCHEMA-UNKNOWN-GATE | agdf_revise | schema_invalid | sdk_validation | – | true | 1357 | 340 | 0.991 | 1.569 |
| V-SEM-PROPOSAL-DIGEST | agdf_revise | semantic_failure | agdf_failure | rejected | false | 1204 | 301 | 574.363 | 588.031 |
| C-VALID-CLOSEOUT | agdf_closeout | valid | ok | accepted | false | 4196 | 1049 | 1155.538 | 1222.924 |
| C-SCHEMA-MISSING-CONFIRMATION | agdf_closeout | schema_invalid | sdk_validation | – | true | 491 | 123 | 0.907 | 3.359 |
| C-SEM-NOT-AT-OR | agdf_closeout | semantic_failure | agdf_failure | rejected | false | 1165 | 292 | 571.98 | 588.69 |
| K-NOUI-RENDER | agdf_cockpit | semantic_failure | agdf_failure | blocked:resource_denied | false | 294 | 74 | 1.328 | 552.263 |
| K-NOUI-SNAPSHOT | agdf_cockpit_read | valid | agdf_failure | blocked:resource_denied | false | 294 | 74 | 1.419 | 3.267 |
| K-NOUI-SEM-UNKNOWN-OPERATION | agdf_cockpit_read | semantic_failure | sdk_validation | – | true | 1832 | 458 | 0.989 | 1.58 |
| K-VALID-RENDER | agdf_cockpit | valid | ok | – | false | 160 | 40 | 1.307 | 547.225 |
| K-VALID-SNAPSHOT | agdf_cockpit_read | valid | ok | – | false | 8675 | 2169 | 54.873 | 281.78 |
| K-SEM-UNKNOWN-OPERATION | agdf_cockpit_read | semantic_failure | sdk_validation | – | true | 1832 | 458 | 0.939 | 1.353 |

Classes: ok 14, sdk_validation 9, agdf_failure 9, tool_error_other 0, protocol_error 0; failures without isError 9 of 32 calls.

## Native layer

Models claude-opus-5-5, claude-sonnet-5-5; variants with_skills, mcp_only; 2 repetitions; cost cap 25 USD.
Consumed 9.47911 USD; cap reached: false. Isolation: unchanged.

| Model | Variant | Task | Sessions | success | tool_calls_total | invalid_argument_calls | is_error_results | agdf_failure_results | agdf_shell_calls | response_tokens_total | total_tokens | cost_usd | wall_time_ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| claude-opus-5-5 | with_skills | T1 | 1:measured 2:measured | 0 | 2/3 (2–3) | 0 | 0 | 0 | 0 | 2187/2619 (2187–2619) | 61432/62730 (61432–62730) | 0.163229/0.173596 (0.163229–0.173596) | 29927/27199 (27199–29927) |
| claude-sonnet-5-5 | with_skills | T1 | 1:measured 2:measured | 0 | 2/3 (2–3) | 0 | 0 | 0 | 0 | 1737/1796 (1737–1796) | 60926/61144 (60926–61144) | 0.078057/0.078044 (0.078044–0.078057) | 17990/18416 (17990–18416) |
| claude-opus-5-5 | mcp_only | T1 | 1:measured 2:measured | 1 | 4/2 (2–4) | 1/0 (0–1) | 1/0 (0–1) | 1/0 (0–1) | 0 | 3241/4466 (3241–4466) | 38449/47486 (38449–47486) | 0.123636/0.214872 (0.123636–0.214872) | 19543/17615 (17615–19543) |
| claude-sonnet-5-5 | mcp_only | T1 | 1:measured 2:measured | 1 | 2 | 0 | 0 | 0 | 0 | 4466/4559 (4466–4559) | 47505/47367 (47367–47505) | 0.107989/0.106174 (0.106174–0.107989) | 10551/8174 (8174–10551) |
| claude-opus-5-5 | with_skills | T2 | 1:measured 2:measured | 1 | 8/9 (8–9) | 0 | 0/1 (0–1) | 0 | 2 | 3656/3884 (3656–3884) | 252000/244068 (244068–252000) | 0.40361/0.32217 (0.32217–0.40361) | 53301/61805 (53301–61805) |
| claude-sonnet-5-5 | with_skills | T2 | 1:measured 2:measured | 1 | 8 | 0 | 0/2 (0–2) | 0 | 2 | 3189/3015 (3015–3189) | 183167/180310 (180310–183167) | 0.143636/0.145141 (0.143636–0.145141) | 42411/44872 (42411–44872) |
| claude-opus-5-5 | mcp_only | T2 | 1:measured 2:measured | 0 | 5 | 0 | 0 | 0 | 0 | 1389/1309 (1309–1389) | 100955/102455 (100955–102455) | 0.202368/0.211861 (0.202368–0.211861) | 25036/30036 (25036–30036) |
| claude-sonnet-5-5 | mcp_only | T2 | 1:measured 2:measured | 0 | 3/6 (3–6) | 0 | 1 | 1/0 (0–1) | 0 | 647/1430 (647–1430) | 20191/130920 (20191–130920) | 0.033965/0.14012 (0.033965–0.14012) | 7175/20441 (7175–20441) |
| claude-opus-5-5 | with_skills | T3 | 1:measured 2:measured | 1 | 7/8 (7–8) | 2 | 2 | 1 | 0 | 7289/7309 (7289–7309) | 190891/228744 (190891–228744) | 0.328103/0.345218 (0.328103–0.345218) | 34463/59497 (34463–59497) |
| claude-sonnet-5-5 | with_skills | T3 | 1:measured 2:measured | 1 | 8 | 2 | 2 | 1 | 0 | 6995 | 233595/238126 (233595–238126) | 0.164169/0.16684 (0.164169–0.16684) | 31259/28411 (28411–31259) |
| claude-opus-5-5 | mcp_only | T3 | 1:measured 2:measured | 0 | 21/13 (13–21) | 7/5 (5–7) | 11/6 (6–11) | 3/1 (1–3) | 0 | 5173/3792 (3792–5173) | 289485/150260 (150260–289485) | 0.380497/0.250949 (0.250949–0.380497) | 79361/54583 (54583–79361) |
| claude-sonnet-5-5 | mcp_only | T3 | 1:measured 2:measured | 0/1 (0–1) | 4/13 (4–13) | 2/4 (2–4) | 2/4 (2–4) | 1/4 (1–4) | 0 | 730/8571 (730–8571) | 76093/182370 (76093–182370) | 0.089562/0.164829 (0.089562–0.164829) | 12710/44336 (12710–44336) |
| claude-opus-5-5 | with_skills | T4 | 1:measured 2:measured | 0 | 6/7 (6–7) | 0 | 0 | 0 | 0 | 36476/36956 (36476–36956) | 174389/177957 (174389–177957) | 0.585102/0.593055 (0.585102–0.593055) | 45433/47356 (45433–47356) |
| claude-sonnet-5-5 | with_skills | T4 | 1:measured 2:measured | 0 | 10/4 (4–10) | 1/2 (1–2) | 1/2 (1–2) | 0/1 (0–1) | 0 | 3190/791 (791–3190) | 259322/101046 (101046–259322) | 0.151874/0.077518 (0.077518–0.151874) | 60099/12173 (12173–60099) |
| claude-opus-5-5 | mcp_only | T4 | 1:measured 2:measured | 0 | 13/12 (12–13) | 4 | 5/4 (4–5) | 2 | 0 | 23451/23435 (23435–23451) | 182486/181535 (181535–182486) | 0.43938/0.440724 (0.43938–0.440724) | 65385/72280 (65385–72280) |
| claude-sonnet-5-5 | mcp_only | T4 | 1:measured 2:measured | 0 | 9/8 (8–9) | 2/3 (2–3) | 3/4 (3–4) | 2/0 (0–2) | 0 | 22887/22035 (22035–22887) | 140855/115685 (115685–140855) | 0.196634/0.181894 (0.181894–0.196634) | 32495/24537 (24537–32495) |
| claude-opus-5-5 | with_skills | T5 | 1:measured 2:measured | 1/0 (0–1) | 4/3 (3–4) | 1 | 1 | 1 | 0 | 3571/668 (668–3571) | 107077/81310 (81310–107077) | 0.213077/0.155138 (0.155138–0.213077) | 30198/22133 (22133–30198) |
| claude-sonnet-5-5 | with_skills | T5 | 1:measured 2:measured | 0/1 (0–1) | 2 | 0 | 0 | 1/0 (0–1) | 0 | 632/4559 (632–4559) | 58177/67665 (58177–67665) | 0.063305/0.100802 (0.063305–0.100802) | 7365/10365 (7365–10365) |
| claude-opus-5-5 | mcp_only | T5 | 1:measured 2:measured | 0 | 2/3 (2–3) | 1/0 (0–1) | 1/0 (0–1) | 0/2 (0–2) | 0 | 127/1364 (127–1364) | 17633/59980 (17633–59980) | 0.059058/0.175939 (0.059058–0.175939) | 18102/16960 (16960–18102) |
| claude-sonnet-5-5 | mcp_only | T5 | 1:measured 2:measured | 0 | 6/3 (3–6) | 1/2 (1–2) | 2 | 3/0 (0–3) | 0 | 1275/209 (209–1275) | 51366/24223 (24223–51366) | 0.056962/0.032742 (0.032742–0.056962) | 21559/11625 (11625–21559) |
| claude-opus-5-5 | with_skills | T6 | 1:measured 2:measured | 0 | 4/6 (4–6) | 1 | 1 | 0/1 (0–1) | 0 | 4696/5624 (4696–5624) | 95932/168385 (95932–168385) | 0.245996/0.300925 (0.245996–0.300925) | 19677/28464 (19677–28464) |
| claude-sonnet-5-5 | with_skills | T6 | 1:measured 2:measured | 0 | 7/4 (4–7) | 1/0 (0–1) | 1/0 (0–1) | 1/0 (0–1) | 0 | 3735/2928 (2928–3735) | 198699/97250 (97250–198699) | 0.150232/0.118372 (0.118372–0.150232) | 32201/22106 (22106–32201) |
| claude-opus-5-5 | mcp_only | T6 | 1:measured 2:measured | 0 | 5/6 (5–6) | 1 | 1 | 1 | 0 | 5613/3548 (3548–5613) | 107038/75353 (75353–107038) | 0.280232/0.190847 (0.190847–0.280232) | 29390/42929 (29390–42929) |
| claude-sonnet-5-5 | mcp_only | T6 | 1:measured 2:measured | 0 | 5 | 1 | 1 | 1 | 0 | 1002/985 (985–1002) | 56846/57501 (56846–57501) | 0.064919/0.065748 (0.064919–0.065748) | 20470/19201 (19201–20470) |

All planned sessions were measured.

Success of T6 was re-evaluated from the recorded transcripts with the corrected predicate (stale_write_guarded); 8 of 8 session verdicts changed.

## Findings mapping

| ID | Finding | Metrics | Note |
|---|---|---|---|
| F01 | AGDF domain failures are returned without isError | protocol.summary.classes.failure_without_isError, native.agdf_failure_results |  |
| F02 | Worker maps every exception to dispatch_worker_failed (repair runtime / effect_unknown before dispatch) | – | Not measurable in this slice: Call matrix v1 has no input that fails inside the worker after SDK validation (for example the 64 KB command budget); add such a call in a later matrix version. |
| F03 | invalid_input is terminal and sends agent-directed text to the human | protocol.calls.D-SEM-RELATIVE-DIRECTORY, native.T5.success, native.invalid_argument_calls |  |
| F04 | agdf_inspect and the command tools leave parameters undocumented | protocol.tools.documented_share, native.mcp_only.success, native.invalid_argument_calls |  |
| F05 | Command rejections return codes without recovery guidance; cockpit errors are undifferentiated | protocol.calls.semantic_failure.outcome, native.T6.success |  |
| F06 | Behavioral instructions live in descriptions and results | native.with_skills_vs_mcp_only.success, protocol.calls.D-VALID-STATUS.text_bytes | Indirect only: the share of instruction payload is not separated from data in v1. |
| F07 | Tools mix effect classes (preview with apply, runtime replacement with recording) | protocol.tools.annotations | Static annotations only; host permission prompts per call are not measured in v1. |
| F08 | Large responses and a 1 MB cap far above host limits | protocol.calls.text_bytes, protocol.calls.est_tokens, native.response_tokens |  |
| F09 | Per-call worker and provenance hashing cause high latency | protocol.calls.latency_ms, native.wall_time_ms |  |
| F10 | Command tools lack outputSchema; dispatch fields are loosely typed | protocol.tools.has_output_schema |  |
| F11 | No MCP-specific evaluations exist | baseline.exists | Closed by this baseline itself. |
| F12 | Metadata inconsistencies (capability manifest, idempotentHint, missing titles, handle lifetimes) | protocol.tools.has_title, protocol.tools.annotations | The capability manifest and handle-lifetime texts are not compared in v1. |

## Limitations

- Token counts are estimates (normalized bytes / 4), not tokenizer counts.
- Native cost is Claude Code's reported API-equivalent figure.
- Two repetitions show a range, not a robust spread.
- Latency depends on the measuring machine and is not compared between runs.
- T6 (`stale_write_guarded`) requires a write attempt with the stale revision that AGDF rejects; an agent that checks the revision first and asks instead of writing does not pass.
