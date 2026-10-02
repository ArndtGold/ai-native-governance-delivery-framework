# SD: Gemeinsamer Skillnamen-Katalog und stabile AGDF-IDs

Status: draft
Gate: SD
Gate approval: open
Based on: PRD.md, genehmigte allgemeine Hostfassung
Date: 2026-10-02
Owner: Codex
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Ein reiner Namensableiter im bestehenden Core-Bereich `skill-dispatch` berechnet aus der kanonischen Plugin-Definition pro Oberfläche exakt erlaubte Namen und deren bestehende Skill-ID. Dieser abgeleitete Index ist keine zweite persistierte Quelle. Die gemeinsame Dispatcher-Eingabevalidierung löst den übergebenen Namen auf denselben bestehenden Registryeintrag auf. Alle weiteren Schritte verwenden ausschließlich dessen `skill_id`.

Generatoren und globale Adapter verwenden denselben Namensableiter für sichtbare Namen und deklarierte Referenzen. Technische IDs, Dispatcherparameter und Contractreferenzen werden nicht als sichtbare Namen umgeschrieben. Die bestehende Target-/Run-/Gate-/Approvallogik bleibt vollständig zuständig.

## 2. Ownership And Source Of Truth

| Concern | Existing authoritative owner | Design responsibility |
|---|---|---|
| Kanonische IDs und Hostkonventionen | plugins/agdf/meta/agdf-plugin.definition.json; plugins/agdf/meta/agdf-agent-router.md | Vorhandene skillSet-Slugs, Plugin-ID, skillPrefix und globalSkillPrefix wiederverwenden; namespacefähige Codex-/Claude-Form aus vorhandener Plugin-ID ableiten |
| Namensableitung | Core skill-dispatch | Reiner gemeinsamer Helfer, etwa skill-names.js; aus der Definition abgeleiteter, hostgebundener Index |
| Registry und Normalisierung | packages/core/lib/skill-dispatch/contract.js und service.js | Bekannte Eingaben exakt auf kanonischen Registryeintrag auflösen; vor Target-/Governance-Evaluierung validieren |
| Produktionsressourcen | packages/core/lib/index.js und resources/context.js | createCoreServices bindet die konkrete vertrauenswürdige Plugin-Definition als Abhängigkeit der Dispatcherinstanz |
| Hostkontext | CLI validation-handlers.js; MCP mcp-dispatch-runtime.js | Bestehende Oberflächenbindung beibehalten; kein neues Modellargument für Präfix, Aliasliste oder Definition |
| Generierung | scripts/sync-package-assets.js | Explizite sichtbare Identität und UI-Verweise rendern; technische Referenzen unverändert halten |
| Globaler OpenCode-Adapter | packages/cli/lib/installers/opencode.js | Bestehende lokalen/globalen Formen aus demselben Helfer ableiten; pauschalen lokalen-zu-globalen Textersatz präzisieren |
| Recovery und Dokumentation | interaction-presentation.js; docs/architecture/02-dispatcher.md | Validierte bekannte Eingabeformen verständlich darstellen und Grenzen erklären |

## 3. Architecture Decisions

- SDD-001: Ein gemeinsamer reiner Namensableiter erzeugt pro Host aus der bestehenden Plugin-Definition exakte Name-zu-ID-Zuordnungen; rationale: Dispatcher, Generator und Adapter dürfen keine unabhängig gepflegten Aliaslisten haben; consequence: Alle Verbraucher verwenden denselben Helfer, während der kanonische skillSet unverändert die Quelle bleibt.
- SDD-002: Die Produktionsdispatcherinstanz erhält die Katalogdefinition über createCoreServices und seinen bestehenden Resource Context; rationale: Modellargumente dürfen weder Hostnamenregeln noch den tatsächlichen Skill-Katalog bestimmen; consequence: CLI und MCP benötigen keine neue öffentliche Eingabeschema-Eigenschaft, direkte Testinstanzen können die Definition ausdrücklich als Abhängigkeit injizieren.
- SDD-003: Exakte Auflösung erfolgt in der gemeinsamen Eingabevalidierung vor Target-/Governance-Evaluierung und liefert immer die kanonische ID; rationale: Aliasannahme darf den weiteren Ablauf und bestehende Fortsetzungen nicht verändern; consequence: Registry-/Normalisierungsschnittstellen werden intern erweitert, bestehende kanonische Aufrufe und öffentliche Ergebnisfelder bleiben kompatibel.
- SDD-004: Alias-/ID-Kollisionen, ungültige Definitionen und unbekannte Namen werden ohne heuristische Korrektur abgewiesen; rationale: Ein Name muss innerhalb der aufrufenden Oberfläche genau einen bestehenden Skill bestimmen; consequence: Recovery unterscheidet korrigierbare Eingaben vom zu reparierenden Katalog und verwendet nur validierte, bounded katalogeigene Namen.
- SDD-005: Hostprojektionen schreiben ausschließlich deklarierte sichtbare Identitäten und explizite UI-Verweise um; rationale: Pauschaler Backtick-/Pfad-/Substringersatz vermischt Hostnamen, IDs und Contractreferenzen; consequence: Copilot-, lokale OpenCode- und globale OpenCode-Projektionen werden präzisiert, Codex-/Claude-Quellnamen bleiben kanonisch.
- SDD-006: Dokumentation und Tests binden Aussagen an die geprüfte Evidenzebene; rationale: Source-/Paketparität beweist keine frisch geladene Hostinstallation; consequence: Alle Hostkonventionen werden deterministisch geprüft, Installation und Live-Host-UAT bleiben separat und ausgeschlossen.

## 4. Integration Points

### Exact host names

| Host | Definition-owned or existing convention | Accepted example for gate-check |
|---|---|---|
| Codex | Kanonischer Slug; Plugin-Namensraum aus definition.id | gate-check; agdf:gate-check |
| Claude Code | Kanonischer Slug; Plugin-Namensraum aus definition.id | gate-check; agdf:gate-check |
| Copilot | Kanonischer Slug; copilot.skillPrefix + Slug | gate-check; agdf-gate-check |
| OpenCode | Kanonischer Slug; opencode.skillPrefix und globalSkillPrefix + Slug | gate-check; agdf-gate-check; agdf-global-gate-check |

Die Beispiele sind keine Mappingquelle. Jede registrierte Form wird aus dem gleichen Katalogeintrag und seiner Hostregel berechnet. Identische Namen auf verschiedenen Hosts sind zulässig; fremde Formen werden nur akzeptiert, wenn sie für die aktuelle Oberfläche ebenfalls exakt registriert sind. Keine neue Hostkonvention, freie Präfixentfernung oder Groß-/Kleinschreibungskorrektur. Slash-UI-Aufrufzeichen gehören nicht zur Dispatcher-ID.

### Runtime flow

1. CLI oder MCP liefert den bestehenden Ausführungskontext; MCP surface kommt weiterhin aus trustedContext und ist kein Toolargument.
2. createCoreServices bindet die Resource-Context-Definition an den gemeinsamen Dispatcher. Direkte Core-Testaufrufe ohne deklarierte Hostkonvention bleiben kanonisch-only kompatibel; Aliasprüfungen injizieren die tatsächliche Definition.
3. Der bestehende Registrybuilder validiert kanonische Slugs und Dispatchmetadaten. Der abgeleitete Hostindex validiert Namen, eindeutige IDs und Kollisionen mit kanonischen IDs. Eine identische Form für dieselbe ID ist erlaubt, dieselbe Form für verschiedene IDs ist ein Katalogfehler.
4. normalizeSkillDispatchInput validiert surface und Eingabe, löst genau einen Namen auf und verwendet ausschließlich den kanonischen Registryeintrag. `skill_id`, Contractlookup, deterministischer Gatepfad und Fortsetzungsrouting tragen die kanonische ID.
5. Erst danach folgen die bestehenden Target-/Controlschritte. Unbekannte Eingaben oder ein defekter Katalog dürfen diese Schritte nicht erreichen.

### Projection boundary

Frontmatter `name`, deklarierte sichtbare Skilllisten und ausdrücklich als UI-Aufruf markierte Referenzen werden aus dem gemeinsamen Helfer gerendert. Technische Felder `skill_id`, CLI `--skill`, kanonische Slugs in Protokollbeschreibung und Runtime-Contractreferenzen bleiben unverändert. Anpassungen realer relativer Contractpfade erfolgen weiterhin über die bestehenden spezifischen Verzeichnisprojektionen; sie dürfen keine Skill-ID-Substringersetzung sein.

Wo bisher eine untypisierte Backtick-Erwähnung sowohl ID als auch sichtbare Skillreferenz sein könnte, wird die kanonische Quelle eindeutig gemacht: technischer Slug bleibt stabil, sichtbarer Verweis wird ausdrücklich deklariert. Ein kurzer generierter Identitätshinweis kann sichtbaren Hostnamen und kanonische ID nennen; er wird aus dem Katalog erzeugt. Doppelte Mappingtabellen und Hostsonderregeln im Modellprompt sind ausgeschlossen. Der Generator muss innerhalb der bestehenden Instruktions-/Payloadbudgets bleiben; nötige Quellenkompaktierung ist möglich, eine pauschale Budgeterhöhung nicht vorgesehen.

### Input recovery

Die vorhandene SkillDispatchInputError- und localized-Recovery-Struktur bleibt zuständig. Bei `skill_id` akzeptiert der Renderer katalogeigene Slug-/Namespacezeichen einschließlich Bindestrich und Doppelpunkt mit bestehenden Längen- und Zeilenumbruchsgrenzen; für andere Fehlerfelder bleibt die bestehende enge Grammatik unverändert. Die Liste gültiger Formen stammt ausschließlich aus dem validierten aktiven Hostindex. Katalogfehler erhalten eine bounded Repair-Aktion und keine erratene Aliasliste. Bestehende Localevorlagen werden wiederverwendet.

## 5. Constraints And Compatibility

Öffentliche Eingabe-/Ausgabefelder und Schema-/Contractversion bleiben unverändert; deren Beschreibung erklärt zusätzlich die erlaubten sichtbaren Formen. Kanonische IDs bleiben weiterhin auf allen unterstützten Hosts gültig. Der Namensableiter führt keine Datei-, Netzwerk-, Target- oder Governanceoperation aus. Keine Änderung an Request Activation, Hookautorität, Gatefreigabe, Runbindung, Persistenzschema oder Installation.

Der vorgefundene fremde Dirty Path `plugins/agdf/hooks/` bleibt unberührt. Änderungen an diesem Run und später genehmigten Codepfaden werden eindeutig getrennt. Regenerierte Dateien bleiben Ableitungen der bestehenden Quellen. Rollback ist die Rücknahme dieses scoped Diffs und erneute deterministische Generierung; keine Datenmigration oder externe Umstellung nötig.

## 6. Test And Evidence Strategy

TP definiert konkrete Kommandos und Nachweispfade. Zu prüfen sind alle skillSet-Einträge und Hostformen, kanonische Ergebnis-/Fortsetzungsparität, falsche Oberfläche, unbekannte/zusätzliche Präfixe, Namespacefehler, malformed Katalog und Alias-/ID-Kollisionen. Spies belegen, dass abgewiesene Eingaben keine Target-/Controlevaluierung auslösen. CLI-/MCP-Tests prüfen die gemeinsame Produktionsressourcenbindung und unresolved-target/non-authorizing-Semantik.

Projektionsprüfungen betrachten Codex, Claude, Copilot, lokale und globale OpenCode-Skills, sichtbares Frontmatter, UI-Referenzen, technische `skill_id`-/`--skill`-Referenzen und vorhandene Contractpfade. Paket-/Integritäts- und Instruktionsbudgetprüfungen belegen die deterministische Verteilung. Assertions werden nicht übersprungen oder zur Umgehung gelockert. Source-/Paketnachweise bleiben von Installation und frischen Hostbeobachtungen getrennt.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Hostindex löst alle registrierten sichtbaren Formen auf denselben Registryeintrag auf; gemeinsame Normalisierung verwendet dessen kanonische ID | Bestehender Core-Dispatcher-Owner; Plugin-Definition und contract.js | SDD-001, SDD-003 | Kanonische Formen bleiben gültig; alle Hosts und ausgelieferten Skills vollständig prüfen |
| AC-002 | Produktionskatalog kommt aus Resource Context; Helfer berechnet Namen aus Definition ohne persistierte Aliasliste | Core-Resources-Owner; index.js, resources/context.js und Plugin-Definition | SDD-001, SDD-002 | Modell kann keine Mappingregel setzen; bestehende direkte kanonische Testaufrufe kompatibel halten |
| AC-003 | Exakte aktive Hostzuordnung, Kollisionsvalidierung vor Target-/Governance-Evaluierung und katalogeigene Recoveryformen | Core-Registry- und Rendererowner; contract.js, service.js, interaction-presentation.js | SDD-003, SDD-004 | Namespaces erfordern bounded Erweiterung nur des skill_id-Wertegrundraums; keine pauschale Grammatiklockerung |
| AC-004 | Gemeinsame explizite Projektion sichtbarer Identitäten und Referenzen; technische IDs und Contractpfade bleiben kanonisch | Bestehender Generator-/Adapterowner; sync-package-assets.js, installers/opencode.js und kanonische Skills/Contracts | SDD-001, SDD-005 | Bestehende lokale/globale OpenCode-Unterscheidung erhalten; Instruktions-/Payloadbudget und referenzierte Dateien prüfen |
| AC-005 | CLI und MCP verwenden denselben Core-Service mit eingebundener Definition und bisherigem Host-/Targetkontext | Core-/Transportowner; index.js, validation-handlers.js und mcp-dispatch-runtime.js | SDD-002, SDD-003 | Keine neuen Toolargumente oder Target-/Approvalrechte; unresolved-target und authorizes false bleiben nachweisbar |
| AC-006 | Dispatcher-Dokumentation erklärt ID, Namen, Katalog und Hostbindung; scoped Nachweise weisen Source/Paket/Host getrennt aus | Dokumentations-/Testowner; docs/architecture/02-dispatcher.md und bestehende Tests | SDD-006 | Keine Veröffentlichung oder Live-Hostbehauptung aus deterministischen Tests |

## 8. Risks And Open Questions

Keine offene Designentscheidung vor TP. Die konkrete Gliederung des reinen Helfers, expliziter Projektionsmarker und der Testfixtures bleibt eine Implementierungswahl innerhalb dieser Grenzen. Falls bestehende Skilltexte nicht ohne neue Produkt-/Aktivierungssemantik typisierbar sind, wird der betroffene Teil vor Umsetzung an den frühesten zuständigen Gateowner zurückgeroutet. Keine akzeptierte zusätzliche technische Schuld; Exit ist ein einziger gemeinsamer Namensableiter ohne pauschalen ID-/Pfadersatz.

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Lösung: Ein aus der bestehenden Plugin-Definition berechneter Namenskatalog dient Dispatcher, Hostgeneratoren und globalen OpenCode-Adaptern gemeinsam. Sichtbare Namen auf Codex, Claude Code, Copilot und OpenCode werden exakt auf stabile interne AGDF-IDs aufgelöst.
- Zuständigkeit: Der bestehende Core-Dispatcher erhält die tatsächliche Definition aus seinem Resource Context. CLI und MCP behalten ihren Hostkontext; das Modell kann keine Präfixe, Aliaslisten oder Katalogdefinitionen übergeben.
- Grenzen: Kollisionen und unbekannte Namen scheitern vor der Zielevaluierung. Ergebnisse und Fortsetzungen tragen ausschließlich kanonische IDs. Generatoren ändern nur ausdrücklich deklarierte sichtbare Referenzen; technische Parameter und Contractreferenzen bleiben stabil.
- Kompatibilität: Bestehende kanonische Aufrufe, lokale/globale Hostnamen und Plugin-Namensräume bleiben gültig. Keine Änderung an Ziel-, Run-, Gate-, Freigabe-, Installations- oder Veröffentlichungsautorität.
- Nachweise: Das TP wird vollständige Host-/Skillparität, negative Namen-/Kollisionsfälle, unterdrückte Zielevaluierung, CLI-/MCP-Parität und alle generierten Profile samt Integritäts- und Instruktionsbudgets prüfen. Keine frische Hostbehauptung aus Quellcode-/Pakettests.
- Offen: Keine bindende Designfrage ist offen. Konkrete Helper-/Marker- und Teststruktur wird innerhalb des Designs umgesetzt; zusätzlicher Produkt- oder Aktivierungsbedarf würde vor Umsetzung eskaliert.
