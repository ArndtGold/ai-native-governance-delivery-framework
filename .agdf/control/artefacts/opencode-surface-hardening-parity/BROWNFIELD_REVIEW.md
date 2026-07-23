# Brownfield Review: OpenCode Surface Hardening and Evaluator Parity

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-07-23

## Scope And Routing

- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change adds visible degradation, version-divergence and evaluator-capability states and changes the recovery path between executable and instruction-only Delivery Path Search modes.
- ux_intent_definition_required: `yes`
- scope_reason: The work is bounded to the established OpenCode lifecycle, plugin, instruction, Delivery Path Search adapter, capability, documentation and regression-test owners, but it changes CLI/runtime behavior, permission evidence and user-visible fallback semantics across several canonical modules.

## Existing Coverage And Owners

| Concern | Coverage | Canonical owner and evidence | Reuse strategy |
|---|---|---|---|
| OpenCode install and status | partially_done | `create-agdf/lib/installers/opencode.js` already resolves the installed AGDF package, reports version state, global native surface, session signals and repository activation. | extend |
| Experimental hook implementation | partially_done | `create-agdf/opencode-plugin.js` owns `experimental.chat.system.transform` and `experimental.session.compacting`; current bodies assume mutable output arrays exist. | refactor narrowly |
| Static global governance | partially_done | `globalOpenCodeBoundary()` and generated `AGDF.md`/global skills already own activation and gate-check-first guidance. | extend the existing owner |
| Delivery Path Search contract | fully_done | `create-agdf/lib/delivery-path-search/contracts.js`, `search-engine.js`, `state-adapter.js` and `transports/read-only-guard.js` own validation, scoring inputs and mutation checks. | reuse unchanged |
| Executable evaluators | partially_done | `evaluators/codex.js`, `evaluators/claude.js` and `evaluators/protocol.js` establish the adapter pattern; OpenCode is absent. | add one conforming adapter |
| Surface capability truth | partially_done | `surfaces/capabilities.js` statically reports OpenCode as `instruction_only`; CLI dispatch in `delivery-path-search-command.js` rejects OpenCode. | extend with runtime preflight evidence |
| Documentation and regression coverage | partially_done | `INSTALL.md`, `create-agdf/README.md`, `pages/src/pages/index.astro`, lifecycle/smoke/unit tests and Runtime Integrity already cover the current instruction-only state. | update existing assertions and derived assets |

## Current Installed Evidence

- OpenCode host reports version `1.18.3`.
- The OpenCode config installation resolves `@opencode-ai/plugin` version `1.17.11`.
- The installed SDK declaration file contains both experimental hook names.
- `opencode run --help` exposes stable `--pure` and `--agent` options.
- OpenCode documents agent-level deny permissions and inline permission configuration.
- Declaration presence proves SDK-level availability only; it does not prove live host invocation.

## Reuse And Clean Path

1. Extend the existing OpenCode package resolver/status report instead of creating a second diagnostic command.
2. Inspect the resolved installed SDK declaration through a bounded capability probe with typed `declared_supported | declared_missing | uninspectable` evidence.
3. Keep host, plugin-SDK and AGDF package versions as separate facts; PRD/SD must define warning policy before any automatic alignment.
4. Strengthen static guidance only through the current global-instruction generator and defensively harden the two existing hook bodies.
5. Add one OpenCode evaluator implementing the shared evaluator contract and shared mutation guard; do not fork scoring, candidate validation or gate semantics.
6. Derive `tool_enforced` per invocation only from a successful OpenCode capability and permission preflight; otherwise expose a typed fail-closed instruction-only recovery path.
7. Update the existing capability, CLI, docs, package-sync, smoke, lifecycle and contract-test owners.

## Parallel-Structure And Compatibility Risks

- A separate OpenCode status utility would duplicate `evaluateOpenCodeStatus`.
- A new evaluator-specific scoring or schema layer would fork the portable Delivery Path Search contract.
- Duplicating hook guidance inside every skill would create parallel policy ownership beside the global instruction generator.
- Treating SDK declaration presence as live host proof would overstate evidence.
- Automatically forcing SDK alignment could overwrite host-owned dependency choices without a compatibility policy.
- `--pure` and agent permission composition must be verified together; flag availability alone is insufficient enforcement evidence.
- Existing explicit OpenCode configuration and permission decisions must remain preserved.

## Open Product And Design Questions

1. What exact user-visible states and recovery actions distinguish declared hook support, missing declarations, an uninspectable SDK and observed live execution?
2. Which host/SDK version differences are informational, warnings or blockers, and is automatic alignment ever allowed?
3. Does preflight failure stop the executable CLI run and route to the existing instruction-only skill, or execute the same subprocess with weaker classification?
4. Which permissions must be denied for `tool_enforced`, how is effective denial proven, and may any read-only tools remain enabled?
5. Is preflight evaluated for every invocation, cached for one process, or persisted with an expiry?
6. Which timeout, authentication, malformed-output and mutation outcomes are recoverable versus blocking?

## Context Graph Decision

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `link`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The existing portable evaluator invariant applies directly; no new node is justified before PRD/SD decisions are approved.
- memory_target: `context_graph`
- memory_reason: Link the approved slice to the existing portable evaluator invariant and update that node only if the approved design changes reusable enforcement or fallback rules.
- memory_refs: `CG-DELIVERY-PATH-SEARCH`

## Result

- decision: `pass`
- missing_evidence: Product semantics for visible degradation, version policy, preflight proof and fallback behavior remain intentionally owned by PRD/SD.
- transparency: Quick Task and Verified Change are not valid because the slice changes CLI/runtime behavior, visible status, permission enforcement evidence and multiple canonical owners. Full structured delivery is disproportionate because the work reuses established seams and remains confined to one runtime surface.
- required_next_step: Run UX Intent Definition for the medium-impact status and recovery semantics, then draft the smallest PRD for the structured slice.
