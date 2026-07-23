# Brownfield Analysis: OpenCode Surface Hardening and Evaluator Parity

Status: pass
Mode: pre_implementation_analysis
Decision: pass
Revision: 2
Date: 2026-07-23
Approved plan: `.agdf/control/artefacts/opencode-surface-hardening-parity/TP.md`

## Scope

Verify the clean implementation path for OHP-01 through OHP-11 before revised CD+Tests, with
OHP-11 as the only newly authorized code delta.

## Existing-System Evidence

- `create-agdf/lib/installers/opencode.js` owns global install, package resolution, status,
  generated global instructions, surface completeness and collision protection.
- `create-agdf/lib/lifecycle/operations.js` independently enumerates ownership-proven OpenCode
  global files for uninstall; the new evaluator agent must be added to both coupled owners.
- `create-agdf/opencode-plugin.js` owns both experimental hook bodies and already centralizes active
  versus inactive guidance.
- `create-agdf/lib/delivery-path-search/evaluators/{codex,claude}.js` establish the executable
  adapter pattern.
- `contracts.js`, `candidate-policy.js`, `scoring.js`, `search-engine.js` and
  `transports/read-only-guard.js` are reusable shared owners and must not fork.
- `surfaces/capabilities.js`, `cli/delivery-path-search-command.js` and
  `cli/validation-handlers.js` own enforcement classification, dispatch and exit behavior.
- Existing lifecycle, smoke, delivery-path-search, package, Runtime Integrity and Pages checks cover
  the affected regression surface.
- `openCodeNpmInvocation()` already centralizes platform-safe npm execution without a shell, and
  `installOpenCodeGlobalPlugin()` is the sole OpenCode package-install owner.
- `evaluateOpenCodeHostSdk()` already provides the read-only host, installed SDK, hook declaration
  and version-divergence evidence required for pre- and post-alignment probes.
- The local OpenCode host and SDK both currently report `1.18.3` after manual repair; the exact
  registry version is resolvable.

## Worktree Isolation

- Approved code paths under `create-agdf/lib/installers/opencode.js`,
  `create-agdf/lib/cli/application.js` and the focused test scripts are clean at the revised
  implementation baseline.
- The current worktree changes are limited to this run's approved revision-2 control artefacts and
  must remain isolated from the implementation diff.
- `create-agdf/generated/**` is derived output produced by the existing sync/prepack flow; it must
  not become a hand-edited source owner.

## Current Coverage And Reuse

| Area | Coverage | Strategy |
|---|---|---|
| Package and status resolution | partially_done | refactor the existing private resolver and extend status |
| Static and dynamic guidance | partially_done | extend one static owner and harden existing hooks |
| Owned global surface lifecycle | partially_done | extend installer, completeness and uninstall ownership lists |
| Evaluator protocol and mutation guard | fully_done | reuse without policy fork |
| OpenCode evaluator and preflight | not_done | add one adapter beside existing evaluators |
| Capability/CLI fallback | partially_done | extend existing dispatch and classification |
| Documentation/tests | partially_done | update existing truth and regression owners |
| Install-time SDK alignment | not_done | extend the existing installer and lifecycle projection only |

## Clean Implementation Order

1. Add exact-version validation and typed alignment states beside the existing host/SDK probe.
2. Extend the existing installer with matching no-op, exact registry resolution/install and
   mandatory post-probe behavior.
3. Map the alignment state through the existing lifecycle result and human output without extending
   the status schema.
4. Add focused transcript tests for all states, npm arguments, no-call paths and read-only status.
5. Run focused lifecycle/OpenCode tests, smoke and Runtime Integrity before mandatory reviews.

## Risks And Controls

- Parallel lifecycle ownership: update installer/completeness and uninstall enumeration together.
- Permission precedence: prove the final effective deny rules from `agent list --pure` under the
  invocation environment; do not trust agent frontmatter alone.
- SDK resolution: constrain manifest walking to the resolved package lineage and exact package name.
- Event-stream trust: accept exactly one final assistant text payload and validate it through the
  existing schema.
- Worktree mutation: retain before/after comparison on every success and failure path.
- Derived-output drift: generate through existing sync scripts only.
- Live evidence: do not claim tool enforcement if authentication or the real invocation is absent.
- Registry/install failure: classify and post-probe the observed final state; never substitute
  `latest`, a range or another version, and never report an unresolved result as healthy.
- Package execution: reuse `openCodeNpmInvocation()`, disable lifecycle scripts/audit/funding output
  for the SDK install and keep status free of registry/install calls.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: `CG-DELIVERY-PATH-SEARCH` now records conditional OpenCode enforcement,
  the instruction-only baseline and the still-unproven live tool-enforced claim.

## Result

- missing_evidence: OHP-11 implementation and deterministic regression results; the historical real
  OpenCode evaluator evidence obligation remains open
- reuse_strategy: extend the existing OpenCode installer, read-only probe and lifecycle projection;
  add no new package or status owner
- parallel_structure_risk: controlled by the approved owner map and review obligations
- required_next_step: implement and test OHP-11 under revised CD+Tests, then refresh mandatory reviews
