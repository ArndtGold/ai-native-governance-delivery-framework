# Code Review: Compact documented approvals with truthful version links

Decision: pass
Run: cockpit-documented-approvals-20261009-01
Reviewed revision: bd459e2e-7402-4934-a7af-000d52b35d0e
Owner: code-review / Codex cooperative_local
Date: 2026-10-10

## Actual review scope

All 27 attributable paths in evidence/renewed/INCREMENT-final.json and increment-final.patch, including retained old component/test replacement, current neighbouring App/navigation/reader/session/service boundaries, and architecture06. Exact approved source hashes are in PROTECTED_AFTER-final.json. This review is a code evidence dimension, not QA or a gate approval.

## Correctness, integrity and compatibility

- Per-gate extraction remains inside artefact-binding-proof; aggregate preconditions and UAT omission unchanged. Actual baseline differential compares the real old implementation in 154 legacy/typed/historical/revised/proof mutation observations; original source-revision and recording tests pass. Positive document observation additionally requires current integrity and exact returned raw bytes; Resource.status is unchanged.
- Reader dependencies/projection remain captured. One slot is bounded, private and revalidated against full target/Run/gate/revision/path/canonical/raw identity before reuse. Invalid selectors reject before mutation; observe-failure/source-change clears applicability and capture/publication failure cannot restore it. Exact Core slot/description 256KiB cases and per-session close/isolation pass.
- Only existing structured authoring diagnostics and finite known early blocker details imply corrections. Unknown code families cannot be classified via prefix. Actual early SD traceability remains visible; original report retained and authorizes false.
- Optional records are strictly validated at api.ts for ordinary reading and handoff, exact membership/source/raw/check/recorded-approval associations, and equivalent Detail/Document. Old absence is explicit uncertainty; malformed presence is rejected. No HTML/provenance execution, arbitrary source route, writer/bulk check or separate App policy.
- Stable type/reference keys, one DOM, guarded readable actions and existing document origin/focus mapping implement the approved UX. Real keyboard/resize/scroll/check/close paths and light/dark built views are evidenced; unavailable sources have no functional action. Context/original disclosures remain in the reader.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | api.ts now shares document-state shape validation with handoff documentData; document-state tests in ui-review-serial.log reject malformed and inconsistent handoff facts | Retain shared-boundary regression on later changes |
| CR-002 | implementation_gap | CD+Tests | resolved | api.ts rejects omission of an actually recorded approval; ui-review-serial.log covers omission and document/raw/identity mismatch | Retain recorded-approval association regression |
| CR-003 | implementation_gap | CD+Tests | resolved | artifact-readiness.js exact finite diagnostic code set replaces prefix classification; core-qualified.log tests unknown prd_readiness/approval_summary codes as unavailable; real authoring/HTTP/MCP/browser-quality pass | Retain unknown-code negative regression |

These were corrected during scoped implementation inspection before formal CD+Tests recording. No open concrete defect or unclassified finding remains. Test-fixture mistakes and environment/timing retries are disclosed in VERIFICATION.md, not hidden as product findings or waived tests.

- missing_evidence: none mandatory within reviewed scope. Fresh native host observation is absent and optional, see NATIVE_LIMITS.md.
- risks: proof/check projection remains bounded and policy-sensitive; future changes need the retained negative/parity regressions. Existing observer/timeout tests are sensitive to execution conditions; serial unchanged reruns passed, no production workaround or assertion weakening.
- brownfield_fit: existing proof, authoring, captured reader, transport and UI navigation ownership reused; 5375 protected paths unchanged; architecture owner updated; no dependency or operational expansion.
- impact_codes: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL assessed; no second transition model was introduced.
- required_next_step: Complete supporting TP and Clean Implementation Reviews before qa-gate.
