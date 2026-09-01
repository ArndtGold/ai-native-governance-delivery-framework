# Brownfield Review: Safe Legacy Profile Upgrade Recovery

Status: done
Mode: `post_ur_review`
Decision: pass
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Owner: Arndt Gold

## Scope And Routing

- delivery_context: `brownfield`
- scope: Extend the existing public installer, provenance, shared-marketplace transaction, host
  sequencing, lifecycle-result and regression-test owners so explicitly supported historical AGDF
  profile contracts can be rebuilt safely, bounded Windows Claude cache contention can recover, and
  activation guidance distinguishes an application restart from starting a fresh session.
- ui_ux_impact: `high`
- ui_ux_impact_reason: The change spans upgrade, failure, recovery and activation states across the
  shared Codex/Claude marketplace and public host-specific install commands. The current terminal
  guidance says only `Restart`, but a restored conversation can retain a stale skill registry; users
  must understand that restarting the app and then starting a fresh session are distinct required
  transitions before loaded-runtime evidence is current.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence:
  `.agdf/control/artefacts/legacy-profile-upgrade-recovery/UX_INTENT_DEFINITION.md`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- transparency: Quick Task and Verified Change are ineligible because migration authority, a public
  CLI compatibility contract, host-owned cache recovery and cross-host activation guidance change.
  Structured Slice is insufficient because the compatibility window and recovery contract span
  persistent marketplace state, Claude-owned cache behavior, public installer output and fresh
  loaded-session evidence.

## Existing Coverage And Owners

| Concern | Current coverage | Existing owner or evidence | Reuse decision |
|---|---|---|---|
| Current distribution-profile contract | fully_done for the current schema; historical current-owned contract rejected | `create-agdf/lib/runtime/plugin-provenance.js` (`EXPECTED_PROFILES`, `validateDistributionProfiles`) | extend with an explicit versioned historical-contract recognizer; keep the current validator strict |
| Installation provenance and payload integrity | fully_done for current and one older marker migration shape | `inspectInstallationProvenance`, source/runtime/plugin digests and `.agdf-installation.json` | reuse as mandatory migration evidence; do not authorize from version or path alone |
| Existing-marketplace classification | partially_done | `create-agdf/lib/installers/local-marketplace.js` (`validateBuiltPlugin`, `classifyExistingMarketplace`) | extend classification with a named supported historical-profile state; unknown, malformed and tampered states remain invalid |
| Canonical replacement transaction | fully_done | `prepareLocalMarketplace`, owned stage/backup/commit/rollback and `renameSyncWithRetry` | reuse unchanged as the replacement and rollback owner; stage only current canonical payload |
| Shared Codex/Claude registration sequencing | fully_done | `create-agdf/lib/installers/plugin-installers.js` | extend only with migration/recovery evidence and bounded host retry orchestration |
| AGDF-owned filesystem rename retry | fully_done for AGDF-owned swaps | `create-agdf/lib/fs-swap.js` | reuse retry semantics where applicable; do not treat it as authority to delete Claude cache entries |
| Claude stale temporary-cache recovery | not_done | Direct native-Windows `temp_local_*` rename `EPERM` reproduction on 2026-09-01 | add one narrowly owned recovery path for the exact failed temporary entry and bounded retry; broad cache cleanup is forbidden |
| Installer lifecycle result | fully_done structurally, incomplete guidance | `create-agdf/lib/lifecycle/result.js`, `presentation.js`, `create-agdf/lib/cli/application.js` | extend the canonical next-action owner so app restart and fresh-session creation are explicit |
| Marketplace and host sequencing tests | partially_done | `create-agdf/scripts/local-marketplace-test.js`, `cli-modularization-test.js`, `lifecycle-test.js` | extend existing fixtures with historical-profile positive/tamper/rollback, cache contention and guidance cases |
| Live-host evidence boundary | fully_done as a principle | `CG-CREATE-AGDF-CLI-COMPOSITION`, cross-host integrity artefacts | preserve installation, restarted application and fresh loaded session as separate evidence planes |

## Direct Brownfield Findings

1. Public `0.14.3` rejected a valid AGDF-owned `0.13.8` shared marketplace because the historical
   `distributionProfiles` contract predates `copilot-runtime-plugin`; current validation requires an
   exact match to all five present-day profiles.
2. Supported uninstall removed the Claude registration but intentionally retained the shared
   marketplace root, so rerunning the installer encountered the same compatibility rejection.
3. The marketplace already has a strong transactional replacement owner. Once the verified old root
   was replaced through that transaction, the profile blocker disappeared without copying historical
   payload files into the new stage.
4. Claude then failed its own final cache rename on native Windows with `EPERM` against a stale
   `temp_local_*` entry. Deleting only that failed temporary entry and retrying installed verified
   `0.14.3`.
5. `renameSyncWithRetry` protects AGDF-owned swaps but does not establish ownership of Claude's cache.
   Cache recovery therefore needs its own exact path/type/failure preconditions and must never become
   general cache deletion.
6. The canonical global next actions currently say only `Restart <host>.` Tests even assert that the
   Claude result contains no second post-restart action. This is contradicted by observed restored
   sessions retaining a stale skill registry.
7. Existing Copilot-specific output already demonstrates the required distinction by saying to
   restart and then verify skills in a fresh session; the shared lifecycle owner should carry the
   truthful surface-specific contract without creating per-command presentation copies.

## Reuse And Minimal Clean Path

- reuse_strategy: `extend`
- canonical_profile_owner: `create-agdf/lib/runtime/plugin-provenance.js`
- canonical_transaction_owner: `create-agdf/lib/installers/local-marketplace.js`
- canonical_host_sequence_owner: `create-agdf/lib/installers/plugin-installers.js`
- canonical_lifecycle_guidance_owner: `create-agdf/lib/lifecycle/result.js`, consumed by
  `create-agdf/lib/cli/application.js`
- canonical_test_owners: existing marketplace, lifecycle and CLI modularization suites
- new_primary_owner: none
- minimal_clean_path: define one explicit historical-profile allowlist and evidence contract; feed its
  matched result into the existing canonical rebuild transaction; add bounded Claude retry only after
  the exact Windows temp-rename failure and exact failed-entry ownership checks; then update the one
  lifecycle next-action projection to require app restart followed by a fresh session.

The two recovery mechanisms remain one delivery outcome because a supported historical upgrade is not
successful until the canonical marketplace can be installed and activated without expert cache
surgery. They remain separate internal failure states and test matrices so profile compatibility
cannot authorize cache deletion and cache contention cannot weaken provenance.

## Impact, Compatibility And Regression Surface

- interfaces: public `claude`, `codex` and applicable global install success/recovery output; internal
  profile-validation and marketplace-classification results
- persistence_and_migration: a supported historical shared marketplace root is replaced by the
  current canonical root through the existing reversible transaction
- compatibility_window: closed explicit allowlist of historical contract versions/shapes; no prefix,
  subset or future-schema matching
- runtime_and_recovery: one bounded retry after an exact Claude Windows cache-temp rename failure;
  unowned, ambiguous, non-temporary or unrelated cache state fails closed
- backwards_compatibility: current installations stay on the current strict path; supported
  historical owned installations gain recovery; invalid or tampered state remains rejected
- rollback: every pre-commit marketplace or host failure restores the exact prior owned root; cache
  cleanup is limited to the failed installer-owned temporary entry and cannot broaden rollback scope
- activation: installed version evidence remains distinct from application restart and fresh-session
  skill-registry evidence
- required_tests: supported `0.13.8` upgrade, unsupported historical/future contract rejection,
  ownership/provenance/digest tamper rejection, canonical-only stage, host-failure rollback, exact
  Windows `EPERM` temp recovery, retry exhaustion, unrelated cache preservation, and lifecycle
  restart-plus-fresh-session output
- required_live_evidence: native-Windows Claude upgrade and a fresh post-restart session; repository
  tests cannot prove Claude cache behavior or loaded-session refresh

## Parallel-Structure And Drift Risks

- A second permissive profile validator could drift from the current contract and create a downgrade
  path. Historical recognition must be a bounded input to the canonical validation/classification
  owner.
- Copying the old plugin tree into the stage would preserve stale or malicious files. Replacement must
  be built exclusively from current canonical assets.
- A general-purpose Claude cache cleaner would claim ownership AGDF does not have. Recovery must bind
  the exact failed `temp_local_*` entry to the observed install attempt and exact failure.
- Per-command restart prose would drift across Claude, Codex, Copilot and OpenCode. The lifecycle result
  remains the presentation source of truth.
- Installation success, app restart and fresh-session activation could be flattened into one healthy
  state. They remain separate authority and evidence planes.
- The existing `owned_pre_provenance_rebuild` branch is not a generic precedent for accepting
  incomplete profile contracts; the new path must require stronger, explicitly versioned historical
  ownership and integrity evidence from the approved UR.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers:
  - external_contract_depth: The published CLI changes which historical installation contracts are
    accepted and changes its user-visible activation/recovery promise.
  - persistence_migration_depth: A durable shared marketplace is migrated across an explicit
    compatibility window with exact rollback requirements.
  - architecture_runtime_depth: Recovery crosses AGDF's atomic marketplace transaction and Claude's
    host-owned Windows cache rename boundary.
  - release_cross_host_depth: The shared marketplace serves Codex and Claude while activation guidance
    must remain truthful across supported hosts and fresh sessions.
- rejected_alternative: `structured_slice` is rejected because the outcome cannot be accepted or
  rolled back as a purely local owner change: public compatibility, persistent migration, host cache
  recovery, shared-host registration and post-restart fresh-session activation must remain coherent.
- missing_or_conflicting_facts: none for depth selection; exact historical allowlist representation and
  Claude temporary-entry ownership proof remain PRD/SD decisions.
- depth_evidence_refs: approved `UR.md`; direct public `0.14.3` native-Windows execution on 2026-09-01;
  verified owned `0.13.8` marketplace inspection; successful transactional replacement; exact failed
  `temp_local_*` cleanup and verified retry; `plugin-provenance.js`; `local-marketplace.js`;
  `plugin-installers.js`; `fs-swap.js`; lifecycle result/application owners; existing regression
  suites; `CG-CREATE-AGDF-CLI-COMPOSITION`.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One user outcome: a supported owned historical installation upgrades safely and reaches a truthful activation handoff. |
| `authority_boundary` | fail | Migration authority must distinguish AGDF-owned persistent state from Claude-owned cache state without weakening either boundary. |
| `owner_consumer_coordination` | fail | Provenance, shared marketplace, Claude sequencing, public lifecycle output and restored-session consumers require one compatibility contract. |
| `full_depth_impacts_absent` | fail | Public CLI, migration, runtime recovery and cross-host activation impacts are directly evidenced. |
| `migration_propagation_bounded` | pass | The allowlist can be closed and the marketplace transaction is locally reversible, but this does not negate the decisive full-depth triggers. |
| `failure_recovery_local` | fail | Marketplace rollback is AGDF-owned, while final cache recovery crosses into an exact Claude-owned temporary failure boundary. |
| `independently_acceptable` | fail | Profile migration without bounded cache recovery and fresh-session guidance reproduces the expert-manual recovery gap. |

## Context Graph And Knowledge Persistence

- situation: A valid historical AGDF installation can require a versioned compatibility rebuild, but
  install completion still does not prove that a restarted application's fresh session loaded the new
  skill registry.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Existing node extensions already own current provenance, atomic marketplace
  replacement, Windows lock tolerance, Claude reinstall behavior and loaded-session separation. This
  run adds the reusable historical-contract and restart-versus-fresh-session boundary after delivery.
- memory_target: `context_graph`
- memory_reason: The compatibility and activation distinction is reusable for future installer
  upgrades and host adapters.
- memory_refs: this Brownfield Review, the approved UR and the later approved delivery artefacts.

## Missing Evidence And Product Decisions

- The exact durable representation and retirement policy for supported historical contracts needs PRD
  definition.
- The exact proof that a Claude `temp_local_*` entry belongs to the failed install attempt needs SD
  definition and adversarial tests.
- Claude CLI cache behavior is directly observed only for the current native-Windows host/version and
  must not be generalized to other platforms without evidence.
- Final output wording and state labels must be incorporated into the approved PRD using the ready UX
  Intent Definition.
- Fresh-session loaded-skill evidence remains later UAT evidence.

## Required Next Step

Draft the Structured Delivery PRD using the ready UX Intent Definition. Define the closed historical
compatibility contract, fail-closed migration authority, exact cache-recovery boundary, rollback,
restart-versus-fresh-session semantics and evidence planes. Request exact `Approval: PRD`.
Implementation, installation mutation, QA, UAT, release and VCS actions remain forbidden.
