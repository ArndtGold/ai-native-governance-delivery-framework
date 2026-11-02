# TP: Plugin-Owned Canonical Artefact Template Resolution

Status: draft
Gate: TP
Gate approval: open
Based on: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/SD.md`
Date: 2026-10-13
Owner: Core and QA maintainers
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Add the shared Core artefact-template identifier set, filename map, resolver, safety validation and stable error taxonomy in `packages/core/lib/resources/artefact-templates.js`. | Core resource owner | none |
| T-002 | Make template resources nullable in Core context, bind source development to canonical plugin sources, and remove generated/repository fallbacks from projected runtime bindings while preserving trusted plugin-root propagation. | Core projection and CLI runtime owners | T-001 |
| T-003 | Replace the UR-only resolver and attach the matching plugin-owned `template_path` at every existing UR, PRD, SD, TP, UX Intent Definition, Brownfield Review, Verified Change, QA Report and OR owner without adding a route. | Skill-dispatch and lifecycle owners | T-001, T-002 |
| T-004 | Update dispatch recovery copy, direct authoring/lifecycle contracts and `INSTALL.md` for exact scope, absolute plugin-owned paths, derived copies and fail-closed repair behavior. | Contract and documentation owners | T-001, T-003 |
| T-005 | Add focused resolver, exclusion, continuation, error-propagation and no-mutation tests covering every Core and dispatch branch. | Core and CLI test owners | T-001, T-002, T-003, T-004 |
| T-006 | Extend stdio, plugin-runtime isolation, Copilot payload/package and Codex regression tests for all nine templates and exact-once deterministic packaging. | MCP, packaging and host test owners | T-002, T-003, T-004 |
| T-007 | Regenerate build-owned assets, run the complete focused validation matrix, conditionally refresh the installed Copilot plugin only when live verification requires it, and capture all results without modifying unrelated user changes. | Delivery agent and QA | T-005, T-006 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Each of the nine exported semantic IDs resolves to the expected absolute regular file under a valid fixture plugin root. | `packages/core/test/artefact-template-resolver-test.js` output |
| AC-001 | SDD-002 | T-001 | SCN-002 | A value outside the exported identifier set is rejected with `AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED` and cannot select a path. | Resolver unit-test assertion |
| AC-002 | SDD-002 | T-005 | SCN-003 | The six excluded control/scaffold filenames have no resolver ID and representative lookup attempts are rejected. | Resolver negative-test assertions |
| AC-002 | SDD-006 | T-003 | SCN-004 | Existing RUN_STATE, AGDF_RUN, backlog, context graph, SoT registry and quality-contract writers remain unchanged and receive no `template_path`. | Skill-dispatch/control-writer regression assertions |
| AC-003 | SDD-003 | T-005 | SCN-005 | Missing roots/files, non-absolute roots, symlink roots/components, directory targets and containment escapes never return a path; a valid contained file returns its absolute real path. | Resolver safety-test matrix |
| AC-003 | SDD-004 | T-004 | SCN-006 | Unsupported, root-unavailable, file-unavailable and unsafe cases preserve their distinct stable error codes through dispatch diagnostics and localized recovery. | Core error tests plus `interaction-catalog-test.js` |
| AC-004 | SDD-004 | T-005 | SCN-007 | Every resolver failure leaves repository scaffold and run fixtures byte-for-byte unchanged and creates no file. | Before/after fixture digest assertions |
| AC-004 | SDD-005 | T-002 | SCN-008 | With `AGDF_DISPATCH_PLUGIN_ROOT` absent, non-authoring status/inspection still starts, while the first in-scope authoring resolution fails closed without fallback. | `plugin-mcp-runtime-test.js` missing-root case |
| AC-005 | SDD-006 | T-003 | SCN-009 | The nine existing owners expose the exact matching absolute `template_path`, including the existing Verified Change owner and no invented continuation. | `skill-dispatch-test.js` and continuation fixtures |
| AC-005 | SDD-007 | T-005 | SCN-010 | Continuations add only `template_path`; registry skill count, phase names, routes and gate authority are unchanged. | Dispatch contract snapshots and route-count assertions |
| AC-006 | SDD-005 | T-006 | SCN-011 | The assembled isolated MCP runtime resolves authoring templates only from the provenance-checked plugin root even when repository scaffold copies differ. | `plugin-mcp-runtime-test.js` isolation fixture |
| AC-006 | SDD-008 | T-006 | SCN-012 | Copilot and npm payload copies are sourced from `plugins/agdf/control/**` and cannot override the runtime resolver root. | Copilot inventory and package-content source-mapping assertions |
| AC-007 | SDD-006 | T-006 | SCN-013 | Copilot still exposes exactly seven MCP tools, Codex retains its private cockpit, and all existing host compatibility checks pass. | `copilot-profile-test.js`, `plugin-mcp-cockpit-variant-test.js`, `codex-plugin-mcp-test.js` |
| AC-007 | SDD-007 | T-006 | SCN-014 | Existing stdio requests and host renderers accept additive `template_path` metadata without presentation or approval changes. | MCP continuation and host regression test logs |
| AC-008 | SDD-008 | T-006 | SCN-015 | All nine canonical artefact templates occur exactly once in generated Copilot and npm package inventories; repeated generation is deterministic and stays within the reviewed payload budget. | Sync digest comparison, payload-budget and package-content test logs |
| AC-009 | SDD-004 | T-004 | SCN-016 | Direct contracts describe explicit unsupported/unavailable/unsafe failures and repair/reinstall recovery without fallback or mutation. | Contract-content assertions and review diff |
| AC-009 | SDD-006 | T-004 | SCN-017 | Direct authoring contracts name the absolute plugin-owned `template_path`, exact nine-template scope and existing owner boundary. | Skill contract tests and documentation review |
| AC-009 | SDD-008 | T-004 | SCN-018 | Installation guidance identifies repository copies as derived reviewable references and the installed matched plugin as runtime authority. | `INSTALL.md` assertion and package documentation review |

## 3. Test Plan

Run commands from `C:\Workspace\ai-native-governance-delivery-framework` in this order. A failed focused check blocks progression until the changed scope is corrected; the known unrelated package-boundary cycle is reported separately and must not be hidden or attributed to this slice without evidence.

| order | command | scenarios | expected_result |
|---|---|---|---|
| 1 | `node packages/core/test/artefact-template-resolver-test.js` | SCN-001, SCN-002, SCN-003, SCN-005, SCN-006, SCN-007 | All resolver domain, safety, error and no-mutation assertions pass. |
| 2 | `npm --prefix packages/cli run test:skill-dispatch` | SCN-004, SCN-009, SCN-010, SCN-014 | All direct and generic continuation mappings pass without new routes or authority changes. |
| 3 | `node packages/cli/scripts/interaction-catalog-test.js` | SCN-006, SCN-016 | Every locale contains the new recovery keys and copy remains within interaction constraints. |
| 4 | `npm --prefix packages/cli run test:plugin-mcp-runtime` | SCN-008, SCN-011 | Isolated runtime uses the trusted plugin root; missing/unsafe roots fail only authoring and never fall back. |
| 5 | `npm --prefix packages/mcp-server run test:continuation` | SCN-009, SCN-014 | Real stdio continuation responses contain the correct template paths and preserve protocol behavior. |
| 6 | `node scripts/sync-package-assets.js` | SCN-012, SCN-015 | Build-owned plugin/package assets regenerate successfully from canonical sources. |
| 7 | `node packages/cli/scripts/copilot-profile-test.js` | SCN-012, SCN-013, SCN-015 | Seven-tool Copilot inventory, all nine template entries and payload constraints pass. |
| 8 | `node packages/cli/scripts/payload-budget-test.js` | SCN-015 | The reviewed Copilot payload budget passes with deterministic inventory. |
| 9 | `node packages/cli/scripts/package-contents-test.js` | SCN-012, SCN-015 | npm dry-run/package contents contain each canonical template exactly once. |
| 10 | `node packages/cli/scripts/package-build-test.js` | SCN-012, SCN-015 | The distributable package builds with the projected Core and canonical control payload. |
| 11 | `node packages/cli/scripts/plugin-mcp-cockpit-variant-test.js` | SCN-013 | Codex private cockpit visibility and Copilot exclusion remain unchanged. |
| 12 | `node packages/cli/scripts/codex-plugin-mcp-test.js` | SCN-013, SCN-014 | Codex MCP discovery, compatibility and existing authoring/control behavior pass. |
| 13 | `npm run test:host-compatibility` | SCN-013, SCN-014 | Supported host contract checks pass without UI or protocol regression. |
| 14 | `npm run build` | SCN-010, SCN-012, SCN-013, SCN-015 | Repository build and projection validation pass, or any proven pre-existing unrelated boundary failure is recorded explicitly as a remaining gap. |

Conditional live verification:

- Run `npm --prefix packages/cli run install:copilot` only if the installed Copilot plugin does not contain the just-generated template/runtime changes needed for a real installed-plugin probe.
- After a required refresh, prepare the plugin runtime and repeat the version-matched stdio continuation checks. Confirm seven tools and at least the UR, PRD, SD, TP, Brownfield Review, UX Intent Definition, QA Report and OR reachable continuation paths; confirm Verified Change at its existing gate-check owner fixture.
- Do not treat plugin installation permission as gate approval, and do not alter repository control during failure probes.

## 4. Brownfield Scope

Inspect and integrate the existing dirty work before implementation:

- Core resource owners: `packages/core/lib/resources/context.js`, `binding.js`, new `artefact-templates.js`, and `packages/core/lib/control-state/contained-file.js`.
- Existing continuation owners: `packages/core/lib/skill-dispatch/delivery-intake.js`, `prd-definition.js`, `sd-definition.js` and `service.js`.
- Existing Verified Change owner: `packages/core/lib/control-evaluation/verified-change.js` plus its current gate-check route.
- Runtime projection and isolation: `scripts/core-projection.mjs` and `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`.
- Deterministic payload projection: `scripts/sync-package-assets.js`, `plugins/agdf/meta/copilot-payload-baseline.json` and package inventory tests.
- Direct contracts: UR, PRD, SD, gate-artifact preparation, UX intent, Brownfield, QA, release/OR and Verified Change/mode owner contracts where `template_path` is consumed.
- Documentation: `INSTALL.md`.
- Existing tests named in Section 3; extend current fixtures rather than adding parallel harnesses.
- Preserve the already staged active `RUN_STATE.md` and all unrelated user changes. Do not touch user-owned deletions under `docs/architecture/mockups/`.

## 5. Out Of Scope

- New authoring skills, dispatch phases, registries or template services.
- Routing `RUN_STATE.md`, `AGDF_RUN.md`, `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, `SOT_REGISTRY.md` or `AGENT_QUALITY_CONTRACTS.json` through the resolver.
- Fallback to repository scaffold, generated Core or ambient working-directory paths.
- Changes to gate order, approval syntax, QA/UAT authority, release semantics or visible Copilot/Codex UX.
- Repair of the known unrelated package-boundary cycle.
- Commit, push, branch switch, stash, reset, PR creation or release actions.
- Reverting or rewriting unrelated dirty work.

## 6. Risks And Blockers

- Block if any in-scope continuation resolves from `.agdf/control/templates/`, generated resources or another non-plugin root.
- Block if a missing or unsafe template produces a usable continuation, mutates repository state or collapses into a success-shaped fallback.
- Block if any of the six excluded control/scaffold files gains a resolver identifier or authoring continuation.
- Block if Verified Change gains a new skill/route instead of using its current gate-check/evaluator owner.
- Revise if additive metadata changes Copilot presentation, Codex cockpit gating, tool count or approval behavior.
- Revise if package generation duplicates, omits or changes the source mapping of a canonical template.
- Revise if recovery messages do not distinguish unsupported, unavailable and unsafe cases with a direct repair action.
- Record the pre-existing package-boundary cycle as an external validation gap only if the exact unchanged failure remains after all focused checks pass.
- Stop and request control recovery if canonical run revision, source digest or artefact binding changes during implementation.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Ziel: Der Plan implementiert den gemeinsamen Core-Resolver, entfernt alle Authoring-Fallbacks und bindet exakt neun bestehende Artefakt-Owner an absolute Plugin-Template-Pfade.
- Aufgaben: Resolver und Fehlerklassen; nullable Core-Bindung und Projektion; neun Owner-Mappings; Verträge und INSTALL-Dokumentation; fokussierte Core-, Dispatch-, Runtime-, Stdio-, Payload-, Paket- und Codex-Tests; abschließende Generierung und Validierung.
- Abgrenzung: Keine neuen Skills oder Routen, keine sechs Control-/Scaffold-Dateien im Resolver, keine UX-/Gate-Änderung, keine VCS-Aktionen und keine Berührung der fremden Mockup-Löschungen.
- Nachweise: 18 stabile Szenarien decken alle neun PRD-Kriterien und alle acht SD-Entscheidungen ab. Die Befehlsmatrix prüft Resolver-Sicherheit, No-Mutation, Runtime-Isolation, alle Owner, sieben Copilot-Tools, Codex-Cockpit, deterministische Paketierung und Build.
- Freigabefolge: `Approval: TP` erlaubt zuerst die Implementierungsvorbereitung durch Brownfield Analysis und danach nur den genehmigten Implementierungs- und Testumfang.
