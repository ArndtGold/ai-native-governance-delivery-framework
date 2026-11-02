# PRD: Portable AGDF Plugin and Package Organization

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-01
Owner: Arndt Gold
Run: `agdf-portable-plugin-package-structure-20261001-01`
Language: en
Traceability contract: criteria-chain-v1

Sources: [Approved UR](UR.md); [Completed Brownfield Review](BROWNFIELD_REVIEW.md).
Mode: structured_delivery; primary depth reason: external_contract_depth.

## 1. Product Scope

Deliver a portable AGDF plugin with a clear installable root, a shared identity, discoverable skills,
and profile-appropriate optional components. Use the current Agent Plugins format and OpenAI's
documented extension namespace. Maintain existing supported host behavior through generated
compatibility projections where needed.

Organize plugin content, control-core, CLI/installation, MCP adapter and build responsibilities so
maintainers can locate each authoritative component and follow its dependency direction.
Reuse existing entry-point packages and generators. The first migration milestone is the portable
plugin format; subsequent module organization follows the dependency analysis in SD. Implement the
boundaries selected there, without requiring independent npm publication for every logical module.

The SD must justify each proposed source move or independently versioned/published package against
consumers, dependency direction, build/offline runtime, compatibility, versioning and maintenance
cost. Retaining an existing package boundary is acceptable when that evidence shows no durable
benefit from extraction. The earlier example `plugins/agdf/` and `packages/{core,cli,mcp-server}/`
does not decide the design.

This run delivers repository/package migration and evidence. Actual release, directory submission,
installation into the active user environment and VCS actions require their separate instruction.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics from Brownfield Review; no new UI, activation permission or recovery behavior
- primary_user_intent: As a maintainer, locate the authoritative plugin/runtime component, build the intended profile and understand what a supported host receives.
- success_signal: The actual package resolves all declared components; a documented component/profile map agrees with source and built inventory, with no competing owners.
- primary_decision_or_action: Choose the existing supported distribution/host path, build or validate its package, then use the existing installation/consent flow when separately authorized.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Source maintenance | Canonical content defines desired identity, governance and selected profiles; generated copies are derived | canonical owner, desired profile, generated status | Registered source owners and approved artefacts | Maintainer component/profile documentation |
| Build and package validation | A profile is complete only when the actual output passes schema, component, identity and exclusion checks | requested profile, validation result, missing/forbidden resources | Existing profile builder and package validator evidence | Build/validation result and inventory |
| Supported local host installation | Effective capabilities are the installed payload recognized by the named host; runtime/consent/trust state remains explicit | installed version, profile, host recognition, consent/trust, failure/recovery | Existing installer, owned runtime provenance and host recognition | Existing installer/host presentation |
| Public candidate preparation | A generated skills-only candidate is repository/package evidence; submission, review and publication remain separate states | candidate validity, absent optional capabilities, unverified host/portal evidence | Candidate builder/validator; OpenAI for portal states | Existing readiness report and documentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Preserve the existing explicit host installation, plugin enablement, hook trust and runtime-check consent flows. Portable discovery alone must not activate profile-inappropriate hooks, MCP servers, applications or new permissions.
- blockers_and_visible_next_actions: Invalid schema, missing/escaping component path, identity/version drift, forbidden profile content or runtime mismatch prevent a valid-package claim and identify the corrective source/build action. Missing fresh-host evidence is shown as unverified.
- recovery_paths: Correct the authoritative input and rebuild/revalidate. Existing recoverable installer/startup failures retain retry and rollback/recovery guidance; generated or installed copies never become an alternative policy owner.
- relevant_state_transitions: Canonical input change -> profile generation -> exact-package validation -> separately authorized installation -> host recognition. Each stage reports only its observed state. Failed generation/validation must not report a ready package; an existing valid installed version is not replaced by this run. Installation/update recovery remains the existing supported path.

## 5. Acceptance Criteria

### AC-001 — Portable root and schema

- criterion_id: AC-001
- observable_success: The distributed root manifest and any portable MCP configuration pass their selected versioned schemas.

The actual selected portable plugin package contains root `plugin.json` and root `skills/`,
validates against the selected versioned Agent Plugins schema, and expresses OpenAI-specific fields
in their documented namespace. Any bundled portable MCP configuration validates against its own
transport schema. Schema identifiers, official documentation date and compatibility mapping are
recorded. Existing legacy MCP JSON must not become portable configuration merely by being renamed.

### AC-002 — Component completeness and containment

- criterion_id: AC-002
- observable_success: All declared components resolve inside each actual profile; missing or forbidden resources fail validation.

For every delivered profile, every declared skill/resource, icon, optional MCP connection, hook and
app mapping resolves within the actual output using the format's path/discovery rules. Validation
rejects missing, incorrect-case, escaping or profile-inappropriate resources where applicable.
Profiles without an optional capability contain no declaration or auto-discovered file that
accidentally enables it. Required evidence: exact-output inventory plus representative positive
and negative package checks.

### AC-003 — One authoritative source per concern

- criterion_id: AC-003
- observable_success: Canonical owners and reproducible derived outputs agree with the reconciled source-of-truth registry.

Identity, skills, governance contracts and profile metadata each have one documented canonical
owner. Portable and required compatibility manifests and host copies are reproducible derived
outputs. Editing a generated copy cannot create an independent identity, workflow, rule or
approval authority. Changed ownership/path references are reconciled in the existing SoT registry
and documentation; no parallel source tree remains independently maintained.

### AC-004 — Justified component organization

- criterion_id: AC-004
- observable_success: The delivered component/dependency map and any independent packages match the approved evidence-based design.

The delivered organization distinguishes plugin content, control-core, CLI/installation, MCP adapter
and build concerns and agrees with the approved SD dependency/owner map. Every added independent
package has evidenced consumers, dependency direction, exact-version/release obligations and a
reason to outweigh its maintenance cost. Existing package identities are preserved through the
migration unless a reviewed compatibility design explicitly accounts for them. A reasoned decision
to retain the current publication boundaries satisfies this criterion; a directory diagram alone
does not.

### AC-005 — Staged compatible migration

- criterion_id: AC-005
- observable_success: The portable-format milestone and affected command, resource, host and recovery paths pass migration checks.

The portable-format milestone can be validated independently before any justified runtime
reorganization. The migration path covers current CLI commands and package entry points, relative
skill/contract resources, generated profiles, installation/update/recovery and version binding.
Every intentional behavior change is documented and remains within the approved UR/PRD.
Affected Codex, Claude Code, OpenCode and Copilot paths have regression evidence matched to the
selected changes. Failures identify a repair/retry or rollback path; unrelated work is preserved.

### AC-006 — Explicit profile capabilities

- criterion_id: AC-006
- observable_success: The profile matrix preserves existing capabilities and the public candidate remains skills-only.

Source, local/runtime and public-candidate outputs retain their documented purpose and capability
matrix. The public candidate remains skills-only in this scope. Local MCP support does not imply
ChatGPT remote capability; OpenAI app mappings, hooks or MCP files are included only for an existing
supported capability whose profile calls for them. Local/public display and prompt differences
continue to derive from the same canonical metadata and retain their applicable limits.

### AC-007 — Preserved control authority and activation

- criterion_id: AC-007
- observable_success: Target-local control, approval binding, offline validation, trust, consent and provenance remain intact.

Packaging or component relocation does not change request activation, gate sequence, deterministic
validation, revision-bound approval, target/run binding or repository-local `.agdf/control/`
ownership. Exact-version offline runtime validation, hook trust and user consent remain intact.
Existing state/provenance/approval/consent checks support the affected paths; no UI or manifest
becomes a second control store or permission authority.

### AC-008 — Evidence states remain distinguishable

- criterion_id: AC-008
- observable_success: Evidence reports distinguish repository, package, installed and fresh-host states and expose unverified gaps.

Repository, generated/packed output, installed payload and fresh-host observations are separately
identified with applicable version/digest, profile, host and date. Existing reports/documentation
show missing host evidence as unverified and never infer host acceptance from schema or build
success. A clean package claim requires exact-package evidence; host-support claims require their
corresponding observation. No active-user installation, release, publication or portal change is
part of this PRD acceptance.

### AC-009 — Maintainer navigation and recovery guidance

- criterion_id: AC-009
- observable_success: Checked documentation locates all five responsibilities and provides valid build, migration and recovery paths.

A maintainer can use the updated repository/package documentation to locate all five component
responsibilities, identify each canonical owner, follow supported profile build/validation and
existing installation paths, and find migration/recovery guidance. Documented paths and commands
are checked against the final source and actual output. Documentation clearly separates desired,
generated, validated, installed and host-recognized state.

The low-impact navigation/build/install semantics in sections 2–4 apply to AC-002, AC-005, AC-008
and AC-009: mode/source state, triggering build or existing install action, expected effective
state, feedback, failure and recovery are defined there. These criteria require observable output
and documentation/host evidence as appropriate; no new rendering or interactive UI is requested.

## 6. Non-Goals

- Staffing, team structure, policy authority or governance semantics changes.
- New panel/file editor, MCP Events, remote service, authentication or approval/write API.
- New public-candidate MCP/hooks/app capability or claiming unpublished ChatGPT support.
- Eager additional npm publications or compulsory directory names.
- Release/submission/deployment, active cache installation or commit/push/PR action.
- Transferred approvals, unrelated run closeout, historical-evidence rewrites or repair of unrelated workspace files.

## 7. Users And Roles

Arndt Gold is the PRD Owner and accountable maintainer for product/compatibility decisions.
Maintainers implement and review within the existing registered owners; CLI/MCP/host consumers
receive derived profiles. Human gate approval remains revision-bound. OpenAI and other host vendors
own their effective host/platform behavior; AGDF reports its evidence without deciding that state.

## 8. Constraints

Preserve approved canonical rules, target-local control and existing safety/consent/provenance
boundaries. Apply current official format documentation with versioned schema evidence. Reconcile
related public-distribution, payload-cleanup and host-compatibility work before shared-owner edits;
their approvals do not apply here. Preserve unrelated workspace changes and use existing generators,
validators and review routes. Source-layout normalization must not silently change capabilities or
make offline runtime depend on a new remote service.

## 9. Evidence Requirements

QA must map each stable criterion ID to concrete evidence. Require actual packaged-profile
schema/resource/inventory results, repeatable canonical projections, dependency and source-owner
mapping, relevant command/profile/install/recovery regression checks, and authority/provenance/
consent checks appropriate to changed paths. Label installed/fresh-host gaps explicitly. Versioned
external format input and compatibility mapping belong to the design evidence; document checks
must use final source/output. This PRD supplies acceptance, while SD and TP supply design and
tasks/scenarios without duplicating it.

## 10. Risks And Open Questions

Overlay precedence, default optional-file discovery and transport mapping can alter effective
capabilities. Moving source roots can break relative references and build scripts. Runtime
extraction can add release/version coupling. Current host acceptance may differ from documented
portable support. Related active work and pre-existing dirty workspace paths can affect shared
builders. SD/TP owners must resolve these through explicit mappings, coordinated baseline review
and proportionate regression evidence; none is permission to widen the scope.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Meaning of organization | before_prd | resolved | Package/directory and software responsibility organization; user explicitly excluded staffing interpretation | Arndt Gold |
| Migration order and capability scope | before_prd | resolved | Approved UR: portable-format first, then justified runtime boundaries; existing supported capabilities preserved; public candidate remains skills-only | Arndt Gold |
| Publication and active installation | before_prd | resolved | Approved UR excludes actual release, submission, active cache installation and VCS actions; deliver repository/package evidence here | Arndt Gold |
| Canonical root, projection precedence and optional-component mapping | later_sd | open | Design selects paths and mapping from current official format and consumer evidence; no path is pre-approved | Arndt Gold |
| Logical/runtime package extraction | later_sd | open | Design weighs actual dependencies and implements justified boundaries; independent publication is conditional, not a product requirement | Arndt Gold |
| Exact scenario/host evidence and migration task order | later_tp | open | Plan names affected consumers, baseline coordination, fixtures, hosts and rollback evidence within these acceptance criteria | Arndt Gold |

## 11. Next Step

Review this persisted PRD. A fresh bound presentation requests `Approval: PRD`.
That approval permits Solution Design drafting.

## AGDF Approval Summary (de; source=en)

- Umfang: Portables AGDF-Plugin mit gemeinsamer Identität und klarer Zuordnung von Plugin-Inhalt, Kontrollkern, CLI/Installation, MCP und Build. Zuerst das Plugin-Format, danach begründete Runtime-Grenzen.
- Nutzerziel: Maintainer finden Quellen und bauen das passende Profil. Bestehende Installation, Trust, Consent und Recovery bleiben erhalten; keine neue Oberfläche.
- AC-001: Tatsächliches Paket mit root plugin.json und skills/; portable und gegebenenfalls MCP-Schemata sind versioniert geprüft.
- AC-002: Alle deklarierten Ressourcen liegen vollständig und korrekt im Paket; unerlaubte oder unbeabsichtigt aktivierende optionale Dateien werden abgewiesen.
- AC-003: Pro Anliegen eine maßgebliche Quelle; Host- und Kompatibilitätsformate werden daraus reproduzierbar erzeugt, Registry und Verweise passen zur endgültigen Struktur.
- AC-004: Komponenten und Abhängigkeiten sind nachvollziehbar; neue eigenständige Pakete brauchen belegten Nutzen. Bestehende Veröffentlichungsgrenzen dürfen begründet bleiben.
- AC-005: Formatmigration zuerst prüfbar; Befehle, Paketidentitäten, Ressourcen, vier Hostpfade, Versionierung und Recovery sind durch Migration und relevante Regressionen abgesichert.
- AC-006: Profile und Fähigkeiten bleiben ausdrücklich getrennt; der öffentliche Kandidat bleibt Skills-only. Lokales MCP begründet keine ChatGPT-Unterstützung.
- AC-007: Aktivierung, Gates, revisionsgebundene Freigaben, Ziel-/Run-Bindung, lokale Control-Dateien, Offline-Validierung, Trust und Consent bleiben erhalten.
- AC-008: Quellcode-, Paket-, Installations- und frische Hostnachweise werden getrennt; fehlende Belege bleiben sichtbar. Keine aktive Installation oder Veröffentlichung in dieser Abnahme.
- AC-009: Dokumentation führt zu Quellen, Komponenten, Build, Validierung und bestehender Installation samt Migration/Recovery; Pfade und Befehle stimmen mit dem Ergebnis überein.
- Entscheidungen: Paketorganisation und gestuftes Vorgehen sind aus der freigegebenen UR geklärt. Konkrete Verzeichnisse, portable Feldzuordnung und zusätzliche Paketgrenzen entscheidet SD; Szenarien und Nachweisplan folgen in TP. Verantwortlich: Arndt Gold.
- Grenze: Keine Teams, Panels, Events, Remote-Dienste, neue öffentliche Fähigkeiten, Policy-Änderungen, Veröffentlichung oder VCS-Aktion. Freigabe dieser PRD erlaubt das Solution Design.
