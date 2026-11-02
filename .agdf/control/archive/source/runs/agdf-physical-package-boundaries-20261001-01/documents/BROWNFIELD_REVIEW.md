# Brownfield Review: Physische Core-/CLI-/MCP-Paketstruktur

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Decision: pass
Date: 2026-10-01

## Run

- run_id: agdf-physical-package-boundaries-20261001-01
- related_ur: UR.md, sha256:aba2ef0c688ce144a17e329c73b2c59baabc9fa89fb1f267fea2b3a9c0f7381d
- reviewed_revision: 3 / 99566c3c-94f6-4e0c-bd11-b39b9e01cb9b
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-01
- decision_scope: Bestehendes System verstanden und für PRD geroutet; keine Implementierungs-, QA- oder Release-Freigabe.

## Objective

Den verbindlichen Zielbaum mit `plugins/agdf/`, `packages/{core,cli,mcp-server}/`, `docs/`, `evals/` und `scripts/` physisch und durch tatsächliche Verantwortungsgrenzen erreichen. Kontrollregeln bleiben bei einem Owner; npm-Namen, öffentliche Exports, Offline-Betrieb und Consent-/Freigabeautorität bleiben kompatibel.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Quell-, Paket- und Buildorganisation ändern sich; bestehende Benutzerbefehle, Statuskarten, Setupwahl und Zustandssemantik müssen erhalten bleiben. Eine neue UI ist ausdrücklich ausgeschlossen.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Bestehende Befehle und Gates; kanonische Pluginverträge | `plugins/agdf/meta/contracts/`, `create-agdf/lib/cli/command-registry.js`, genehmigte UR | low: Erhalt, keine neue Fähigkeit |
| Source of truth | Plugindefinition/Verträge/Templates in `plugins/agdf/`; Implementierung noch im Mischpaket | `.agdf/control/SOT_REGISTRY.md`, `docs/architecture/package-structure.md` | high: tatsächliche Code-Owner und aktive Pfadreferenzen ändern sich |
| Runtime path | `create-agdf/lib/control-{state,evaluation,inspect}/`, `skill-dispatch/`, `runtime/`; CLI-Komposition; MCP-SDK-Adapter | `evidence/DEPENDENCY_INVENTORY.json`, `runtime/validator-application.js`, `agdf-mcp-server/src/server.js` | high: gemeinsamer Kern und separat erzeugte Host-Runtimes |
| UI / UX | Bestehende Interaktionsprojektion und Install-Setup | `interaction-presentation.js`, `install-setup/`, Plugin-Locale-Metadaten | none: Verhalten erhalten |
| Persistence / data | Kontrollzustand, Revision/Seals, Transaktionen, Recovery; Installer-Daten separat | `control-state/`, `installers/`, `mcp-lifecycle/` | high: Dateipfadbindung und Recovery müssen trotz Codeumzug erhalten bleiben; keine Datenmigration gefordert |
| Tests / QA | Vorhandene CLI-, Runtime-, Paket-, Installer-, Provenance- und Host-Kompatibilitätstests | `create-agdf/package.json`, `agdf-mcp-server/package.json`, `evals/` | high: reale Verbraucher und erzeugte Profile prüfen |
| Release / operations | Drei öffentliche Pakete und gekoppelte Veröffentlichungsreihenfolge | `.github/workflows/publish-agdf.yml`, `create-agdf/lib/release/`, Root- und Paketskripte | high: Build-, Archiv-, Versions- und historische Pfadbindung |

Die statische AST-Inventur betrachtet 203 Quelldateien und 583 lokale Importkanten; in diesem begrenzten Graphen wurden keine Importzyklen gefunden. Das beweist weder dynamische Laufzeitfreiheit von Zyklen noch bereits saubere Paketgrenzen. Die zunächst von Kontrollzustand, Evaluatoren, Inspektion und Dispatch ausgehende Kern-Closure enthält zwei Kanten in `cli/`: Inspektion → Vertragsleser → CLI-Runtime-Kontext. Diese Seed-Auswahl ist ein Analyseinstrument, keine vorweggenommene abschließende Core-Zuordnung.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Tatsächliche Ausführungs-/Metadaten-Owner, öffentlich konsumierte Fassade, Offline-Komposition und gekoppelte Paket-/Host-Artefakte müssen auseinandergezogen und gemeinsam migriert werden.
- architecture_evidence: `evidence/BASELINE.json`, `evidence/DEPENDENCY_INVENTORY.json`; konkrete Owner in der folgenden Tabelle.
- architecture_missing_evidence: none für die Tiefenentscheidung. Genaue Exportgestaltung, Metadaten-Injektion, Archivzusammenstellung und Migrationsfolge sind erforderliche SD-/TP-Entscheidungen, keine unbekannten Tatsachen über die heutige Volltiefenwirkung.
- architecture_next_owner_and_action: Bestehende Kontroll-, CLI-, MCP- und Build-Owner werden in SD einer prüfbaren Paketgrenze zugeordnet; Codex bereitet vor, Arndt Gold entscheidet am SD-Gate. Vor TP-Freigabe und erneuter Brownfield Analysis keine Umsetzung.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Core-nahe Vertragsleser unter CLI und Offline-Komposition mit CLI-Abhängigkeiten | `control-inspect/service.js` → `cli/contract-command.js`; `runtime/validator-application.js` → CLI-Handlers/Parser/Registry | warn | Bestehende Vertragsprüfung wiederverwenden; in SD reinen Kern und CLI-Komposition trennen. Kein zweiter Regel- oder Approval-Owner. |
| problem: Core-Metadaten implizit an heutige Paketverzeichnisse gebunden | `runtime/control-context.js` liest bei Import `generated/plugins/agdf/meta/`; `cli/runtime-context.js` erweitert diesen Owner | warn | SD: explizite kompatible Ressourcenauflösung und eine Metadatenprojektion festlegen; Root-Tiefe nicht blind umschreiben. |
| problem: Öffentliche `create-agdf`-Exports und MCP-Provenance tragen bisherige Paketidentität | `create-agdf/package.json`, `mcp-dispatch-runtime.js`, `agdf/bin/agdf.js`, `agdf-mcp-server/package.json` | warn | Bestehende API/Fassade bewahren; SD entscheidet private Core-Grenze und Paketassemblierung unter Erhalt der drei npm-Namen/exakten Bindungen. |
| problem: Offline-/Claude-/Copilot-Runtimes werden aus gemischtem Paket komponiert | `scripts/sync-plugin-runtime.js` im bisherigen Paket; private Bundle-Identität `@agdf/local-validator-runtime`, Einträge unter `runtime/create-agdf` | warn | Build-Owner unter Root `scripts/`; explizite Quell→Bundle-Zuordnung und Ausschluss unerlaubter Installer-/SDK-Inhalte prüfen. Interner Installationspfad darf kompatibel bleiben, ist kein kanonischer Quellspiegel. |
| problem: Installer und Releases setzen alte Paket-Root-Nachbarschaft voraus | `installers/local-development.js`, lokale Installerskripte, `publish-agdf.yml`, Release-Version-Coherence | warn | Bestehende Install-/Release-Owner refaktorieren; SD/TP plant gemeinsamen Cutover, echte npm-Archive, Fehler- und Rückweg. |
| problem: Aktive und historische Pfadreferenzen haben verschiedene Bedeutung | `release/profile-history.js` liest `create-agdf/package.json` aus unveränderlichen Git-Tags | warn | Historische Archive über explizite historische Pfadauflösung lesen; historische Artefakte nicht nachträglich umschreiben. Aktive alte Owner nach Migration entfernen. |
| problem: Zielbaum und aktiviertes Profil dürfen nicht verwechselt werden | `public-plugin/manifest.js`, `plugins/agdf/plugin.json`, erzeugte Codex-/Claude-/Copilot-Konfiguration | warn | PRD erhält bestehende Profilfähigkeiten; SD zeigt MCP-/Hook-Dateien je Profil oder begründete sichtbare Abweichung vor Abnahme. Keine neue öffentliche MCP-Fähigkeit durch Verschieben. |

Reuse strategy: `refactor` vorhandener Kern-/CLI-/Adapter-Owner und `extend` vorhandener Build-/Grenzprüfungen. Keine Greenfield-Neuimplementierung. Neue interne Package-Metadaten dürfen die bestehenden Implementierungen bündeln, ohne parallele Policy- oder Zustandslogik.

Retained debt: not_applicable. Diese Review akzeptiert keine dauerhafte Rückabhängigkeit oder zweite Quelle. Die Probleme sind zu beseitigende Migrationsarbeit; ihr technischer Lösungsweg gehört in SD. Falls SD eine verbleibende Schuld oder Zielabweichung vorschlägt, sind Grund, accountable owner, Mitigation und endliche Exit-/Review-Bedingung vor Akzeptanz nötig. Bis dahin bleibt sie offen und kann keinen späteren Gate-Pass tragen.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: architecture_runtime_depth — Kern, CLI-Komposition, MCP-Fassade und Offline-Runtime ändern ihre Ausführungs- und Ressourcenbindung; zusätzlich release_cross_host_depth durch koordinierten Build-/Paket-/Profil-Cutover. `structured_slice` ist abgelehnt, weil eine isolierte Umbenennung ohne Verbraucher-/Runtime-Migration das genehmigte Ergebnis nicht erfüllt.
- evidence: Diese Review, `evidence/BASELINE.json`, `evidence/DEPENDENCY_INVENTORY.json`, `publish-agdf.yml`, `sync-plugin-runtime.js`, `mcp-dispatch-runtime.js`.
- transparency_note: Quick/Compact und Verified Change zuerst geprüft: nicht geeignet wegen verbindlicher Architektur-/Runtime- und Release-Wirkung. Vollständige PRD/SD/TP sind erforderlich; Anzahl Dateien, Owner oder Imports entscheidet die Tiefe nicht.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: architecture_runtime_depth
- decisive_full_depth_triggers: Architecture or runtime; Release, deployment or cross-host; External or public contract durch gekoppelte Consumer-/Versionsmigration bei unveränderter API-Semantik.
- rejected_alternative: structured_slice; Ressourcen-/Runtime-/Archiv-/Consumer-Cutover kann nicht als unabhängig akzeptierbare lokale Quellordnerumbenennung abgenommen werden.
- missing_or_conflicting_facts: none für Routing. Designentscheidungen unten bleiben ausdrücklich bis SD/TP offen.
- depth_evidence_refs: Bestehende Owner-Tabelle; `evidence/BASELINE.json`; `evidence/DEPENDENCY_INVENTORY.json`; genehmigte UR; `plugins/agdf/meta/contracts/modes.md`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Ein vollständiger physischer Zielbaum mit kompatiblen Verbrauchern ist ein zusammenhängendes, abnehmbares Ergebnis (UR §§2–5). |
| authority_boundary | pass | Bestehende kanonische Verträge und Kontrollzustands-Owner sind bekannt; keine neue Trust-/Policy-/Freigabeautorität wird eingeführt (UR §4). |
| owner_consumer_coordination | fail | Öffentliche `create-agdf`-Exports, exakt gebundener MCP-Server und CLI-Fassade müssen mit Archiv/Runtime/Installer gemeinsam umgestellt werden. |
| full_depth_impacts_absent | fail | `control-context`, Offline-Komposition und Veröffentlichungsworkflow belegen bereits nichtlokale Runtime-/Releasewirkung. |
| migration_propagation_bounded | fail | Kompatibilität umfasst Quellpakete, erzeugte Hostprofile, npm-Archive und historische Release-Leser; lokales Zurückbenennen alleine stellt diese Verbraucher nicht konsistent wieder her. |
| failure_recovery_local | fail | Profil-/Archiv-Provenance und Install-/Release-Abhängigkeiten müssen gemeinsam zurückführbar bleiben; Rückweg gehört in SD/TP. |
| independently_acceptable | fail | Eine vorgeschlagene lokale Slice-Umbenennung versteckt die erforderliche Kernextraktion und Consumer-Migration als spätere Voraussetzung und erfüllt UR-Signale 1–5 nicht. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Produktziel verbindlich physisch, keine neue Fähigkeit, drei npm-Namen erhalten, keine Publikation oder aktive Installation allein aus dieser Migration? Bereits durch genehmigte UR beantwortet. | PRD | warn: als konkrete Abnahmekriterien übernehmen |
| Welche internen Exports und Ressourcen-Provider lösen Core→CLI-Kanten, ohne Zustands-/Vertragslogik zu duplizieren? | SD | revise vor SD-Freigabe; Core-/CLI-Owner |
| Wie wird `packages/core/` privat/assemblierbar gehalten und wie bedienen die drei veröffentlichten Identitäten weiterhin ihre Exports? | SD | revise vor SD-Freigabe; Paket-/Release-Owner |
| Welche MCP-/Hook-Pfade realisieren die bestehenden Profilfähigkeiten; wo ist eine technisch begründete sichtbare Zielbaumabweichung nötig? | SD | revise vor SD-Freigabe; Profil-/Build-Owner, Akzeptanz Arndt Gold |
| Welche Reihenfolge und konkreten Archiv-/Regression-/Hostnachweise sichern Cutover/Rückweg? | TP | revise vor TP-Freigabe; CLI-/Release-/QA-Owner |

## Concurrent Work And Baseline

`evidence/ACTIVE_RUN_INVENTORY.json` dokumentiert die per Doctor erfassten aktiven Runs. Doctor meldet aggregiert 62 Warnungen, keine revise/block; das ist Integritätsinventar, keine QA-/Lifecycle-Freigabe. Run-State-Felder sind explizit rohe gespeicherte Werte, keine neu ausgewertete Gate-Entscheidung.

Der vorherige Pluginstruktur-Run bleibt separat aktiv, Revision 27 / `285b69c8-bafb-4801-8877-9dd8ee3ad4bd`, gespeichertes Gate QA. Er ist Baseline; seine Freigaben und offenen Host-/Abnahmenachweise werden nicht übertragen. Andere aktive Installations-, Payload-, Routing- und Compatibility-Scopes teilen Implementierungs-Owner; ihre Reports belegen keine Sperre dieser Planungsarbeit. Vor Umsetzung müssen die betroffenen Quellen und Revisionen erneut verglichen werden.

`evidence/BASELINE.json` hält HEAD, Paketmanifeste, Quellhashes und Workspace-Status fest. Die fünf bereits staged und inzwischen entfernten `control-state/* 2.js`-Kopien gehören zur vorherigen Arbeit; keine Indexbereinigung in diesem Run. Bestehende Fremdänderungen bleiben erhalten. Kein Test, Build, Host-Install, Commit oder Publish wurde durch diesen Review als Implementierungsnachweis ausgeführt.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-NATIVE-INTERACTION-AUTHORITY, CG-TASK-TARGET-AUTHORITY, vorhandener Install-/Runtime-Kontext in `.agdf/control/CONTEXT_GRAPH.md`.
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Bestehende Nodes enthalten aktive `create-agdf/`-Build-/Runtime-Referenzen; tatsächlicher Owner-Wechsel ist noch nicht umgesetzt. SD/TP benennt die nötigen kuratierten Referenzupdates; Abschluss prüft aktualisierte SoT-/Context-Graph-Pfade. Kein automatisch neuer Architektur-Node, kein paralleles Reviewprotokoll im Graph.

## Next Permissible Step

- next_allowed_action: Review und Mode/Slice über `run-step --step route` gemeinsam versiegeln, dann PRD mit prüfbaren Kriterien vorbereiten und für eine neue `Approval: PRD` präsentieren.
- forbidden_until_then: PRD vor kanonischer Route; SD vor neuer PRD-Freigabe; TP vor neuer SD-Freigabe; Quell-/Buildimplementierung vor neuer TP-Freigabe und positiver pre_implementation_analysis.

## Quality Outlook

Routing: pass. Die bekannten Owner erlauben eine belastbare Volltiefenplanung; bestehende Rückabhängigkeiten werden nicht als fertige Paketgrenze akzeptiert. Spätere QA benötigt Import-/Ownership-Grenzen, echte Paket-/Profilnachweise, kompatible Verbraucher, Fehler-/Recovery-Evidenz und sichtbar begrenzte Host-Aussagen.
