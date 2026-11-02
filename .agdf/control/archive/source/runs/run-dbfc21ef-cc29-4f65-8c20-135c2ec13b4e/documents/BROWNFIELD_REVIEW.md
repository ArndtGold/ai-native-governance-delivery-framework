# Brownfield Review: MCP schema projection and guidance repair

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run
- run_id: run-dbfc21ef-cc29-4f65-8c20-135c2ec13b4e
- related_ur: .agdf/control/artefacts/run-dbfc21ef-cc29-4f65-8c20-135c2ec13b4e/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-30

## Objective
Repair discovery and description of existing MCP inputs, remove the specifically authorized obsolete local cockpit registration, and recheck the bounded outcome. Preserve accepted request semantics and all existing approval, identity, revision and recovery owners.

## UI / UX Impact Routing
- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Agent-facing descriptions and type visibility become clearer for existing operations; no new capability, authority, mode or recovery semantics.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View
| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Existing dispatch/inspect/command contracts | packages/core/lib/skill-dispatch/contract.js; control-inspect/contract.js; control-state/run-command-schema.js | low |
| Source of truth | Canonical Core definitions, shared by protocol and writers | packages/cli/lib/mcp-protocol-runtime.js; packages/mcp-server/src/server.js | none |
| Runtime path | Existing SDK registers the same definitions and validators | packages/mcp-server/src/server.js | none |
| UI / UX | Model-visible MCP input and tool guidance | docs/architecture/04-mcp-schnittstellen.md documents root-allOf projection symptom and inspect correction | low |
| Persistence / data | Existing Run/receipt and target owners | No persistence or receipt format change is proposed | none |
| Tests / QA | Contract, protocol, command-schema and renderer checks | packages/cli/scripts/skill-dispatch-function-contract-test.js; packages/core/test/run-command-contract-test.js; packages/mcp-server/test/protocol.test.js | low |
| Release / operations | Repository-local obsolete registration | .codex/config.toml registers only agdf-cockpit-local 0.14.5; installed plugin uses its separate namespaced endpoint | low |

## Architecture Impact
- architecture_relevance: architecture-not-applicable
- architecture_impact: none
- architecture_reason: This repair retains all fields, operations, validation restrictions, Core owners and SDK boundaries. Equivalent schema factoring and guidance corrections do not expand the public behavioral contract or introduce another schema owner. Removing one obsolete local registration is reversible and changes no current plugin registration.
- architecture_evidence: Existing inspect owner already relocates conditions below a required discriminator; commandGroupSchema remains the expanded source, compactCommandSchema its deterministic projection, SDK validation consumes that projection.
- architecture_missing_evidence: none
- architecture_next_owner_and_action: Existing schema owners perform equivalent projection repair and acceptance/rejection parity checks. Escalate if equivalence requires a new accepted input or authority change.

## Reuse And Parallel-Structure Risk
| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing Codex-compatible factoring is reusable | control-inspect/contract.js relocates root-allOf under required operation | warn | Apply the same semantic principle to dispatch using required skill_id; verify parity. |
| Command projection and budget are coupled | run-command-schema.js local references and factored empty property shapes; definition limits stay fixed | warn | Repair the existing compact projection only; keep expanded owner and SDK restrictions, test budgets and invalid inputs. |
| Live session may retain old tool metadata | This chat was created with current installed plugin | warn | Use a fresh isolated candidate signature/protocol probe where available; distinguish it from installation or qualification of this chat. |
| Concurrent unrelated changes | Baseline status shows CONTRIBUTING.md, local preparation files and another Run already modified/staged | warn | Do not modify, stage or restore those paths. |

## Mode / Slice Decision
- decision: quick_task
- required_next_gate: none
- scope_reason: Narrow corrective repair of the discovery of already-supported inputs and their descriptions, plus one explicitly named local config removal. No new product semantics, contract expansion, architecture, policy, persistence, approval or release behavior. Keep the relevant-run review and closeout ceremony; do not claim the single-function trivial exception.
- evidence: Canonical owners and exact symptoms above; prior installed/repository byte comparison and eight validator cases; approved UR bounds; current contract tests passed before changes.
- transparency_note: Compact Delivery after approved UR; no further action is needed from the user for this internal routing step. Code Review and evidence remain mandatory.

## Structured Depth Evidence
- depth_policy_version: 1
- depth_facts_status: not_applicable
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none; validation semantics and consumer coordination remain unchanged
- rejected_alternative: verified_change requires one canonical owner, which this repair does not have; structured routing is reserved for expanded behavior or a new unresolved boundary
- missing_or_conflicting_facts: none for bounded routing
- depth_evidence_refs: Existing-System View and Architecture Impact

## PRD / SD Open Questions
| Question | Required gate | Impact |
|---|---|---|
| None: expected behavior is fixed by the approved UR and existing accepted inputs | none | warn |

## Context Graph Impact
- context_graph_impact: link_only
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing architecture documentation links the current schema owners; no new node or authority is introduced.

## Next Permissible Step
- next_allowed_action: Repair existing schema factoring and guidance, remove the obsolete local registration, verify regression detection and parity, then mandatory Code Review and closeout.
- forbidden_until_then: New operations or accepted input semantics, permission changes, installation/release claims, Git actions and unrelated worktree changes.

## Quality Outlook
- quality_outlook: Expected bounded repair; evidence must separately establish validator parity, protocol behavior and candidate signature visibility. Escalate if budgets cannot be met without changing semantics.
