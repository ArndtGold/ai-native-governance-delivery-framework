# Brownfield Analysis: German User Guide for AGDF in Coding Agents

Mode: `pre_implementation_analysis`
Decision: `pass`
Run: `coding-agent-user-guide-de`
Based on: approved TP
Date: 2026-07-12
Owner: agent

## Scope And Existing Owners

| Area | Reuse path | Change | Regression boundary |
|---|---|---|---|
| Public entry point | existing root README document list | One guide-index link | Do not move or alter existing document links |
| Framework explanation | `docs/00-07` and glossary | Link-only context | No duplicated conceptual or normative content |
| Runtime/gates | Runtime Contract and skills | Short user examples with canonical links | No second gate table or altered semantics |
| Installation/CLI | `INSTALL.md`, package READMEs | Link-only references | No copied command matrices |
| Run mechanics | `plugin/control/README.md` | User-level explanation with link | Match canonical resolver/lifecycle wording |
| Website | existing landing page | No change | No duplicate web documentation source |

## Current Coverage

- fully_done: UR, Brownfield Review, PRD, SD, TP and documentation ownership mapping.
- partially_done: none.
- not_done: guide index, chapters, root link, validation and reviews.

## Reuse Strategy

- `extend`: root README reading path and `docs/` hierarchy.
- `new`: the bounded `docs/agenten-handbuch/` Markdown cluster.
- `reuse`: all normative, installation, CLI and control-state references.
- `replace` and `refactor`: none.

## Worktree Boundary

The current worktree contains staged and unstaged run-scoped-control-state work and its separate UAT
scope. This guide slice must add only its own control artefacts, guide files and one root README link;
it must not normalize, stage, delete or otherwise modify unrelated changes.

## Risks And Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Guide restates a normative rule | block | Link to canonical owner; inspect wording and source scans before QA |
| Example implies implicit approval | block | Show exact `Approval: <Gate>` only and explain the distinction |
| Run-selection drift | revise | Cross-check against control README and Runtime Contract before final review |
| Broken documentation path | revise | Check all local links and root navigation |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The slice reuses existing documentation ownership and introduces no reusable runtime invariant.

## Next Permissible Step

Implement TP tasks GDE-02 through GDE-07, then run the mandatory reviews before QA.
