# OR: Compact documented approvals with truthful version links

## Outcome

- run_id: cockpit-documented-approvals-20261009-01
- report_mode: OR-full
- date: 2026-10-10
- gate: OR
- status: pass
- delivery_outcome: Completed within the renewed approved scope
- approval_snapshot_revision: 31 / 9a107cb9-a029-4497-80f6-233b6fb1afc7
- missing_approvals: none
- required_next_step: Use delivery-closeout only when an operative VCS handoff is explicitly requested.
- quality_outlook: Approved scope delivered, mandatory qualification and reviews pass; optional final native-host observation remains absent.

## Delivered

The Cockpit has a compact two-column document overview containing actual registered resources. Each row has a readable state and one contextual reading action. Draft corrections have an icon and text; overview rows have no expandable approval entry or separate approval link. The reader shows applicable Core findings and original approval context.

Core describes approved-version correspondence through the existing canonical proof and exact raw readable bytes. Changed, damaged, foreign, missing or uncertain sources never receive a false confirmed-approval claim. An explicit draft check uses the existing readiness owner. One bounded ephemeral per-view result survives matching document navigation and is cleared when identity, revision, source, lifecycle or scope changes, on reload and on close. Strict shared optional DTO validation preserves uncertainty for old servers and rejects malformed associations in both ordinary transport and handoff.

Existing proof, authoring, snapshot, selector, session, writer and policy owners remain authoritative. The existing architecture document describes the additive contract. MCP discovery/direct-Core-call candidates are retained in MCP_CANDIDATES.md; they are not implicit implementations.

## Approvals and source identity

Current UR, PRD, SD and TP approvals are recorded in the selected RUN_STATE.md. Renewed QA is genuinely pass and human-approved. The deliberate new replies accepted in this continuation are:

| Gate | Presented revision | Presentation | Accepted response | Resulting revision |
|---|---|---|---|---|
| QA | 29 / 9e94c26c-c0e7-4dea-b072-8a1482d3b1ae | be36590e-32a0-44b5-90fb-1a45b59f3384 | Approval: QA | 30 / 22a41ecc-0cf0-47fb-8c04-3dd1dcbaca7a |
| UAT | 30 / 22a41ecc-0cf0-47fb-8c04-3dd1dcbaca7a | 3458f6c0-b827-477e-b6f3-2221b08698d4 | Approval: UAT | 31 / 9a107cb9-a029-4497-80f6-233b6fb1afc7 |

QA_REPORT.md canonical digest: sha256:92d000264c123fc921fd04ece7859ab12ddb3aa725d1abad5e7a8383509e7a1e. Exact approved UR/PRD/SD/TP digests are in that immutable report and BUILD_IDENTITY-quality.json. Source-revision archives and older observations remain historical evidence only. UAT is the user's acceptance of the presented evidence and disclosed limits; it is not an invented fresh native-host test. Approval provenance remains cooperative_local / caller_forwarded_deliberate_reply, not independent human proof.

## Task coverage, Brownfield fit and reviews

All nine approved TP tasks are fulfilled. TASK_PLAN_REVIEW-02.md evidenced 8/8 pre-QA tasks and all six UX fidelity rows. T-009 is fulfilled by the sole qa-gate evaluation, QA_REPORT.md and its exact QA_REPORT tests TP mapping. CD_TESTS-02.md, BROWNFIELD_ANALYSIS-02.md, CODE_REVIEW-02.md and CLEAN_IMPLEMENTATION_REVIEW-02.md document existing-owner reuse, bounded implementation and passing review. Normalized CR-001 through CR-003 were resolved in CD+Tests; no applicable open finding remains. QA is the sole quality decision owner.

## Validation evidence

The detailed authority is evidence/renewed/VERIFICATION.md and SCENARIO_RESULTS.json, with all 20 required scenarios pass and no required skip or waiver. Evidence includes 18 focused Core cases, 154 original-versus-current proof comparisons, 210 recording assertions, 20 source-revision scenarios, 50 scoped/lifecycle cases, 126 UI cases, nine actual HTTP/worker cases, six real STDIO fixture/protocol combinations and 25 distinct built-browser cases. Overlapping reruns do not add coverage. Typecheck, both qualified builds and whitespace validation pass.

Real browser/card observations cover keyboard/focus return, scrolling, light/dark rendering and 12 measured 320/960-pixel transitions with stable row/action identity and at least 44px targets. Consumer-only multiple-reference and absent-old-server simulations are identified separately from canonical Core proof. Initial sandbox/parallel failures and fixture corrections remain documented with attributable successful unchanged-assertion reruns.

BUILD_IDENTITY-quality.json and RUNTIME_QUALIFICATION-quality.json bind the final sources, tests, dependencies and immutable qualified-browser-review/qualified-mcp-review assets. Actual returned MCP HTML: sha256:1adf4ff5985aa747176450849cce1eeffd31c3445dead0a113c6f83ae20200c6, 1081513 bytes. SCOPE_REVIEW.md and INCREMENT-final.json identify 27 attributable product/test/documentation paths; PROTECTED_AFTER-final.json verifies 5375 protected paths. These qualification observations precede and exclude authorized approval/closeout bookkeeping. Closeout rechecks source/test/dependency identities before recording.

## Intentionally not delivered, missing evidence and risks

- missing_evidence: none mandatory under the approved SD/TP.
- native_host_observed: false. Fresh native Codex MCP-App initialize/render/interaction/teardown of these exact final assets was optional and is not claimed. Earlier host/user observations are not transferred.
- No installation, host configuration/profile replacement, commit, push, PR, release or publication was performed or authorized by QA/UAT.
- No broad test aggregate, remote CI, other-host qualification or performance claim is inferred from the scoped qualification.
- Exact proof/result association is policy-sensitive; future changes must retain parity, identity and negative-boundary tests. Existing event/timeout checks remain execution-condition-sensitive; failed initial runs were retained, not waived.
- The approval writer returned a stale PRD/UX follow-up projection for QA and UAT. Immediately fresh canonical dispatch instead resolved UAT and then OR, doctor pass. This existing projection mismatch is retained as a separate MCP candidate; no policy or writer repair is part of this delivery.

## Retained compatibility and exit criteria

Absent optional document-state data from old servers retains explicitly uncertain reading. It never certifies approval or triggers automatic checking. Remove this compatibility path only through a separately approved compatibility/version decision with transport tests. Prior approval evidence remains original historical context, not current certification. No temporary parallel validator or production test workaround was introduced.

## Documentation and knowledge

- documentation: docs/architecture/06-agdf-cockpit.md, reviewed additive Core/UI/transport contract.
- memory_target: scope_artifact
- memory_reason: Run-specific qualified evidence and bounded MCP candidates belong to this Run.
- memory_refs: evidence/renewed; MCP_CANDIDATES.md; OR.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing Context Graph and SoT registry remain unchanged; no graph knowledge or ownership migration is claimed.

## Coordination projection

Copied from the canonical selected-run Delivery Map after UAT approval, doctor/status pass:

- parent_reconciliation: outcome=not_applicable; target_run_id=empty; disposition=not_applicable; evidence=empty; missing_evidence=none; next_action=none.
- programme_aggregation: applicable=false; startable=false; final_ready=false; acceptance_ref=empty; evidence=[]; missing_evidence=[]; next_action=none.

No parent relationship was inferred and no other Run was changed. Governance work for this scope is complete. The next permissible operative handoff is delivery-closeout only after an explicit VCS request; this report performs no VCS action.
