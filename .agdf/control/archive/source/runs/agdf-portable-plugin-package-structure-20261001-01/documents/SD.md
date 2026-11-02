# SD: Portable AGDF Plugin and Package Organization

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-01
Owner: Arndt Gold
Run: `agdf-portable-plugin-package-structure-20261001-01`
Language: en
Traceability contract: criteria-chain-v1

Source: [Approved PRD](PRD.md), criteria AC-001 through AC-009.
This document selects design only. It neither implements the migration nor proves host acceptance.

## 1. Solution Overview

Use `plugins/agdf/` as the canonical plugin source root. Generate its portable root manifest from
the existing plugin definition. Keep portable skills, assets and shared metadata at that root.
Move the existing canonical hook templates into a build-only host-template directory so a
runtime-free source/skills profile cannot discover executable hooks by default.

Keep the three existing npm packages and their identifiers. Their logical responsibilities become
explicit in the component map and documentation; this run does not introduce a fourth published
control-core package or move all npm sources into a cosmetic `packages/` tree.

Selected source organization:

```text
plugins/agdf/
  plugin.json                    generated portable source identity/OpenAI presentation
  skills/                        canonical skills, unchanged relative meta references
  assets/                        canonical visual assets
  meta/                          canonical definition, contracts, locales and profile metadata
    schemas/agent-plugins/1.0.0/  pinned external plugin/MCP schema inputs
  control/templates/             canonical repository control templates
  host-templates/shared/hooks/   canonical existing Codex/Claude hook templates; build-only
  submission/openai/             canonical existing submission inputs
  scripts/                       existing source conformance/integrity tooling
create-agdf/
  bin/                           existing CLI/bootstrap/validator entry points
  lib/control-state/             durable control, locks, seals and approval recording
  lib/control-evaluation/        deterministic gates and readiness
  lib/runtime/                   version binding, offline runtime and provenance
  lib/cli/                       command parsing, presentation and handlers
  lib/skill-dispatch/             shared non-authorizing dispatch
  lib/control-inspect/            shared read-only inspection
  lib/mcp-lifecycle/              existing acquisition/startup/recovery ownership
  lib/public-plugin/             portable/compatibility/profile generation and checks
  lib/installers/                existing owned staging, installation and rollback
  scripts/                       build orchestration and existing tests
  generated/                     derived profiles; current output paths retained
agdf/                            @agdf/cli, thin create-agdf/cli consumer
agdf-mcp-server/                  @agdf/mcp-server, protocol/worker adapter
.agdf/control/                   target-local authoritative run state; unchanged
```

Build/package output remains under the current `create-agdf/generated/` paths. Moving the source
root does not move installed marketplace roots, control state, runtime data or exported package
paths. No old `plugin/` mirror or symlink is kept. Historical approved artefacts retain their
original evidence paths; current executable and maintainer references are migrated.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner after migration | Consumers and dependency direction |
|---|---|---|
| Identity, profiles and presentation | plugins/agdf/meta/agdf-plugin.definition.json; Arndt Gold | Existing manifest projector -> source and built profile manifests; no profile owns a duplicate definition |
| Skills and governance semantics | plugins/agdf/skills/ and meta/contracts/; existing AGDF owners | Profile builders and shared dispatcher/runtime read derived copies; adapters do not decide policy |
| Project control templates | plugins/agdf/control/templates/; existing AGDF owner | Bootstrap installs templates; target .agdf/control remains effective repository authority |
| Control-core and deterministic evaluation | Existing create-agdf/lib/control-state/ and control-evaluation/ | CLI handlers, dispatch, inspection and control-command facade call these existing owners |
| CLI and installation | create-agdf/bin/, lib/cli/, lib/installers/ | @agdf/cli imports create-agdf/cli; package identifiers and public exports unchanged |
| MCP protocol and lifecycle | agdf-mcp-server/src/ adapter; create-agdf/lib/mcp-lifecycle/ | Protocol adapter consumes create-agdf/mcp-dispatch-runtime at exact matching version; no core -> MCP SDK dependency |
| Build and external format validation | Existing public-plugin modules and sync scripts | Canonical plugin sources -> derived profiles -> validation/inventory; pinned schemas are external format input, not governance policy |
| Effective installed/host state | Existing installers/provenance and named host | Build results do not decide host recognition; existing reports expose evidence gaps |

The existing SOT_REGISTRY is updated for moved source paths and extended for pinned schemas and
the source-root locator. Existing Context Graph distribution/local-dispatch nodes receive curated
path/design updates at implementation closeout, not claims of unobserved host support.

## 3. Architecture Decisions

- SDD-001: Move the canonical plugin source from plugin/ to plugins/agdf/ and provide one build/source path locator; rationale: one recognizable portable plugin root improves component navigation and removes repeated source-root assumptions; consequence: current build, versioning, conformance and documentation consumers must change together while historical evidence remains untouched.
- SDD-002: Generate portable root identity from the existing definition and select exactly one complete OpenAI settings source per profile; rationale: root identity stays portable and inline OpenAI metadata replaces the entire legacy overlay rather than merging with it; consequence: source/public profiles use inline extensions.com.openai, while current local runtime profiles omit that object and use a complete generated compatibility overlay.
- SDD-003: Make optional-file inclusion profile-controlled and move shared hook templates outside root hooks/ in canonical source; rationale: default hook discovery must not activate runtime code in skills-only/source outputs; consequence: builders materialize hooks only into runtime profiles and exclude host templates from distributable payloads.
- SDD-004: Retain create-agdf, @agdf/cli and @agdf/mcp-server publication boundaries and their current exports; rationale: CLI and MCP already consume one exact-version runtime owner and extraction would add dependency/release obligations without an evidenced independent core consumer; consequence: logical core remains within create-agdf and future independent-core extraction requires new consumer evidence rather than a directory diagram.
- SDD-005: Extend existing profile validation with pinned Agent Plugins 1.0.0 schema inputs and actual-output semantic checks; rationale: schema conformance alone cannot prove path containment, capability absence or OpenAI settings consistency; consequence: schema-engine tooling is build/test-only and must not enlarge or network-enable the offline governed runtime.
- SDD-006: Deliver portable-format generation/validation before the source-root relocation, with unchanged generated and installed destination contracts; rationale: each migration stage has separate acceptance and rollback evidence; consequence: path changes are coordinated through existing builders/tests and no old source mirror is retained.
- SDD-007: Keep existing control, trust, consent, provenance and target/run authority owners; rationale: package organization must not move binding decisions into manifests, UI or adapters; consequence: generated manifest additions enter existing digest/inventory checks while approval/state semantics remain unchanged.
- SDD-008: Preserve separate repository, package, installed-payload and fresh-host evidence lanes and document component/profile navigation; rationale: format validation does not establish host acceptance and maintainers need an accurate map; consequence: missing host proof stays explicit and no active-user install, portal mutation or release is performed by this run.

## 4. Integration Points

### Manifest and component mapping

The current external inputs, revalidated on 2026-10-01, are
[OpenAI package guidance](https://developers.openai.com/plugins/build/plugins),
[plugin schema 1.0.0](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json) and
[MCP schema 1.0.0](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json).
These define format compatibility, not AGDF permission policy.

The root projector emits the declared schema, stable name, version and portable identity metadata.
Portable discovery uses root skills/ without a top-level skills field. OpenAI interface values
retain existing local/public selection and asset paths under extensions.com.openai when inline
settings are selected. Registered app mappings remain absent: this run adds no registered service.

| Output/profile | Root/host manifest strategy | Optional runtime components |
|---|---|---|
| Canonical source-development | Portable plugin.json with inline OpenAI presentation, no runtime declaration; remains authoring source rather than an installed runtime | No root hooks/hooks.json, mcp.json, .mcp.json or .app.json; build-only host templates are excluded from outputs |
| Public portable-skills candidate | Portable plugin.json with complete inline public presentation; generated legacy Codex fallback may be retained for older consumers from the same definition | No hooks, MCP, app mapping or bundled runtime; public exclusion check covers both old and portable filenames |
| Shared Codex/Claude runtime plugin | Portable root identity with extensions.com.openai absent; complete generated .codex-plugin/plugin.json supplies local presentation, explicit hooks and existing mcpServers; .claude-plugin/plugin.json retains its existing projection | Existing host-specific mcp/codex.mcp.json and mcp/claude.mcp.json plus runtime hooks; no newly auto-discovered portable mcp.json |
| Copilot runtime plugin | Existing Copilot plugin.json and generated profile remain host-specific; do not overwrite this root with the portable OpenAI schema | Existing generated Copilot hooks and bounded runtime inventory |
| OpenCode local/global | Existing config/npm and skill projections; no new OpenAI manifest injected | Existing explicit runtime/permission/consent behavior |

The shared runtime's compatibility overlay remains an intentional supported adapter. It has portable
identity/skills, but its MCP transport remains host-specific. A host that ignores that adapter does
not acquire claimed MCP support. Do not insert an inline OpenAI object into that runtime profile
without migrating every setting and establishing equivalent host evidence.

A future bundled portable MCP configuration must use the versioned MCP schema with explicit
transport type and the specification's executable/path/environment rules. It is absent in this
migration: current Codex launchers need installer-completed absolute root/data paths, while Claude
uses its host variables. A generic portable launcher/data-root transition would change an execution
and recovery boundary and is not required to deliver this selected format/organization design.

### Builder and validator changes

Extend public-plugin/manifest.js with a portable projector alongside existing Codex, Claude and
Copilot projectors; all consume one definition and explicit profile settings. The existing
sync-package-assets orchestration owns profile composition. It materializes runtime hooks from
host-templates/shared/hooks/ into the current generated hooks/ path and must never wholesale-copy
build-only templates into a distributed profile.

Use one source-root locator for executable build/source consumers in create-agdf/lib/public-plugin/
(or a focused shared build module in that existing owner). Repository tools and fixtures either use
that locator or explicit new canonical paths where import boundaries make reuse inappropriate.
Installed runtime path resolution continues to use package-generated/installed roots, never the
repository locator.

Extend current public/profile validators to inspect portable identity first where that profile
requires it, resolve the effective OpenAI source deterministically, compare generated identity and
selected presentation, and apply profile capability/path checks. Legacy-only Copilot/OpenCode
outputs retain their own grammar. Schema validation uses pinned local snapshots with source URL,
retrieval date and digest, plus a locked standards-compliant draft-2020-12 build/test validator.
TP selects the compatible locked tool version; it is not added to plugin-local offline execution.

Preserve provenance normalization for installer-completed Codex MCP paths. Include new root manifests
in existing payload digests; recompute generated markers through their existing owners. Do not
normalize away new identity, hook or capability edits.

## 5. Constraints And Compatibility

All package names, CLI invocations, package exports, exact-version dependencies, Node baseline,
generated output paths, installed marketplace identities, runtime data roots and .agdf/control
locations remain stable. Existing positional/relative skill references to ../../meta remain valid
inside each plugin root. Source-relative diagnostics and canonical-owner inventory paths are migrated.

The source-root move is a repository maintenance change, not a migration of sealed historical
approvals. Current README/INSTALL/handbook navigation, build/versioning scripts, workflows and SoT
references follow the new source root; historical artefacts and dated evidence are not rewritten.
A stale active executable dependency on the old root is a failed migration check.

Compatibility adapter retention is deliberate: accountable owner Arndt Gold; rationale is the
observed absolute-path Codex launcher and distinct Claude data-root lifecycle; mitigation is complete
generated overlays, exclusive settings selection, capability matrices and exact-profile regression
proof; exit condition is a separately scoped, verified portable MCP launcher/data-root migration for
all affected hosts. It creates no second maintained metadata source and no claim that portable MCP
has been implemented.

Before source edits, implementation-preparation review compares current related-run revisions and
dirty paths for shared-owner conflicts. Existing unrelated deletion/duplicate files are preserved;
if they prevent a required check, report the baseline cause and route bounded remediation separately.

## 6. Test And Evidence Strategy

TP supplies task/scenario IDs; the design requires these evidence groups:

- Validate actual portable source/public/runtime identity outputs against pinned schemas, not only projector input; test malformed identity, unsupported top-level fields and missing transport type in a portable MCP fixture.
- Test profile exclusions and default discovery, including injected root hooks/hooks.json, mcp.json, .mcp.json and app mappings in skills-only output; verify no generated host templates leak.
- Test inline-versus-overlay replacement, identity/version parity, distinct canonical local/public interface values and complete runtime fallback including MCP/hooks.
- Pack output and resolve all declared skill/meta/assets and host launch resources; test missing/case-mismatched/escaping resources under existing safety conventions.
- Exercise current CLI exports, four affected host projection paths, runtime digest/absolute-path normalization, consent/trust, update/recovery and source-root/version/conformance propagation.
- Verify documented command/path/profile mapping against final source and output, and run the existing mandatory review/QA paths.
- Report package and protocol fixtures separately from isolated installed-payload/native host observations; unavailable host evidence stays unverified. No mutation of the active user installation is required or authorized.

## 7. Acceptance Traceability

Product acceptance remains exclusively in approved PRD.md; this table maps implementation design.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Portable projector and pinned schema checks for selected root manifests; portable MCP fixture checks transport grammar | plugins/agdf/meta/agdf-plugin.definition.json and meta/schemas/; existing public-plugin owner, Arndt Gold | SDD-002, SDD-005 | Keep runtime MCP in explicit legacy adapter; no portable transport support inferred |
| AC-002 | Per-profile inclusion and actual resource/discovery/path validation, with host-template exclusion | Existing sync-package-assets and public-plugin validators; AGDF build owner | SDD-003, SDD-005 | Default discovery and path errors fail validation before package readiness |
| AC-003 | Single source-root relocation/locator, generated manifests, reconciled registry and current references | plugins/agdf canonical sources and .agdf/control/SOT_REGISTRY.md; existing AGDF owners | SDD-001, SDD-002 | No independently maintained plugin/ mirror; historical evidence retains original paths |
| AC-004 | Explicit component/dependency map retains existing logical core and three published identities | Existing create-agdf, agdf and agdf-mcp-server package manifests/exports; Arndt Gold | SDD-004 | Avoid fourth-package release coupling and preserve exact dependency direction |
| AC-005 | Format milestone then source-root relocation with unchanged generated/install destinations and existing recovery | Existing builders/installers/provenance and active source consumers; AGDF maintainer | SDD-001, SDD-006 | Coordinate related work and fail on stale active paths; preserve dirty baseline |
| AC-006 | Profile matrix selects inline public/source settings or complete local runtime fallback; Copilot/OpenCode stay host-specific | Canonical definition and public-plugin projectors; Arndt Gold | SDD-002, SDD-003 | Prevent accidental capability activation and preserve local/public prompt selection |
| AC-007 | Reuse canonical control and adapter owners; include new manifests in existing provenance without authority changes | Existing control-state, control-evaluation and runtime/provenance; AGDF | SDD-007 | No new control store, gate owner, remote validation or changed consent |
| AC-008 | Distinct evidence lanes and unchanged report authority with explicit host gaps | Existing readiness/compatibility evidence owners and named hosts; Arndt Gold | SDD-008 | Build success never substitutes installed/native recognition; no active install/publication |
| AC-009 | Component/profile guide and verified current paths/commands after relocation | Current README, INSTALL, handbook and registered component owners; Arndt Gold | SDD-001, SDD-008 | Documentation follows source/output and separates desired from effective host state |

## 8. Risks And Open Questions

All PRD later_sd design choices are resolved here: canonical root is plugins/agdf; schema target is
Agent Plugins 1.0.0; source/public use inline OpenAI settings and local runtime uses complete fallback;
existing publication boundaries are retained. No product decision or scope expansion is deferred.

Remaining TP planning work: identify the full current executable path-consumer inventory, pin the
build/test schema tool and retrieval digests, select exact affected regression and isolated host
scenarios, coordinate shared-owner baselines and stage rollback fixtures. Arndt Gold owns those
planning decisions. Host observations can reject the selected bridge during validation; that routes
a design revision rather than a silent capability change.

Context Graph: link existing CG-PUBLIC-PLUGIN-DISTRIBUTION and CG-MCP-DISPATCH-ADAPTER; reusable
source-root/projection decisions require curated updates at implementation/closeout. No implemented
or live-host claim is added at design time. SoT registry changes happen with the corresponding source
migration, not ahead of it.

## 9. Next Step

Review this persisted Solution Design and approve only with `Approval: SD`.
Approval permits the Task/Test Plan. Implementation remains gated by TP approval and its required
Brownfield preparation.

## AGDF Approval Summary (de; source=en)

- Lösung: Kanonischer Plugin-Quellordner wird plugins/agdf/ mit portablem root plugin.json, skills/, assets/ und meta/. Bestehende erzeugte Paket-, Installations- und Control-Pfade bleiben stabil.
- SDD-001: Ein Quellordner und ein gemeinsamer Build-Pfadbezug; aktive Verweise werden migriert. Kein zweiter plugin/-Quellbaum und keine Änderung historischer Freigaben.
- SDD-002: Eine Metadatenquelle erzeugt portable Identität und vollständige Hostvarianten. Source/Public nutzen extensions.com.openai; die lokale Runtime behält bewusst den vollständigen Codex-Kompatibilitäts-Overlay ohne Inline-Objekt.
- SDD-003: Hook-Vorlagen ziehen in host-templates/shared/hooks/. Nur Runtime-Builder erzeugen ausführbare root hooks/. Source und öffentlicher Skills-Kandidat enthalten keine automatisch aktivierenden MCP-, Hook- oder App-Dateien.
- SDD-004: create-agdf, @agdf/cli und @agdf/mcp-server bleiben mit aktuellen Namen, Exporten und exakten Versionsbindungen bestehen. Kontrollkern bleibt logisch getrennt innerhalb create-agdf; kein viertes npm-Paket ohne unabhängigen Verbraucher.
- SDD-005: Gepinnte Agent-Plugins-Schemata 1.0.0 und vorhandene Paketprüfer prüfen Schema, tatsächliche Ressourcen, Profilgrenzen und Overlay-Auswahl. Schema-Werkzeuge bleiben Build/Test und vergrößern nicht die Offline-Runtime.
- SDD-006: Zuerst portables Format validieren, danach Quellordner verschieben. Migration und Rollback werden je Stufe geprüft; fremde Workspace-Änderungen bleiben erhalten.
- SDD-007: Bestehende Gates, revisionsgebundene Freigaben, Trust, Consent, Provenance und lokale Control-Dateien behalten ihre Besitzer. Neue Manifeste werden in bestehende Integritätsnachweise aufgenommen.
- SDD-008: Quellcode-, Paket-, Installations- und frische Hostnachweise bleiben getrennt. Dokumentation erklärt Komponenten, Profile, Pfade und Recovery; unbelegte Host-Unterstützung bleibt sichtbar.
- Kompatibilität: Lokales MCP bleibt im vorhandenen Hostadapter mit Codex-Absolutpfaden und Claude-Lifecycle. Kein neues portables mcp.json, keine Remote-Fähigkeit. Copilot und OpenCode behalten ihre eigenen Formate.
- Abwägung: Die Runtime-Kompatibilität ist ausdrücklich beibehalten. Verantwortlich ist Arndt Gold; vollständige erzeugte Overlays und Regressionen sichern sie ab. Ersatz erst bei separat belegter portabler MCP-/Datenpfad-Migration aller betroffenen Hosts.
- Abnahmezuordnung: AC-001 bis AC-009 sind jeweils genau einmal auf das Design und seine Quellen abgebildet. Technische Verzeichnisse und Paketgrenzen sind entschieden; Szenarien, Werkzeuge und Aufgaben folgen in TP.
- Grenze: Dieses Artefakt enthält das Design. Keine Implementierung, aktive Installation, Veröffentlichung oder VCS-Aktion. Approval: SD erlaubt den Aufgaben- und Testplan.

