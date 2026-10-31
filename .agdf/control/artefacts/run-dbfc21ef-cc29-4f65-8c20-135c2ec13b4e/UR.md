# UR: Discoverable MCP schemas and clear tool guidance

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-30
Owner: Repository maintainer

## 1. Problem

The current repository and installed AGDF 0.20.2 runtime share the affected MCP contracts. Codex exposes agdf_dispatch as an unknown intersection and loses parameter types in several write tools. The compact inspect guidance does not explain an executable help entry or conditional bindings clearly enough, and write-tool descriptions do not distinguish their effects. A separate repository-local agdf-cockpit-local registration still points to 0.14.5.

## 2. Goal

Agents can discover and correctly call the existing MCP functions from clear visible schemas and descriptions, preserving their validation and governance semantics. Remove the obsolete local cockpit registration and reassess the changed MCP behavior with explicit evidence boundaries.

## Affected Users

The maintainer and coding agents using AGDF MCP in Codex; other consumers of the shared MCP schemas must retain compatible validation.

## 3. Scope

- Correct schema shapes responsible for missing or unknown model-visible input types, including dispatch and affected write-tool envelopes and payloads.
- Restore concise actionable inspect guidance for operation selection, help, required target pairs and conditional Run/revision bindings.
- Give each write-tool group a distinct description of purpose, effect, prerequisites and approval boundary.
- Remove only the obsolete agdf-cockpit-local registration from the repository-local .codex/config.toml, preserving unrelated configuration.
- Regenerate affected derived artifacts through their existing owners where required.
- Recheck schema acceptance and rejection, MCP discovery and representative execution, and available model-visible signature rendering. Distinguish candidate/repository checks from an installed-host observation.
- Preserve the pre-existing unrelated worktree and staged changes.

## 4. Non-Goals

New governance permissions, weaker target or revision checks, new approval semantics, removal of retained historical runtime packages, unrelated installer changes, release/publication, commits or pushes, and automatic replacement of the installed plugin. A global host qualification is not implied by this repair.

## 5. Acceptance Signals

- The tested model-visible projection exposes dispatch fields and the affected known input types without losing them to schema projection; intentionally open data remains explicitly identified.
- Positive and negative validation checks preserve the original semantic restrictions, including invalid combinations, foreign fields, stale bindings and required identity fields in the covered paths.
- Inspect guidance supplies a complete valid help example and clearly identifies required parameter pairs and operation-specific bindings.
- Write-tool descriptions distinguish initialize, create, prepare/deliver, record, approve, revise and closeout.
- The effective repository-local configuration contains no agdf-cockpit-local registration.
- Focused MCP tests and applicable generation/budget checks pass, or concrete remaining failures and limits are reported.
- The final reassessment states what changed and what was actually verified; the existing installed session is not represented as updated without separate evidence.

## 6. Existing Source Of Truth

Canonical owners: packages/core/lib/skill-dispatch/contract.js, packages/core/lib/control-inspect/contract.js, packages/core/lib/control-state/run-command-schema.js, packages/mcp-server/src/server.js, existing MCP contract/protocol tests and generators. docs/architecture/04-mcp-schnittstellen.md documents the observed Codex root-allOf projection issue and prior inspect correction. .codex/config.toml owns the obsolete local registration. CONTRIBUTING.md and GOVERNANCE.md remain applicable.

## 7. Risks And Unknowns

Schema validation equivalence does not establish Codex signature visibility. Compact schema and packaged payload budgets must be respected. Reference expansion and discriminated branches may affect multiple hosts. Existing tool metadata in this chat may remain cached until a fresh connection; report that boundary instead of inferring installation failure. Unrelated concurrent edits must remain intact.

## 8. Next Step

Approve this bounded requirement with Approval: UR. Then perform the canonical Brownfield/Mode-Slice routing, implement the eligible corrections, run focused verification and reassess the MCP functions. No requested preview is needed.

## AGDF Approval Summary (de; source=en)

- Problem: Codex zeigt unvollständige AGDF-Parametersignaturen; knappe Hilfetexte erschweren korrekte Aufrufe. Zusätzlich ist ein alter lokaler Cockpit-Server registriert.
- Ziel: Maintainer und Coding-Agenten können die vorhandenen MCP-Funktionen aus verständlichen Signaturen und Beschreibungen korrekt nutzen.
- Umfang: Dispatch- und betroffene Schreibschemas korrigieren, Inspect-Hilfe mit gültigem Beispiel und Pflichtpaaren verbessern, Schreibwerkzeuge eindeutig beschreiben, agdf-cockpit-local aus .codex/config.toml entfernen und MCP-Funktionen erneut prüfen. Erforderliche Ableitungen entstehen über bestehende Generatoren; fremde Änderungen bleiben erhalten.
- Abgrenzung: Keine neuen Freigaben oder gelockerten Bindungen, keine Veröffentlichung oder Git-Aktionen, kein Löschen historischer Runtime-Pakete und kein automatischer Austausch des installierten Plugins.
- Abnahme: Bekannte Eingabetypen bleiben sichtbar; positive und negative Validierung bewahren die Regeln. Hilfetexte erklären gültige Aufrufe, Werkzeugzwecke sind unterscheidbar und der alte Konfigurationseintrag ist entfernt. Gezielte MCP-, Generierungs- und Budgetprüfungen dokumentieren Ergebnis und Grenzen.
- Verantwortung: Die bestehenden Core-Schema-Owner, MCP-Server, Tests und Generatoren bleiben maßgeblich; CONTRIBUTING.md und GOVERNANCE.md gelten weiter.
- Offen: Codex-Darstellung und Größenbudgets benötigen eigene Prüfung. Eine bestehende Sitzung kann alte Metadaten behalten. Kandidatenprüfungen werden von einem Nachweis des installierten Hosts unterschieden.
- Nächster Schritt: Approval: UR; danach geltende Brownfield-/Mode-Slice-Einordnung, Umsetzung, Tests und erneute MCP-Bewertung.
