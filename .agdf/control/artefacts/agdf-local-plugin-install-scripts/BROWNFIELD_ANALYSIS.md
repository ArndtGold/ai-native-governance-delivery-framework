# Brownfield Analysis: Simple Local Plugin Installation Scripts

Mode: `pre_implementation_analysis`
Status: pass
Run: `agdf-local-plugin-install-scripts`
Based on: approved `TP.md`
Reviewed at: 2026-08-23

## Scope

Revalidate the approved implementation path for three source-checkout npm install commands before CD+Tests.

## Current Coverage

- current_coverage: partially_done
- Codex and Claude Code already have one transactional marketplace and lifecycle implementation.
- OpenCode already has one configuration, package, SDK-alignment, native-surface and status implementation.
- Canonical release preparation, Runtime Integrity and package tests already exist.
- Missing behavior is limited to local-development orchestration, deterministic local identity, checkout-local OpenCode package provenance and contributor aliases.

## Existing Owners And Reuse Strategy

| Concern | Existing owner | Reuse strategy | Implementation boundary |
|---|---|---|---|
| Root contributor commands | `package.json` | extend | Add exactly three thin aliases. |
| Source preparation | `create-agdf` `release:prepare` | extend | Invoke unchanged before host mutation. |
| Codex/Claude marketplace | `local-marketplace.js` | extend | Add optional validated local projection inside the existing transaction. |
| Codex/Claude lifecycle | `plugin-installers.js` | extend | Consume transaction install version; do not add another command owner. |
| OpenCode lifecycle | `opencode.js` | extend | Accept an internal validated local package specifier; public default unchanged. |
| CLI presentation | `application.js` and lifecycle presentation | extend | Forward adapters and preserve current output owner. |
| Runtime Integrity | `check-runtime-integrity.mjs` | extend | Allow only an installed local projection carrying copied marker evidence. |
| Tests | existing marketplace, lifecycle, package and integrity suites | extend | Add focused isolated fixtures and aggregate command. |

## Candidate Path Baseline

The approved implementation candidates are clean at baseline:

- `package.json`
- `create-agdf/package.json`
- `create-agdf/scripts/**`
- `create-agdf/lib/installers/local-marketplace.js`
- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/lib/installers/opencode.js`
- `create-agdf/lib/cli/application.js`
- `plugin/scripts/check-runtime-integrity.mjs`
- `CONTRIBUTING.md`
- canonical generated derivatives under `create-agdf/generated/**`

Existing `.agdf/control/**` changes belong to this run except the unrelated staged `codex-harness-conformance-slice/UR.md`, which remains isolated and untouched.

## Parallel-Structure And Drift Assessment

- No second marketplace, installer, status renderer, public CLI or version SoT is required.
- The development orchestrator is a thin internal caller, not a lifecycle decision owner.
- The Codex install projection needs a plugin-root local-install marker copied into the installed cache because the marketplace-root marker does not travel with the plugin. This is implementation evidence for the approved ownership-context rule, not a new authority.
- Canonical source/generated/public versions remain exact; only the owned staged Codex manifest receives the approved suffix.
- The OpenCode tarball path must be durable and marker-proven. An ephemeral tarball or registry fallback is forbidden.
- No product-semantics, persistence, public-contract or Context Graph drift blocks implementation.

## Regression And Test Impact

- Extend, do not replace, current marketplace and lifecycle tests.
- Add negative tests for arbitrary cache suffixes, missing local marker, wrong digest/base version, unsafe package paths and pre-preparation mutation.
- Preserve every existing release version-coherence and public candidate assertion.
- Use temporary data/config roots and injected executables exclusively; no real host or registry call is allowed during CD+Tests.

## Risks

- risk: local marker validation becomes too permissive; mitigation: bind schema, owner, base version, install version and prepared digest and reject the suffix in source/generated/public modes.
- risk: OpenCode saves a dead file dependency; mitigation: store the package beneath the durable AGDF data root before lifecycle invocation.
- risk: same content creates needless new cache keys; mitigation: derive identity from prepared content, not time.
- risk: public install behavior changes; mitigation: all local behavior is adapter-driven and absent on normal public CLI calls.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The implementation path directly applies the existing local-development alias boundary recorded by the post-UR review.

## Decision

- decision: pass
- missing_evidence: none required before implementation
- required_next_step: Implement only approved TP tasks LPI-T02 through LPI-T13 with isolated tests, then perform mandatory reviews before QA.
- forbidden: real host installation, canonical version mutation, registry fallback, release and VCS delivery
