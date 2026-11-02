# Brownfield Review: Runtime-Clean AGDF npm Package

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-08-30
Run: `agdf-npm-package-payload-cleanup`
Derived from: approved UR revision 1

## Scope And Routing

- delivery_context: `brownfield`
- scope: Separate the public `create-agdf` npm payload from maintainer-only generated submission and
  build material while preserving every supported install, scaffold, validator and runtime path.
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change affects package composition and deterministic validation, not a
  user-facing capability, state, action, blocker, recovery flow or presentation.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- transparency: Full structured depth is required because the npm tarball is a public compatibility
  and release contract consumed across all supported host profiles. No UI/UX artefact is required.

## Existing Coverage And Owners

| Area | Coverage | Existing owner | Reuse strategy |
|---|---|---|---|
| npm publish allowlist | partially_done | `create-agdf/package.json` | refactor the broad `generated` inclusion into one explicit semantic publish boundary |
| Generated asset composition | partially_done | `create-agdf/scripts/sync-package-assets.js` | extend the existing generator; do not add a second build pipeline |
| Shared Codex/Claude runtime profile | partially_done | `syncPluginDirectory()` plus `syncPluginRuntime()` | exclude non-runtime source subtrees during the existing projection while retaining required manifests, skills, contracts, controls, diagnostics and validator runtime |
| Copilot runtime profile | fully_done for current semantics | `writeCopilotPluginFiles()`, `writeCopilotSupportFiles()` and Copilot inventory validation | preserve the isolated profile and its semantic inventory |
| OpenCode and repository scaffolds | fully_done for current semantics | existing `.opencode`, `.agdf` and `.agents` generators | preserve unchanged unless package inventory proof identifies a direct boundary dependency |
| Public submission candidate | fully_done | `buildPublicPluginCandidate()` under `create-agdf/lib/public-plugin/` | keep local generation and validation independent from npm publication |
| Exact offline validator | fully_done | `create-agdf/scripts/sync-plugin-runtime.js` | preserve the bounded runtime entries and digests |
| Package inventory tests | partially_done | `create-agdf/scripts/package-contents-test.js` | retain positive completeness checks and replace submission-presence assertions with explicit forbidden-path checks |
| Clean build and lifecycle tests | fully_done for current payload | package-build, local marketplace, Copilot profile, lifecycle and smoke suites | extend with clean-client and excluded-path evidence without weakening existing assertions |

## Consumer And Path Evidence

- `create-agdf/package.json` publishes the entire `generated` directory, so generation and publication
  currently share a directory boundary rather than a semantic payload boundary.
- Supported installation and runtime consumers reference generated `.agdf`, `.agents`, `.opencode`,
  `plugins/agdf`, `plugins/copilot/agdf`, `lib`, `bin` and exported entrypoints.
- No installed CLI or runtime consumer references `generated/submissions/openai/agdf/**`.
- The shared `plugins/agdf` profile is copied recursively from the source plugin, which also copies
  `submission/openai/**` and Copilot build-baseline metadata even though shared runtime consumers do
  not use them.
- Release-version coherence and public-plugin tests consume submission sources and generated
  candidates during release preparation. That proves they must still be generated locally, not that
  they belong in the published tarball.
- Installed Runtime Integrity scripts, Agent Skills conformance metadata and the bundled validator
  are operational diagnostics. Their test-like names do not make them development-only.

## Impact Assessment

- public_contract: The npm tarball path inventory changes and must remain complete for existing
  commands, exports and installations.
- architecture_runtime: No execution semantics change is intended, but the shared runtime profile
  projection boundary changes and must remain digest-compatible with the existing validator model.
- persistence_migration: No project data or schema migration. Package updates must remain compatible
  with existing installer swap, rollback and provenance behavior.
- release_cross_host: Codex, Claude Code, OpenCode and Copilot consume different subsets of one public
  package, so regression evidence must cover all four profiles.
- ui_ux: none.
- external_side_effects: none in implementation; publish, version, VCS and installed-host mutation
  remain separately gated and out of scope.

## Reuse And Parallel-Structure Assessment

The clean path is to keep `sync-package-assets.js` as the single generator and `package.json` plus
`package-contents-test.js` as the public package boundary and proof. A second staging tree, a second
hand-maintained file manifest or a separate submission builder would duplicate existing owners and
is rejected. The public candidate continues to be built for maintainers under `generated/submissions`
but is excluded at npm pack time.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `external_contract_depth`; `release_cross_host_depth`
- rejected_alternative: `structured_slice` is rejected because the public npm path contract and four
  supported host payloads must change and validate together; a local independently releasable slice
  would leave package consumers with an unproven compatibility boundary.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: approved UR; `create-agdf/package.json`;
  `create-agdf/scripts/sync-package-assets.js`; `create-agdf/scripts/package-contents-test.js`;
  `create-agdf/scripts/sync-plugin-runtime.js`; installer, lifecycle, public-plugin and package-build
  tests; measured 0.14.2 dry-run inventory.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One runtime-clean npm payload has an explicit acceptance boundary. |
| `authority_boundary` | pass | Existing package, generator, submission and runtime owners are identified; no new permission or governance authority is introduced. |
| `owner_consumer_coordination` | fail | One public package is consumed by four host profiles and requires coordinated compatibility evidence. |
| `full_depth_impacts_absent` | fail | Public npm contract and release/cross-host impacts are directly present. |
| `migration_propagation_bounded` | pass | No data migration; generated propagation and installed package replacement already have deterministic owners and rollback tests. |
| `failure_recovery_local` | fail | A defective published tarball affects external installs and requires package-version rollback rather than a purely local correction. |
| `independently_acceptable` | pass | The cleanup is one coherent outcome with measurable package and runtime evidence. |

## Risks And Stop Conditions

- Stop if any required CLI target, export, scaffold, host profile, validator file, diagnostic or clean
  installation path is absent from the packed package.
- Stop if submission generation is removed instead of separated from npm publication.
- Stop if the solution introduces a second manually maintained inventory or duplicates generator
  ownership.
- Stop if package tests are weakened to file-count or size-only checks.
- Stop if implementation changes plugin identity, supported-host semantics, approval authority,
  version, release state or user-owned installations.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CROSS-HOST-RUNTIME-INTEGRITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes already own the public-candidate versus installed-runtime
  distinction and the cross-host runtime completeness invariant.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: The current inventory and routing decision are specific to this package cleanup;
  reusable invariant changes, if any, belong in existing Context Graph nodes at closeout.
- memory_refs: `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/BROWNFIELD_REVIEW.md`

## Required Next Step

Draft the bounded PRD for a runtime-complete semantic npm publish inventory and request
`Approval: PRD`. Implementation remains forbidden.
