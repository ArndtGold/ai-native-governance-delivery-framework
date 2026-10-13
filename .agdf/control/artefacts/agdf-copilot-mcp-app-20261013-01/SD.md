# SD: Plugin-Owned Canonical Artefact Template Resolution

Status: draft
Gate: SD
Gate approval: open
Based on: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/PRD.md`
Date: 2026-10-13
Owner: Core resource owner
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Introduce one shared Core resource resolver for the nine canonical artefact-authoring templates and make every existing authoring owner consume its validated absolute result.

The resolver is implemented in `packages/core/lib/resources/artefact-templates.js`. Its public Core API is:

```js
export const ARTEFACT_TEMPLATE_IDS = Object.freeze({
  UR: "UR",
  PRD: "PRD",
  SD: "SD",
  TP: "TP",
  UX_INTENT_DEFINITION: "UX_INTENT_DEFINITION",
  BROWNFIELD_REVIEW: "BROWNFIELD_REVIEW",
  VERIFIED_CHANGE: "VERIFIED_CHANGE",
  QA_REPORT: "QA_REPORT",
  OR: "OR",
});

export function resolveArtefactTemplatePath(templateId, context = resources) {}
```

`templateId` is an internal allow-listed identifier, not a caller-supplied path fragment. The resolver maps each identifier to exactly one filename below `context.templatesRoot/artefacts/` and returns the absolute real path only after root, symlink, containment and regular-file validation.

The resource context keeps `templatesRoot` nullable so an absent trusted plugin root does not disable status, inspection or other non-authoring MCP behavior. Authoring resolution alone fails closed. Source-development Core binds `templatesRoot` to the canonical repository plugin source under `plugins/agdf/control/templates/`; projected installed runtimes bind it only from `AGDF_DISPATCH_PLUGIN_ROOT/control/templates`.

## 2. Ownership And Source Of Truth

- `plugins/agdf/control/templates/artefacts/` remains the canonical repository source from which plugin and package payloads are derived.
- The installed, version-matched plugin root supplied by `AGDF_DISPATCH_PLUGIN_ROOT` is the sole runtime authoring authority.
- `packages/core/lib/resources/artefact-templates.js` owns template identifiers, filename mapping, validation and stable resolution errors.
- `packages/core/lib/resources/context.js` owns the nullable normalized `templatesRoot`.
- `packages/core/lib/resources/binding.js` owns source-development binding to the canonical repository plugin source.
- `scripts/core-projection.mjs` owns projected runtime bindings and must not synthesize a repository or generated template fallback.
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` remains the owner that propagates the provenance-checked plugin root into the isolated runtime.
- Existing skill-dispatch and lifecycle owners remain authoritative for when an artefact is authored. They receive `template_path`; they do not resolve paths independently.
- `.agdf/control/templates/` remains scaffold/control-writer owned and reviewable, but has no runtime authoring authority.

## 3. Architecture Decisions

- SDD-001: Add `packages/core/lib/resources/artefact-templates.js` with `ARTEFACT_TEMPLATE_IDS` and `resolveArtefactTemplatePath(templateId, context = resources)`; rationale: one Core resource owner prevents per-skill duplication and accepts only finite semantic identifiers; consequence: all authoring owners depend on one shared fail-closed API.
- SDD-002: Map the nine identifiers internally to `UR.md`, `PRD.md`, `SD.md`, `TP.md`, `UX_INTENT_DEFINITION.md`, `BROWNFIELD_REVIEW.md`, `VERIFIED_CHANGE.md`, `QA_REPORT.md` and `OR.md`; rationale: callers cannot supply path syntax or extend scope accidentally; consequence: adding any future canonical authoring template requires an explicit reviewed Core change.
- SDD-003: Validate an absolute non-symlink template root, reject symlink components, and reuse `containedRegularFile()` for real-path containment and regular-file validation; rationale: lexical joining alone cannot prevent unsafe or redirected resources; consequence: missing resources are unavailable and unsafe resources are never followed.
- SDD-004: Use stable resolver errors `AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED`, `AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE`, `AGDF_ARTEFACT_TEMPLATE_UNAVAILABLE` and `AGDF_ARTEFACT_TEMPLATE_UNSAFE`; rationale: callers and tests must distinguish unsupported scope, absent trusted installation and unsafe content; consequence: dispatch surfaces translate these errors into explicit recovery without success-shaped fallback.
- SDD-005: Remove the `context.js` generated-template default and make projected `templatesURL` null when `AGDF_DISPATCH_PLUGIN_ROOT` is absent; rationale: non-authoring runtime behavior must remain available while authoring cannot silently adopt generated or repository copies; consequence: only resolver invocation fails when the trusted root is unavailable.
- SDD-006: Add `template_path` only at existing continuation or lifecycle owners: UR, PRD and SD definition continuations; TP required-gate-artifact continuation; UX Intent Definition reassessment/direct judgement owner; Brownfield Review post-UR continuation; Verified Change gate-check owner while its compact record is created or repaired; QA Report qa-gate owner; and OR post-UAT closeout; rationale: existing ownership and gate semantics remain intact; consequence: no new skill, phase, route or parallel authoring surface is introduced.
- SDD-007: Preserve `template_path` as additive continuation metadata and leave approval, presentation and host rendering schemas otherwise unchanged; rationale: Copilot and Codex must retain current tool/UI behavior; consequence: older consumers may ignore the field while authoring owners can require it.
- SDD-008: Keep recursive plugin control packaging and deterministic inventory as the only propagation path for derived copies; rationale: build-owned projection already packages `plugins/agdf/control/**`; consequence: tests expand to all nine files without adding another copy mechanism.

## 4. Integration Points

| Integration point | Design |
|---|---|
| `packages/core/lib/resources/context.js` | Stop defaulting `templatesURL` to generated `.agdf/control/templates/`; accept a missing template URL and expose `templatesRoot: null` while retaining strict validation for package, generated and contract resources. |
| `packages/core/lib/resources/binding.js` | Bind source-development templates to the canonical repository plugin path, never to repository scaffold output. |
| `scripts/core-projection.mjs` | Project `templatesURL` from `AGDF_DISPATCH_PLUGIN_ROOT/control/templates` only; emit `null` when the trusted root is absent. Keep current contract-resource behavior unchanged. |
| `packages/core/lib/skill-dispatch/delivery-intake.js` | Replace `resolveUrTemplatePath()` with the shared resolver and `ARTEFACT_TEMPLATE_IDS.UR`. |
| `packages/core/lib/skill-dispatch/prd-definition.js` | Add the resolved PRD `template_path` to the existing continuation. |
| `packages/core/lib/skill-dispatch/sd-definition.js` | Add the resolved SD `template_path` to the existing continuation. |
| `packages/core/lib/skill-dispatch/service.js` | Resolve and attach the matching path at the existing TP, UX Intent Definition, Brownfield Review, Verified Change, QA Report and OR owners. |
| `packages/core/lib/control-evaluation/verified-change.js` and gate-check dispatch | Keep eligibility and record validation in the existing owner; expose the Verified Change template only when the existing gate-check continuation is preparing or repairing the compact record. |
| `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` | Preserve current provenance-checked `AGDF_DISPATCH_PLUGIN_ROOT` propagation into the isolated server process. |
| `scripts/sync-package-assets.js` | Preserve recursive `plugins/agdf/control/**` copy behavior; no new projection source is introduced. |
| Skill runtime contracts | State that supplied `template_path` is absolute, plugin-owned and mandatory for the nine in-scope authoring paths; missing/unsafe resolution blocks authoring without mutation. |
| `INSTALL.md` | Document runtime plugin authority, derived repository copies, exact nine-template scope and repair/reinstall recovery. |

Continuation mapping is fixed as follows:

| Artefact template | Existing owner | Binding point |
|---|---|---|
| `UR.md` | `ur-definition` | `urDefinitionPhase()` |
| `PRD.md` | `prd-definition` | `prdDefinitionPhase()` |
| `SD.md` | `sd-definition` | `sdDefinitionPhase()` |
| `TP.md` | gate-check task-plan preparation | `required_gate_artifact` for gate `TP` |
| `UX_INTENT_DEFINITION.md` | `ux-intent-definition` | source-analysis reassessment and its direct judgement continuation |
| `BROWNFIELD_REVIEW.md` | `brownfield-analysis` | `post_ur_review` continuation only |
| `VERIFIED_CHANGE.md` | gate-check / Verified Change evaluator | existing compact-record preparation or repair continuation |
| `QA_REPORT.md` | `qa-gate` | existing QA judgement/authoring continuation |
| `OR.md` | `release-or` | `post_uat_closeout` continuation |

## 5. Constraints And Compatibility

- The resolver accepts only values from `ARTEFACT_TEMPLATE_IDS`; it never accepts a relative or absolute path from a continuation caller.
- `context.templatesRoot` must be an absolute directory path supplied by Core resource binding. A missing root produces `AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE`.
- A mapped file missing below a valid root produces `AGDF_ARTEFACT_TEMPLATE_UNAVAILABLE`.
- A non-absolute root, symlink root/component, path escape, non-directory root, non-regular target or failed containment check produces `AGDF_ARTEFACT_TEMPLATE_UNSAFE`.
- An identifier outside the nine-value allow-list produces `AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED`.
- No error path reads from or writes to `.agdf/control/templates/`, creates repository files or repairs an installation.
- Core context construction must remain usable for non-authoring status and inspection when the plugin template root is absent.
- Existing result freezing conventions apply to identifier objects, continuation results and exposed resource context.
- Existing seven-tool Copilot MCP inventory, Codex private cockpit behavior, approval syntax and gate authority remain unchanged.
- Generated and packaged files remain build-owned; direct changes are made only to canonical sources and then projected with existing scripts.
- The implementation must preserve unrelated dirty work, especially user-owned deletions under `docs/architecture/mockups/`.

## 6. Test And Evidence Strategy

TP must select exact commands, but implementation and QA must collect these evidence classes:

- Resolver unit coverage for every one of the nine identifiers and representative unsupported values.
- Resolver safety coverage for missing root, missing file, non-absolute root, symlink root/component, directory target, path escape and valid absolute regular files.
- Negative coverage proving the six excluded control/scaffold files have no resolver identifier and retain their existing writers.
- Skill-dispatch coverage for each mapping in the continuation table, including failure propagation and no repository mutation.
- Verified Change coverage proving its existing owner receives the template without a new skill or route.
- Runtime-isolation coverage proving projected Core resolves from `AGDF_DISPATCH_PLUGIN_ROOT` and fails only authoring when the variable or template is absent.
- Real stdio continuation coverage against the assembled version-matched plugin for all reachable authoring continuations.
- Copilot payload and npm package-content coverage proving all nine template files occur exactly once and derive from `plugins/agdf/control/**`.
- Codex regression coverage proving private cockpit discovery, authoring compatibility and host behavior remain unchanged.
- Contract and installation-document assertions for plugin authority, derived copies, exact scope and fail-closed recovery.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | One frozen nine-value identifier set and internal filename map define the complete resolver domain. | `packages/core/lib/resources/artefact-templates.js`; Core resource owner | SDD-001, SDD-002 | Risk: accidental scope expansion; mitigated by exact allow-list and negative tests. |
| AC-002 | The six excluded files have no identifier or continuation mapping and remain under existing scaffold/control writers. | Existing control writers; resolver allow-list | SDD-002, SDD-006 | Risk: indirect routing through generic continuation; mitigated by negative mapping tests. |
| AC-003 | Root, symlink, real-path containment and regular-file validation precede every successful return. | `artefact-templates.js`; `control-state/contained-file.js` | SDD-003, SDD-004 | Risk: host-specific path behavior; mitigated by Windows-safe containment tests and existing helper reuse. |
| AC-004 | Nullable runtime binding and explicit resolver errors replace all generated/repository fallback behavior without mutation. | `resources/context.js`; `resources/binding.js`; `scripts/core-projection.mjs` | SDD-004, SDD-005 | Risk: runtime startup regression; mitigated by keeping non-authoring context available with `templatesRoot: null`. |
| AC-005 | The fixed continuation table extends each current owner and introduces no new dispatch route. | `skill-dispatch/*.js`; Verified Change evaluator/gate-check | SDD-006, SDD-007 | Risk: generic owner receives an irrelevant path; mitigated by phase/gate-specific mapping tests. |
| AC-006 | Runtime authority comes from the trusted installed plugin while repository/package copies remain deterministic derived assets. | plugin runtime environment; `scripts/sync-package-assets.js` | SDD-005, SDD-008 | Risk: source/payload drift; mitigated by source mapping and inventory digest tests. |
| AC-007 | `template_path` is additive and no tool, gate, approval or renderer contract is replaced. | skill-dispatch continuation schema and host regression suites | SDD-006, SDD-007 | Risk: strict consumer fixtures reject added metadata; mitigated by focused Copilot/Codex regressions. |
| AC-008 | Existing recursive packaging is retained and assertions expand to exactly the nine canonical artefact templates. | `scripts/sync-package-assets.js`; payload/package tests | SDD-008 | Risk: duplicates or budget drift; mitigated by exact-once inventory and reviewed baseline checks. |
| AC-009 | Direct contracts and installation guidance describe the absolute plugin-owned path, exact scope, derived copies and explicit recovery. | `plugins/agdf/meta/contracts/*.md`; `INSTALL.md` | SDD-004, SDD-006, SDD-008 | Risk: contract/code mismatch; mitigated by content assertions and review. |

## 8. Risks And Open Questions

- Generic continuations must receive a template only when they are acting as the existing authoring owner; phase/gate predicates prevent irrelevant metadata.
- `templatesRoot: null` must not weaken contract or locale resource validation; only template authoring is optional at context-construction time.
- Symlink and junction behavior differs across hosts; implementation must reuse existing Core filesystem wrappers and test the supported Windows behavior rather than adding ad hoc filesystem semantics.
- Dispatch recovery copy must expose a direct repair or reinstall action for unavailable/unsafe plugin templates while retaining the stable resolver code in diagnostics.
- Verified Change integration must remain within the existing gate-check/evaluator route and must not create a `verified-change` skill.
- No material architecture decision remains open. Exact test command selection and scenario grouping are deferred to TP.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Shared resolver module and API | before_sd | resolved | Add `packages/core/lib/resources/artefact-templates.js` exporting frozen `ARTEFACT_TEMPLATE_IDS` and `resolveArtefactTemplatePath(templateId, context = resources)`. | Core resource owner |
| Identifier and filename domain | before_sd | resolved | Use exactly nine semantic identifiers mapped internally to the nine approved filenames; accept no path parameter. | Core resource owner |
| Safety and error taxonomy | before_sd | resolved | Reuse Core containment helpers, reject symlinks/non-files/escape, and emit the four stable `AGDF_ARTEFACT_TEMPLATE_*` error classes described in SDD-004. | Core resource owner |
| Missing trusted plugin root behavior | before_sd | resolved | Keep non-authoring Core available with `templatesRoot: null`; fail only template resolution and never fall back or mutate repository state. | Core and plugin runtime owners |
| Continuation and lifecycle mapping | before_sd | resolved | Use the fixed nine-row mapping in Section 4 and extend only existing owners. | Skill-dispatch owner |
| Host compatibility | before_sd | resolved | Add only `template_path`; preserve tools, gates, presentations, cockpit behavior and lifecycle authority. | MCP host owners |
| Validation command matrix | later_tp | deferred | TP will bind exact focused commands and scenario IDs after this design is approved; the required evidence classes are fixed in Section 6. | QA and task-plan owner |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Eine gemeinsame Core-Resolver-API bindet die neun kanonischen Artefakt-Templates ausschließlich an das installierte, versionsgleiche AGDF-Plugin.
- Architektur: `packages/core/lib/resources/artefact-templates.js` exportiert eine feste Neuner-Allowlist und `resolveArtefactTemplatePath(templateId, context = resources)`. Nur validierte absolute reguläre Dateien innerhalb des vertrauenswürdigen Plugin-Template-Roots werden zurückgegeben.
- Fehlerverhalten: Nicht unterstützte IDs, fehlender Plugin-Root, fehlende Dateien und unsichere Pfade liefern stabile explizite Fehler. Es gibt keinen Fallback auf Repository- oder generierte Scaffold-Kopien und keine Mutation.
- Integration: Die bestehenden Owner für UR, PRD, SD, TP, UX Intent Definition, Brownfield Review, Verified Change, QA Report und OR erhalten additiv `template_path`; es entsteht kein neuer Skill oder Dispatch-Pfad.
- Kompatibilität: Copilot-Tools und Präsentation, Codex-Cockpit, Gate-Autorität und Lifecycle bleiben unverändert. Nicht-Authoring-Funktionen bleiben bei fehlendem Template-Root verfügbar.
- Nachweise: Resolver-Sicherheit, alle neun Owner-Mappings, sechs Ausschlüsse, Runtime-Isolation, Stdio-Fortsetzungen, Payload/Paket und Codex-Regressionen werden im TP mit exakten Szenarien und Befehlen gebunden.
