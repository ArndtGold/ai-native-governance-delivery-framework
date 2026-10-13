# CD+Tests: Plugin-Owned Canonical Artefact Template Resolution

- decision: pass
- run_id: `agdf-copilot-mcp-app-20261013-01`
- based_on: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/TP.md`
- implementation_precondition: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/BROWNFIELD_ANALYSIS.md` (`pass`)
- date: 2026-10-13

## Implemented Scope

The approved TP scope is implemented:

- one shared Core resolver owns the exact nine canonical authoring template identifiers and filenames;
- successful resolution requires a trusted absolute template root, real-path containment, regular files and no symlink or junction components;
- unsupported, unavailable-root, unavailable-file and unsafe failures retain four stable error codes;
- installed projected runtimes use only `AGDF_DISPATCH_PLUGIN_ROOT/control/templates`;
- source development resolves against canonical `plugins/agdf/control/templates`;
- UR, PRD, SD, TP, UX Intent Definition, Brownfield Review, Verified Change, QA Report and OR receive the matching absolute `template_path` at their existing owners;
- `RUN_STATE.md`, `AGDF_RUN.md`, `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, `SOT_REGISTRY.md` and `AGENT_QUALITY_CONTRACTS.json` remain outside the resolver and under their existing writers;
- missing or unsafe plugin templates fail closed without fallback or repository mutation;
- contracts, localized recovery, installation guidance, payload inventory and package/runtime tests describe and enforce the same boundary.

No new authoring skill, dispatch phase, registry route or fallback service was added. Existing Copilot seven-tool behavior, Codex cockpit behavior and approval authority remain unchanged.

## Task Completion

| task_id | Result | Evidence |
|---|---|---|
| T-001 | done | `packages/core/lib/resources/artefact-templates.js`; resolver tests |
| T-002 | done | Core context/binding and projected runtime changes; runtime-isolation tests |
| T-003 | done | Existing direct and generic continuation owners receive the matching template; dispatch and stdio tests |
| T-004 | done | Localized recovery, direct contracts and `INSTALL.md` updated |
| T-005 | done | Resolver, exclusions, safety, diagnostics and no-mutation coverage pass |
| T-006 | done | Stdio, runtime isolation, Copilot payload, npm package and Codex regression coverage pass |
| T-007 | done | Build-owned assets regenerated; complete focused matrix and full build pass |

## Verification Results

| Command | Result | Covered scenarios |
|---|---|---|
| `node packages/core/test/artefact-template-resolver-test.js` | pass | SCN-001, SCN-002, SCN-003, SCN-005, SCN-006, SCN-007 |
| `npm --prefix packages/cli run test:skill-dispatch` | pass | SCN-004, SCN-009, SCN-010, SCN-014 |
| `node packages/cli/scripts/interaction-catalog-test.js` | pass | SCN-006, SCN-016 |
| `npm --prefix packages/cli run test:plugin-mcp-runtime` | pass | SCN-008, SCN-011 |
| `npm --prefix packages/mcp-server run test:continuation` | pass | SCN-009, SCN-014 |
| `node scripts/sync-package-assets.js` | pass | SCN-012, SCN-015 |
| `node packages/cli/scripts/copilot-profile-test.js` | pass | SCN-012, SCN-013, SCN-015 |
| `node packages/cli/scripts/payload-budget-test.js` | pass | SCN-015 |
| `node packages/cli/scripts/package-contents-test.js` | pass | SCN-012, SCN-015 |
| `node packages/cli/scripts/package-build-test.js` | pass | SCN-012, SCN-015 |
| `node packages/cli/scripts/plugin-mcp-cockpit-variant-test.js` | pass | SCN-013 |
| `node packages/cli/scripts/codex-plugin-mcp-test.js` | pass | SCN-013, SCN-014 |
| `npm run test:host-compatibility` | pass | SCN-013, SCN-014 |
| `npm --prefix packages/cli run eval:skills` | pass: 102/102 cases, 13 skills | current contract-owner fingerprints |
| `npm run build:prepare` | pass | candidate generation and release preparation |
| `npm run compatibility:record` | pass: 56 evaluated, 0 failed | fresh deterministic host evidence |
| `npm run build` | pass | SCN-010, SCN-012, SCN-013, SCN-015; build contracts, evals, compatibility freshness and package assembly |

The deterministic eval observations retained their existing routing, gate, action, mutation and quality facts; only source fingerprints were rebound after review of the intentionally changed contracts. Host compatibility evidence was regenerated through the repository-owned recorder after `source_snapshot_changed`; it evaluated 56 scenarios with zero failures and produced source fingerprint `5061442eb8e805e085efe3304fcc09a69b8712511249c340791e87ee2deb476b`.

The full build emitted the existing npm audit notice for one high-severity dependency advisory. No dependency manifest changed in this slice, and the notice did not fail the approved build or test matrix.

## Acceptance And Design Traceability

All TP scenarios SCN-001 through SCN-018 passed. This covers every PRD acceptance criterion AC-001 through AC-009 and every SD decision SDD-001 through SDD-008.

## Workspace Preservation

- The staged active `RUN_STATE.md` was not replaced manually; canonical control changes remain writer-owned.
- Existing repairs in `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`, `scripts/sync-package-assets.js` and `plugins/agdf/meta/contracts/ur-definition.md` were integrated.
- User-owned deletions under `docs/architecture/mockups/` were not modified or restored.
- No commit, push, branch switch, stash, reset, PR or release action was performed.

## Remaining Gap

No implementation or validation gap remains within the approved TP scope. QA, UAT, OR and any operative VCS handoff remain separate governed steps and are not inferred by this result.
