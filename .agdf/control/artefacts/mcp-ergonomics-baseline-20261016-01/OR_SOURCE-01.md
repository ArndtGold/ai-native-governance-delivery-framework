# OR: MCP ergonomics baseline evaluation

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: mcp-ergonomics-baseline-20261016-01
- related_ur: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md
- related_prd: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD.md
- related_sd: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD.md
- related_tp: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md
- related_qa_report: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-16 · revision 28 · presentation 912f7562-8185-4f50-8ebc-22e484acc0ba · .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_REVIEW.md |
| PRD | approved | `Approval: PRD` · 2026-10-17 · revision 31 · presentation 0e5cfa07-f961-40a3-8725-fa2e4d0a7f55 · .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/PRD.md |
| SD | approved | `Approval: SD` · 2026-10-17 · revision 33 · presentation b7364678-a81f-48b9-a0d1-86b99ff7d5c3 · .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD.md |
| TP | approved | `Approval: TP` · 2026-10-17 · revision 35 · presentation 05ce4021-5462-40f9-bacc-8ba0d122f919 · .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/CODE_REVIEW.md |
| QA | approved | `Approval: QA` · 2026-10-17 · revision 41 · presentation af8e7a7b-51e6-408b-8485-d0b58242b61e · .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-17 · revision 42 · presentation f766b4ea-af3e-4f39-9f40-3d75b0a2f15f sha256:126abdd1fe617272b27afa6752015c7072e6e5145dedbd524f27cde80c36044f |

Two UR source revisions renewed the chain: `835fbe03-7a34-4676-92b8-6616c355e6d5` (2026-10-16) removed native Codex measurement from scope, and `ad5a4176-32d1-4b55-a42f-779bb2d8eaee` (2026-10-16) corrected only the localized UR summary after UAT preparation could not read it. UR, PRD, SD and TP were approved again on their current material and every later step was recorded afresh. All user gates are approved for their exact current material. OR records completion; it grants no VCS, installation or publication authority.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Approved bounded delivery complete; this report is published by the canonical closeout transaction |
| Current gate | OR |
| Allowed now | Record exact OR and prepare the operational handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | The owner commits the change set on `feat/mcp-ergonomics-baseline-20261016-01` |
| Quality outlook | Phase 1 (MCP error contract) can start against this baseline; the native Codex measurement is a separate follow-up slice |

## Delivered

| Item | Evidence |
|---|---|
| Measurement component `evals/mcp-ergonomics/` with metrics rule, normalization, classification, fixtures F1 to F5, call matrix v1 (32 calls), task set v1 (T1 to T6), report, findings map and compare | `METRICS.md`, `README.md`, `lib/`, `call-matrix.v1.json`, `tasks.v1.json`, `findings-map.v1.json`; `CD_TESTS.md` |
| Protocol layer over the seven `agdf` tools and the cockpit without and with UI capability | `evals/scripts/run-mcp-ergonomics-protocol.js`; protocol runs A/B and D/E identical in every non-timing metric |
| Native Claude Code layer: Opus 5.5 and Sonnet 5.5, `with_skills` and `mcp_only`, two rounds, 25 USD cap, isolation proof, cleaned transcripts | `evals/scripts/run-mcp-ergonomics-native.js`; native run 3: 48 of 48 sessions, 9.48 USD, `complete` |
| Shared Claude session module, also used by the existing host E2E probe | `scripts/native-probes/lib/claude-session.mjs`, `scripts/native-probes/claude-host-e2e.mjs` |
| Promoted baseline and report | `evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/baseline.json`, `REPORT.md` |
| Unit tests in the repository CI lane and root scripts | `test:mcp-ergonomics` (37 tests), verify-ci stage `mcp-ergonomics`, `eval:mcp-ergonomics:protocol`, `:native`, `:compare` |
| Unchanged AGDF MCP interfaces | `evidence/TOOLS_LIST_BEFORE.json` and `TOOLS_LIST_AFTER.json` byte-identical; nothing under `packages/` changed |
| Technical reviews, QA and human acceptance | `TP_REVIEW.md`, `CLEAN_IMPLEMENTATION_REVIEW.md`, `CODE_REVIEW.md`, `QA_REPORT.md` and the QA/UAT approval receipts |
| Context Graph link | `CG-MCP-DISPATCH-ADAPTER` entry `mcp_ergonomics_baseline_20261017` |

Baseline results for the later phases: every one of the 9 AGDF failure results is returned without `isError` (F01); MCP-only agents cannot start a delivery run (T2 0 of 4); no session completed `agdf_inspect` `presentation-document` because of required fields the schema does not describe (T4, F04); T5 failures are `target_unresolved` after an omitted `target_source` (F03, F05); with skills, T1 agents read control files through the shell instead of AGDF.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Native measurement on Codex, GitHub Copilot or OpenCode | Removed from scope by UR source revision `835fbe03` | Separate follow-up slice (native Codex measurement) |
| Changes to MCP interfaces, contracts, error mapping or performance | Phases 1 to 3 of the interface plan | Phase 1 (error contract) as its own run |
| CI thresholds or regression budgets | Phase 4 | Phase 4 run |
| Commit, push or pull request | The owner commits; no VCS action was requested | Owner |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approved sources and bindings | UR.md, PRD.md, SD.md, TP.md with derivation reviews `*_DERIVATION_REVIEW-02.json` | Exact approved intent, design and plan | direct |
| Implementation and tests | CD_TESTS.md; `evidence/IMPLEMENTATION_STATUS.md`; `evidence/BASELINE_COMPARE.json` | T-001 to T-013, suites, `tools/list`, diff scope | direct |
| Code Review with sixteen resolved findings | CODE_REVIEW.md; `evidence/CR_FIX_VERIFICATION.json`; `evidence/CR13_NATIVE_SMOKE.md` | Defects CR-01 to CR-16, re-evaluated T6, corrected runner in native sessions | direct |
| TP Review | TP_REVIEW.md; `evidence/CLEAN_CHECKOUT_VERIFICATION.md` | 13 of 13 tasks, AC-001 to AC-015; SCN-019 from a clean checkout (TPR-01, TPR-02 resolved) | direct |
| Clean Implementation Review | CLEAN_IMPLEMENTATION_REVIEW.md | Reuse of harness, fixtures and Core reads; bounded, visible guards; no normalized finding | direct |
| QA and UAT | QA_REPORT.md; QA and UAT approval receipts in RUN_STATE.md | Sole QA decision `pass`; deliberate human acceptance on exact material | direct |
| Baseline reproducibility | `evidence/CLEAN_CHECKOUT_VERIFICATION.md` | Protocol run from a fresh clone compares `unchanged` against the baseline | direct |

TP Review and Clean Implementation Review were recorded after UAT approval. The run reached OR without them, and AGDF 0.14.5 accepted both steps only at CR or QA while closeout required them; that dead end was fixed in AGDF before closeout. The TP Review ran SCN-019 from a clean checkout for the first time and found that the README omitted the MCP server dependency install (TPR-01). With the owner's consent the README gained a Setup section after UAT; no code, test or metric changed, and the re-run from a fresh clone passed.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Native results beyond Claude Code 2.1.296 on Windows with Opus 5.5 and Sonnet 5.5 | warn | Native Codex follow-up slice; repeat on other hosts before generalizing |
| Spread beyond two repetitions per cell | warn | More repetitions only if a later phase needs statistical claims |
| Native host E2E probe re-run after the shared session module changed | warn | Run `npm run native:claude-e2e` from an external terminal before relying on the probe again |
| Paid native sessions from a clean checkout | warn | The clean checkout was verified with `--dry-run`; paid sessions ran from the working tree with the same tracked content |
| Signal cleanup and charging an unknown session cost in a real run | warn | Unit-tested only; observe when such a case occurs |

No mandatory evidence for the accepted slice is missing. These are disclosed qualification limits, not skipped checks counted as passed.

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| `packages/mcp-server` `test:performance` fails on this Windows machine (warm dispatch p95 about 2.5 s against 1 s, F09); pre-existing and unchanged | warn | Phase 3 (response budget and warm worker) |
| Native run 2 lost 29 sessions to unexplained AGDF MCP connect timeouts | warn | The pre-session check records launcher diagnostics if they recur |
| `--credentials-copy` can still copy the real login into the isolated home | warn | Opt-in only; the default is `CLAUDE_CODE_OAUTH_TOKEN` (CR-16) |
| Nothing is committed yet | warn | Owner commits the change set on the feature branch |
| The UAT approval was recorded through the CLI after an AGDF MCP worker held the run lock; the run summary format was validated only at UAT; the quality projection showed missing evidence; closeout required steps it could not record | warn | AGDF defects handed to the fix run `core-approval-lock-defects-20261017-01`; no effect on this delivery's evidence |

No blocking finding remains. No guard, cap, timeout or approval rule was weakened to pass a check.

## Retained Fallbacks And Exit Criteria

The native runner keeps one bounded retry of the free pre-session MCP check; every attempt is recorded and a failed check aborts the cell without cost. The credential copy is the approved SDD-006 mechanism and needs the explicit `--credentials-copy` opt-in. Both are measurement procedure, not product fallbacks. Root replacement exists in `normalize.js` (SDD-004) and in `createRedactor` (SDD-006); unifying them is a candidate for the native Codex follow-up slice.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: none
- missing_evidence: none
- next_action: none

The values above are copied from the selected-run Delivery Map projection. No Parent was inferred or mutated. Programme aggregation is not applicable according to the same projection.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER; evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The existing node `CG-MCP-DISPATCH-ADAPTER` has the entry `mcp_ergonomics_baseline_20261017`, which links the baseline as the reference for later MCP interface phases; no new node.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The baseline and its findings are reusable reference knowledge for the MCP interface phases; run-specific attempts stay in this run's evidence.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER

## Next Permissible Step

- next_allowed_action: The owner commits the change set on `feat/mcp-ergonomics-baseline-20261016-01`; delivery-closeout may prepare the commit handoff.
- required_approval: none
- forbidden_until_then: commit, push, pull request, installation or publication without a separate explicit user instruction.

## Quality Outlook

Phase 1 (MCP error contract) can start and compare against this baseline. The native Codex measurement and a re-run of the native host E2E probe remain open follow-ups; no required technical repair remains within the accepted slice.

## Approval

OR records the accepted delivery and the exact next permissible step. It grants no later approval and performs no commit, push, PR, installation or publication.
