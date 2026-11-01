# CD+Tests: Run overview and worktree convention

- decision: revise
Status: revise
Date: 2026-10-31
Owner: Codex, implementation author and local verifier
Run: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
Approved TP: sha256:c459a2c031a7b536655f10d86d8940565f103ac06fc4d7ba41e68d92907f211e
Baseline HEAD: 8e57078d2a7cbe0f8c071d1c27eac8e0c0a14f52
Assigned branch: agdf/run-overview-worktree-convention

## Result and decision boundary

The isolated implementation is present and its targeted local checks pass. CD+Tests remains revise because the approved T-011 integration prerequisite is not fulfilled. The independent CI repair still has staged changes at e50f6b02afaef3f2dbd778eb6a15718e8c0b0f5c. Candidate compatibility:check reports source_snapshot_changed. No evidence refresh, baseline adoption, scoped-index verification, matching-head platform matrix, commit, push, merge or release has been performed. No QA pass, review completion, UAT approval or installed-host qualification is inferred from this report.

## Implementation

- The existing readRunInventory/discovery owner supplies the default bounded Cockpit snapshot once. Active/history/search are presentation projections of its saved facts and order. Invalid entries, incomplete coverage, missing store and valid empty store remain distinct. Creation/removal refresh is tested. Ordinary overview reads do not load UR headings or perform per-Run current gate evaluation.
- Selected Run/document reading retains exact identity, current evaluation, source/seal/presentation guards, snapshot replacement and safe stale/retry/removal behavior. Return retains the originating overview source, area/query and safe focus. Explicit Runs selects the canonical store; optional Legacy retains its own original rows/provenance/errors without creating Runs.
- Core parser, HTTP, session/MCP mediation, UI DTO validation and resource URI are paired at reader v2. The shared MCP domain projector was corrected to accept only the paired Cockpit envelope at v2; bootstrap, control/decision tools and published context packets retain their independent v1 contracts. The actual SDK context journey found and verified the packet-version correction.
- New ordinary mutation/revision/closeout uses existing Run transactions with backlog:null and no shared backlog lock or output. Exact source/material/revision/seal/receipt/replay and owned-output checks remain. Same-Run contention still fails stale requests. An unrelated null-backlog pending transaction no longer blocks independent Run work.
- Explicit old-journal recovery retains versions 1-5, captured old/next backlog bytes, Run-then-legacy lock order, archive/output ownership and conflict refusal. Completed old Verified Change records may retain a backlog path in their historical execution snapshot; active work has no such scope exemption.
- Setup/doctor/current relationship checks no longer require or seed live MASTER_BACKLOG. Other required control, SoT and registered-source checks remain. Optional historical data is preserved. Compatibility helper exports and old decoders remain for existing callers/history; they do not create a new normal writer.
- task-target-resolution.md owns the worktree convention: owning-primary/.agdf/worktrees/initiative, verified ignored container, assigned reuse, one writer, grandfathered/explicit alternatives and no automatic manager, relocation or cross-checkout locking claim. A real disposable Git walkthrough covers primary/linked metadata, ignore, reuse, collision, unsafe destination and unresolved owner refusal.
- Existing Context Graph/SoT nodes, DE/EN handbook, control/setup documentation, architecture and runtime/template guidance describe the new invariant with explicit local/integration qualification limits.

The earlier authoring-input UX template repair is the separately authorized T-001 starting change in authoring-inputs.js, fixtures/prd-definition.js and authoring-reassessment-test.js; it is not silently attributed to this feature. The currently serving control runtime remains separate from the non-activated candidate profile, so its own legacy projection behavior does not qualify the new writer.

## Actual verification and applicability

Environment: isolated macOS/Node 22.22.3 checkout, its own lockfile-installed dependencies, disposable canonical/Git projects, local HTTP ports, Chromium and real SDK/STDIO processes. Logs and selected screenshots are retained under evidence/; manifest.json hashes actual output files. No assertion budget, timeout, Copilot baseline, host observation or CI workflow was weakened.

| Check | Observed result and retained evidence |
|---|---|
| Defect detection | run-only absent/held-backlog and no-backlog overview assertions first failed on the old behavior; agdf-run-only-red.log and agdf-overview-red.log retain genuine product red evidence. Dependency/sandbox failures are not red evidence. |
| Ordinary writer and independent transactions | agdf-writer-recheck.log: 4/4 pass; agdf-independent-transactions.log: actual independent pending Run, same-Run stale refusal, recovery and immutable legacy bytes pass. Actual typed recording/approval/source/revision/closeout fixtures start without a backlog; their source/material negatives remain. |
| Recovery/history | agdf-revision-recheck.log, agdf-legacy-typed-recovery.log: original source revision/renewal/history and typed v2/v5 captured recovery pass; agdf-domain-material-final2.log: 5/5 pass including v4 captured conflict/explicit recovery; typed closeout v3 and low-level v1 remain covered. Synthetic compatibility fixtures preserve actual writer-generated receipts/outputs/archives and add only a historical captured backlog field, never a production receipt or new approval. agdf-extra-recovery-final.log: early PRD and approval process interruption/replay 2/2 pass; agdf-run-recovery-final.log passes original seal recovery as well. agdf-verified-history-final.log preserves completed historical execution scope. |
| Setup, diagnosis and bindings | agdf-init-recheck.log: 27/27 pass; canonical init, control-inspect parity, active inventory and target-binding tests pass. agdf-required-targeted.log retained 44/45 at its original run: its obsolete new-backlog checkpoint failure is superseded by the actual corrected approval recovery result above. Context packet recheck is separately current. This is not represented as a clean aggregate original log. |
| Bounded reading and sessions | agdf-membership-final.log: 9/9 pass including Run creation/removal, canonical dotted identity, invalid-entry diagnostic and no-write assertions; agdf-final-projection.log: inventory/projection 9/9 pass. agdf-sessions-local.log: 17/17 pass; agdf-context-packet-final.log: 4/4 pass; codec/list/scoped/source/changes cases retain their existing denial and provenance assertions. |
| HTTP | agdf-http-tests.log: 8/8 actual local service cases pass. Native local listeners/watches ran outside the macOS sandbox after its infrastructure denial; no product timeout was raised. |
| UI | agdf-ui-unit-coherent-final.log: all 287 tests in 25 files pass; typecheck passes. Desktop/MCP builds pass; generated Cockpit URI is ui://agdf/cockpit/v2.html, digest sha256:1ff747df6ba66da5f76bee5728afe86a296e91efdb6a89b9ddb7c5d33aeba09d, source_digest sha256:5823e47e910ab8ad510003131f4a175b671454536f0c2452331a610a1febd3aa. |
| Visible browser | agdf-all-browser3.log: 36/40 original cases passed. The missing Pages reference build was supplied in this checkout and the original design assertion passed; agdf-browser-followup.log also passes two explicit unsupported-envelope views (3/3). The three actual SDK context failures exposed the v2-inherited packet defect and are superseded by agdf-sdk-final.log: all 4 actual built-resource/SDK/Core cases pass. Together the 40 original cases plus 2 new version-failure cases have applicable passing observations. This is a union of identified rechecks, not a falsely clean original full run. |
| Visible coverage | Both desktop/compact 390x844 and 1440x900 Run lists, selected-area search/history, keyboard/open/return, retained failed refresh/retry, absent optional legacy, source-local errors, invalid/missing/changed selection and original documents are exercised. Built MCP resource additionally renders both widths through the synthetic SDK host. Representative Run, legacy, stale/refresh and built-resource screenshots were actually inspected. The SDK/HTTP fixtures are not native Desktop/Codex host qualification. |
| Real packaged STDIO | agdf-final-stdio-version2.log and agdf-final-stdio-scoped.log pass both pinned protocol eras, actual registered approval/draft/document reads, independent sessions, Run default, explicit legacy, immutable files, v2 resource digest and v1 context packets. The old-v1 URI is explicitly refused with the actual SDK Resource-not-found response; agdf-final-stdio-version2.log passes that assertion in both protocol eras. |
| Build/package/contracts | build:prepare passes its full prepare profile; build-contract checks pass source references, three generated surfaces and 14 late-gate cases. plugin-mcp-cockpit-variant passes; package-contents verifies 1494 files with complete built plugin. MCP capability gating passes; 12 publication cases passed in the earlier combined log whose separate old fixture-version failure was subsequently corrected/rechecked. |
| Worktrees | agdf-worktree-placement-evidence.json and agdf-worktree-negative-evidence.json record actual disposable Git observations, retained alternate assignment and no creation on collision/unsafe/unresolved cases. This qualifies procedural guidance, not automatic enforcement. |
| Isolation/integration | isolation-final.json and the starting observation retain own branch/HEAD and read-only CI status. Its staged path list/HEAD remain as observed; no task command mutated that checkout, its index/baselines/workflows or processes. The source compatibility freshness failure is preserved in agdf-compatibility-final.log rather than hidden by copied host evidence. |

The UI packet bug changed only the Core packet construction after the full UI unit run; its actual Core boundary test and built SDK/resource recheck are current. Later membership/contract assertions strengthen unchanged production behavior. Build/package and fresh isolated STDIO use the final source. Exact source digests remain in the non-activated candidate preparation evidence.

## Execution coverage (not a substitute for Task Plan Review)

- T-001 through T-008: implemented with the named existing owners and local proof above; historical source/approval files remain unchanged outside this Run and existing graph/SoT documentation.
- T-009: generation, targeted checks and package proof complete locally; candidate compatibility evidence reconciliation remains dependent on T-011.
- T-010: local desktop/compact and built-resource browser proof complete with identified repairs/rechecks and native limits.
- T-011: not done. CI repair completion and eligible exact candidate/platform evidence are unconfirmed. No unrequested VCS publication is used to manufacture that prerequisite.
- T-012: mandatory formal TP/Clean/Code reviews and QA are not recorded as completed. They remain downstream of complete required CD evidence. This self-assessment neither replaces them nor grants QA authority.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| RUNOV-INTEGRATION-001 | evidence_gap | evidence_obligation | open | Approved TP T-011; evidence/isolation-final.json shows the independent CI repair still staged; compatibility:check reports source_snapshot_changed; no matching-head mandatory matrix or scoped-index verification exists. | After the independent CI owner finishes, read its concrete result and reconcile this isolated candidate through the existing source/evidence owners; obtain authorized exact-candidate mandatory checks, then refresh CD+Tests and perform the required reviews/QA. |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes now describe the implemented Run-only invariant, optional legacy recovery, historical Verified Change boundary, paired reader v2/context v1 and local evidence, while retaining the explicit integration gap. Historical entries remain historical.
- memory_target: scope_artifact
- memory_reason: Actual commands, candidate and qualification limits are Run-specific; durable invariant belongs to the updated existing graph/SoT nodes.
- memory_refs: this report; evidence/manifest.json

## Next permissible step

Retain this isolated candidate and the open evidence obligation. Observe the independent CI completion read-only when available, then reconcile and qualify the eligible exact candidate. No human QA/UAT approval is being requested now, and no commit/push/merge/release or installed-host cutover is authorized by this report.

## AGDF Approval Summary (de; source=en)

- Ergebnis: Run-Übersicht, optionale Legacy-Ansicht, Run-Schreiben ohne gemeinsame Backlog-Pflege und die Worktree-Regel sind im isolierten Checkout umgesetzt. Die lokalen UI-, Browser-, Core-, Protokoll- und Paketprüfungen sind mit konkreten Reparaturen und passenden Wiederholungen dokumentiert.
- Grenzen: CD+Tests bleibt revise. Der unabhängige CI-Fix ist noch nicht abgeschlossen; die Kompatibilitätsprüfung meldet source_snapshot_changed. Exakte spätere Integration, verpflichtende Plattformnachweise, formelle Reviews und QA bleiben offen. Kein Host wurde mit diesem Kandidaten aktualisiert; es gab keinen Commit, Push, Merge oder Release.
- Nächster Schritt: Nach dem fertigen CI-Ergebnis den isolierten Kandidaten abgleichen und seine erforderlichen Nachweise vervollständigen, danach die vorgesehenen Reviews und QA durchführen. Jetzt wird keine weitere Freigabe verlangt.
