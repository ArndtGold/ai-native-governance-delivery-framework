# Brownfield Review: Fresh Request vs Durable Control State Documentation

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: fresh-request-control-state-docs
- related_ur: .agdf/control/artefacts/fresh-request-control-state-docs/UR.md
- current_gate: Quick Task Execution
- reviewer: agent
- reviewed_at: 2026-07-09

## Objective

Size and route a bounded documentation clarification without changing AGDF gate logic or CLI behavior.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Runtime rule | `plugin/meta/agdf-runtime-contract.md` | Defines fresh-request behavior and durable-control boundary | reference only |
| Gate-check skill | `plugin/skills/gate-check/SKILL.md` | Gives the same operational rule | reference only |
| User docs | `README.md`; `INSTALL.md`; `create-agdf/README.md` | Current explanation is present but scattered | low |
| CLI behavior | `create-agdf/bin/create-agdf.js` | Already emits the same next action | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The rule already exists in Runtime Contract and gate-check | Runtime and skill files | warn if duplicated as a second rule model | Explain the rule in user terms and point at existing behavior |
| User docs already mention `init` is optional for normal fresh requests | README and create-agdf README | warn if left scattered | Add a compact explicit distinction near setup/control sections |
| CLI behavior should not change | Scope non-goal | block if implementation changes are introduced | Documentation-only change |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: The approved scope is a small documentation clarification that follows existing Runtime Contract and gate-check behavior without changing product logic, CLI behavior, persistence or architecture.
- evidence: Existing source-of-truth files already define the behavior; affected docs are known and local.
- transparency_note: PRD, SD and TP would add ceremony without reducing risk for this documentation-only clarification.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This explains an existing operating-model boundary and does not create a new durable concept.

## Next Permissible Step

- next_allowed_action: Update the affected user documentation and run a focused diff/review.
- forbidden_until_then: CLI behavior changes, new gates, implementation claims beyond documentation.

## Quality Outlook

- quality_outlook: Keep Runtime Contract as the normative rule and make user docs explain only the practical distinction.
