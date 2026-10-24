# QA Report: AGDF 0.20.0 Desktop release matrix, candidate aa3e4b02

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-23
Owner: Claude (Claude Desktop Code, Windows) as qa-gate owner; maintainer for human decisions

## 1. QA Decision

Decision: revise

QA (qa-gate, sole decision owner) returns revise. Plan coverage, solution integrity and code quality
are evidenced for candidate aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108
(commit 2295730c, PR 30). The P0 release obligation is not met: none of the six mandatory
candidate-bound Desktop records exists, and one commit-bound CI job still needs a green re-run.

| Quality Readiness | Source | Result |
|---|---|---|
| Plan coverage | task-plan-review (TP_REVIEW.md) | revise: T-001 to T-008 fully done; T-009 one CI job pending; T-010 0 of 6 Desktop records |
| Solution integrity | clean-implementation-review (CLEAN_IMPLEMENTATION_REVIEW.md) | pass: existing owners extended, retained legacy paths justified by SD |
| Code quality | code-review (CODE_REVIEW.md) | pass: seven findings resolved, advisories recorded |
| QA decision | qa-gate (this report) | revise |

## 2. TP Coverage

- delivered_result: Candidate aa3e4b02 at commit 2295730c ships the schema-2 Desktop release matrix with mandatory Codex Desktop and Windows Claude Desktop session/upgrade/recovery cases, a strict schema-3 Desktop validator that now ingests native Claude Desktop transcripts and Codex Desktop session rollouts while rejecting CLI or exec traces, reused sessions, foreign review tuples and non-image captures, a publication workflow gated on the full Desktop matrix, and compatibility reports that keep the two human handcheck reports at zero qualified credit.

Fully done: T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008. Partially done: T-009 (Install ·
Win22 1of4 awaiting re-run), T-010 (six Desktop records absent; original handchecks unbindable).
T-011 is completed by this QA report together with the three recorded reviews.

## 3. Evidence

- Reviews: CODE_REVIEW.md (pass, CR-001 to CR-007 resolved), TP_REVIEW.md (revise, TPR-001 to
  TPR-003 open), CLEAN_IMPLEMENTATION_REVIEW.md (pass); CD_TESTS.md (pass, revision 29).
- Candidate: evidence/CANDIDATE_2295730C_20261023/CANDIDATE.json and CANDIDATE_IDENTITY.json; dirty
  false; payloads and loaded identity byte-identical to af150d33; seven expected source changes.
- Repository tests on win32 x64: test:release-qualification 25/25, release-handoff-test 16/16,
  release-lifecycle-test 6/6, release-evidence-test, test:maintenance-contracts, test:mcp-ergonomics
  44/44, test:community-health, build; documented preparation all exit 0; compatibility 56/0.
- Commit-bound remote CI: run 39927176152 for 2295730c, 99 of 100 jobs pass (44 Windows); previous
  run 39918075437 failures diagnosed (own test defect fixed in 2295730c; one Windows MCP flake).
- Native: real Claude Desktop dispatch lines pass the fixed capture rules
  (evidence/CANDIDATE_D4F39956_20261023/CLAUDE_DESKTOP_CAPTURE_PROBE_AFTER_FIX.json); no Desktop
  record exists. Release tool: handoff prepared; validate --all-hosts rejects.
- Brownfield fit: BROWNFIELD_ANALYSIS.md current; installer and runtime code unchanged; no guard,
  timeout or payload allowance relaxed.
- Context Graph: context_graph_impact none; context_graph_reconciliation not_applicable;
  memory_target scope_artifact (run evidence and the release guide hold the capture-format rules).

## 4. Missing Evidence

- qualification_limits: No candidate-bound Codex Desktop or Windows Claude Desktop session, upgrade or recovery record exists for aa3e4b02, so Desktop qualification is unverified and publication is ineligible; the two maintainer handchecks remain human_reported without candidate, app, model or session identity; Install · Win22 1of4 of run 39927176152 has no green result yet; local full verification on the reviewing Windows host stops at a host-load MCP test flake, so the commit-bound verification is remote CI by maintainer decision.

Codex CLI on Windows/Linux stays unqualified and Copilot/OpenCode experimental by scope; no CLI
result, repository test or green CI qualifies a Desktop surface.

## 5. Risks

- delivery_risks: Desktop executors need host-supported isolated Desktop scopes (none exists on the Windows host that ran this QA); the Codex Desktop session_meta source value is inferred from codex exec behaviour and must be confirmed at the first real capture; the MCP structured-flow test can fail under local host load until the proposed robustness fix lands; 215eccf2 committed the session-local .claude/launch.json with an absolute local path.

## 6. Required Next Step

Desktop executors record session, upgrade and recovery for aa3e4b02 on Codex Desktop and Windows
Claude Desktop in isolated scopes from evidence/CANDIDATE_2295730C_20261023/handoff/, then evidence
review, scoped import and validate --all-hosts; the maintainer re-runs the failed CI job. Re-run QA
afterwards. UAT, OR, merge, tag and publication stay closed.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QA-001 | evidence_gap | evidence_obligation | open | TP_REVIEW.md TPR-001 and evidence/CANDIDATE_2295730C_20261023/DESKTOP_EVIDENCE_REVIEW.md: 0 of 3 Codex Desktop records for aa3e4b02 | Codex Desktop executor records session, upgrade and recovery for aa3e4b02 in an isolated scope and returns the bundle for review and import |
| QA-002 | evidence_gap | evidence_obligation | open | TP_REVIEW.md TPR-002 and DESKTOP_EVIDENCE_REVIEW.md: 0 of 3 Windows Claude Desktop records for aa3e4b02 | Windows Claude Desktop executor records session, upgrade and recovery for aa3e4b02 in a dedicated isolated Desktop profile and returns the bundle for review and import |
| QA-003 | evidence_gap | evidence_obligation | open | TP_REVIEW.md TPR-003 and VERIFICATION_RESULTS.json: run 39927176152 Install · Win22 1of4 git ETIMEDOUT in unchanged installer code | Maintainer re-runs the failed job of run 39927176152 and the green result is recorded for 2295730c |

No deviation acceptance is proposed: the Desktop records are the mandatory publication evidence of
this release scope and cannot be waived through QA.

## 7. Gate Approval

A revise decision does not open UAT. `Approval: QA` is not requested for this report; QA is re-run
once the obligations above are fulfilled.
