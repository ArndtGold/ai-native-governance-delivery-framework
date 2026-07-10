# Brownfield Analysis: Surface Bootstrap and Registry Readiness

## Status

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: CD+Tests
- artefact: .agdf/control/artefacts/codex-bootstrap-release-readiness/BROWNFIELD_ANALYSIS.md

## Scope

Implementation is limited to the approved TP tasks for Codex global bootstrap refresh/version verification, Claude Code supported install/update behavior, Copilot non-destructive rerun ownership, focused smoke coverage, and post-publish npm readiness verification.

## Evidence

- `create-agdf/bin/create-agdf.js` already owns target parsing, global bootstrap commands, generated-file lists, write behavior and user-facing next-step output.
- `create-agdf/scripts/smoke-test.js` is the focused regression owner for bootstrap generation, CLI behavior and deterministic fixture checks.
- `.github/workflows/publish-agdf.yml` already owns the ordered release validation and publish jobs.
- `plugin/meta/agdf-plugin.definition.json`, `create-agdf/package.json` and `agdf/package.json` all expose version `0.4.4`; the implementation must compare against the plugin definition rather than private cache paths.
- `create-agdf/package.json` runs `sync-package-assets` before smoke tests and prepack, so generated package content must continue to derive from `plugin/`.

## Missing Evidence

- Real Codex and Claude Code CLI output formats can change. Implementation must use tolerant parsing and stubbed executable tests instead of relying on private cache layout.
- GitHub Actions cannot be executed locally in this step. The publish workflow readiness behavior will be validated through static smoke assertions.

## Current Coverage

| Area | Coverage | Notes |
|---|---|---|
| Codex global install | partially_done | Existing code adds marketplace and plugin but does not refresh marketplace or verify installed version. |
| Claude global install | partially_done | Existing code uses unsupported `plugin add` and has no install/update split. |
| Copilot first bootstrap | fully_done | Existing generation creates AGENTS routing, control files, GitHub instructions and skills. |
| Copilot repeat bootstrap | not_done | Existing write path fails on existing `.agdf/control/config.json` unless `--force` is used. |
| Publish readiness | not_done | Existing workflow publishes packages but does not wait for exact npm package resolvability. |
| Regression coverage | partially_done | Existing smoke test covers generation and gate behavior but not global CLI stubs or rerun ownership. |

## Reuse Strategy

- Extend `create-agdf/bin/create-agdf.js`; do not add a second bootstrap executable.
- Add small helper functions for command execution, plugin list parsing, version verification and target-aware write planning.
- Reuse the existing generated-file arrays for Copilot ownership and add conservative overwrite policy around them.
- Extend `create-agdf/scripts/smoke-test.js`; do not add a separate test runner.
- Extend the existing `publish` job; do not add a second release workflow.

## Impact

| Area | Impact |
|---|---|
| Files/modules | `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/smoke-test.js`, `.github/workflows/publish-agdf.yml`, AGDF control artefacts. |
| Interfaces | CLI output and exit behavior for `codex`, `claude`, `copilot`; no new public target. |
| Data model | No data model or migration changes. |
| Backwards compatibility | First-run behavior remains; `--force` remains the explicit broad overwrite path. |
| Regression tests | Smoke tests must isolate fake global CLIs through `PATH` and temporary directories. |
| Side effects | Real user Codex/Claude config must not be touched by tests. |

## Parallel-Structure Risk

Risk is low if implementation stays in the existing CLI owner and smoke-test harness. A separate updater, second release workflow, or generated-file source would create avoidable parallel authority and is out of scope.

## SoT And Runtime Drift

No runtime semantics change is required. The expected version source is `plugin/meta/agdf-plugin.definition.json` copied into `create-agdf/generated` by the existing sync flow.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_required_action: link
- context_graph_gate_effect: none
- rationale: The slice remains a concrete delivery reliability instance under the existing cross-surface delivery-path knowledge line.

## Decision

Pass. Implementation may proceed with the approved TP, using the existing owners and focused validation path.

## Required Next Step

Implement T01-T10, then produce implementation evidence and run required validation before review and QA.
