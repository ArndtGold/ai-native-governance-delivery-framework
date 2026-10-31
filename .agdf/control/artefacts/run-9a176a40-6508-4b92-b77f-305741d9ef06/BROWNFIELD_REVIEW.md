# Brownfield Review: Automatic local MCP UI preparation

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: run-9a176a40-6508-4b92-b77f-305741d9ef06
- related_ur: .agdf/control/artefacts/run-9a176a40-6508-4b92-b77f-305741d9ef06/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-30

## Objective

Repair local installation preparation so required missing/stale UI resources are rebuilt, valid resources reused and failures stop before host installation, within the approved UR.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Bounded recovery of the existing prepare-checkout action; no new option, decision, interaction or host state.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | CONTRIBUTING.md local installation | The command already promises to prepare the checkout. | low |
| Source of truth | scripts/cockpit-ui-build.mjs | Exact HTML and source digests; canonical validation remains unchanged. | none |
| Runtime path | packages/cli/scripts/prepare-local-plugin.js | Calls syncPackageAssets without ensuring valid UI first. | low |
| UI / UX | packages/control-ui/scripts/build-mcp.mjs | Existing build writes both resources and guards source changes. | low |
| Persistence / data | install-local-plugin.js | Preparation precedes package assembly and host lifecycle. | none |
| Tests / QA | local-preparation-test.js; plugin-mcp-cockpit-variant-test.js | Existing isolated fixture, surface matrix, wrapper boundary and invalid-resource checks. Missing/stale preparation currently expects failure. | low |
| Release / operations | packages/cli/lib/npm-invocation.js | Existing platform-safe npm invocation; no publication or host action needed. | none |

## Architecture Impact

- architecture_relevance: architecture-not-applicable
- architecture_impact: none
- architecture_reason: Add one bounded prerequisite check/build/recheck inside the existing local preparation owner. Validation, UI build, profile generation and host lifecycle keep their owners; no public CLI contract, trust, persistence or coordination boundary changes.
- architecture_evidence: prepare-local-plugin.js; cockpit-ui-build.mjs; build-mcp.mjs; install-local-plugin.js
- architecture_missing_evidence: none
- architecture_next_owner_and_action: Existing local preparation owner invokes the canonical build only when selected-surface resources fail validation.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Missing prerequisite orchestration | prepareLocalPlugin calls syncPackageAssets directly. | warn | Extend this function; reuse readDecisionUiBuild/readCockpitUiBuild and npmInvocation. |
| Existing fail-closed validation | Source digest includes UI sources, dependency lock and imported contracts. | none | Revalidate after build and preserve packaging validation. |
| Build prerequisites | UI owns a separate package lock and node_modules; fixtures omit these dependencies. | warn | Report the existing npm ci command on dependency/build failure; copy installed UI dependencies into this test fixture only. No implicit network install or second dependency manager. |
| Coverage reuse | Existing local-preparation fixture already covers all surfaces and wrapper isolation. | none | Extend it with real rebuilds, reuse proof and failure cases; retain budget guards. |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Compact Delivery for a narrow correctness fix to the already approved local preparation behavior, with canonical owners unchanged and local reversible output.
- evidence: Approved UR; direct source review above; earlier missing/stale digest reproduction and successful manual canonical rebuild.
- transparency_note: No PRD/SD/TP needed for this bounded correction. Relevant-run review, QA and closeout remain; no host installation or VCS action is implied.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: not_applicable
- primary_reason_code: narrow_existing_preparation_fix
- decisive_full_depth_triggers: none
- rejected_alternative: verified_change adds an unnecessary separate eligibility record; structured depth is unnecessary for unchanged owner/public contracts and a local prerequisite repair.
- missing_or_conflicting_facts: none
- depth_evidence_refs: Existing-System View and Architecture Impact above.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| None; unavailable build dependencies receive an actionable existing install command as allowed by UR. | none | warn |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Local prerequisite correction; no ownership or reusable architectural decision changes.
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: Reproduction and test evidence belong to this Run.

## Next Permissible Step

- next_allowed_action: After canonical route recording, implement the bounded preparation fix and extend its existing regression suite.
- forbidden_until_then: Source implementation before route recording; host installation, publication and VCS actions.

## Quality Outlook

- quality_outlook: Test missing output and stale source failure before the fix, real rebuild and valid reuse after it, failed/no-op builds, required surface payloads and wrapper host isolation. Reuse existing invalid-resource contract checks. No native-host claim.
