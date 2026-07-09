# UR: AGDF Delivery Path Search

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

High-impact delivery decisions can enter implementation before competing paths have been compared systematically for scope fit, risk, evidence needs, test impact and gate readiness.

AGDF currently governs whether a delivery step is allowed, but it does not provide a bounded search mechanism that explores several permissible next-step candidates and recommends the safest evidence-backed option before implementation.

## 2. Goal

Add a surface-neutral AGDF Delivery Path Search capability that explores candidate delivery paths without changing code, uses a replaceable coding-agent or model adapter for evaluation, and returns exactly one recommended next delivery step with scores, evidence needs and rejected alternatives.

The capability is an AGDF function rather than a Codex-specific function. Codex is the primary implementation surface, while Claude Code, GitHub Copilot, OpenCode and future coding agents consume the same search semantics through surface-specific adapters.

The selected step remains subject to the normal AGDF gate decision. Search never grants implementation permission, regardless of the agent or model used.

## 3. Scope

- Define one surface-neutral Delivery Path Search core for high-impact delivery decisions.
- Represent an AGDF delivery state as a search node and permissible next delivery steps as actions.
- Evaluate candidate consequences against scope, risk, evidence, tests and gate readiness.
- Keep search read-only and prohibit implementation during exploration.
- Return one recommended next step plus rejected alternatives and reasons.
- Persist the decision result as scope evidence in the existing AGDF control model.
- Define an evaluator-adapter contract so Codex, Claude Code, GitHub Copilot, OpenCode or another capable coding agent/model can perform repeated evaluation without changing the search or gate semantics.
- Define surface adapters that map the shared capability to each supported agent's native extension points, such as plugins, skills, repository instructions, agents, commands, permissions or hooks.
- Use Codex as the primary implementation and validation surface without placing Codex-specific behavior in the search core.
- Provide a capability model that distinguishes:
  - full enforcement when the surface supports trusted hooks or permissions,
  - tool-enforced operation when an external orchestrator controls writes,
  - instruction-only operation when technical write prevention is unavailable.
- Keep deterministic AGDF gates authoritative after search.
- Reuse the canonical skill and routing sources; generate or adapt surface-specific output rather than maintaining parallel definitions.

## 4. Non-Goals

- No model-level MCTS switch or modification of any evaluator model.
- No autonomous code changes during search or simulation.
- No replacement of AGDF gate-check, approvals, runtime contracts or durable control state.
- No second skill tree, runtime rule set or delivery-state source of truth.
- No promise that every coding agent provides equally strong lifecycle enforcement.
- No agent-specific fork of scoring, gate semantics or persisted delivery state.
- No claim of full Monte Carlo Tree Search unless expansion, repeated simulation, backpropagation and an exploration policy are implemented and verified.
- No commit, push, PR, release or publish.

## 5. Acceptance Signals

- The capability activates only for high-impact planning decisions.
- Candidate actions are derived from the current governed delivery state.
- Every evaluation makes assumptions, risks, tests, evidence needs and gate readiness visible.
- Search cannot modify repository files or unlock implementation.
- The output contains exactly one recommended next delivery step and explains rejected alternatives.
- The next AGDF gate independently allows or blocks that step.
- The search core has no direct dependency on a specific coding-agent plugin format.
- Evaluator and surface adapters have explicit contracts and capability declarations.
- Codex, Claude Code, GitHub Copilot and OpenCode mappings reuse the same canonical search, scoring and gate semantics.
- An additional coding agent can be integrated through adapters without copying or changing the core decision model.
- Each surface reports whether read-only search is technically enforced, externally enforced or instruction-only.
- Surfaces without trusted hooks or permissions fail transparently instead of claiming equivalent enforcement.
- Naming accurately distinguishes bounded path search from full MCTS.
- Contract tests verify adapter conformance.
- Focused tests verify read-only behavior, scoring/output stability, cross-surface semantic consistency and fail-closed gate handling.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/meta/agdf-agent-router.md`
- `plugin/skills/`
- `plugin/.codex-plugin/plugin.json`
- `plugin/hooks/hooks.json`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/test-routing.js`
- `create-agdf/opencode-plugin.js`
- `.agdf/control/`

## 7. Open Product Questions

- Should the first release implement bounded beam-style path search or full MCTS?
- What is the minimal surface-neutral evaluator contract?
- Which programmatic interface owns repeated evaluator calls on each supported surface?
- Which surface is responsible for orchestration when the coding agent cannot be called directly?
- Which score fields are deterministic inputs versus model judgements?
- What search budget and stopping conditions are acceptable?
- Which evidence is persisted, and how are sensitive prompts or model traces excluded?
- What minimum capability qualifies a new coding agent for full, tool-enforced or instruction-only support?
- Which adapter conformance tests are mandatory across surfaces?

## 8. Next Step

Request `Approval: UR` for this revised cross-agent scope. Then repeat Brownfield Review and record a new Mode/Slice Decision before drafting later artefacts or implementation.
