# TP: AGDF Live Host Conformance Matrix

Status: approved
Gate: TP
Gate approval: exaktes `Approval: TP` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 5 und dauerhaftem Artefakt
Based on: genehmigtes SD
Date: 2026-07-28
Owner: user / agent

## 1. Ausführungsgrenze

Dieser Plan bereitet ausschließlich eine diagnostische, redigierte und versionsgebundene
Host-Beobachtung vor. Nach seiner Freigabe beginnt zuerst eine Pre-Implementation Brownfield
Analysis. Erst bei deren `pass` dürfen die geplanten Beobachtungsartefakte und sicheren
Host-Ausführungen bearbeitet werden.

Der Plan autorisiert keine Änderung an Runtime, Plugin, Contracts, Skills, Adaptern,
Host-Konfigurationen, Authentifizierung, Installationen, fremden Runs oder Produktverhalten.
Ein gefundener Produktfehler wird dokumentiert und in einen separaten UR-Scope geroutet.

## 2. Task Plan

| task_id | Aufgabe | Acceptance Mapping | Erforderliche Evidenz | Stop-Bedingung |
|---|---|---|---|---|
| LHT-01 | Pre-Implementation Brownfield Analysis für aktuelle Worktree-, Host-, Versions-, Authentifizierungs-, Provider-, Session- und sichere Befehlslage durchführen. | LHC-2, LHC-4, LHC-5, LHC-7 | `BROWNFIELD_ANALYSIS.md` mit `pass`, `revise` oder `block`; konkrete erlaubte und verbotene Pfade | kein `pass`, unklare Mutation oder nicht redigierbarer Probe-Output |
| LHT-02 | Run-spezifisches `OBSERVATION_SCHEMA.json` mit Pflichtfeldern, Enums und Ergebnisregeln anlegen. | LHC-1 bis LHC-3, LHC-7 | maschinenlesbares Schema ohne normative Produktsemantik | neuer Runtime-/Contract-Owner wäre nötig |
| LHT-03 | `HOST_CONFORMANCE_MATRIX.json` mit exakt 36 eindeutigen Host-/Fall-Slots und Preflight-Sektionen initialisieren. | LHC-1, LHC-7 | 12 Fälle × 3 Hosts; keine vorweggenommenen Pass-Ergebnisse | unvollständige oder doppelte Kombination |
| LHT-04 | Synthetische, nicht private Testdaten und Wegwerf-Workspaces für HC-01 bis HC-12 vorbereiten; Vorher-Zustand erfassen. | LHC-4, LHC-5 | Fixture-/Workspace-Inventar und Mutation-Baseline | Nutzerprojekt, Home, globaler Zustand oder fremder Run wäre Ziel |
| LHT-05 | Read-only Preflight je Host ausführen und Version, Installation, Aktivierung, Authentifizierung/Provider sowie verfügbare Beobachtungsmodi redigiert klassifizieren. | LHC-2, LHC-5, LHC-7 | drei Preflight-Datensätze mit konkreter Grenze; CLI-Präsenz nie als Auth-Nachweis | Anmeldung, Konfigurationsänderung oder Secret-Persistenz wäre nötig |
| LHT-06 | Codex-Fälle HC-01 bis HC-12 über den jeweils zulässigen Headless-/Interactive-Pfad beobachten. | LHC-1 bis LHC-7 | zwölf Codex-Zeilen oder präzise `host_unavailable`-Datensätze | unsichere Session, Mutation, fehlende Redaction oder Produktänderungsbedarf |
| LHT-07 | Claude-Code-Fälle HC-01 bis HC-12 nach denselben Regeln beobachten. | LHC-1 bis LHC-7 | zwölf Claude-Code-Zeilen oder präzise `host_unavailable`-Datensätze | wie LHT-06 |
| LHT-08 | OpenCode-Fälle HC-01 bis HC-12 nach denselben Regeln beobachten. | LHC-1 bis LHC-7 | zwölf OpenCode-Zeilen oder präzise `host_unavailable`-Datensätze | wie LHT-06 |
| LHT-09 | Alle Beobachtungen redigieren, Evidence-/Enforcement-Klasse vergeben, Mutation-Nachweis prüfen und Gaps zum bestehenden Owner routen. | LHC-2 bis LHC-7 | keine verbotenen Daten; jeder `pass` direkt belegt; jeder `product_gap` mit Owner und separatem Scope-Hinweis | unklare Herkunft, widersprüchliche Evidenz oder stille Reparatur |
| LHT-10 | `HOST_CONFORMANCE_REPORT.md` als menschenlesbare Projektion erstellen und gegen die JSON-Matrix abgleichen. | LHC-1 bis LHC-8 | vollständige Parität; Versionen, Grenzen und UAT-Boundary sichtbar | Bericht stuft Evidenz oder Ergebnis hoch |
| LHT-11 | Task Plan Review, Clean Implementation Review und Code Review für den tatsächlichen Diff durchführen. | LHC-1 bis LHC-8 | 12/12 Tasks nachvollziehbar; keine neue Produkt-/Runtime-Struktur | ungeklärte Abweichung oder unnötige Parallelstruktur |
| LHT-12 | QA-Gate mit Matrix-, Redaction-, Mutations- und Paritätsnachweisen ausführen und danach Nutzer-UAT vorbereiten. | LHC-1 bis LHC-8 | QA `pass`, `revise` oder `block`; kein UAT-Vorgriff | kritische Evidenzlücke oder offener Mutationsbefund |

## 3. Ausführungsphasen

### Phase A — Sicherheits- und Brownfield-Preflight

Umfasst LHT-01. Sie inventarisiert den aktuellen Worktree, verfügbare Host-Versionen, sichere
Read-only-Befehle, Authentifizierungs-/Provider-Zustände, interaktive Oberflächen und mögliche
Session-Risiken. Ohne `pass` endet die Ausführung.

### Phase B — Run-eigene Evidenzstruktur

Umfasst LHT-02 bis LHT-04. Zulässig sind nur Child-Artefakte und explizite Wegwerf-Workspaces.
Die Matrix wird leer beziehungsweise mit `not_observed`-Zwischenzuständen vorbereitet; Planung
oder CLI-Präsenz erzeugt keinen Pass.

### Phase C — Host-Beobachtung

Umfasst LHT-05 bis LHT-08. Jeder Host wird unabhängig behandelt. Sichere Headless-Fälle dürfen
automatisiert werden. Attachment-, native Approval-, Restart- und andere sichtbare UX-Claims
verlangen einen dedizierten interaktiven Beobachtungspfad.

Für HC-08 ist nur ein bereits sicher isolierbarer Host-/Session-Neustart zulässig, der keine
andere laufende Arbeit gefährdet und in LHT-01 ausdrücklich bestätigt wurde. Andernfalls wird der
Fall `host_unavailable`. Es werden keine neuen Tasks, Logins, Provider oder Konfigurationen
automatisch erzeugt.

### Phase D — Klassifikation und Bericht

Umfasst LHT-09 und LHT-10. Rohdaten werden nicht dauerhaft abgelegt. Persistiert werden nur
redigierte, claim-relevante Belege und die strukturierte Klassifikation.

### Phase E — Reviews, QA und UAT

Umfasst LHT-11 und LHT-12. QA bewertet Belegqualität und Planabdeckung. Erst eine separate
Nutzerentscheidung kann verbleibende `limitation`- und `host_unavailable`-Ergebnisse als
Roadmap-Baseline akzeptieren.

## 4. Test Plan

| test_id | Prüft | Verfahren | Pass-Kriterium |
|---|---|---|---|
| LHT-T01 | Schema | JSON-Schema und Matrix maschinell validieren | alle Zeilen erfüllen Pflichtfelder und Enums |
| LHT-T02 | Coverage | kartesisches Produkt aus HC-01 bis HC-12 und drei Hosts vergleichen | exakt 36 eindeutige Kombinationen |
| LHT-T03 | Pass-Evidenz | alle `pass`-Zeilen gegen Evidenzklasse und Referenz prüfen | direkte frische Host-Beobachtung; keine Repository-/Replay-Promotion |
| LHT-T04 | Versionsbindung | Host-/AGDF-Version und Zeitpunkt je Zeile prüfen | 36/36 vollständig oder Ergebnis `invalid_evidence` |
| LHT-T05 | Enforcement-Ehrlichkeit | Enforcement-Klasse gegen tatsächlichen Mechanismus und Grenze prüfen | keine Universalbehauptung ohne direkte technische Abdeckung |
| LHT-T06 | Redaction | Artefakte und `evidence/` auf verbotene Datenklassen und unnötige absolute Pfade prüfen | keine Secrets, Cookies, Accounts, privaten Vollinhalte oder Hidden Reasoning |
| LHT-T07 | Mutationsfreiheit | Vorher-/Nachher-Zustand je read-only Fall und Git-Diff gegen Scope vergleichen | kein relevanter Zustandswechsel; andernfalls `invalid_evidence` |
| LHT-T08 | Modustrennung | UI-/Attachment-/Restart-Claims gegen Observation Mode prüfen | kein Headless-Nachweis trägt einen interaktiven Claim |
| LHT-T09 | Gap-Routing | alle `product_gap`-Zeilen prüfen | bestehender Owner, separate UR-Idee, keine Reparatur im Run |
| LHT-T10 | Berichtsmatrix-Parität | Markdown-Aussagen gegen JSON-Zeilen vergleichen | kein fehlender Fall, kein abweichendes Ergebnis, keine Hochstufung |
| LHT-T11 | Scope-Isolation | Worktree-Diff und Artefact Chain prüfen | nur genehmigte Child-Control-Artefakte; keine Runtime-/Plugin-Änderung |
| LHT-T12 | Control Integrity | Child-/Parent-`doctor`, Child-`gate-check`, Linkprüfung und `git diff --check` | 0 block/revise; keine defekten Links oder Formatfehler |

## 5. Sichere Host-Regeln

- Preflight-Befehle müssen vor Ausführung auf erwartete Ausgabefelder und Secret-Risiko geprüft sein.
- Ausgabe wird sofort auf erlaubte Felder reduziert; vollständige Rohlogs werden nicht persistiert.
- Interaktive Beobachtung erfolgt nur in einem dedizierten, sicher isolierbaren Kontext.
- Bestehende Nutzeraufgaben und nicht gespeicherte Arbeit dürfen nicht für Restart-Tests verwendet
  oder unterbrochen werden.
- Fehlende Authentifizierung oder Provider werden dokumentiert; sie werden nicht hergestellt.
- Eine native UI darf nur visuell bewertet werden, wenn sie tatsächlich beobachtbar ist.
- Jeder unerwartete Zustandswechsel stoppt die betroffene Host-Serie.

## 6. Artefakte

| Artefakt | Owner | Zweck |
|---|---|---|
| `BROWNFIELD_ANALYSIS.md` | Child-Run | Freigabe der konkreten sicheren Ausführungspfade |
| `OBSERVATION_SCHEMA.json` | Child-Run | run-spezifische Datenvalidierung |
| `HOST_CONFORMANCE_MATRIX.json` | Child-Run | primäre strukturierte Beobachtungsevidenz |
| `HOST_CONFORMANCE_REPORT.md` | Child-Run | menschenlesbare Projektion |
| `evidence/` | Child-Run | redigierte fallbezogene Belege |
| Review-/QA-Artefakte | Child-Run | Planabdeckung, Diff-Qualität und Abnahmeentscheidung |

## 7. Out of Scope

- Änderungen an AGDF-Produkt-, Runtime-, Plugin-, Skill-, Contract-, Adapter- oder
  Presentation-Implementierung.
- automatische Anmeldung, Provider-Konfiguration, Installation, Reinstallation oder globale
  Aktivierungsänderung.
- Nutzung privater Nutzerdateien oder laufender Produktivaufgaben als Fixtures.
- neues persistiertes Host-Harness oder paralleles Capability-System.
- Behebung eines beobachteten Gaps im selben Run.
- Commit, Push, Pull Request, Release oder Veröffentlichung.
- UAT-Akzeptanz ohne separate Nutzerentscheidung.

## 8. Risiken und Eskalation

- **block:** sicherer Preflight oder isolierter Ausführungspfad ist nicht nachweisbar.
- **block:** geplante Aktion könnte Nutzerarbeit, fremde Runs oder globale Konfiguration verändern.
- **block:** Secrets oder private Vollinhalte wären für Evidenz erforderlich.
- **revise:** weniger oder mehr als 36 eindeutige Host-/Fall-Slots.
- **revise:** Headless-Evidenz soll einen UI-Claim tragen.
- **revise:** ein Pass stützt sich nur auf Repository-, Replay- oder alte Host-Evidenz.
- **revise:** Produktreparatur oder neues Harness wird für die Beobachtung notwendig.
- **warn:** einzelne Hosts können mangels Authentifizierung, Provider oder UI verfügbar bleiben.

## 9. Nächster Schritt

Pre-Implementation Brownfield Analysis durchführen; Host-Ausführung startet nur bei `pass`.
