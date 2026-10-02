# TP: Gemeinsame Skillnamen-Auflösung und Hostprojektion

Status: draft
Gate: TP
Gate approval: open
Based on: PRD.md; SD.md
Date: 2026-10-02
Owner: Codex
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Nach TP-Freigabe Implementierungsvorbereitung abschließen, Baseline/Diff erfassen und im Core einen gemeinsamen reinen Hostnamen-Ableiter aus der vorhandenen Definition ergänzen | Codex, Core-Owner | Approval: TP; Brownfield Analysis |
| T-002 | Produktionsdefinition im bestehenden Core-Service binden; Registry und Normalisierung um exakte Hostnamenauflösung mit stabilen kanonischen IDs erweitern | Codex, Core-/Transportowner | T-001 |
| T-003 | Negative Namen-/Katalogfälle und begrenzte lokalisierte Input-Recovery implementieren; frühe Abweisung vor Target-/Controlevaluierung belegen | Codex, Core-/Rendererowner | T-002 |
| T-004 | Gemeinsamen Ableiter in Hostgeneratoren und globalem OpenCode-Adapter verwenden; sichtbare Referenzen explizit projizieren und technische IDs/Contractreferenzen erhalten | Codex, Generator-/Adapterowner | T-001 |
| T-005 | Host-/Skill-, CLI-/MCP- und Fortsetzungsparität prüfen; Profile deterministisch regenerieren und Paket-/Integritäts-/Instruktionsprüfungen ausführen | Codex, Testowner | T-002; T-003; T-004 |
| T-006 | Dispatcher-Dokumentation aktualisieren, CD+Tests samt Szenarioergebnissen festhalten; Pflicht-Code-Review, Plan-/Strukturreview und QA nach vorhandener Gatefolge durchführen | Codex, Dokumentations-/Reviewowner | T-005 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Jeder skillSet-Eintrag besitzt genau die aus seiner Hostdefinition abgeleiteten kanonischen, lokalen/globalen und namespacefähigen Formen; Ableitung ist deterministisch und ohne I/O | Neuer fokussierter Core-Katalogtest, etwa packages/core/test/skill-names-test.js; CD_TESTS.md |
| AC-001 | SDD-003 | T-002 | SCN-002 | Sichtbarer Name und kanonische ID liefern pro Host dieselbe fachliche Dispatcherantwort; Zeitwerte werden bei Vergleich ausgeschlossen | Erweiterte packages/cli/scripts/skill-dispatch-test.js; CD_TESTS.md |
| AC-002 | SDD-001 | T-001 | SCN-003 | Geänderte Definition-ID/Präfixe im Fixture propagieren zu den erwarteten Namen; kein hartcodierter AGDF-Alias und keine persistierte Mappingliste | Core-Katalogtest mit synthetischer Definition; Diffreview |
| AC-002 | SDD-002 | T-002 | SCN-004 | Produktionsservice verwendet seinen Resource Context; Modell kann weder Definition noch Hostnamensregeln über zusätzliche Toolargumente setzen | skill-dispatch-function-contract-test.js; mcp-server/test/contract.test.js und safety.test.js |
| AC-002 | SDD-002 | T-002 | SCN-005 | Bestehende kanonische direkte Core-Aufrufe bleiben kompatibel; Aliasauflösung erfordert die deklarierte Definition der Instanz | Core-/Dispatcher-Kompatibilitätstest |
| AC-003 | SDD-003 | T-003 | SCN-006 | Unbekannte Namen, zusätzliche Präfixe, falsche Namespaces und Formen fremder Oberflächen erzeugen invalid_input; Target-/Gate-Spies werden nicht aufgerufen | skill-dispatch-test.js mit Negativmatrix und Callcountern |
| AC-003 | SDD-004 | T-003 | SCN-007 | Alias-/ID-Kollision, doppelte Slugs, defekte Präfixe und malformed Definition scheitern eindeutig ohne heuristische Zuordnung; identischer Name für dieselbe ID bleibt zulässig | Core-Katalogtest und Dispatcher-Kollisionstest |
| AC-003 | SDD-004 | T-003 | SCN-008 | Bekannte gültige Formen erscheinen in kataloggestützter Recovery; Bindestrich/Doppelpunkt nur im skill_id-Wertegrundraum; Zeilenumbruch und overlong Werte bleiben abgewiesen | packages/core/test/interaction-presentation-test.js oder bestehender Rendererprüfpfad; operational-localization-test.js |
| AC-004 | SDD-001 | T-004 | SCN-009 | Generator und globaler Adapter leiten sichtbare Namen aus demselben Core-Helfer ab; alle vier Hosts und beide OpenCode-Formen sind abgedeckt | Neue gemeinsame Projektionsfixture; agent-skills-conformance-test.js |
| AC-004 | SDD-005 | T-004 | SCN-010 | Frontmatter und deklarierte UI-Aufrufe tragen Hostnamen; skill_id, --skill, kanonische Slugs und technische Contractreferenzen bleiben stabil und auflösbar | Projektionsregression; copilot-profile-test.js; opencode-hardening-test.js |
| AC-004 | SDD-005 | T-004 | SCN-011 | Eine ID-Erwähnung in Backticks oder als Pfadsubstring wird nicht unbeabsichtigt umgeschrieben; ausdrücklich deklarierte UI-Referenz wird korrekt projiziert | Positive/negative Projektionsfixtures einschließlich globaler OpenCode-Transformation |
| AC-004 | SDD-005 | T-005 | SCN-012 | Wiederholte unveränderte Generierung ist deterministisch; Instruktions-/Payloadbudgets und vorhandene Runtime-/Contractpfade bestehen | sync-package-assets.js; instruction-footprint-test.js; payload-budget-test.js; check-runtime-integrity.mjs |
| AC-005 | SDD-002 | T-005 | SCN-013 | Echte CLI und MCP-Produktionseintritte akzeptieren bekannte Hostnamen und stabile IDs mit identischer fachlicher Semantik; MCP-Surface bleibt vertrauenswürdig gebunden | CLI-Subprozessfixture; mcp-server/test/protocol.test.js und provenance.test.js |
| AC-005 | SDD-003 | T-005 | SCN-014 | Aliasaufruf ohne Ziel bleibt target_unresolved; authorizes ist immer false; gewählte Runs und Gatefreigaben werden nicht ersetzt | CLI-/MCP-Unresolved- und Resolved-Fixtures; safety.test.js |
| AC-005 | SDD-003 | T-005 | SCN-015 | Judgement- und Gatefortsetzungen verwenden ausschließlich kanonische IDs, unabhängig von der ursprünglichen sichtbaren Eingabe | mcp-server/test/continuation.test.js; skill-dispatch-test.js |
| AC-006 | SDD-006 | T-006 | SCN-016 | Dokumentation erklärt gemeinsame Regeln, ID-/Namensbeispiele, Hostbindung und Fehlergrenzen; CD_TESTS/Reviews/QA führen konkrete Kommandos, Ergebnisse und offene Hostevidenz getrennt | docs/architecture/02-dispatcher.md; CD_TESTS.md; CR.md; QA_REPORT.md |

## 3. Test Plan

Nach Freigabe und Implementierung werden folgende Prüfungen ausgeführt. Fixture-Tests dürfen temporäre Targets nutzen; der aktive Run wird nicht durch Testfreigaben verändert. Neue fokussierte Tests werden in die bestehenden passenden Suites eingebunden.

1. Reproduktion vor dem Fix im vorhandenen Dispatcher-/Projektionsfixture: sichtbarer Hostname scheitert bzw. technische Erwähnung wird umbenannt. Den Befund in CD_TESTS.md erfassen; eine fehlende Live-Hostreproduktion wird nicht erfunden.
2. Neuer reiner Katalogtest: `node packages/core/test/skill-names-test.js` (genauer Name bleibt innerhalb T-001 wählbar, muss vor Ausführung dokumentiert sein).
3. `npm --prefix packages/cli run test:skill-dispatch` für gemeinsame Eingabe, Fortsetzungen und bestehende Runzuordnung.
4. Neue fokussierte Projektionsprüfung, etwa `node scripts/skill-name-projection-test.mjs`; alle bestehenden Host-/globalen Formen und technische Referenzen abdecken.
5. `npm run build` für bestehende all-profile Generierung und Paketassembly. Die passende zweite unveränderte Generierung mit Digestvergleich belegt Determinismus; sie ersetzt keinen Test.
6. `npm --prefix packages/cli run test:copilot-profile`, `test:opencode-hardening`, `test:agent-skills-conformance`, `test:instruction-footprint` und `test:payload-budget` als separate Aufrufe. Keine pauschale Budgeterhöhung oder abgeschwächte Assertion.
7. `npm --prefix packages/mcp-server test` für Funktion-/Protokoll-/Fortsetzungs-/Safety-/Provenance-/Performance-/Paketnachweise; neue Aliasfälle in den zuständigen bestehenden Dateien ergänzen.
8. `npm --prefix packages/cli run test:interaction-presentation` und `test:operational-localization` für Recoverygrammatik und registrierte Localevorlagen.
9. `node plugins/agdf/scripts/check-runtime-integrity.mjs` im Quellmodus und vorhandene Paketprüfungen `npm --prefix packages/cli run test:package-contents` und `test:package-build` nach Assembly. Falls ein Check andere notwendige Buildvoraussetzungen verlangt, diese ohne Veröffentlichung herstellen und dokumentieren.
10. `git diff --check` sowie scoped Diffreview. Test-/Generierungsprotokolle und Szenariomatrix dauerhaft in diesem Run referenzieren; die Abschlussdarstellung zeigt Ergebnisse und konkrete offene Nachweise.

Neue Änderungen nach bestandenen Prüfungen lösen nur betroffene Wiederholungen aus. Ein Fehler bleibt dokumentiert, wird soweit scoped behoben und rechtfertigt keine Behauptung vollständiger QA-/Hostbereitschaft. Mandatory CR und QA bleiben nach CD+Tests getrennte Schritte.

## 4. Brownfield Scope

Nach Approval: TP erfolgt `brownfield-analysis` im Modus `pre_implementation_analysis` für genau diesen Run. Vor dem ersten Codeedit Baseline-Commit sowie tracked/untracked Dirty Paths erfassen. Erneut prüfen, ob vorgesehene Owner und Pfade den genehmigten Scope tragen und keine zwischenzeitlichen Fremdänderungen überlagert werden.

Primäre Codepfade: `packages/core/lib/skill-dispatch/`, `packages/core/lib/index.js`, nötigenfalls der bestehende `resources/`-Bereich und `interaction-presentation.js`; `scripts/sync-package-assets.js`; `packages/cli/lib/installers/opencode.js`; bestehende CLI-/MCP-Bindung nur soweit für die gemeinsame Instanz erforderlich. Kanonische `plugins/agdf/skills/` und `plugins/agdf/meta/` dürfen innerhalb dieses Scopes nur für eindeutige sichtbare Referenzen, korrekte Dispatchbeschreibung und den vorhandenen Namensvertrag geändert werden. Das führt keine zweite Mappingquelle ein.

Tests: bestehende Dispatcher-/Host-/Renderer-/Paketdateien plus fokussierte Katalog-/Projektionsfixtures. Dokumentation: `docs/architecture/02-dispatcher.md` und unmittelbar widersprüchliche bestehende Namensbeschreibungen. Generierte Profile sind ausschließlich Ableitungen. Bestehende Gatepolicy, Targetresolver, Approvalpersistenz und Hookautorität sind geschützt. Der vorgefundene fremde Dirty Path `plugins/agdf/hooks/` bleibt unberührt.

## 5. Out Of Scope

Hostinstallation, Marketplaceänderung, Versionbump, Veröffentlichung, Commit/Push/PR, neue Hostkonventionen, allgemeine Dispatcher-Neugestaltung, Gate-/Target-/Runautorität, neue Hookaktivierung sowie frische Modell-/Host-UAT. Zusätzliche Architektur- oder Produktentscheidungen werden vor Umsetzung an das früheste betroffene Gate zurückgegeben.

## 6. Risks And Blockers

- Doppelte Aliasquellen, Kollisionen oder Modellsteuerung der Definition blockieren QA.
- Unbeabsichtigte Änderung technischer IDs, Fortsetzungen, Contractpfade oder Aktivierungsregeln ist eine scoped Regression und verhindert Abschluss.
- Eine erforderliche neue Produkt-/Namenskonvention, Budgetausweitung oder offene Designdefinition wird vor Umsetzung zur jeweiligen PRD-/SD-Entscheidung zurückgeroutet.
- Fremde Dirty Paths werden nicht übernommen; neue gleichzeitige Änderungen werden vor Edit bewertet.
- Paket-/Runtime-/Instruktionsfehler und fehlende Pflichtreview-Nachweise bleiben offen, bis sie scoped geklärt sind. Source-/Pakettests allein belegen keine installierte oder frisch geladene Hostversion.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Aufgaben: Gemeinsamen katalogbasierten Namensableiter ergänzen, vertrauenswürdige Produktionsdefinition binden und die exakte Core-Normalisierung um sichtbare Hostnamen erweitern. Danach Recovery und Hostprojektionen einschließlich globalem OpenCode präzisieren, Profile regenerieren und Dokumentation aktualisieren.
- Prüfung: Alle Skill-/Hostformen, kanonische Fortsetzungen, unbekannte/fremde Namen, Alias-/ID-Kollisionen und unterdrückte Zielevaluierung testen. CLI und MCP müssen fachlich identische Ergebnisse liefern und ohne Ziel ungeklärt sowie nicht autorisierend bleiben.
- Verteilung: Alle erzeugten Profile, technische Parameter und Contractreferenzen prüfen; deterministische Generierung, Instruktions-/Payloadbudgets, Runtimeintegrität und Paketprüfungen ausführen. Bestehende Assertions werden nicht abgeschwächt.
- Grenzen: Nach TP-Freigabe folgt zuerst Implementierungsvorbereitung mit Baseline und bestehenden Ownern. Fremde Hookänderungen bleiben isoliert. Keine Installation, Veröffentlichung, VCS-Aktion oder ungeprüfte Live-Hostbehauptung.
- Abschluss: CD+Tests samt Szenariomatrix festhalten; Pflicht-Code-Review und bestehende Plan-/Strukturreviews durchführen; QA entscheidet separat. Fehler und fehlende Evidenz bleiben sichtbar und werden nicht als bestanden ausgegeben.
