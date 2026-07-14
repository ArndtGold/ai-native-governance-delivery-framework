# QA Report: Surface-Native AGDF Interactions

Status: passed
Gate: QA
Gate approval: `Approval: QA` recorded on 2026-07-14
Based on: approved `TP.md`; `BROWNFIELD_ANALYSIS.md`; `CD_TESTS.md`; `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md`
Date: 2026-07-14
Owner: AGDF

## 1. QA Decision

Decision: `pass`

The implementation satisfies AC-01 through AC-18 with strong deterministic contract, generation, configuration, control-state, integrity, documentation and build evidence. Brownfield fit and solution integrity pass, and Code Review has no findings.

## 2. TP Coverage

- fully_done: SNI-01 through SNI-13 and SNI-15 (14 tasks)
- partially_done: SNI-14 only for authenticated interactive host-UI observations
- not_done: none
- P0/P1 gaps: none; the TP defines no task priorities and no correctness/security blocker is open

SNI-14 does not prevent QA pass because the approved SD/TP explicitly classifies authenticated UI probes as supporting evidence. Deterministic contract, generated-surface and gate-state tests are release-critical and all pass.

## 3. Evidence

- Brownfield Analysis: pass; existing owners and non-destructive OpenCode config boundaries verified.
- Runtime Contract and gate-check: canonical semantic envelope, readiness, no-auto-resolution, exact approval, revalidation and fallback rules present.
- Canonical metadata: Codex, Claude Code, OpenCode and fallback adapters plus technical permission ownership declared.
- OpenCode config: missing question permission gains `allow`; explicit `allow` and `deny` remain unchanged; existing repository config remains protected.
- Positive and controlled-negative runtime-integrity tests: pass.
- Control-state, routing and aggregate `create-agdf` smoke tests: pass.
- Repeated asset synchronization: idempotent.
- Pages diagnostics/build: pass with 0 diagnostics and one static page built.
- `git diff --check`: pass.
- Task Plan Review: pass_with_disclosure; AC-01 through AC-18 done.
- Clean Implementation Review: pass; no parallel owner or workaround-heavy path.
- Code Review: pass; no findings.
- AGDF doctor/gate-check after reviews: pass/open at QA with no findings.

## 4. Missing Evidence

- Claude Code 2.1.193 is locally installed but unauthenticated, so no authenticated `AskUserQuestion` probe was run.
- Codex 0.142.4 is authenticated and OpenCode 1.17.13 has configured credentials, but interactive native-question rendering was not automated from the non-interactive test shell.
- Current Codex interaction used the exact-text fallback successfully.

These are explicitly supporting observations. No deterministic AC evidence is missing.

## 5. Risks

- Host question tool names, schemas and timeout behavior may drift. Runtime-integrity anchors and exact-text fallback keep drift visible and fail closed.
- Instruction-driven selection is not host enforcement. Documentation and evidence classification state this explicitly.
- An explicit OpenCode `permission.question: deny` prevents native presentation by design and retains exact-text behavior.

## 6. Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node records the reusable authority invariant and now cites passing runtime, config, package, idempotence and Pages evidence.

## 7. Required Next Step

Obtain exact post-report `Approval: QA`. Only then may the run request UAT; release and VCS delivery remain gated.

## 8. Gate Approval

QA was approved with exact post-report evidence on 2026-07-14. Proceed to user acceptance; release and VCS delivery remain gated.
