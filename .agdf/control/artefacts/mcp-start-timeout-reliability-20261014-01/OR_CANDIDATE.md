# OR: Reliable MCP runtime and coherent Codex host setup

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: mcp-start-timeout-reliability-20261014-01
- related_ur: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UR.md
- related_prd: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/PRD.md
- related_sd: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/SD.md
- related_tp: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/TP.md
- related_qa_report: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

This closeout records the approved local technical scope. It preserves the protected QA report as authored before its human approval; historical pending-gate prose is not rewritten. Current QA and UAT receipts supersede that temporal state, without upgrading any native-host or historical-cause claim. Prepared against revision 21, 67d8b0f3-02c6-4ff3-86e5-4742dd24e74c; completion is established only by the matched closeout transaction and subsequent canonical evaluation.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/PRD.md |
| SD | approved | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/SD.md |
| TP | approved | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-10-14 · revision 20 · presentation e5b0e879-fdd0-4beb-a5bc-1985af26bc86 sha256:850efcad6336dc142c832fb109e97e828403c3b28e62f9a979c1d60ff83f9fcc |
| Mode/Slice Decision | structured_delivery | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/BROWNFIELD_REVIEW.md |
| TP Review | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/TP_REVIEW.md |
| Clean Implementation Review | done | .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/CLEAN_IMPLEMENTATION_REVIEW.md |

Fresh human QA receipt: evidence/QA_APPROVAL_RESULT.json, operation c90d2c47-ae34-407b-a367-ce5412739b56, revision 19 to 20, exact QA sha256:dc50ea34d8a561245bc784e366278925d6d2fc24808d5ab2f63137df6ed47ff1.
Fresh human UAT receipt: evidence/UAT_APPROVAL_RESULT.json, operation d20fdb0d-047f-4630-91a2-23f2782b129b, revision 20 to 21, presentation e5b0e879-fdd0-4beb-a5bc-1985af26bc86, record sha256:850efcad6336dc142c832fb109e97e828403c3b28e62f9a979c1d60ff83f9fcc.
Technical QA remains pass; no deviation-acceptance route was used. Cooperative caller-forwarded human replies are not independent cryptographic human proof.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Ready for the exact OR recording; completed after its accepted receipt |
| Current gate | OR |
| Allowed now | Record this report and deliver the scoped result |
| Blocked by | none |
| Missing approval | none |
| Next step | Review the completed scoped delivery |
| Quality outlook | Scoped technical pass; native/cross-host and compatibility limits retained |

## Delivered

| Item | Evidence |
|---|---|
| Atomic complete owner records, closed schema/liveness, bounded verified contention, inode/token guarded cleanup | CD_TESTS.md; evidence/core-transaction-closed-schema.log; lock-owner-closed-shape.log; installed-qualification.json |
| SDK acquisition and publication share the unchanged 30000ms deadline; directly owned no-script child receives remaining timeout | evidence/baseline-acquisition-overrun.json; installed-qualification.json; launcher-child-focused-qualified.log |
| Worker capacity remains protected until confirmed termination; unknown effects recover only through original UUID | CD_TESTS.md; complete MCP safety/generation/protocol tests; installed-recovery-reviewed.json |
| Safe phase and failure allowlists with redaction; fresh full provenance and isolated request execution preserved | CODE_REVIEW.md; generation/provenance/canary regressions in evidence/checks.json |
| Codex closed roles and exact config/wrapper revalidation for transitions, unchanged repeats and guarded rollback | evidence/config-indentation-final.log; lifecycle-complete-final.log; codex-role-final-owner.log |
| Honest source, ownership, configured/started/discovered/native/session/policy states; en/de and fr-CA fallback rendering | evidence/host-setup-final.json; host-setup-final-en.txt; host-setup-final-de.txt; host-setup-final-fr-CA.txt |
| Optional AGDF Cockpit / agdf-cockpit preparation and explicit agdf-test-* descriptors with own cleanup lifecycle | scripts/prepare-cockpit-local.mjs; scripts/native-probes/core-mcp-decision.mjs; evidence/diagnostic-repeat-final.json |
| Exact final supported installation and frozen source/marketplace/cache identity, direct installed CLI/STDIO qualification | evidence/final-identities.json; installed-qualification.json; installed-recovery-reviewed.json |
| Normal build, 56 compatibility scenarios, 102 unchanged deterministic eval cases and existing bounds | evidence/checks.json; compatibility-closed-owner-qualified.log; build-closed-owner-qualified.log; performance-final-qualified.log |
| Current technical reviews, fresh QA/UAT decisions and this durable closeout | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md; evidence/QA_APPROVAL_RESULT.json; UAT_APPROVAL_RESULT.json |

Plan coverage: T-001 through T-010 are fully done. T-011's pre-QA assessment correctly retained later human/lifecycle work; new QA/UAT have now occurred and its final OR obligation is fulfilled only when this exact report is accepted. No protected review is retrospectively rewritten. All 14 approved PRD criteria, 10 SD decisions and 32 TP scenarios retain their established mappings. Conditional retained and native-unobserved branches are approved behavior, not claimed native success.

Brownfield fit and solution integrity: existing Core transaction/lock, package publisher, generation/Worker, Codex lifecycle and presentation owners are reused. No second config writer, mutable runtime registry, persistent Worker pool, cached provenance bypass, duplicate product server, approval authority or increased production budget was introduced. Five normalized implementation findings are resolved; no required open normalized gap remains. Reviews are cooperative self-review, not independent peer review.

Documentation impact: run-local requirements, design, tests, review, qualification and recovery material record exact invariants and boundaries. Compatibility evidence and deterministic bindings were refreshed without changing their assertions or grading outcomes. Unrelated user architecture/UI/mockup work is excluded from this delivery and is not reverted or qualified here.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Fresh native desktop render/interaction/teardown, loaded final-session identity and effective host policy | No current native observation; CLI/STDIO does not establish it | Explicitly scoped host qualification and supported user-triggered refresh |
| Native Windows or live model-host reliability claim | Qualification is local darwin-x64 / pinned Node 22.22.3; deterministic replay is not a model run | Separate native-host qualification owner |
| Attribution of every historical broad startup/timeout failure | Original private exception/phase traces unavailable; demonstrated mechanisms have direct before/after proof | Diagnostics owner, only from original incident evidence |
| Removal/renaming of actual historical probe/Cockpit registrations | Exact wrapper ownership, namespace consumers and old live references unconfirmed | Existing Codex lifecycle owner, after supported refresh and exact transition proof |
| Automatic app restart, shared process kill or MCP-App storage purge | Neither required nor authorized; shared state remains protected | Human host lifecycle owner |
| Commit, push, PR or release | Run acceptance does not authorize VCS/publication | Explicit human instruction and delivery-closeout |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Frozen final identity | evidence/final-identities.json | 0.14.5+codex.local-0e4bdc1df572; source/cache/marketplace match | direct |
| Actual configured producer | QA_REPORT.md; evidence/installed-qualification.json | Dispatcher 99ba11c32405acfb2445da5227d7049be836f3988789c2ee658838af79dcaece; server 57e00b512994b060995ff5875e89620f87bf5a275857ea217f87f2ba6f1dd6b1; SDK b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb | direct |
| Actual final workloads | evidence/installed-qualification.json | All 120 samples retained: 20 cold, 20 warm, ten three-client and ten product/diagnostic waves; cold p95 2052.847ms, warm 552.899ms, parallel 2529.540ms | direct |
| Bounds and baseline | evidence/baseline-acquisition-overrun.json; installed-qualification.json | Old 33427.061ms late publication versus new 29970ms remaining child timeout and 30006.759ms observed exit/cleanup total; configured 30000ms unchanged | direct |
| Recovery and refusals | evidence/installed-recovery-raw.json; installed-recovery-reviewed.json | Original UUID/replay, stale and changed payload refusal; unknown/corrupt/symlink/foreign/oversized states preserve bytes | direct |
| Source/fixture tests | evidence/checks.json; scenario-evidence-index.json; normal logs | Fixed guards: fixture cold p95 895.219ms, warm 799.051ms; complete suites and affected final owner tests | direct |
| Host data preservation | evidence/host-data-preservation-final.json | Actual user/project config preserved; managed disposable transitions distinct from user-host cleanup | direct |
| Plan and code review | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md | Current scoped coverage and resolved findings | indirect |
| Deliberate fresh gate replies | evidence/QA_APPROVAL_RESULT.json; UAT_APPROVAL_RESULT.json | Exact recorded presentation/material and target/run/revision | direct |

Normalized source digest: 0e4bdc1df572158e7ea7dddb23cb83cdacb13705dd3141f9ce64bdc90d0d3422.
Full runtime digest: 3d890ceb675781ee98f9ee298e1f989e455b19b0997f64153005ef8c815d7117.
Installed provenance, protocol, source and fresh native-host behavior remain separate evidence lanes.

Counterevidence remains retained: the earlier real three-client LOCK_UNCONFIRMED drove the atomic owner fix; earlier overloaded performance outliers remain visible; the child-focused fixture's 250ms prerequisite assumption was corrected with a 3000ms test-only allowance while production stayed 30000ms. The raw recovery collector's duplicate status key is explicitly disambiguated in reviewed evidence without inventing another execution. Tooling path/argument mistakes did not mutate approved source or authorize another effect.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Fresh native desktop App/session/policy and native Windows/model-host observations | warn | Obtain direct separately scoped host evidence before making those claims |
| Individual historical original exception/phase traces | warn | Preserve unknown attribution unless original incident evidence is available |
| Actual legacy wrapper ownership, namespace and live consumer transition | warn | Prove exact ownership/references before any actual migration or cleanup |

These are stronger-claim boundaries already disclosed at QA/UAT. Required current direct-path proof exists; no required current implementation or evidence obligation is silently waived.

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Existing clients can retain an older loaded runtime | warn | Host user deliberately refreshes only affected clients; new exact session proof precedes fresh-native claims |
| Slow first acquisition now fails at the existing shared budget | warn | Supported installer preparation/prewarm; no timeout increase |
| Unknown/claimed immutable generations and legacy IDs remain conservatively retained | warn | Existing lifecycle/retention owner; remove only after exact owner and no-live-reference proof |
| Final payload is 253 files / 2218869 bytes with zero spare headroom | warn | Packaging owner rechecks legitimate future changes; no disabled guard or hidden allowance |
| Local cooperative qualification does not guarantee other hosts/workloads | warn | Preserve exact lane and workload in any handoff |

Retained fallbacks and finite exits: unobserved native mediation keeps existing exact-bound text/document fallback until the full current host/server/dispatcher/SDK/resource tuple and actual initialize/render/interaction/teardown are proved. Old Cockpit IDs remain an explicit compatibility state with no duplicate registration; exit requires supported client refresh and verified namespace/reference transition. Unknown probe descriptors cannot adopt foreign state; cleanup requires exact config/wrapper/source ownership and acknowledged owned shutdown. Claimed immutable runtimes retire only under existing liveness/reference/owner proof. Arndt Gold remains accountable for the approved compatibility boundary; existing lifecycle and native-qualification owners perform the bounded transition.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: Canonical Delivery Map at revision 21 reports no qualifying parent relationship.
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

Not applicable: canonical Delivery Map reports applicable false. No programme start or final-readiness claim is made.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing concrete graph nodes and their Core/runtime, native authority and run-state ownership are preserved. This report and the current CD/QA evidence link the stronger implementation to those same owners; no new graph or normative owner is claimed.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Candidate-specific local measurements, receipts and qualification limits remain with their single Run evidence owner.
- memory_refs: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/OR.md; .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/CD_TESTS.md; .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/QA_REPORT.md; .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/evidence/final-identities.json; .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/evidence/installed-qualification.json

## Next Permissible Step

- next_allowed_action: Review the completed scoped delivery and its retained qualification boundaries.
- required_approval: none
- forbidden_until_then: Automatic VCS/publication, host restart, foreign process termination, legacy removal without proof or shared App-data purge.

Quality outlook: Scoped technical QA pass, fresh human QA/UAT accepted, no additional required quality follow-up identified; native/cross-host/legacy transition limitations remain explicit. A separate delivery-closeout is useful only when an operative VCS/handoff is requested.

## Approval

OR records the result and next permissible step. It grants no later approval, publication or native-host qualification.
