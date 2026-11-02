# TP: Fachliche MCP-Schnittstellen als Zielbild

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-09-29
Owner: Arndt Gold (AGDF maintainer)
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Ist-Verträge und Zuständigkeiten an ihren kanonischen Quellen prüfen; Referenzen und Statusaussagen für das Zieldokument festhalten. | AGDF maintainer | Approved SD |
| T-002 | Nicht-normatives deutsches Zieldokument mit Statuskennzeichnung, Kandidatenfamilien, Autoritätsgrenzen, Primitive-Vergleich, offenen Fragen und Entwicklungspfad erstellen. | AGDF maintainer | T-001 |
| T-003 | Architekturübersicht um den relativen Link und den Hinweis auf den nicht-normativen Status ergänzen. | AGDF maintainer | T-002 |
| T-004 | Dokument und Übersicht manuell gegen alle Kriterien, Quellen, Links und Scope-Grenzen prüfen; Befunde als QA-Evidenz sichern. | AGDF maintainer | T-002, T-003 |

## 2. Verification Traceability

Jede Zeile verbindet ein PRD-Kriterium mit der dafür vorgesehenen SD-Entscheidung und einem prüfbaren Szenario. Die Nachweise entstehen bei Umsetzung und Review; dieses TP behauptet keine bereits erfolgte Prüfung.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-STATUS-LABELS | Statuslegende und Abschnitte unterscheiden sichtbar `implemented`, `decided`, `candidate` und `open`; ein Kandidat erscheint an keiner Stelle als verfügbar. | Manuelle Sichtprüfung von `docs/architecture/mcp-target-architecture.md`; Kriteriennotiz in QA-Evidenz. |
| AC-002 | SDD-002 | T-001 | SCN-CURRENT-OWNERS | `agdf_dispatch` und `agdf_inspect` sind als aktuelle Werkzeuge belegt und jeweils mit den passenden kanonischen Verträgen und Services verlinkt. | Quellenvergleich mit `create-agdf/lib/skill-dispatch/contract.js`, `create-agdf/lib/control-inspect/contract.js`, `selection.js` und Linkziele im Zieldokument. |
| AC-003 | SDD-002 | T-002 | SCN-CAPABILITY-MATRIX | Alle vier Kandidatenfamilien enthalten Zweck, explizite Bindung, Ergebnis, Nebenwirkungen und Fehlerverhalten; wo ein Verhalten nicht belegt ist, wird es als offen markiert. | Manuelle Vollständigkeitsprüfung der Fähigkeitsmatrix gegen AC-003 und SD. |
| AC-004 | SDD-002 | T-001 | SCN-AUTHORITY-BOUNDARY | Host, Mensch, MCP-Adapter, Policy-/Gate-Evaluation und Run-State haben jeweils einen benannten Verantwortungsbereich; die Adapterebene weist sich keine Policy- oder Freigabehoheit zu. | Quellenvergleich mit `plugin/meta/contracts/`, `create-agdf/lib/control-evaluation/`, `create-agdf/lib/control-state/` und `CG-MCP-DISPATCH-ADAPTER`; Reviewnotiz. |
| AC-005 | SDD-004 | T-002 | SCN-CONDITIONAL-WRITE | Zustandsänderungen sind ausdrücklich bedingt; Ziel, Run, Gate, Revision, Digest und bewusste host-verifizierbare menschliche Entscheidung sind Voraussetzungen. Der Negativfall „keine sichere aktuelle Schreib-API belegt“ wird nicht als vorhandene Fähigkeit dargestellt. | Manuelle Prüfung des Abschnitts zu Zustandsänderungen gegen SD und `plugin/meta/contracts/`; explizite Suche nach unbelegten Verfügbarkeitsbehauptungen. |
| AC-006 | SDD-003 | T-002 | SCN-PRIMITIVE-COMPARISON | Tools, Resources und Prompts werden mit möglichen Rollen verglichen; jede Zuordnung bleibt als Vorschlag gekennzeichnet und behauptet keine Host-Unterstützung oder Registrierung. | Manuelle Prüfung der Vergleichstabelle, Statuslabels und Quellenangaben im Zieldokument. |
| AC-007 | SDD-001 | T-002 | SCN-EVOLUTION-BASELINE | Der Entwicklungspfad belässt aktuelle Verträge unverändert, bis ein separat freigegebener Scope kanonischen Owner, Vertrag, Kompatibilität und Evidenz aktualisiert. | Prüfung des Migrationsabschnitts gegen bestehende Vertragslinks und die genehmigte SD. |
| AC-007 | SDD-004 | T-002 | SCN-EVOLUTION-WRITE-GATE | Der Entwicklungspfad behandelt künftige schreibende Fähigkeiten als eigene Entscheidung; ohne exakte Bindung und belastbaren Freigabekanal erfolgt keine Behauptung einer zulässigen Zustandsänderung. | Prüfung der Voraussetzungen und offenen Punkte im Migrationsabschnitt gegen SDD-004. |
| AC-008 | SDD-001 | T-003 | SCN-OVERVIEW-LINK | `docs/architecture/README.md` enthält einen funktionierenden relativen Link zum neuen Dokument und bezeichnet es als nicht-normatives Zielbild; aktuelle Verträge bleiben maßgeblich. Der Fehlerfall eines veralteten oder falsch aufgelösten Links wird beim manuellen Linkcheck erfasst. | Manuelle Linkauflösung von `docs/architecture/README.md` zu `docs/architecture/mcp-target-architecture.md`; Reviewnotiz. |
| AC-009 | SDD-001 | T-004 | SCN-SCOPE-BOUNDARY | Diff und Dateiliste enthalten nur das Zieldokument und die Ergänzung der Architekturübersicht; keine Runtime-, Schema-, Gate-, Kontrollzustands-, Host- oder Release-Datei wird verändert. | `git diff --name-only` und abschließende Diff-Prüfung; dokumentierte Scope-Prüfung in QA-Evidenz. |

## 3. Test Plan

- Keine automatisierten Runtime- oder Protokolltests: Der freigegebene Slice ändert keine ausführbare Komponente.
- Manuelle Quellenprüfung der Implementierungsbehauptungen gegen die in SD genannten kanonischen Dateien und Services.
- Manuelle Kriterienprüfung AC-001 bis AC-009 anhand der Szenarien in Abschnitt 2.
- Relativen Link aus `docs/architecture/README.md` sowie interne Links im neuen Dokument auf korrekte Auflösung prüfen.
- Diff- und Dateilistenprüfung auf den genehmigten Dokumentationsumfang begrenzen.
- Keine Live-Host- oder Discovery-Aussage aus dieser Dokumentationsprüfung ableiten.

## 4. Brownfield Scope

Vor der Umsetzung sind mindestens diese bereits bestehenden Quellen zu prüfen und im Zieldokument zu verlinken:

- `plugin/meta/contracts/` für Request-Aktivierung, Zielbindung, Gate und Autoritätsgrenzen.
- `create-agdf/lib/skill-dispatch/contract.js` für den aktuellen `agdf_dispatch`-Vertrag.
- `create-agdf/lib/control-inspect/contract.js` und `selection.js` für den aktuellen `agdf_inspect`-Vertrag.
- `create-agdf/lib/control-evaluation/` für kanonische Gate- und Kontrollauswertung.
- `create-agdf/lib/control-state/` für Run-State und Revision.
- `docs/architecture/README.md` als bestehende Navigations- und Architekturübersicht.
- `CG-MCP-DISPATCH-ADAPTER` im Context Graph als vorhandene Architekturquelle, sofern der Eintrag im Checkout auflösbar ist; fehlende oder veraltete Evidenz wird als offen gekennzeichnet.

## 5. Out Of Scope

- Neue, geänderte oder entfernte MCP-Tools, Schemas, Resources, Prompts oder Registrierungen.
- Änderungen an Runtime, CLI, Skills, Host-Setup, Gate-Policy, Run-State, Release oder generierten Paketen.
- Eine produktive Schreib- oder Approval-API sowie die Behauptung, ein host-verifizierbarer Approval-Kanal existiere bereits.
- Festlegung endgültiger Capability-Namen oder einer verbindlichen Tools/Resources/Prompts-Zuordnung.
- Live-Host-UAT oder Aussagen zur tatsächlichen Discovery und Ausführung auf einem bestimmten Host.

## 6. Risks And Blockers

- Eine Quellenabweichung zwischen Architekturtext und kanonischem Vertrag blockiert die betreffende Ist-Aussage, bis sie korrigiert oder ausdrücklich als offen markiert ist.
- Nicht auflösbare interne Links oder ein fehlender Overview-Link führen zu revise.
- Kandidatennamen, die wie verfügbare API-Aufrufe erscheinen, oder eine unklare Statuskennzeichnung führen zu revise.
- Eine Scope-Ausweitung in Runtime, Schema, Policy, Zustand, Host oder Release blockiert die Umsetzung, bis sie separat genehmigt ist.
- Unklare Schreibautorisierung muss als offene Voraussetzung stehen bleiben; sie darf nicht durch eine angenommene Bestätigung des MCP-Hosts ersetzt werden.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
