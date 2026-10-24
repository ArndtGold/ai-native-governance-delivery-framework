# Brownfield Analysis: CLI-qualified matrix implementation preparation

Decision: pass
Mode: pre_implementation_analysis
Status: done
Owner: Claude (Claude Desktop Code, Windows)
Date: 2026-10-23
Run: release-0200-codex-claude-20261020-01

## Scope and current sources

Apply the approved TP T-002 to T-008 now; T-009 to T-011 follow later. Exact source digests: UR 2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248; PRD 7ff703b088b9db7a223b286c9f949de3ce20612d37d3615f4e9f648ed47c7daa; SD 2e1be758666cf513aae78309a301de1ea26536d5e156d84f430b493ff83577a1; TP ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581. TP approval operation 90f5eabb-4c58-4fa1-8488-1a11934a1588 established revision 0b0e72ac-5d75-46b2-9c61-f48fcf50513c.

## Baseline and ownership

evidence/CLI_MATRIX_IMPLEMENTATION_20261023/BASELINE.json captures HEAD 79df3564fc7214821afb585372c45e82d525cfc9 (the maintainer's local commit on feat/prepare-0.20.0-Desktop-evidence-handoff, one ahead of origin), the untracked run files, 161 canonical CI commands, 117 planned jobs and every workflow job timeout before implementation. Compare normalized per-lane command multisets, not job counts. Untracked run artefacts belong to this run; no foreign work is touched. Commit and push wait for the maintainer.

## Existing coverage and reuse

| Owner / paths | Coverage | Reuse and required extension |
|---|---|---|
| plugins/agdf/meta/agdf-plugin.definition.json hostSupport; packages/core/generated copy | partially_done | Schema 2 lists the two Desktop targets as required. Add schema 3 with required CLI targets, reported_desktop, optional_cli codex only and the unchanged unqualified list; regenerate the core copy through the existing generator |
| scripts/native-probes/lib/release-policy.mjs | partially_done | CLI_CASES and the schema-1 CLI branch already exist. Accept schema 3 with exact assertions, return ten required rows, keep diagnostic rows disjoint, add a reported-Desktop case selector; keep schema 1 and 2 readable |
| scripts/sync-package-assets.js | fully_done | Already derives codex-release-policy.json from optional_cli.codex; the schema-3 shape keeps that key, so the generated pin stays byte-identical |
| scripts/native-probes/lib/release-candidate.mjs | fully_done | Policy bytes are part of the candidate identity; evidence-only outputs are already excluded. Reuse, verify through tests |
| scripts/native-probes/lib/release-observation.mjs | partially_done | CLI step, primary capture and loaded-identity checks are reusable. Codex records are bound only by the pin; add reviewed locked-tuple binding for required targets, keep the exact-commit rule, add an optional Desktop scope, keep schema-3 Desktop checks |
| scripts/native-probes/lib/release-handoff.mjs | partially_done | Import maps --surface cli to the optional scope; preflight refuses Codex CLI; validate --all-hosts demands schema 2; handoff text is Desktop-only. Map scopes from the policy, allow Codex CLI preflight on darwin with CODEX_BIN, per-host handoff text, schema-3 validate with optional strict Desktop scopes |
| scripts/native-probes/claude-host-e2e.mjs; codex-host-e2e.mjs | fully_done | Both run the five cases with --candidate, --scenario and --tuple and refuse a changed tuple; Codex reads CODEX_BIN and records process.platform; released-baseline and owned-stale helpers are shared. No harness change expected |
| .github/workflows/publish-agdf.yml; codex-release-e2e.yml; packages/cli/scripts/release-workflow-contract-test.js; scripts/native-probes/release-evidence-test.mjs | partially_done | The evidence job is named desktop-evidence and the contract tests assert that name. Rename it to release-evidence with the CLI wording, keep validate --all-hosts, all needs edges and timeouts; the Codex E2E workflow stays diagnostic |
| scripts/host-compatibility/run.mjs, render.mjs, native-release.mjs, test.mjs | partially_done | Projection is already host/surface-scoped. The snapshot and render still title the Desktop matrix; add reported_desktop to the snapshot and render the CLI matrix plus manually checked Desktop surfaces |
| README.md, INSTALL.md, docs/maintenance/release-0.20.0.md, docs/maintenance/README.md, plugins/agdf/submission/openai/release-notes.md | partially_done | Guidance names the Desktop surfaces as targets; update wording to the approved matrix |
| Tests: release-handoff-test, release-lifecycle-test, test-support | partially_done | Fixtures derive the policy from the repository definition and convert only schema 2 to 1. Keep schema 1 and 2 fixtures as historical conversions from schema 3, add schema-3 tests |

## Interfaces, risks and minimal implementation

Policy first, then evaluator, handoff/import/validate, workflow and reports, then guidance. One policy owner, one evaluator, one import path; no new service, register or authority. Risks: the publish-graph rename must keep every transitive dependency; the schema-3 import mapping must not let a diagnostic record satisfy a required row; the render text change requires compatibility:record, whose Windows output must be checked for platform-only noise before acceptance. The known local MCP structured-flow flake can affect verify:ci; remote CI remains the commit-bound check.

No Core gate, runtime guard, ownership postcondition, consent rule, payload/history limit or timeout is relaxed. A defect with unchanged approved intent is repaired at its owner; scope changes use their revision route.

## Missing evidence and next step

The ten native records do not exist yet and need the final candidate (T-009, T-010). The Codex macOS client version and model are captured by preflight at execution. Independent implementation and fixture checks proceed now.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: Run-specific implementation baseline and limits; reassess reusable knowledge at closeout.
- required_next_step: Record this preparation through the internal-step owner, then implement T-002 to T-008 under CD+Tests.
