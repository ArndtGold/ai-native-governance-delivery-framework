# Brownfield Analysis: AGDF Delivery Path Search

Mode: `pre_implementation_analysis`
Status: passed
Decision: `pass`
Reviewed at: 2026-07-09
Approved scope: DPS-01 through DPS-14
Based on: `.agdf/control/artefacts/agdf-delivery-path-search/TP.md`

## 1. Existing Owners

| Concern | Existing owner | Required implementation fit |
|---|---|---|
| CLI command parsing and dispatch | `create-agdf/bin/create-agdf.js` | Extend `allowedTargets`, help, argument validation and `main`; do not add a second CLI |
| Published primary CLI | `agdf/bin/agdf.js` and `agdf/package.json` | Continue delegating to `create-agdf/cli` |
| Portable runtime package | `create-agdf/` | Add runtime modules here and include them in the package `files` allowlist |
| Gate and delivery-state parsing | existing functions in `create-agdf/bin/create-agdf.js` | Reuse or extract shared readers; do not copy gate transitions |
| Skill source | `plugin/skills/` | Add one canonical skill directory |
| Skill routing | `plugin/meta/agdf-plugin.definition.json` | Add one canonical `skillSet` row and derive prefixes |
| Plugin packaging | `plugin/.codex-plugin/plugin.json`; `plugin/.claude-plugin/plugin.json` | Reuse shared skill root; no per-surface skill copy |
| Copilot/OpenCode generation | `create-agdf/scripts/sync-package-assets.js` | Generate derived mappings from canonical source |
| OpenCode runtime | `create-agdf/opencode-plugin.js` | Keep hooks as lifecycle guidance; do not place search logic here |
| Cross-surface validation | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/test-routing.js` | Extend current checks |
| CLI regression tests | `create-agdf/scripts/smoke-test.js`; `agdf/scripts/smoke-test.js` | Extend existing smoke ownership |

## 2. Current Coverage

- `partially_done`
- AGDF already has durable state, gate projection, delivery-map evidence, shared skill routing, generated surface assets and package smoke coverage.
- No Delivery Path Search engine, evaluator protocol, enforcement declaration or search-result persistence exists.
- No existing source should be replaced.

## 3. Reuse Strategy

- strategy: `extend`
- Extract shared state-reading helpers only where needed by both current commands and search; preserve existing behavior.
- Add dependency-light ESM modules under `create-agdf/lib/delivery-path-search/`.
- Keep `agdf` as a thin wrapper over `create-agdf/cli`.
- Add the skill once under `plugin/skills/` and let existing generators create Copilot/OpenCode mappings.
- Extend existing smoke and routing fixtures rather than creating an independent test framework.

## 4. Verified Feasibility

- The installed Codex CLI exposes non-interactive `codex exec`.
- It supports `--sandbox read-only`, `--ephemeral`, `--output-schema`, `--json`, model selection and an explicit working directory.
- These capabilities are sufficient to begin DPS-01 without changing the approved evaluator contract.
- The exact stable invocation, output extraction and authentication behavior still require the approved DPS-01 probe before product code depends on them.

## 5. Package And Compatibility Impact

- `create-agdf/package.json` currently publishes only `bin`, `generated`, `opencode-plugin.js`, `README.md` and `NOTICE`.
- Adding `create-agdf/lib/` requires an explicit package allowlist update and packed-file verification.
- `@agdf/cli` depends on `create-agdf`; the wrapper should receive the new command without parallel implementation.
- Existing commands must remain unchanged when Delivery Path Search is unused.
- Any new dependency for Codex transport must be justified by DPS-01 and checked in both package smoke paths.

## 6. Dirty Worktree And Scope Isolation

The observed dirty files are limited to the current AGDF control-state updates and new artefacts for `agdf-delivery-path-search`.

No unrelated source-code edits were observed. Implementation must preserve these control artefacts and avoid overwriting generated output manually.

## 7. Regression And Security Risks

| Risk | Required control |
|---|---|
| Gate logic copied into search | Reuse canonical parsed state and re-run `gate-check` |
| Runtime modules omitted from npm package | Update `files` allowlist and inspect packed contents |
| Evaluator writes despite planning boundary | Use read-only sandbox, ephemeral context and mutation evidence |
| Adapter response becomes executable input | Schema validation and data-only handling |
| Surface mappings drift | Canonical `skillSet`, asset sync and routing tests |
| Hooks become a second orchestrator | Keep search in CLI/runtime; hooks only declare or verify lifecycle state |
| Smoke-test monolith becomes harder to maintain | Add focused module tests and only essential end-to-end cases to existing smoke |

## 8. Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_required_action: resolved after implementation evidence, QA and UAT; link to promoted node
- context_graph_gate_effect: none
- context_graph_evidence: Implementation evidence, QA and UAT confirmed the reusable advisory-search, gate-authority and evaluator-boundary invariants now captured in `CG-DELIVERY-PATH-SEARCH`.

## 9. Missing Evidence

- Real Codex evaluator invocation and structured-output behavior: DPS-01
- Default scoring and budget suitability: DPS-04 and DPS-05 fixtures
- Cross-surface executable capability: DPS-11 and DPS-12 conformance results
- Package and runtime regression evidence: DPS-14
- The current CLI gate projection does not parse a persisted pre-implementation Brownfield Analysis as a completed internal step. It therefore retains Brownfield Analysis permissions even when live `AGDF_RUN.md` has advanced to `CD+Tests`. The agent-native Runtime Contract transition and this persisted pass decision are the operative evidence; the projection gap must not be mistaken for missing analysis.

These are planned implementation evidence, not Brownfield ownership blockers.

## 10. Decision

- decision: `pass`
- reuse_strategy: `extend`
- parallel_structure_risk: controlled by the approved module and generation boundaries
- required_next_step: Implement DPS-01 first. Continue only if the Codex transport probe supports the approved read-only evaluator contract; otherwise revise SD.
- forbidden: parallel CLI, copied gate model, manually maintained surface skills, undocumented provider fallback, commit, push, PR, release or publish
