# CD+Tests: Simple Local Plugin Installation Scripts

Status: done
Run: `agdf-local-plugin-install-scripts`
Based on: approved `TP.md`
Date: 2026-08-23

## Delivered Scope

- Added exactly three root contributor aliases and three `create-agdf` scripts backed by one development-only Node orchestrator.
- Reused canonical `release:prepare`, Codex and Claude marketplace transactions, host lifecycle owners, OpenCode installation, SDK alignment and lifecycle presentation.
- Added a normalized prepared-plugin digest and marker-bound Codex install projection while retaining canonical version `0.13.5` in source, generated and public manifests.
- Added a durable OpenCode package path under the AGDF data root, bound to packed file paths, modes and contents plus the archive SHA-256 digest.
- Added read-only provenance validation for local Codex status and an internal OpenCode package-source adapter whose absent/default behavior remains the public registry specifier.
- Added contributor documentation that separates checkout installation, public bootstrap, restart, new-task pickup, repository activation and UAT evidence.

## Automated Evidence

| Command or check | Result | Evidence boundary |
|---|---|---|
| `npm --prefix create-agdf run test:local-development-install` | pass | Isolated preparation, identity, marketplace, Codex/Claude lifecycle JSON, OpenCode source, package, Windows command construction, failure and documentation fixtures. Uses temporary roots and no real host. |
| `npm --prefix create-agdf run test:local-marketplace` | pass | Existing migration, interruption, rollback, ownership and tamper contracts remain green. |
| `npm --prefix create-agdf run test:lifecycle` | pass | Existing lifecycle and status behavior remains green. |
| `npm --prefix create-agdf run test:cli-modularization` | pass | Public command grammar remains unchanged. |
| `npm --prefix create-agdf run test:runtime-integrity-layout` | pass | Source and installed layout behavior remains green. |
| `npm --prefix create-agdf run test:runtime-integrity-negative` | pass | Existing fail-closed integrity matrix remains green. |
| `npm --prefix create-agdf run release:prepare` | pass | 29 version surfaces remain coherent at `0.13.5`; 43 public plugin candidates pass. |
| `npm --prefix create-agdf run test:package-build` | pass | Complete builds are byte-identical and canonical source remains untouched. |
| `npm --prefix create-agdf run test:package-contents` | pass | 302 expected package files are present. |
| `npm --prefix create-agdf run smoke-test` | pass | Complete create-agdf suite, 66/66 deterministic skill eval cases, isolated CLI smoke and routing render pass. |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass | Source mode reports 10 skills and 16 control files checked. |
| `npm pack --dry-run --json` from `create-agdf/` | pass | `create-agdf@0.13.5`, 302 files; dry run only. |
| `npm audit --audit-level=high` at repository root | pass | 0 vulnerabilities in the lockfile-backed root package. |
| `git diff --check` and syntax checks for changed JavaScript | pass | No whitespace or syntax error. |
| `doctor --run agdf-local-plugin-install-scripts --json` | pass | 0 block, revise or warn findings before review persistence. |

## Expected And Resolved Failures

- The first full smoke run exposed `localPackageSource is not defined` in the public OpenCode registry path. The variable scope was corrected and focused plus complete smoke runs passed afterward.
- `npm --prefix create-agdf pack --dry-run --json` selected the private root manifest and failed before packing. Running the same read-only check with `create-agdf/` as the working directory passed.
- `npm --prefix create-agdf audit --audit-level=high` returns `ENOLOCK` because `create-agdf` has no lockfile and declares no dependencies or devDependencies. No lockfile was invented for this slice; the repository root lockfile audit passed with zero vulnerabilities.

## Evidence Boundaries

- No real `codex`, `claude` or `opencode` installation command was run.
- No user marketplace, agent configuration, installed cache, host process or repository activation was changed by tests.
- Repository, package and fake-host evidence does not prove restarted-host loading or UAT.
- Release, publication, deployment, commit, push and pull request were not performed.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing node already records the local development aliases and reuse boundary implemented by this slice.
