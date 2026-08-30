# Brownfield Analysis: Host-Specific AGDF Artifact for GitHub Copilot

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- revision: 3
- artefact: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md`
- based_on: approved TP revision 3

## Scope And Evidence

CPI3-T01 verifies the existing-owner path before CPI3-T02 through CPI3-T13. Direct repository
inspection confirms that the desired split can be implemented without a second editable skill
source, installer lifecycle or approval authority.

| Existing owner | Current behavior | Revision 3 use |
|---|---|---|
| `plugin/**` and `agdf-plugin.definition.json` | Own canonical skills, metadata, contracts and surface projections | Keep as the only editable semantic source |
| `sync-package-assets.js` | Builds one shared plugin root and adds Copilot files into it | Refactor to build shared and Copilot generated profiles from the same source |
| `sync-plugin-runtime.js` | Builds deterministic exact-version runtime payloads | Reuse for both generated profiles |
| `plugin-provenance.js` and `local-validator.js` | Validate only the full runtime-plugin shape | Extend with an explicit Copilot runtime profile; do not add a parallel validator |
| `local-marketplace.js` | Owns safe staging, markers, swap, rollback and shared marketplace manifests | Extract/reuse transaction primitives and add a Copilot-specific root and manifest validator |
| `installCopilotGlobalPlugin` | Uses the shared marketplace preparer | Select the Copilot preparer while retaining lifecycle and recovery |
| Existing focused and smoke suites | Cover generation, provenance, marketplace, installer and routing | Extend current owners with profile, negative and coexistence cases |

## Runtime Dependency Closure

The Copilot profile requires:

- rendered root `plugin.json` and `hooks/copilot-hooks.json`;
- projected `copilot-skills/**` including focused Runtime Contract modules and locale registry;
- exact-version `runtime/**`;
- `meta/agdf-plugin.definition.json` for validator and session-check identity;
- `meta/agdf-agent-router.md`, `meta/agdf-constitution.md` and
  `meta/agdf-runtime-contract.md` referenced by the session-start orientation;
- license and any validator-owned profile inventory.

Canonical `skills/**`, Codex and Claude manifests, Codex hooks, submissions and generic assets are
not runtime dependencies of Copilot. Control templates are not required for plugin loading or local
validation and remain available through the surface-neutral CLI/runtime package.

## Current Coverage And Reuse Strategy

| Area | Coverage | Strategy |
|---|---|---|
| Canonical source and Copilot projection | `partially_done` | `refactor` existing generator; no new source tree |
| Runtime payload | `fully_done` | `reuse` deterministic builder twice |
| Profile validation and provenance | `partially_done` | `extend` existing profile contract and validator |
| Atomic marketplace transaction | `fully_done` for shared root | `refactor` common transaction helpers and add isolated Copilot root |
| Copilot lifecycle | `fully_done` | `extend` only preparer selection and root evidence |
| Semantic inventory and growth guard | `not_done` | `new` generated evidence contract owned by the profile builder |
| Cross-host coexistence tests | `partially_done` | `extend` current local marketplace and installer suites |

## Impact And Minimal Clean Path

1. Add one code-owned Copilot profile builder beside existing generation helpers.
2. Extend the canonical distribution-profile contract with `copilot-runtime-plugin`.
3. Make local validation and provenance select requirements by explicit profile evidence rather than
   inferring from missing manifests.
4. Reuse atomic marketplace transaction primitives under `marketplaces/agdf-copilot`.
5. Point only the Copilot lifecycle to the new preparer.
6. Move Copilot-only generated files out of the shared runtime-plugin root after the new profile and
   tests are ready.
7. Preserve public commands, consent, plugin identity, repository retention and other hosts.

## Regression And Migration Boundaries

- Existing `marketplaces/agdf` content and Codex/Claude registration remain unchanged.
- Existing Copilot registrations pointing to the shared root are treated as owned prior state and
  migrate through the current marketplace lifecycle; user repository content is never touched.
- Source digest normalization and local Codex version projection remain unchanged for the shared
  profile.
- Copilot provenance adds an inventory digest but does not weaken canonical version or runtime digest
  checks.
- Package, generated, staged, host-cache and loaded-session evidence remain separate.

## Parallel-Structure And Drift Check

- A second editable Copilot skill tree is forbidden.
- A second general-purpose validator or lifecycle service is unnecessary and would fail this analysis.
- The semantic inventory is generated evidence, not a competing source of product semantics.
- Profile-specific manifest validation is an extension of existing provenance ownership.
- Size limits alone cannot authorize content removal.

## Risks

- Runtime validation currently hard-codes Codex and Claude manifests. Profile selection must be
  explicit and covered by positive and tamper tests.
- Shared transaction helpers currently assume one root and two marketplace manifests. Refactoring
  must preserve foreign-root refusal, interrupted recovery and idempotence.
- Removing Copilot files from the shared root too early can break current tests and installation.
  Implement and validate the new profile first, then switch consumers and clean the old projection.
- Same-machine installations must prove that failure rollback cannot cross surface roots.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `pending_after_delivery`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`

## Required Next Step

Proceed with CPI3-T02 through CPI3-T10 through the identified owners. Start with the generated
Copilot profile and semantic inventory, then add profile-aware validation and isolated marketplace
staging before changing installer routing. Stop if implementation requires a second editable source,
post-install network fetch, shared-root replacement, weakened Runtime Integrity or user-data cleanup.
