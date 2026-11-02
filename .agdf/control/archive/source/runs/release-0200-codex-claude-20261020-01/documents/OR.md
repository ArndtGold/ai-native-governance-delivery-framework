# OR: AGDF 0.20.0 original CLI evidence and local import correction

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done
Date: 2026-10-24

## Run

- run_id: release-0200-codex-claude-20261020-01
- related_ur: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/UR.md
- related_prd: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/PRD.md
- related_sd: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/SD.md
- related_tp: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/TP.md
- related_qa_report: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

The decision above confirms closeout of the expressly accepted internal review/handoff scope.
Technical QA remains revise. No missing qualification is converted into pass, and publication
or qualification of the changed source is not granted. All three accepted evidence findings
remain open and are carried forward below.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/release-0200-codex-claude-20261020-01/UR.md` |
| Brownfield Review | done | `.agdf/control/artefacts/release-0200-codex-claude-20261020-01/BROWNFIELD_REVIEW.md` |
| PRD | approved | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/PRD.md |
| SD | approved | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/SD.md |
| TP | approved | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/release-0200-codex-claude-20261020-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-24 · revision 67 · presentation 75032d7c-1b74-44d6-ab57-7dc047142f7c sha256:ee1f84fa4e71a4b3ee38e6018482f83db6ea5f026aa6dac87da416f4380000ae |

QA approval operation 65257be9-6cab-412c-aac3-bf6a0259ac36 recorded accepted_with_deviations at
revision 67. UAT approval operation ad50d8eb-55b9-4a7b-839c-a3a5910c0c53 recorded the human's
exact Approval: UAT against presentation 75032d7c-1b74-44d6-ab57-7dc047142f7c at revision 68.
The initial approval call returned an uncertain transport outcome; canonical operation-status
confirmed its durable receipt. No second approval was issued. The exact receipt is retained in
evidence/QA_FINISH_20261024/UAT_APPROVAL_RECEIPT.json.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Accepted internal scope; closeout prepared for canonical recording |
| Current gate | OR |
| Allowed now | Persist this exact report and complete the accepted scope |
| Blocked by | No closeout blocker; qualification limits remain disclosed |
| Missing approval | none |
| Next step | Retain the completed evidence and handoff package |
| Quality outlook | Technical QA revise; three medium evidence deviations accepted by the maintainer |

## Delivered

| Item | Evidence |
|---|---|
| Original Codex macOS CLI matrix: dispatch, failure_case, skill_continuation, upgrade, recovery, all PASS | Five immutable records for candidate 8e2b8699; original clean commit 460027fabc58fe0da041bbabe117519dd1f696b7 |
| Original Claude Code CLI Windows matrix: all five cases PASS and previously imported | evals/host-compatibility/native/8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692/claude/cli/ |
| Durable producer/validator correction and regression coverage | scripts/native-probes/codex-host-e2e.mjs; lib/release-observation.mjs; release-handoff-test.mjs; targeted suite 34/34 |
| Full local verification and complete reviewed read-only matrix validation | evidence/QA_FINISH_20261024/VERIFICATION.json and REVIEWED_MATRIX_VALIDATION.json |
| Current Code/Clean/TP/QA review chain and compatibility projection | CODE_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; TP_REVIEW.md; QA_REPORT.md; docs/compatibility/ |
| Traceability metadata corrected through the existing writer | evidence/QA_FINISH_20261024/RELATIONSHIP_CORRECTIONS.json; approved documents and approval seals unchanged |
| Immutable original tar and separate final handoff ZIP | /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz; /private/tmp/codex-cli-windows-return-8e2b8699-final.zip |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Windows Codex review/import and final combined import projection | Explicitly accepted residual evidence scope; no Windows executor or repository import claimed | Maintainer, if a later import claim requires it |
| New final clean source commit/candidate and its CI/native proof | No commit or push authorized; three tooling/test source files change candidate identity | Maintainer and existing release-verification owner before publication of changed source |
| Commit, push, merge, tag, PR creation, import and publication | Excluded by the user and not implied by QA/UAT/OR | A future explicit instruction within applicable controls |
| Desktop or additional adapter production qualification | Desktop handchecks are reported/non-gating; Copilot/OpenCode remain experimental | Existing applicable host qualification scope |

## TP Coverage And Brownfield Fit

The approved TP digest is sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
Current TP Review: T-001 to T-007 and T-011 fully_done; T-008 to T-010 partially_done because of
the three retained evidence obligations. Human acceptance does not resolve those findings.
Brownfield Analysis records reuse of existing policy/evaluator/import/report owners. The local
correction retains those owners and strict candidate/reference/hash checks; no parallel authority,
weakened source identity check or rewritten native evidence was introduced. Current Code Review
and Clean Implementation Review pass their scoped correction, derived outputs and metadata.
These are cooperative agent reviews, distinct from the recorded human QA and UAT decisions.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| All 27 canonical verification stages PASS, including full CLI/MCP smoke | evidence/QA_FINISH_20261024/VERIFICATION.json; FINAL_VERIFICATION.md; verification.log | Exact isolated source snapshot 9888565d0513806fda85ef1eb860f1c6a8e9e32800497a9229a502bd3264cfc4 | direct |
| Full reviewed ten-case matrix validation PASS | evidence/QA_FINISH_20261024/REVIEWED_MATRIX_VALIDATION.json | Unchanged actual records/captures/reviews in a temporary read-only validation input; no import | direct |
| Shipped payload inventories identical; source identity differs in three tooling files | evidence/QA_FINISH_20261024/PAYLOAD_COMPARISON.json; SOURCE_APPLICABILITY.json; SNAPSHOT_STABILITY.json | Applicability boundary between original candidate and current local correction | direct |
| Protected original files unchanged | evidence/QA_FINISH_20261024/IMMUTABILITY_FINAL.json | 44 Codex files/archive and 26 imported Claude files; no native work-tmp remains | direct |
| Exact original-head remote CI | https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40079920556 | Commit 94ef61c9f0aa5a2041269236affc6556c33ed5a3 only; not uncommitted correction | direct |
| Human QA deviation acceptance and UAT approval | Canonical approval receipts and evidence/QA_FINISH_20261024/UAT_APPROVAL_RECEIPT.json | Bounded internal review/handoff; no changed-source qualification or publication | direct |
| Compatibility fixture results | docs/compatibility/evidence/snapshot.json | 56 deterministic scenarios, zero unexpected failures; not native-host proof | indirect |

Original candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692.
Codex frozen tuple: CLI 0.163.0, gpt-6-luna, macOS 15.7.7, darwin/x64, Node v22.22.3.
Tuple digest: 8299345338bf8687140d55d13cdc8242137cb7da0fbfeaeee4e3f57cda18e347.
Original archive SHA-256: 2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.
Final ZIP SHA-256: 868ec36f30844d6887e022768b8ecc9a7521e2761942502bb2189fe7b41d1957.
The ZIP captures the pre-approval handoff state; subsequent gate receipts and this OR are held
in canonical control, not backfilled into or substituted for the existing immutable packages.

## Accepted QA Deviations

- qa_acceptance: accepted_with_deviations
- accepted_qa_deviations_digest: sha256:c577bb92e36719cb033c807376fbe48b540daa9a8e384bd5e51925d7605c09bc

Usage scope: internal review/handoff of original candidate 8e2b8699 and the separately locally
tested import correction. No publication, changed-source qualification or automatic VCS/import.
Technical QA remains revise; all normalized finding statuses below remain open.

| Finding | Status and severity | Risk and consequence | Follow-up | Owner |
|---|---|---|---|---|
| TPR-102 | open; medium; accepted | Specified Windows review/import absent; ten-case read-only validation does not prove that execution | Retain unchanged package and execute documented Windows review/import before claiming it | Arndt Gold, maintainer |
| TPR-105 | open; medium; accepted | No new final commit/candidate/CI/native proof for changed source; old records qualify only 8e2b8699 | Establish expressly authorized clean final source/candidate and its required evidence before publication of changed source | Arndt Gold and existing release-verification owner |
| TPR-106 | open; medium; accepted | Final combined imported projection absent; no added host-qualified status is claimed | Complete actual authorized import and refresh existing projection if that later claim requires it | Arndt Gold and existing compatibility owner |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| TPR-102: Windows review/import execution | warn | Retain as accepted open gap; actual execution precedes any later claim |
| TPR-105: final changed-source candidate, commit-bound CI and native qualification | warn | Retain as accepted open gap for internal handoff; establish before publication |
| TPR-106: final combined repository-import projection | warn | Retain as accepted open gap; refresh only after an actual authorized import |

Warning impact describes the accepted closeout scope only; it does not reclassify the original
medium QA findings or assert that mandatory release evidence exists.

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Extending original-candidate proof to changed source | warn | Maintainer retains strict exact-candidate boundary; no release-ready assertion |
| Absolute user paths in original bundle | warn | 20 /Users/ occurrences in 16 files reported; original bytes unchanged; scan found no token-like secrets, email addresses, auth.json or config directories |
| Hook installation outcome hook_review_required | warn | Accepted only as recorded by native harness; no separate hook qualification inferred |
| Pre-existing staged evidence additions and ignored local config | warn | Attribution of staging unknown; index and private files preserved; ignored local configs excluded from tested Git snapshot |
| Raw verification log formatting | warn | Diff whitespace check flags trailing spaces in captured build output; raw log retained unchanged; source/report diff check excluding that log passes |
| Historical failed/interrupted tests, dependency audit output and thirteen objective warnings | warn | Preserve logs and scope limits; final 27-stage run supersedes prior incomplete test status, not historical evidence |

## Retained Fallbacks And Exit Criteria

The legacy absent-authorizes summary compatibility is limited to Codex failure_case with an
already hash-checked primary capture explicitly authorizes false. Explicit true/null/string,
wrong scopes and invalid/missing primary/hash evidence remain rejected. New producer output
records the field. This compatibility remains while those immutable supported legacy records
remain valid input; no arbitrary removal is authorized by this closeout. A later removal needs
the existing compatibility owner to decide supported-record scope without rewriting records.

## Documentation Impact

The existing release/host guidance and compatibility projection remain at their canonical owners.
RELEASE_READINESS.md and final verification/handoff evidence state exact applicability and the
remaining limits. No broad support promise or additional native host status is introduced here.
Approved QA bytes remain protected; this OR records later acceptance rather than rewriting QA.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: Canonical selected Delivery Map in evidence/QA_FINISH_20261024/CLOSEOUT_DELIVERY_MAP.json reports no qualifying Parent relationship.
- missing_evidence: none
- next_action: none

Programme aggregation is not applicable according to that same evaluated Delivery Map.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing producer, evaluator, source checks, traceability writer and canonical control owners are retained. Candidate-specific observations and acceptance limits are stored in this Run; no reusable graph ownership change or new graph claim is introduced.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Candidate-specific proof, accepted deviations and closeout belong to the existing Run, not a second authority or private memory update.
- memory_refs: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/OR.md; .agdf/control/artefacts/release-0200-codex-claude-20261020-01/QA_REPORT.md; .agdf/control/artefacts/release-0200-codex-claude-20261020-01/evidence/QA_FINISH_20261024/

## Next Permissible Step

- next_allowed_action: Retain the completed internal review/handoff evidence and unchanged return package with its disclosed limits.
- required_approval: none
- forbidden_until_then: Commit, push, merge, tag, PR creation, import, publication and qualification of changed source remain outside this instruction; none is performed or implied by QA/UAT/OR.

Quality outlook: accepted internal handoff with three open medium evidence deviations; technical
QA revise. A separate delivery-closeout is only useful for a future explicitly requested VCS or
publication handoff and is not performed here. No additional human OR approval is invented.

## Approval

QA and UAT human approvals are recorded against their exact presentations. This OR records
their bounded effect and the next permissible step. OR grants no later gate or VCS authority.
