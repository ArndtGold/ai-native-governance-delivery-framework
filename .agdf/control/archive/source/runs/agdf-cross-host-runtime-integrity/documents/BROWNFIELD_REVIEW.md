# Brownfield Review: Cross-Host Plugin Runtime Integrity

Status: done  
Mode: post_ur_review  
Decision: pass  
Date: 2026-08-25  
Derived from: approved `UR.md`

## 1. Scope And Routing

- delivery_context: brownfield
- scope: Correct the existing AGDF distribution-source and effective-runtime integrity boundary
  without creating a second validator, installer, marketplace format or host-specific governance
  implementation.
- ui_ux_impact: medium
- ui_ux_impact_reason: The change affects visible installation identity, effective activation,
  degraded-state diagnosis, recovery guidance and the distinction between installed and actually
  loaded plugin state across coding-agent hosts.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- transparency: Quick Task and Verified Change are ineligible because the scope changes executable
  distribution-source validation and user-visible recovery across multiple existing owners. Full
  Structured Delivery is not required because the shared runtime architecture, gate semantics,
  durable installer, public Skills-only contract and host authority boundaries remain unchanged;
  the correction is independently deliverable and locally recoverable through existing installers.

## 2. Existing Coverage And Owners

| Concern | Current coverage | Canonical owner | Reuse strategy |
|---|---|---|---|
| Shared validator implementation | fully_done | focused modules under `create-agdf/lib/` and `create-agdf/bin/agdf-validator.js` | extend validation only; do not fork |
| Runtime payload generation | fully_done | `create-agdf/scripts/sync-plugin-runtime.js` | reuse unchanged composition unless evidence requires a bounded metadata extension |
| Complete generated plugin | fully_done | `create-agdf/scripts/sync-package-assets.js` | reuse as the only runtime-bearing build source |
| Durable Codex and Claude marketplace | fully_done | `create-agdf/lib/installers/local-marketplace.js` | extend provenance and effective-source verification where needed |
| Codex and Claude lifecycle | fully_done | `create-agdf/lib/installers/plugin-installers.js` | extend post-install evidence; preserve rollback and ownership checks |
| OpenCode runtime | fully_done | `create-agdf/lib/installers/opencode.js` | regression-only unless a shared contract field must propagate |
| Repository Codex marketplace projection | partially_done | `create-agdf/lib/public-plugin/manifest.js` and generated `.agents/plugins/marketplace.json` | correct or remove the source projection; do not install runtime-free `plugin/` as runtime-bearing AGDF |
| Repository marketplace identity contract | partially_done | `plugin/meta/agdf-plugin.definition.json` | consume the existing `agdf-repo` identity consistently or remove the unnecessary projection |
| Source and installed Runtime Integrity | partially_done | `plugin/scripts/check-runtime-integrity.mjs` | add source-target, identity-collision and effective-provenance negatives |
| Public Skills-only profile | fully_done for repository contract | `create-agdf/lib/public-plugin/` and `plugin/submission/openai/` | preserve agent-native and unverified-host boundaries |
| Effective loaded-host evidence | partially_done | lifecycle evidence plus direct host UAT | extend to selected cache or plugin root and fresh-session proof |

## 3. Direct Brownfield Findings

1. The completed `automatic-version-asset-sync` design already states that `plugin/` is source-only
   and not directly installable as an offline full plugin.
2. The completed local-install design already builds and stages a runtime-complete plugin with
   exact-version and digest ownership markers.
3. The repository Codex marketplace contradicts that architecture by pointing to `./plugin`.
4. The canonical definition declares repository marketplace name `agdf-repo`, while
   `createRepositoryCodexMarketplace` emits `definition.id` (`agdf`). Existing lifecycle logic
   already distinguishes `agdf@agdf-repo` from `agdf@agdf`, confirming the separate identity intent.
5. The observed Codex session cache is byte-identical to the runtime-free source projection. The
   registered durable marketplace contains a healthy validator and passes exact-version resolution.
6. Claude Code already has a host-native plugin-root contract and executable support. It can consume
   the same complete runtime payload through a thin host adapter without owning gate semantics.
7. OpenCode already uses an exact config-local package and does not need a second runtime distribution.
8. The public Skills-only candidate intentionally permits agent-native operation without promising a
   local validator. Its absence is not the same defect as a runtime-bearing local installation that
   is shadowed by source.

## 4. Reuse And Parallel-Structure Assessment

- reuse_strategy: extend the existing repository marketplace renderer, local marketplace validation,
  lifecycle evidence and regression suites.
- new primary runtime owner: none
- new installer owner: none
- new marketplace format: none
- parallel_structure_risk: high if the solution adds per-skill validator copies, a second generated
  runtime, a second local marketplace or independent Codex/Claude gate logic.
- required safeguard: all host adapters must consume the same generated validator payload and may
  translate only installation-root resolution, invocation and host-owned lifecycle evidence.
- source_of_truth_drift: present in the repository marketplace projection; the declared `agdf-repo`
  identity and source-only plugin contract are not reflected by the rendered install target.

## 5. Impact And Regression Surface

- likely owners affected: repository marketplace projection, canonical distribution metadata,
  Runtime Integrity assertions, local marketplace provenance inspection, lifecycle status evidence,
  package/install fixtures and host UAT artefacts.
- interfaces: marketplace identity and source, installed plugin version/provenance reporting and
  machine-validation availability classification.
- persistence: host-owned marketplace registrations and caches only; no new AGDF persistent schema.
- migration: no in-place cache mutation. Recovery uses the existing explicit install/update path and
  fresh-session boundary.
- backwards compatibility: existing canonical `agdf@agdf` durable installations and public
  Skills-only behavior remain valid; repository-source consumers receive an explicit migration or
  removal path.
- security and authority: unchanged. Host permissions remain host-owned and AGDF approvals remain
  exact-text, run-scoped authority.
- test impact: source, generated, installed, cache/provenance, negative collision, Codex fresh-session,
  Claude installed-root/fresh-session and OpenCode regression evidence remain separate.

## 6. Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` is rejected because no trust, policy, security,
  persistence, external API, public CLI, validator semantics, independent release plan or coordinated
  cross-host cutover changes. Each host adapter can adopt the same bounded contract through its
  existing installer and recovery path.
- missing_or_conflicting_facts: none
- depth_evidence_refs: approved `UR.md`; completed `automatic-version-asset-sync` and
  `agdf-local-plugin-install-scripts` artefacts; current marketplace, installer, Runtime Integrity and
  observed cache evidence; official Codex and Claude Code plugin documentation inspected 2026-08-25.

| Bounded-slice check | Status | Evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: prevent runtime-free source shadowing and prove the effective shared validator or honest degradation. |
| authority_boundary | pass | Existing plugin definition, runtime builder, installer, host and AGDF approval authorities remain unchanged. |
| owner_consumer_coordination | pass | All affected owners are inside the existing AGDF repository and host adapters can update independently without shared external cutover. |
| full_depth_impacts_absent | pass | The runtime execution model, gate semantics, persistence, public API and security boundaries do not change. |
| migration_propagation_bounded | pass | Normal owned installer refresh plus restart/fresh-session verification is deterministic and locally reversible; caches are not patched. |
| failure_recovery_local | pass | Collision or provenance failure stops locally and routes to the existing surface installer or explicit marketplace recovery. |
| independently_acceptable | pass | The integrity correction has standalone acceptance signals and does not depend on public submission, release or another active run. |

## 7. Risks And Missing Evidence

- risks:
  - host marketplace precedence could differ from the inferred Codex cause;
  - a renderer-only correction could leave stale-cache or effective-session ambiguity undetected;
  - broad runtime-profile work could duplicate completed owners;
  - repository tests could be overstated as authenticated host behavior.
- missing_evidence:
  - direct Codex host proof of repository marketplace selection precedence;
  - direct Claude Code installed-root and fresh-session proof for the corrected profile;
  - exact design choice for removing, renaming or restricting the repository marketplace;
  - final changed-path and regression inventory after SD and TP.

These gaps belong to SD, TP and later host evidence. They do not block bounded PRD drafting.

## 8. Context Graph And Knowledge Persistence

- context_graph_impact: update_existing_node
- context_graph_refs: existing runtime distribution, plugin installation and cross-host surface nodes;
  exact canonical node IDs must be selected before closeout.
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The reusable invariant is that source, built bundle, registered marketplace,
  installed cache and effective loaded session are separate evidence planes, while validator semantics
  retain one owner.
- memory_target: context_graph
- memory_reason: The source-selection and effective-runtime invariant is reusable across every future
  plugin release and host adapter.
- memory_refs: this Brownfield Review and the approved UR.

## 9. Decision

- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- required_next_step: Draft the bounded PRD using the ready UX Intent Definition; implementation,
  installation, release and cache mutation remain forbidden.
