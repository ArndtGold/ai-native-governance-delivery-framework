# TP: AGDF Product Maturity Roadmap

Status: approved
Gate: TP
Gate approval: `Approval: TP` accepted on 2026-07-28 after same-run, same-gate, revision-6 and durable-artefact revalidation.
Based on: genehmigtes SD AD-1 bis AD-10
Date: 2026-07-28
Owner: user / agent

## 1. Ausführungsgrenze

Dieser TP autorisiert nach seiner Freigabe ausschließlich die Roadmap-Koordination:

- Baseline und Workstream-Register;
- verlinkte, normalisierte Evidenzklassifikation;
- Vorbereitung des ersten eigenständigen Conformance-Scope;
- Fortschritts- und PMR-Abdeckungsaggregation; sowie
- Roadmap-Reviews und Abnahme.

Er autorisiert keine Runtime-, Skill-, Contract-, Router-, Eval-, Interaction-, Host-Adapter- oder
Produktänderung. Jede solche Änderung benötigt einen eigenständigen Run mit eigener UR und eigenen
Freigaben.

## 2. Task Plan

| task_id | Aufgabe | Acceptance Mapping | Erforderliche Evidenz | Gate-Abhängigkeit |
|---|---|---|---|---|
| RMP-01 | Run-eigenes `BASELINE_REGISTER.md` mit Schema aus SD AD-3 anlegen und relevante bestehende Runs verlinken. | PMR-1, PMR-2, PMR-3, PMR-7 | jede Zeile verweist auf kanonischen Child-/Bestandszustand; keine kopierte Voll-Evidenz | Roadmap `Approval: TP` plus Brownfield Analysis |
| RMP-02 | `task-target-resolution-boundary`, `agdf-interaction-ownership-quick-path-ux`, relevante OpenCode-Aktivierungs-/Hardening-Runs und abgeschlossene Capability-/Ceremony-Arbeit gegen das Register klassifizieren. | PMR-1 bis PMR-5, PMR-7 | aktueller Gate-/Artefaktstatus, Evidenzklasse, Einschränkung und Next Action je Baseline | keine fremde Freigabe oder Mutation |
| RMP-03 | `WORKSTREAM_REGISTER.md` für Baseline, Conformance, Proportionalität/Zeremonie, Enforcement Closure und Unified Journey anlegen. | PMR-1 bis PMR-7 | pro Workstream: Scope, Eintrittsbedingung, Owner-Kandidaten, Child-Run, Status und Exit-Evidenz | Parent besitzt nur Links/Koordination |
| RMP-04 | Einen minimalen Scope-Entwurf für `agdf-live-host-conformance-matrix` erstellen, der alle PMR-3-Pflichtfälle, Redaction, Hosts und Gap-Routing enthält. | PMR-2, PMR-3, PMR-6, PMR-7 | `CONFORMANCE_SCOPE.md`; keine Produktlösung und kein versteckter Child-Approval | Child-UR bleibt separat offen |
| RMP-05 | Für den Conformance-Scope einen eigenständigen Run nur über den normalen `gate-check`-Pfad vorbereiten und die konkrete UR zur separaten Nutzerentscheidung vorlegen. | PMR-3 | eindeutiger Child-Run, dauerhafte UR, exaktes `Approval: UR` separat erforderlich | Roadmap-TP vererbt keine Autorität |
| RMP-06 | Nach eigenständigem Child-QA/UAT/OR dessen Ergebnis in Baseline- und Workstream-Register verlinken, ohne Evidenzklasse hochzustufen. | PMR-2, PMR-3, PMR-6, PMR-7 | Parent-Wert stimmt mit Child-SoT; `unverified`/`evidence_limited` bleibt sichtbar | Child-Zustand ist autoritativ |
| RMP-07 | Nur aus konkreten Conformance-Gaps einen separaten Scope-Entwurf für Proportionalität/Zeremonie ableiten; 40-Fall-Benchmark und Schwellenwerte beibehalten. | PMR-1, PMR-4, PMR-7 | Gap-to-scope-Traceability; kein Scope ohne Host-/Benchmark-Evidenz | eigene Child-UR erforderlich |
| RMP-08 | Nur aus konkreten technisch schließbaren Matrix-Gaps einen separaten Enforcement-Closure-Scope ableiten. | PMR-2, PMR-7 | Garantie, Host, aktuelle Enforcement-Klasse, Zielklasse, Owner und negativer Test pro Gap | eigene Child-UR erforderlich |
| RMP-09 | Unified-Journey-Scope erst nach stabilen Target-, Routing- und Enforcement-Ergebnissen ableiten; bestehende Interaction Pipeline bleibt alleiniger Owner. | PMR-1, PMR-5, PMR-6, PMR-7 | Journey-Gap, relevante Zustände, sichtbare Recovery und Verständlichkeitsnachweis | eigene Child-UR erforderlich |
| RMP-10 | `AGGREGATE_ACCEPTANCE.md` mit PMR-1-bis-PMR-7-Matrix führen; nur verlinkte kanonische Evidenz akzeptieren. | PMR-1 bis PMR-7 | Requirement, Workstream, Child-Artefakt, Evidenzklasse, Status, Limitation | Roadmap-QA bleibt offen bei kritischem Gap |
| RMP-11 | Nach jedem abgeschlossenen Workstream Roadmap-Brownfield-Fit und Context-Graph-Linkwirkung revalidieren. | PMR-2, PMR-7 | kein neuer Parent-Owner; neue Graph-Knoten nur im zuständigen Child-SD | kein stiller Scope-Transfer |
| RMP-12 | Roadmap Task Plan Review, Clean Implementation Review, Code Review für Parent-Diffs, QA und UAT erst nach vollständiger PMR-Aggregation durchführen. | PMR-1 bis PMR-7 | Parent 12/12; alle erforderlichen Child-Nachweise; offene Limits sichtbar | Roadmap-QA/UAT nicht vor Child-Evidenz |

## 3. Phasen und Stop-Bedingungen

### Phase A — Parent-Baseline

Umfasst RMP-01 bis RMP-04.

Stop nach `CONFORMANCE_SCOPE.md`. Vor RMP-05 ist eine neue Child-UR als eigener Gate-Vorgang
erforderlich. Das Roadmap-Approval darf dafür nicht wiederverwendet werden.

### Phase B — Conformance Child

Umfasst RMP-05 und RMP-06, wird aber im eigenständigen Child-Run ausgeführt.

Stop bei:

- fehlender authentifizierter Host-Verfügbarkeit;
- unklarer Redaction;
- mehreren plausiblen Mutation Targets;
- fehlender eigener UR-Freigabe; oder
- einem Befund, der Produktänderung statt Beobachtung verlangt.

### Phase C — Evidenzbasierte Folge-Runs

RMP-07 bis RMP-09 erzeugen nur bei konkreten Gaps einen Scope-Entwurf. Jeder Entwurf stoppt vor
eigener Implementierung und verlangt die normale Child-Gate-Kette.

### Phase D — Aggregation und Abnahme

RMP-10 bis RMP-12. Roadmap-QA kann erst `pass` werden, wenn PMR-1 bis PMR-7 durch erlaubte
Evidenzklassen erfüllt sind und kein kritischer Unter-Governance- oder Autoritätsbefund offen ist.

## 4. Test Plan

| test_id | Prüft | Verfahren | Pass-Kriterium |
|---|---|---|---|
| RMP-T01 | Baseline-Linkintegrität | alle Registerpfade und Run-IDs gegen `.agdf/control/` auflösen | jede Referenz existiert und zeigt auf den kanonischen Owner |
| RMP-T02 | Statuskonsistenz | Parent-Register mit `doctor`, `gate-check` oder `delivery-map` des jeweiligen Runs vergleichen | keine hochgestufte oder veraltete Zustandsbehauptung |
| RMP-T03 | Approval-Isolation | Parent- und Child-Artefact-Chain prüfen | kein Child-Gate ist durch Parent-Approval erfüllt |
| RMP-T04 | Scope-Isolation | Parent-Diff und Worktree-Baseline prüfen | Roadmap-Scope enthält nur eigene Control-Artefakte und Backlog-/Run-Verlinkung |
| RMP-T05 | Evidenzklassen | Stichproben für Repository, Replay, Host, UAT und unverified | keine Klasse wird ohne passende direkte Evidenz verwendet |
| RMP-T06 | Conformance-Coverage | `CONFORMANCE_SCOPE.md` gegen zwölf PMR-3-Pflichtfälle prüfen | 12/12 Fälle, drei Full Surfaces, Redaction und Recovery abgedeckt |
| RMP-T07 | Gap-Routing | simulierte Host-Befunde `pass`, `limitation`, `product_gap`, `unavailable` | nur konkrete Gaps erzeugen einen Folgescope; keine stille Reparatur |
| RMP-T08 | Proportionalitäts-Gate | Scope-Entwurf gegen 40-Fall-/25%-/0-/10%-Kriterien prüfen | alle PRD-Schwellen und kanonische Gate-Legalität enthalten |
| RMP-T09 | Enforcement-Gate | jede vorgeschlagene Closure gegen AD-8 prüfen | konkreter Host-Gap, bestehender Owner und negativer Umgehungstest vorhanden |
| RMP-T10 | Journey-Gate | Scope-Entwurf gegen UX Intent und AD-7 prüfen | kein zweiter Presentation- oder State-Owner; Recovery und UAT sichtbar |
| RMP-T11 | Aggregierte PMR-Abnahme | PMR-1 bis PMR-7 gegen Child-QA/UAT/OR verifizieren | keine offene kritische Lücke, keine unzulässige Evidenzpromotion |
| RMP-T12 | Control Integrity | `doctor --run agdf-product-maturity-roadmap --json`, `delivery-map`, `git diff --check` | 0 block/revise; keine Format-/Artefact-Chain-Drift |

## 5. UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| PMR-1 | Quick/Compact/Structured | RMP-02, RMP-07, RMP-10 | Baseline plus späterer Ceremony-Child und aggregierte Interaktionsmetriken | planned | none |
| PMR-2 | alle Hosts | RMP-02, RMP-06, RMP-08, RMP-10 | Enforcement-/Evidence-Klassifikation und gezielte Gap-Closure | planned | none |
| PMR-3 | Host Conformance | RMP-04 bis RMP-06 | zwölf Fälle auf Codex, Claude Code und OpenCode | planned | none |
| PMR-4 | Proportionality | RMP-07, RMP-10 | 40-Fall-Benchmark mit Über-/Unter-Governance | planned | none |
| PMR-5 | Standard Journey | RMP-09, RMP-10 | bestehende Interaction Pipeline und Progressive Disclosure | planned | none |
| PMR-6 | Verständlichkeit | RMP-04, RMP-06, RMP-09, RMP-10 | Host-Beobachtung und acht verblindete Journey-Szenarien | planned | none |
| PMR-7 | Schutzwirkung | RMP-06 bis RMP-12 | Child-QA/UAT/OR, negative Tests und aggregierte Abnahme | planned | none |

## 6. Brownfield Scope vor Parent-Ausführung

Nach `Approval: TP` muss die Pre-Implementation Brownfield Analysis mindestens prüfen:

- fremde und eigene Worktree-Diffs;
- aktuellen Status aller in RMP-02 genannten Runs;
- vorhandene Baseline-/Register- oder Roadmap-Artefakte;
- Backlog- und Run-State-Parserkompatibilität;
- Context-Graph-Linkgrenze;
- ob Parent-Control-Artefakte ohne neue Runtime-/Template-Semantik ausreichen; und
- ob RMP-01 bis RMP-04 der kleinste saubere Parent-Scope bleiben.

Falls dafür Runtime-Code, neue Control-Templates oder neue Validatorlogik nötig wäre, kehrt der Run
zu SD/TP-Revision zurück.

## 7. Out of Scope

- Runtime-, Plugin-, Skill-, Contract-, Router-, Eval- oder Interaction-Code im Parent-Run.
- Automatische Erstellung, Freigabe oder Implementierung eines Child-Runs.
- Änderung bestehender offener Runs oder Neuinterpretation ihrer Diffs.
- Host-Anmeldung oder externe Mutation ohne den eigenen genehmigten Conformance-Scope.
- Commit, Push, Pull Request, Release oder Reinstall.
- Roadmap-QA-Pass allein aufgrund guter Planung ohne Child-Evidenz.

## 8. Risiken

- **block:** Parent-Approval wird als Child-Autorität verwendet.
- **block:** Baseline kopiert oder überschreibt kanonischen Child-Zustand.
- **block:** Roadmap-TP beginnt Runtime- oder UX-Implementierung.
- **revise:** Conformance-Scope deckt nicht alle zwölf Fälle oder drei Full Surfaces ab.
- **revise:** Ein Folge-Scope entsteht ohne konkreten Gap.
- **revise:** Evidenzklasse wird gegenüber der Quelle hochgestuft.
- **warn:** Externe Host-Verfügbarkeit kann die Conformance-Phase zeitlich blockieren.
- **warn:** Roadmap bleibt bewusst länger aktiv als ein normaler Delivery-Run.

## 9. Nächster Schritt

Aufgaben- und Testplan prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: TP`
