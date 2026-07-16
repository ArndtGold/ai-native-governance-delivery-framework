# Brownfield Analysis: Consistent Gate Recovery and Approval Eligibility

Status: pass
Mode: pre_implementation_analysis
Date: 2026-07-16
Run: `gate-check-recovery-command`
Derived from: approved `.agdf/control/artefacts/gate-check-recovery-command/TP.md`

## Existing-System Findings

- `create-agdf/bin/create-agdf.js` remains the canonical owner for run selection, transition projection,
  status cards, command validation and top-level CLI presentation.
- `transitionDecisionForRunState()` already projects selected, artefact-ready user gates as `open` with
  the exact missing approval. The focused baseline passes, so GRC-02 must retain and extend this owner
  through explicit gate-matrix assertions rather than introduce a replacement readiness evaluator.
- `buildStatusCard()` already keeps ready-gate status separate from native capability, but currently
  emits a report-only `capability_missing` placeholder. Native execution eligibility already belongs to
  `evaluateNativeApprovalCapability()` and `executeNativeApprovalAttempt()` in
  `create-agdf/lib/interaction-presentation.js`; these helpers must be reused without a parallel evaluator.
- Canonical surface metadata already classifies Codex, Claude Code and OpenCode as
  `decorated_label_only` and authorizes only `exact_text`. The defect is an orchestration-instruction gap:
  direct adapter invocation can bypass the correct preflight even though helper tests reject decoration.
- `evaluateDoctor()` owns the shared ambiguous-selection finding but hard-codes recovery containing
  `--all-active` for every caller. Recovery must be derived from the requested target so `gate-check`
  never advertises an option rejected by its own parser contract.
- Expected option errors reach the unguarded final `await main()` and therefore produce a Node stack
  trace. A single concise top-level boundary is the reusable fix; per-command catch blocks would be a
  parallel error policy.

## Reuse And Change Boundary

- Reuse the current resolver, transition evaluator, capability preflight, exact-approval validator,
  generator and Runtime Integrity script.
- Do not change approval strings, gate order, persisted schema, adapter APIs, public flags or plugin identity.
- `create-agdf/lib/interaction-presentation.js` needs no production change unless new regression evidence
  exposes a reason-propagation gap; current decorated-only and canonical-approval tests pass.
- Edit `plugin/meta/agdf-runtime-contract.md` and `plugin/skills/gate-check/SKILL.md` narrowly because both
  contain unrelated in-progress Chat and Tool-Call Discipline changes that must be preserved.

## Regression And Compatibility Paths

- Extend `create-agdf/scripts/control-state-test.js` with target-aware recovery, stack-free illegal-option
  output and all six user-gate readiness fixtures.
- Retain `create-agdf/scripts/interaction-presentation-test.js` as the direct adapter-call-count and
  decorated-value rejection owner; add only missing eligible-transport or retry-identity coverage.
- Extend `plugin/scripts/check-runtime-integrity.mjs` so canonical capability metadata, Runtime Contract
  and gate-check instructions cannot drift back to unqualified native invocation.
- Run the existing generator before aggregate smoke validation; generated surfaces remain derived output.
- Baseline evidence: `control-state-test.js` and `interaction-presentation-test.js` pass before implementation.

## Dirty-Worktree And Parallel-Structure Assessment

- Unrelated active-run artefacts and skill edits exist and remain outside this slice.
- The two overlapping canonical documentation owners contain unrelated additions only; patch them in place
  without replacement or rollback.
- No parallel command resolver, readiness predicate, capability registry, approval validator or generated
  skill tree may be introduced.

## Context Graph Reconciliation

- Existing Context Graph entries already own multi-run resolver behavior and native interaction authority.
- This slice links evidence to those existing nodes; it does not establish a new reusable policy node.
- `context_graph_impact: link_only`; `context_graph_reconciliation: satisfied_by_existing_nodes`.

## Decision

- decision: pass
- implementation_mode: approved structured slice
- scope_fit: The approved TP maps to existing owners with focused deterministic regression paths.
- escalation_trigger: Return to SD if a new public flag, schema, adapter, approval semantic or parallel
  readiness/capability evaluator becomes necessary.

## Next Permissible Step

Implement GRC-01 through GRC-08 under CD+Tests, preserving unrelated worktree changes and the exact-text
authorization boundary.
