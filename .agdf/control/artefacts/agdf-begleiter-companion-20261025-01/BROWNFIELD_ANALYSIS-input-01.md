# Brownfield Analysis: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: revise
Mode: `pre_implementation_analysis`
Status: `revise`

## Run

- run_id: `agdf-begleiter-companion-20261025-01`
- related_tp: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP.md` (approved, revision 13)
- current_gate: Brownfield Analysis
- reviewer: Claude
- reviewed_at: 2026-10-25

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: revise
- scope: Approved TP tasks T-001 to T-009 for the Claude-only companion.
- evidence: `scripts/sync-package-assets.js:185-205` (syncPluginDirectory removes target entries that are neither source entries nor generated-only; `host-templates` is build-only), `:599`, `:615`, `:633` (source and runtime Claude manifest projection, shared hooks copy), `:640-680` (Copilot profile built from explicit writes and mapped generated directories); `scripts/sync-plugin-runtime.js:219` (the runtime bundle copies `generated/plugins/agdf/meta/agdf-plugin.definition.json`); generated Copilot profile contains `meta/agdf-plugin.definition.json` and `runtime/create-agdf/generated/plugins/agdf/meta/agdf-plugin.definition.json`; `scripts/public-plugin/manifest.js:84-96`; `scripts/public-plugin/validator.js:103-140` (non-source profiles reject `host-templates/`; source and public profiles reject `hooks` declarations); `plugins/agdf/scripts/check-runtime-integrity.mjs:1330-1359`; `packages/cli/scripts/public-plugin-test.js:79-80`; `packages/cli/scripts/package-contents-test.js:38-78`; `packages/cli/package.json` (`smoke-test` chains the CLI suites run by the `cli-smoke` stage of `scripts/verify-ci.mjs`).
- missing_evidence: none for the decision; host behaviour remains the T-001 probe obligation.
- current_coverage: not_done — no companion code, wiring or tests exist in the repository; the prototype lives outside it.
- reuse_strategy: extend — reuse the runtime-profile manifest projection, the generated-only copy pattern used for `hooks/`, the validator and integrity owners, the payload budget owner and the CLI test chain.
- risks: SDD-01 places the Claude-only declaration in `plugins/agdf/meta/agdf-plugin.definition.json`. That file ships unchanged in the Copilot payload (twice) and in the shared runtime bundle, so the Copilot payload would change and carry a companion reference, contradicting SDD-02, AC-009 and TP scenario SCN-016. Implementing SDD-01 as approved would violate an approved acceptance criterion; implementing it differently would silently change an approved design decision.
- context_graph_impact: unchanged from the Brownfield Review (update CG-PUBLIC-PLUGIN-DISTRIBUTION and CG-RUN-STATUS-CARD after implementation evidence).
- required_next_step: Revise SDD-01 through the approved-source revision owner so that the Claude-only companion declaration is owned by the runtime-profile manifest projection (for example a Claude companion descriptor under `plugins/agdf/host-templates/claude/companion/` read by `createClaudePluginManifest`) and the shared plugin definition stays unchanged; then renew the dependent SD and TP approvals before CD+Tests.

## Minimal Clean Implementation Path (after the SD correction)

1. T-001 host probe on a scratch runtime build.
2. Companion source under `plugins/agdf/host-templates/claude/companion/` (build-only, never distributed as `host-templates/`).
3. `scripts/sync-package-assets.js`: add `companion` to the generated-only set of the source root and copy the companion into `generated/plugins/agdf/companion/` after `syncPluginDirectory`, like the shared hooks.
4. `createClaudePluginManifest` runtime profile adds the `hooks` declaration from the Claude-only owner; the source profile stays without it.
5. `validatePortableProfile` runtime branch and `check-runtime-integrity.mjs` verify the declaration and files; negative checks for the Codex manifest, `hooks/hooks.json` and the Copilot profile.
6. `package-contents-test.js`, `public-plugin-test.js` and `portable-plugin-test.js` updated for the new generated files; a new `test:claude-companion` suite chained into `smoke-test`.
7. Payload budget review, regenerated provenance, fingerprints and compatibility records; `INSTALL.md`.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| BA-F01 | design_gap | SD | open | SDD-01 declares `claude.hooks` in `plugins/agdf/meta/agdf-plugin.definition.json`; `scripts/sync-plugin-runtime.js:219` and the generated Copilot profile (`meta/agdf-plugin.definition.json`, `runtime/create-agdf/generated/plugins/agdf/meta/agdf-plugin.definition.json`) ship that file to Copilot, contradicting SDD-02, AC-009 and SCN-016 | Revise SDD-01 so the Claude-only declaration is owned by the runtime-profile manifest projection and the shared definition stays unchanged, then renew SD and TP approval |

## Next Permissible Step

- next_allowed_action: Approved-source revision of the SD (SDD-01) with fresh SD and TP approval.
- forbidden_until_then: CD+Tests, including the T-001 probe as part of implementation; payload, manifest or definition changes.
