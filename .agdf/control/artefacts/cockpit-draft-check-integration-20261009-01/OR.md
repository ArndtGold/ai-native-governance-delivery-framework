# OR: Cockpit bound draft-check integration

Report mode: OR-full
Run: cockpit-draft-check-integration-20261009-01
Date: 2026-10-09
Gate: OR
Status: completed
Quality decision: pass (qa-gate)
Missing approvals: none

## Delivery

Users can deliberately check a selected canonical UR/PRD/SD/TP draft in compact or expanded Cockpit views through the existing bounded read service. One shared Core authoring projection returns original findings and source binding. Exact selection/revision/draft freshness, explicit retry/reload and coordinated session/worker/resource/source observation prevent an old result becoming current. A finite cancellable request and one guarded central reducer commit keep client ownership clear. The result grants no approval or delivery permission.

The delivered scope is the approved draft-check integration. The independent documented-approvals layout proposal and earlier backlog-clarity Run remain separately governed. No archive/version store, generic filesystem/tool fallback, alternative validator, automatic checks, global install, dependency upgrade, Git action or publication was delivered.

## Bound sources, approvals and quality

- Approved UR/PRD/SD/TP remain byte-identical; TP sha256:541fef03c6192ee7a567ce2b9067a7a1feeb540f7b83cfe74069988adae9a44b.
- All seven TP tasks and seven PRD UX criteria fulfilled: TASK_PLAN_REVIEW.md.
- Brownfield preparation and existing owner fit: BROWNFIELD_ANALYSIS.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md.
- QA_REPORT.md decision pass is canonically bound tests to the exact approved TP; report sha256:d686e60feccc2993693493142830f3d90b8ef392bcf0aaced2b7e985d686ec23.
- Deliberate Approval: QA was accepted against presentation ca3ce680-bcaa-421b-a76b-c34f4253886c and revision 7898f9ce-ed2e-4ac7-be8d-2d2c51bd0668.
- Deliberate Approval: UAT was accepted against presentation 2d601326-b41c-4c23-bae4-9a5acd8fcd20 and revision 6d04aac2-53e8-4de5-ba35-38c618a24f5e; resulting revision 1582e5f8-1ee0-4413-a50a-0b49fde874a0.
- The old open NATIVE-001 rows in append-only Run evidence describe earlier observation stages. Final NATIVE_FINAL_OBSERVATION.json and the superseding passing QA_REPORT resolve that gap. They are not current blockers.

## Verification

Actual standalone checks covered all four draft gates. Focused Core five-case suite passed. Existing Core suites recorded 49 pass and one sandbox fs-notification failure, with exact two-case host rerun passing. UI regression run recorded 142 pass; final focused six-case run separately passed (no invented distinct combined count). Actual authenticated HTTP nine-case host run and actual built browser 24-case run passed. MCP contract/safety/protocol, both packaged protocol variants, typecheck/build/sync/package and measured payload checks passed. Full original logs, failures and environment attribution remain in CD_TESTS.md and evidence/VERIFICATION.md.

Qualified UI: sha256:859039c09e4c0ebc02cecc02b4954936538afb6749e42981b053a4ca0f687828, 1072355 bytes, runtime 0.14.5 and verified SDK. Native host initialization acknowledgement, enforced capability acceptance, deliberate passed/correction results, same-revision source invalidation and explicit reload/recheck are recorded separately from source/stdio/browser tests. Fresh compact retry produced one actual Core busy and original passed result after user action. Explicit native close returned closed:true and later reads session_expired; user confirmed card closure. Attributed prepared compact/expanded manual controls were completed without reported flicker.

All 26 product-source hashes and 15 protected source/history hashes were checked again at closeout and still match qualification. Original synthetic draft restored; one-shot marker consumed; test-only probe startup replaced with the exact original connection block while preserving other config bytes. Test session is closed. Next ordinary host reload uses the original entrypoint; no new restart is required to close this Run.

## Evidence limits, risks and retained fallbacks

Missing required evidence: none within the approved TP. Codex native proof does not establish other hosts/platforms. Raw capability envelopes and a separately firing Host SDK teardown callback were not captured or claimed. Manual keyboard/resize/focus observations are user evidence, not automated measurements. Actual explicit native reader close is separately acknowledged. Original sandbox failures were retained rather than relabeled.

Optional capability on an older server remains bounded unavailable while existing reading works. Missing/malformed/unsafe/stale sources cannot become success. Exit: reload a supported qualified connection and explicitly recheck the current draft; no generic fallback or new authority. Published-context uncertainty stays under the existing quarantine owner. These approved boundaries require no architectural workaround or second result/source store.

## Documentation and knowledge routing

Documentation, proof-level separation, exact build qualification and this audit report stay Run-local. MCP_CANDIDATES.md records the user's extra assignment: source discovery/direct Core calls that could become bounded MCP operations. Candidates are proposals only; no added implementation authority. The supplemental closeout candidates identify CLI approval argument discovery, typed QA recording/update ordering and overly historical UAT evidence presentation.

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: Run-specific qualification and candidate discovery belong to this scope; no general source ownership changed.
- memory_refs: MCP_CANDIDATES.md; evidence/NATIVE_FINAL_OBSERVATION.json; this OR

## Evaluated parent reconciliation

Copied from the bound Delivery Map (evidence/CLOSEOUT_DELIVERY_MAP.json):

- outcome: not_applicable
- target_run_id: empty
- disposition: not_applicable
- evidence: empty
- missing_evidence: none
- next_action: none

Programme aggregation: not applicable; no programme readiness claim or parent mutation.

## Next permissible step

Required next step: retain the completed delivery and its evidence; use delivery-closeout only when a separate operational Git handoff is requested.
Quality outlook: no additional quality follow-up identified for this approved scope. QA and UAT are approved; this OR records completion, not publication. Commit, push, PR and release require a separate explicit request.


## Closeout projection limitation

Final doctor has no findings and the sealed lifecycle/decision are completed with OR done. The existing structured gate projection nevertheless reports OR/open and completed_closeout_pending after approved UAT; it does not evaluate OR completion in that branch. This is a recorded diagnostic candidate, not a missing delivery approval or required implementation/test obligation. The completed backlog pointer and sealed Run/OR remain the durable completion evidence. No gate-policy change was made in this Run.
