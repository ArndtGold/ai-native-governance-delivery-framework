# OR: Versioned defaults and immediate MCP input relief

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53
- related_ur: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/UR.md
- related_prd: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/PRD.md
- related_sd: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/SD.md
- related_tp: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/TP.md
- related_qa_report: .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

This OR-full is prepared after deliberate QA and UAT acceptance of the exact presented material. It reports the existing technical qa-gate pass; it does not decide QA or grant installation, VCS or release authority. The report is complete; canonical Run completion is established only by the closeout writer receipt.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | Brownfield Review records external-contract depth and the required PRD/SD/TP path |
| PRD | approved | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/PRD.md |
| SD | approved | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/SD.md |
| TP | approved | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-30 · revision 20 · presentation fdfd355d-da87-4051-a057-5830ec122d90 sha256:bc0671d26e9d01b8df2fda964b92a70653f7c99dd55b8226d1b943e38008539b |

QA pass report digest: sha256:3213e43ab1b1b54024a67d94d77f8f4c6a249ffe7dbb4674be92af1040c03ecf. QA approval accepted at revision 20 b04ffab9-4278-49de-8558-d078f3504913, bound presentation e9a5978d-42c5-48fc-b2e7-089ffa25ba2d. UAT approval accepted at revision 21 b3bec043-4877-4c2b-be6a-18466259ef7f, bound presentation fdfd355d-da87-4051-a057-5830ec122d90. These are deliberate chat acceptances with cooperative provenance, not evidence of independent native UI clicks or human execution of tests.

## Run Status Card

| Run status | Value |
|---|---|
| Status | QA and UAT accepted; OR prepared for canonical completion |
| Current gate | OR |
| Allowed now | Record this exact closeout through its typed owner |
| Blocked by | none |
| Missing approval | none |
| Next step | Complete canonical OR recording and validate its receipt/backlog |
| Quality outlook | No additional quality follow-up required for the approved scope; qualification limits remain explicit |

## Delivered

| Item | Evidence |
|---|---|
| Canonical versioned JSON defaults and adjacent schema for exactly four preferences | plugins/agdf/meta/agdf-defaults.json and agdf-defaults.schema.json; Core configuration/resource tests |
| One validated per-confirmed-target resolution with explicit, project, then plugin precedence | Existing flat project config and legacy language trio retained; invalid recognized settings fail; extension siblings preserved |
| Immediate MCP input relief | Nine tools accept language omission; seven groups accept contract constant omissions; delivery-only route and gate-check-only selector; complete Core authority validation retained |
| Safe context and original-operation semantics | Native cwd omission is a no-effect error; private context is invocation-bound; original UUID/presence/digest snapshot retained by existing families across replay/recovery |
| Immutable presentations, effective configuration help and actionable errors | Actual SDK/native results, original bytes/language/IDs/digests, provenance and allowlisted diagnostic cases |
| Generator/resource/provenance/guidance integration | Existing owners regenerate packages/runtime resources and 14 skills; graph-linked architecture document updated |

T-001 through T-010 implementation work is fulfilled in the approved Task Plan. T-011 now has the recorded TP/Clean/Code reviews, sole QA decision and fresh QA presentation/acceptance. T-012 has the accepted UAT and is fulfilled by the canonical OR completion that records this report. Its future human dependencies were correctly left open in the earlier TP Review; this report records their subsequently observed completion without rewriting that historical review. SCN-025/AC-012 is now supported by the same-candidate reviews and accepted QA/UAT material. All twelve criteria, eight design decisions and 25 scenarios retain their approved ownership and evidence mapping.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Plugin installation/update, source commit/push/PR/merge or release | Excluded by this Run's approved scope; no such authority is inferred from gate approval | Separately requested operational handoff |
| Native Desktop/UI clicks and other host/platform qualification | Bounded proof is macOS x64 Codex CLI MCP transport; no broader support claim | Separate host qualification scope |
| Native trusted cwd completion | Current native adapter has no evidenced trusted task context; explicit directory remains required | Separately approved adapter integration |
| Token/cost savings or model-task success measurement | No model call was made by the native probe; deterministic replay cannot establish these outcomes | Separate evaluation scope if needed |
| Unrelated CONTRIBUTING, installer and other-Run changes | Protected pre-existing work, excluded from the product candidate | Their existing owners |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Exact product candidate | probe-results/mcp-defaults-run-3ab79b5a/current-candidate-inputs.json; 99 intended files on base 1833c8b4a5e3184bbcb1dde97c09a33f086dd3eb; compact manifest SHA-256 1a1279afd089b79da451a50448a8eacc280bef55b60f222da508ffcf29a35a5a | Source/candidate identity separate from live Run bookkeeping | direct |
| Build/package/resource/schema/safety/runtime checks | CD_TESTS.md and retained evidence-index.json/logs | Final scoped obligations, both SDKs, parent/Worker/generation, compatibility freshness 56/0, deterministic skill replay 113/113 | direct |
| Original operation safety | Latest 22 expanded source-revision cells, 44 approval interruption checkpoints, legacy/new reader and tampering negatives | Identity, strict versions, recovery and no duplicate effects; process interruption only | direct |
| Original-condition defect verification | CODE_REVIEW.md CR-001..003 resolved; oversized config read regression old 1/1 versus final 0/0; exact Worker field and target-plane rechecks | Correction at shared owner without changing approved semantics | direct |
| Fresh native Codex CLI transport | codex-delivered.json and delivered-native-assembly-parity.json | Six direct calls, shortened/explicit equivalence, one fixture effect, replay after config change, cwd omission error, zero models, exit 0 and cleanup/preservation | direct |
| Final local unchanged performance budgets | delivered-performance.log, 20 cold/20 warm samples | Cold p95 1417.455 ms with 1500 ms limit; warm 337.645 ms with 1000 ms limit; no speedup claim | direct |
| Brownfield fit and solution integrity | BROWNFIELD_ANALYSIS.md, TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md | Existing owners retained, no second config/ledger/authority; UX-S1..S4 fulfilled with protocol-visible evidence | direct |
| Human decisions | Exact QA and UAT approval receipts and immutable presentations | Accepted stated scope/result/limits; no independent human code review asserted | direct |

Original failed attempts remain retained: early unassembled runtime prerequisites, stale contract/version assertions, unresolved-target/error-field defects, generation fixture race, native property-order comparison, source freshness changes and loaded performance failure. The repairs and targeted rechecks are documented in CD+Tests and accepted QA. The CLI aggregate npm orchestration timed out while its child eventually passed 63/63; four trailing preview scripts separately exited 0. This segmented coverage is not relabelled as aggregate npm success. Earlier valid family results retain their tested candidate identity and documented applicability. The exact Copilot payload baseline was regenerated through its approved owner to 440 files/4647526 bytes; generic hard caps were not raised.

All 18 current OR authoring pages were consumed at revision b3bec043-4877-4c2b-be6a-18466259ef7f under manifest sha256:129d31d5602b16b9854c15632c4cbd9d97d560cc91834df92c96afba67c8a3c0. OR template digest sha256:63bde2e942e18b3ae1ba34a48474043b78c2e3782689eb691cf3918cff42c2dd is version-matched plugin content; no scaffold fallback. Final product and ten protected-file drift checks are empty; source branch/HEAD remain unchanged. Substantial AI assistance: Codex authored, implemented, tested and performed semantic self-reviews; the maintainer deliberately approved the presented gates.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| No missing mandatory proof within this accepted bounded scope | warn | Retain the exact evidence references; no redundant retest merely for closeout |
| Native Desktop/UI, other hosts/platforms and power-loss behavior | warn | Qualify only before making the corresponding broader claim |
| Installed-plugin update, GitHub CI and complete source-index verify:commit | warn | Execute applicable checks only in a separately authorized operational handoff; current index contains unrelated work |
| Model outcomes, token/cost improvement and independent human code review | warn | Do not infer them from deterministic tests or deliberate gate acceptance |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Narrow existing descriptor headroom: inspect 4954/5000, aggregate 24033/24576 bytes | warn | Future additions must stay inside the unchanged fixed caps |
| Resolution metadata consumes existing transfer/delivery capacity | warn | Keep bounded sets and use smaller transfers near caps; no limit widening |
| Volatile original context can expire or be lost with generation | warn | Existing uncertainty/restaging policy remains authoritative; never guess from current config |
| Unsupported old readers reject resolved/1 | warn | Use version-compatible runtimes for new records; supported legacy records remain unchanged |
| Uncommitted feature coexists with protected unrelated work | warn | Later VCS handoff must use the exact intended manifest and preserve excluded changes |

No open applicable normalized finding, upstream ambiguity or blocking implementation risk remains within the accepted scope. Retained behaviors are the existing complete-English fallback for valid unsupported locales, exact-capability automatic representation with Markdown fallback, supported legacy format/inventory handling and explicit volatile-context recovery limits. They are approved compatibility rules, not temporary workarounds. Their exit condition is an independently approved change to the relevant locale, representation, reader-version or retention policy; invalid config and missing cwd never silently fall back.

## Parent Reconciliation Handoff

Delivery Map evaluated the following object; no parent relationship was inferred and no other Run was mutated:

```json
{"outcome":"not_applicable","target_run_id":"","disposition":"not_applicable","evidence":"","missing_evidence":"none","next_action":"none"}
```

Programme aggregation is not applicable in the evaluated Delivery Map; no programme readiness or authority is claimed.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER; docs/architecture/core-mcp-command-flow.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The existing node already references the maintained architecture document. The updated document back-links the node and names the new defaults/schema/resolver and existing replay/transport owners; the required link work is complete, as verified by TP/Clean/QA reviews.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The accepted candidate identity, actual verification attempts, reuse boundaries and host qualification limits belong to this Run and its canonical evidence; reusable ownership guidance is linked in the existing architecture document.
- memory_refs: This Run's CD_TESTS.md, TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md, QA_REPORT.md and OR.md; probe-results/mcp-defaults-run-3ab79b5a/evidence-index.json; docs/architecture/core-mcp-command-flow.md

## Next Permissible Step

- next_allowed_action: Record this exact OR through the bound closeout owner and validate canonical completion/backlog. A separately requested delivery-closeout may then prepare the operational handoff for the intended code diff.
- required_approval: none
- forbidden_until_then: Do not claim canonical completion before its receipt; do not execute installation, commit, push, PR, merge or release without their separate requested authority.

Quality outlook: no additional quality follow-up is required for this accepted feature scope. A delivery-closeout is useful for a subsequently requested VCS/install handoff because the source contains unrelated protected changes; this OR does not produce that operative handoff.

## Approval

OR does not approve later gates. It records the accepted scope, actual evidence, limits and next permissible step. CONTRIBUTING.md and GOVERNANCE.md remain applicable; no CLA or DCO is required, and any future pull request grants no merge, release or roadmap commitment.
