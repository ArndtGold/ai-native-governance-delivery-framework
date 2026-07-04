# AGDF Context Graph

This file keeps durable delivery knowledge discoverable. It is not a second PRD, SD or task plan.

## Admission Rules

A node belongs here only when it has:

- concrete evidence
- affected artefacts or paths
- a visible risk, decision, invariant or reusable Brownfield finding
- a next clean step
- an exit criterion

Do not add nodes for general opinions, one-off chat summaries or local observations without future decision value.

## Node Index

| ID | Type | Status | Title | Evidence | Next Step |
|---|---|---|---|---|---|
| CG-001 | `decision | brownfield_finding | quality_node | sot_invariant | cleanup_obligation | integration_surface` | `draft | active | resolved | superseded | rejected` |  |  |  |

## Relationship Language

| Relationship | Meaning |
|---|---|
| `derived_from` | An artefact was derived from another artefact |
| `satisfies` | A task or implementation satisfies a requirement or acceptance criterion |
| `tests` | A test checks a criterion or risk |
| `mitigates` | Evidence reduces a risk |
| `depends_on` | A decision or artefact depends on another |
| `changes` | A requirement changes a component, artefact or behavior |
| `supersedes` | A newer artefact replaces an older basis |
| `blocks` | A defect or risk blocks a gate |
| `approved_by` | An artefact was approved by a gate |
| `evidenced_by` | A claim is backed by evidence |

## Nodes

### CG-001 Example

- type:
- status:
- title:
- introduced_by:
- affects:
- evidence:
- risk_or_value:
- next_clean_step:
- exit_criterion:
- links:
