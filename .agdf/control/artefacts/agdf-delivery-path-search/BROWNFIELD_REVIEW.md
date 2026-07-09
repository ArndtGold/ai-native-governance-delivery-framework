# Brownfield Review: AGDF Delivery Path Search

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-delivery-path-search
- related_ur: `.agdf/control/artefacts/agdf-delivery-path-search/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-09

## Objective

Size and route a surface-neutral, read-only delivery-path search capability with a shared core, replaceable evaluators and coding-agent-specific adapters while leaving AGDF gates authoritative.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Skill sources and routing | `plugin/skills/`; `plugin/meta/agdf-plugin.definition.json` | Shared skill source and canonical routing rows already exist | high |
| Gate semantics | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | Canonical transitions, permissions and fail-closed rules already exist | high |
| Codex plugin packaging | `plugin/.codex-plugin/plugin.json` | Existing manifest exposes shared skills and lifecycle hooks | medium |
| Claude Code packaging | `plugin/`; `plugin/.claude-plugin/plugin.json` | Claude Code consumes the shared plugin root | medium |
| Copilot generation | `create-agdf/scripts/sync-package-assets.js`; `create-agdf/scripts/test-routing.js` | Copilot receives generated repository instructions and prefixed skills | high |
| OpenCode integration | `create-agdf/opencode-plugin.js`; generated `.opencode/` assets | OpenCode combines repository instructions, generated agents, permissions and npm hooks | high |
| Lifecycle hooks | `plugin/hooks/hooks.json`; `plugin/hooks/session-start.sh` | Current hook loads AGDF context at session start; it is not a search engine | medium |
| Runtime integrity | `plugin/scripts/check-runtime-integrity.mjs` | Existing cross-surface validation checks manifest, hooks and skill routing | high |
| Durable delivery state | `.agdf/control/` | Existing run, backlog, registry and artefact conventions own governed state | high |
| Search implementation | none observed | Repository search found no MCTS or delivery-path-search implementation | high |

## Coverage And Reuse Strategy

- current_coverage: `partially_done`
- reuse_strategy: `extend`
- reuse:
  - derive candidate states and permissions from the existing runtime contract and live control state
  - add the workflow to the shared `plugin/skills/` source and canonical `skillSet`
  - derive surface-specific names and routing from `plugin/meta/agdf-plugin.definition.json`
  - extend the existing Copilot and OpenCode generation paths instead of maintaining adapter copies by hand
  - persist results under the existing scope artefact model
  - extend runtime-integrity checks instead of adding a separate validator
- new component justified:
  - a surface-neutral bounded search engine or orchestrator is not currently present
  - evaluator and surface-adapter contracts are not currently defined
  - programmatic evaluator calls and enforcement capability reporting require explicit runtime owners

## Parallel-Structure And Drift Risks

| Finding | Risk | Required action |
|---|---|---|
| Search could invent a second gate transition model | block | Consume canonical runtime state; never encode competing gate authority |
| A separate `agdf-mcts-plan` tree could diverge across surfaces | block | Add one shared skill source and derive surface names from canonical metadata |
| Agent-specific adapters could fork scoring or search semantics | block | Keep algorithms and contracts in one core; adapters translate transport and capabilities only |
| Model-generated scores could be presented as measurements | high | Separate deterministic facts from evaluator judgements and confidence |
| A hook-based search loop would mix enforcement and orchestration | high | Keep hooks deterministic and narrow; place search in a skill plus explicit programmatic runtime |
| Surfaces without trusted hooks could overstate read-only enforcement | high | Report `full`, `tool_enforced` or `instruction_only` capability explicitly |
| Supporting every coding agent could create an unbounded compatibility promise | high | Support the four existing surfaces first and publish a conformance contract for additional adapters |
| “MCTS” could overstate a beam search or ranked-candidate MVP | medium | Use `Delivery Path Search` until full MCTS mechanics are evidenced |
| Repeated model calls add cost, latency and non-determinism | high | Define budgets, stopping rules, reproducibility evidence and fallback behavior in PRD/SD |
| Search traces may expose sensitive repository context | high | Define persistence and redaction boundaries before implementation |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: The capability introduces new product semantics, a shared search runtime, evaluator and surface contracts, programmatic model calls, scoring and persistence policy, and coherent delivery across all four supported coding-agent surfaces.
- evidence: Existing surface owners and generation paths are identifiable, but they differ materially in plugin packaging, repository instructions, agents, permissions and hooks. The repository has no common search runtime or adapter contract.
- transparency_note: PRD, SD and TP are required at focused depth. The delivery may be sliced by core, primary Codex adapter and additional surface conformance, but the shared contract must be designed first.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: none yet
- context_graph_required_action: Reassess after PRD identifies durable invariants worth promoting.
- context_graph_gate_effect: none
- context_graph_evidence: Current findings belong to this scope until product and runtime decisions are approved.

## Decision

- decision: `pass`
- missing_evidence: Product choices, portability guarantees, enforcement levels and adapter conformance requirements listed in the UR must be resolved by PRD and SD.
- required_next_step: Draft a compact PRD for `agdf-delivery-path-search` and request `Approval: PRD`.
- forbidden_until_then: Solution Design, Task Plan, core or adapter implementation, model-call integration, new hooks and release activity.

## Quality Outlook

Keep one advisory, read-only and auditable core. Preserve deterministic AGDF gates as the sole execution authority and make weaker enforcement surfaces visibly weaker.
