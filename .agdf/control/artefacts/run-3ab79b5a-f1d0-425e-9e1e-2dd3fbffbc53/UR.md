# UR: Plugin defaults and validated MCP configuration resolution

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-30
Owner: Repository maintainer

## 1. Problem

AGDF MCP calls repeatedly require stable presentation settings and technical envelope values. The project already owns .agdf/control/config.json, but its language preferences do not remove the explicit MCP presentation_language requirement. Defaults and fallback behavior are currently distributed across resource code and existing plugin metadata. Moving arbitrary parameters into global configuration would risk confusing preferences with target authority, current Run bindings or deliberate user actions.

## 2. Goal

Maintain configurable defaults as versioned JSON in the canonical plugin, reuse the existing project configuration for project choices, and resolve eligible settings consistently before Core execution. Reduce repeated agent-supplied technical values while retaining AGDF's required governance complexity and making effective values and their origin understandable.

## Affected Users

The maintainer configuring AGDF projects and coding agents using the shared MCP interfaces, initially observed in Codex CLI. Existing CLI and other host consumers of the shared configuration and contracts must retain compatible behavior; native support claims remain bound to separate evidence.

## 3. Scope

- Classify existing parameters into configurable preferences, adapter-supplied context/constants and operation-specific authority/state. Define the exact supported configuration keys and their owners through the subsequent delivery stages.
- Store the configurable plugin defaults in one canonical, versioned JSON source shipped through the existing generators. Use .agdf/control/config.json for project overrides. Preserve the separate existing locale registry and contract constants rather than duplicating their ownership.
- Provide one shared, validated resolution path with precedence: a valid explicit request/call value, then the applicable project setting, then the plugin default. Preserve an explicit current-request language choice and the distinction between chat/presentation and artefact language.
- Cover language/presentation preferences and assess the existing presentation delivery route and status variant for eligible configuration. Adapter-managed constants and the actual execution directory may be supplied technically; they are not user-tunable authority settings.
- Allow supported stable settings to be omitted from agent-facing calls when the resolver can supply them unambiguously. Hand complete validated effective values to the existing Core owners and make the selected source observable through the existing inspection/help surfaces.
- Preserve existing valid project values and explicit call behavior. Regenerate affected surfaces and document the settings, precedence, errors and compatibility boundary. Add focused checks for the resolution matrix and model-visible MCP guidance.

## 4. Non-Goals

No configurable default approvals, implementation permission, target selection/provenance, Run identity, expected revision, presentation identity, source digest or confirmation reply. No new automatic-check consent, relaxed hard limits, implicit control activation, new parallel configuration hierarchy, generic schema redesign, Cockpit redesign, unrelated installer fixes, release, publication, installation or Git actions. No UI preview was requested.

## 5. Acceptance Signals

- Each eligible setting has one canonical default, a documented project override and defined explicit-call precedence. Existing valid project configuration remains usable and is preserved by plugin updates.
- Supported omitted settings resolve deterministically; explicit valid values override defaults. Present invalid configuration produces an actionable diagnostic instead of being silently ignored. Missing project control is still missing control.
- Effective settings and their provenance are inspectable. Independent projects and concurrent sessions cannot inherit each other's settings. Approved/presented decision bindings retain their original effective language and identity.
- The adapter can supply fixed protocol values and execution context without making them configurable or treating cwd as target authority. Operation UUIDs retain their original identity during replay; Run/revision/digest/approval checks remain mandatory.
- Focused tests cover explicit/project/plugin precedence, omission, invalid input, old valid configurations, language overrides, project separation and unchanged authority/replay boundaries. MCP help/discovery explains the resulting inputs. Repository checks and installed-host observations are reported separately.

## 6. Existing Source Of Truth

Project configuration: .agdf/control/config.json. Existing resolution and validation: packages/core/lib/resources/context.js, language-preference.js and control-state/control-configuration.js. Canonical plugin metadata and locales: plugins/agdf/meta/agdf-plugin.definition.json and agdf-interaction-locales.json. MCP owners: Core dispatch/inspect/command contracts and packages/mcp-server/src/server.js. Existing sync-package-assets and package assembly own derived distributions. CONTRIBUTING.md and GOVERNANCE.md remain applicable.

## 7. Risks And Unknowns

Brownfield Review must assess contract and architecture impact before selecting Mode/Slice. PRD/SD must settle the exact eligible key inventory, defaults-file/schema location, compatible omission semantics, project binding before configuration access and how setting provenance is exposed. These are downstream specification/design decisions; the requested outcome and authority exclusions are settled. Existing language fallback, immutable presentations, payload budgets and multi-host resource packaging require explicit consideration. Preserve all unrelated staged/unstaged work. This Run is separate from the completed MCP discovery repair and does not reopen its approvals.

## 8. Next Step

Review this bounded UR and approve only with Approval: UR. Then perform the canonical Brownfield Review and Mode/Slice decision before the required PRD/SD/TP stages or any eligible implementation. No further gate, Git, installation or release approval is inferred from creating this Run.

## AGDF Approval Summary (de; source=en)

- Problem: Stabile Einstellungen und technische Werte werden in MCP-Aufrufen wiederholt angegeben. Die vorhandene Projektkonfiguration ersetzt diese Angaben bisher nicht durchgängig; Vorgaben und Fallbacks liegen an mehreren Stellen.
- Ziel: Maintainer und Coding-Agenten erhalten zentral gepflegte Plugin-Defaults, wirksame Projekteinstellungen und nachvollziehbar aufgelöste MCP-Werte. Die notwendige Governance-Komplexität bleibt erhalten.
- Umfang: Geeignete Parameter klassifizieren; eine versionierte JSON-Quelle im Plugin ueber die bestehenden Generatoren ausliefern; .agdf/control/config.json für Projektwerte wiederverwenden. Reihenfolge: gültige explizite Angabe, Projektwert, Plugin-Default. Sprache und Darstellung betrachten; Konstanten und Ausführungskontext technisch ergänzen. Geeignete stabile Angaben dürfen bei eindeutiger Auflösung entfallen. Hilfe, Dokumentation und gezielte Prüfungen aktualisieren.
- Abgrenzung: Keine konfigurierbaren Freigaben, Ziele, Run-/Revisionsbindungen, Digests oder Bestätigungen; keine neuen automatischen Rechte, gelockerten Grenzen oder implizite Projektaktivierung. Keine parallele Konfiguration, Cockpit-Neugestaltung, fremden Installer-Änderungen, Installation, Git-Aktionen oder Veröffentlichung. Kein Preview beauftragt.
- Abnahme: Eindeutige Defaults und Vorrangregeln, Erhalt gültiger Projektwerte, sichtbare Diagnose ungültiger Einstellungen und prüfbare wirksame Werte samt Herkunft. Projekttrennung, bestehende Präsentationen, explizite Sprachwünsche und Replay-/Freigabebindungen bleiben korrekt. Nachweise unterscheiden Repository-Prüfungen und native Host-Beobachtungen.
- Verantwortung und offene Ausgestaltung: Bestehende Core-Resolver, Projektkonfiguration, Plugin-Metadaten, Locale-Registry und Generatoren bleiben die Ausgangspunkte. Brownfield Review klärt Auswirkungen und Delivery-Pfad; PRD/SD bestimmen die genaue Schlüsselliste, Dateistruktur und kompatible Auflösung. CONTRIBUTING.md und GOVERNANCE.md gelten weiter; fremde lokale Änderungen bleiben erhalten.
- Nächster Schritt: Approval: UR; danach Brownfield Review und Mode/Slice, anschließend die erforderlichen weiteren Stufen. Die Run-Anlage genehmigt keine Umsetzung oder spätere Freigabe.
