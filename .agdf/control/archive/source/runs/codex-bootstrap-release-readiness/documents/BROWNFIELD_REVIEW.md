# Brownfield Review: Surface Bootstrap and Registry Readiness

## Decision

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD

## Scope

The approved requirement changes the existing `create-agdf` global bootstrap adapters for Codex and Claude Code, the Copilot repository-file update behavior, and the npm publish completion workflow. It must preserve the distinction between global plugin state and repository-owned instructions.

## Evidence

- `create-agdf/bin/create-agdf.js` owns the Codex and Claude CLI adapters and all generated target-file behavior.
- Codex needs `plugin marketplace upgrade agdf` before `plugin add agdf --marketplace agdf`; direct observation showed an existing snapshot at `0.4.2` after `main` moved to `0.4.4`.
- The installed Claude CLI exposes `plugin install`, `plugin update`, and `plugin marketplace update`; it does not expose `plugin add`.
- `create-agdf` Copilot generation preserves a pre-existing `AGENTS.md` by creating `AGENTS.agdf.md`, but a second full invocation fails on the existing `.agdf/control/config.json` without `--force`.
- `--force` is global to all generated files, so it can overwrite user-owned `AGENTS.md`.
- `.github/workflows/publish-agdf.yml` publishes `create-agdf` and then `@agdf/cli` but has no post-publish registry readiness check.
- `create-agdf/scripts/smoke-test.js` is the established focused test owner for bootstrap and generation behavior.

## Current Coverage

| Area | Status | Evidence |
|---|---|---|
| Codex global install | partially_done | Installs from a configured marketplace but does not refresh it or verify the installed version |
| Claude global install | partially_done | Has an adapter, but it uses unsupported `plugin add` syntax and lacks update verification |
| Copilot initial generation | fully_done | Generates router, instructions, skills and control templates while preserving an existing `AGENTS.md` as a fragment |
| Copilot repeat update | not_done | Rerun fails on an existing AGDF-owned config file unless `--force` is used |
| Publish readiness | not_done | Publish order exists; registry resolvability is not checked after publish |
| Focused regression coverage | partially_done | Existing smoke test owns target generation, but does not stub global CLIs or test repeat-update semantics |

## Reuse Strategy

- Extend `create-agdf/bin/create-agdf.js`; do not add another bootstrap executable.
- Extend `create-agdf/scripts/smoke-test.js` with isolated fake `codex` and `claude` executables and temporary output directories.
- Reuse the existing generated-file ownership lists; add an explicit update-safe path rather than using blanket `--force`.
- Extend the existing `publish` job in `.github/workflows/publish-agdf.yml`; do not create a second release workflow.

## Risks

- CLI command shapes and cache locations are external contracts. Tests must assert invocations and exposed output rather than private cache layout where possible.
- Copilot update safety must distinguish AGDF-owned generated files from user-owned `AGENTS.md`; a new parallel instruction source is not acceptable.
- npm readiness polling must use a bounded retry loop and emit the unresolved package/version on timeout.

## Transparency

PRD and SD are required because this slice defines user-visible update semantics across three agent surfaces, file ownership boundaries, failure behavior, and release completion criteria. Implementation and Task Plan are not yet allowed.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: pending PRD scope decision
- context_graph_required_action: link
- context_graph_gate_effect: none

## Required Next Step

Create the PRD for the approved structured slice, then obtain `Approval: PRD`.
