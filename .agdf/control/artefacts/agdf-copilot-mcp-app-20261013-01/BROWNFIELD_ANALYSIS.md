# Brownfield Analysis: Plugin-Owned Canonical Artefact Templates

Status: complete
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Based on: approved TP revision `0c6eabe6-dba4-47ac-ba7b-a5fa7d607949`
Date: 2026-10-13
Reviewer: Copilot delivery agent

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/BROWNFIELD_ANALYSIS.md`
- scope: Implement the seven approved TP tasks for exactly nine canonical authoring templates. Preserve the six scaffold/control writers, existing host behavior, the staged Run state, unrelated dirty work and the user-owned mockup deletions.
- evidence: The existing resource context, trusted plugin-root propagation, UR-only resolver, continuation builders, recursive plugin-control packaging and focused runtime/package tests provide the required owners and extension points. The approved SD fixes the Core API, stable errors and nine-owner mapping; the approved TP fixes implementation order and validation.
- transparency: The repository already contains partial uncommitted repairs. They are inputs to extend, not generated output to replace. This analysis authorizes no wider refactor and claims no test result.
- missing_evidence: Implementation and the TP validation matrix remain outstanding. The known unrelated package-boundary cycle may remain a separately disclosed full-build gap only if focused checks pass and the failure is unchanged.
- current_coverage: `partially_done`
- reuse_strategy: `extend`
- risks: A repository/generated fallback, unsafe symlink traversal, per-skill resolver duplication, a new Verified Change route, missing template paths on generic owners, package drift or host-contract changes would violate the approved design.
- context_graph_impact: `none`; the work clarifies an existing resource and authoring-owner boundary without introducing a durable domain concept or ownership relationship.
- required_next_step: Implement the approved TP in dependency order, beginning with the shared Core resolver and nullable resource binding, then wire the nine existing owners, update direct contracts/tests and run the exact validation matrix.

## Existing Owners And Reuse Evidence

| Concern | Existing owner | Observed coverage | Reuse strategy |
|---|---|---|---|
| Resource binding | `packages/core/lib/resources/context.js`; `packages/core/lib/resources/binding.js` | `templatesRoot` and `templatesURL` exist, but generated scaffold fallback remains | Refine the existing context to allow `templatesRoot: null`; bind source development to `plugins/agdf/control/templates/` |
| Path safety | `packages/core/lib/control-state/contained-file.js` | `containedRegularFile()` and `hasSymlinkComponent()` already enforce control-relative containment and symlink checks | Reuse these helpers from one new resource resolver |
| UR authoring | `packages/core/lib/skill-dispatch/delivery-intake.js` | UR-only `resolveUrTemplatePath()` exists and checks only file presence | Replace it with the shared resolver and stable errors |
| PRD and SD authoring | `packages/core/lib/skill-dispatch/prd-definition.js`; `sd-definition.js` | Existing direct continuations have canonical artefact paths but no template provenance | Add only the matching resolved `template_path` |
| TP, UX, Brownfield, Verified Change, QA and OR | `packages/core/lib/skill-dispatch/service.js`; existing Verified Change evaluator and gate route | Existing continuation/owner branches already decide when authoring occurs | Add phase/gate-specific template selection at those branches; invent no route |
| Runtime authority | `scripts/core-projection.mjs`; `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` | The launcher propagates the provenance-checked plugin root, but projected Core still falls back to generated templates | Preserve propagation and remove only the template fallback |
| Payload projection | `scripts/sync-package-assets.js` | Recursive `plugins/agdf/control/**` packaging already includes canonical templates | Retain the copy mechanism and extend exact-nine assertions |
| Regression evidence | Existing Core, CLI and MCP tests named by TP | UR/runtime/package coverage exists; nine-template and exclusion coverage is incomplete | Extend current harnesses rather than adding parallel test infrastructure |

## Affected Interfaces And Data

- Continuation results gain only additive `template_path` metadata at existing authoring owners.
- `resources.templatesRoot` becomes nullable; package, generated, contract and interaction resources remain required.
- The resolver accepts only nine semantic identifiers and returns an absolute real regular-file path.
- Stable failures distinguish unsupported identifiers, unavailable trusted root, unavailable files and unsafe paths.
- No persisted product data, run schema, gate order, approval value, public CLI option, MCP tool inventory or host renderer changes.
- `.agdf/control/templates/` remains derived scaffold/control-writer data and is never a runtime authoring fallback.

## Reuse And Parallel-Structure Risk

| Classification | Finding | Control |
|---|---|---|
| `problem` | Keeping the UR-specific resolver while adding other template lookups would create parallel path policy. | Replace it with one exported Core resolver and use semantic IDs everywhere. |
| `problem` | The current context/projection fallback can silently make generated or repository copies authoritative. | Make template binding nullable and fail only authoring resolution when the trusted plugin root is absent. |
| `problem` | Generic judgement branches can accidentally receive the wrong template or expose a second authoring route. | Bind by exact existing phase/gate/skill predicates and assert registry/route counts remain unchanged. |
| `problem` | Verified Change has no direct definition continuation. | Attach the template only at its existing gate-check/evaluator compact-record preparation owner. |
| `trade-off` | Full repository build may still report the pre-existing package-boundary cycle. | Owner: existing separate maintenance scope. Mitigation: run every focused TP check first and compare the exact unchanged build failure. Exit condition: report it as an external gap, never mask it or modify unrelated boundaries. |
| `none` | No new persistence, migration, UI state or security authority is required. | Preserve existing writers, presentation behavior and runtime provenance checks. |

## Minimal Safe Implementation Path

1. Add `packages/core/lib/resources/artefact-templates.js` with the approved frozen identifier set, internal filename map, four stable errors and containment/symlink validation.
2. Make only template resources optional in `context.js`; update source and projected bindings so installed runtimes use only `AGDF_DISPATCH_PLUGIN_ROOT/control/templates`.
3. Replace UR-only lookup and attach the correct template path to each existing direct or generic owner, with Verified Change retained under its current evaluator/gate route.
4. Add explicit localized recovery and update only directly consuming contracts plus `INSTALL.md`.
5. Extend existing resolver, dispatch, stdio, runtime-isolation, payload, package and Codex tests; regenerate build-owned assets through the existing scripts.
6. Run the approved TP validation matrix. Stop on any fallback, mutation, route/tool-count change, package duplication or host regression.

## Completion Boundary

This analysis passes the owner, reuse, compatibility, regression-risk and minimal-path review. It permits the next internal step `CD+Tests` for the approved TP only. It does not claim implementation, test success, QA readiness, UAT approval, release readiness or permission for VCS actions.
