# Brownfield Analysis: OpenCode Surface Hardening and Evaluator Parity

Status: pass
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-07-23
Approved plan: `.agdf/control/artefacts/opencode-surface-hardening-parity/TP.md`

## Scope

Verify the clean implementation path for OHP-01 through OHP-10 before CD+Tests.

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
- The OpenCode 1.18.3 CLI exposes the approved stable run flags; the installed 1.17.11 SDK declares
  both experimental hook keys.

## Worktree Isolation

- Approved source paths under `create-agdf/lib`, `create-agdf/opencode-plugin.js`,
  `create-agdf/scripts`, `plugin/meta`, `plugin/scripts`, documentation and `pages/src` are clean at
  implementation baseline.
- Pre-existing unrelated deletion of `.gitignore`, `.idea/`, dependency directories and generated
  build outputs are outside this run and must remain isolated.
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

## Clean Implementation Order

1. Implement and test pure resolver/status helpers.
2. Harden static/dynamic guidance.
3. Add owned evaluator-agent lifecycle symmetrically to install/status/uninstall.
4. Add preflight and evaluator adapter using the shared mutation guard.
5. Wire conditional enforcement and typed CLI fallback without entering the search core on failure.
6. Synchronize docs, generated assets and Runtime Integrity.
7. Run focused, aggregate and live evidence in that order.

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

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `link`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The approved implementation preserves the existing portable search,
  evaluator and gate-authority invariant; reconciliation is required before closeout.

## Result

- missing_evidence: implementation, deterministic regression results and real OpenCode evaluator evidence
- reuse_strategy: extend existing canonical owners; add only the missing OpenCode adapter and owned agent
- parallel_structure_risk: controlled by the approved owner map and review obligations
- required_next_step: implement OHP-01 through OHP-10 under CD+Tests, then run mandatory reviews
