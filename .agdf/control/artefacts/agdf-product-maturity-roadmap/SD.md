# SD: AGDF Product Maturity Roadmap

Status: approved
Gate: SD
Gate approval: `Approval: SD` accepted on 2026-07-28 after same-run, same-gate, revision-5 and durable-artefact revalidation.
Based on: genehmigter PRD PMR-1 bis PMR-7
Date: 2026-07-28
Owner: user / agent

## 1. Architekturziel

Die Roadmap wird als koordinierender Programm-Scope über bestehenden AGDF-Ownern realisiert. Sie
besitzt keine eigene Runtime, keinen zweiten Router, keinen zweiten State Store und keinen zweiten
Presentation-Owner.

Der Roadmap-Run besitzt:

- Reihenfolge und Eintrittsbedingungen der Arbeitslinien;
- gemeinsame Produktmetriken und Evidenzgrenzen;
- Links auf die autoritativen Artefakte der Folgeruns; und
- die aggregierte PMR-1-bis-PMR-7-Abnahme.

Jeder ausführbare Folgerun besitzt weiterhin seine eigene UR, proportionale Brownfield-Entscheidung,
Artefakte, Freigaben, QA, UAT und OR. Keine Roadmap-Freigabe wird an einen Folgerun vererbt.

## 2. Systemgrenze

```text
Roadmap Run
  ├─ Baseline links to existing QA/UAT runs
  ├─ Workstream 1: Live Host Conformance
  ├─ Workstream 2: Proportionality and Ceremony
  ├─ Workstream 3: Enforcement Closure
  └─ Workstream 4: Unified Journey

Each workstream
  └─ owns an independent AGDF run and exact approvals

Canonical runtime owners
  ├─ Target Resolution
  ├─ Modes and Gate Transition
  ├─ Quality and Capability Evidence
  ├─ Interaction and Presentation
  └─ Skill Evals and Runtime Integrity
```

Die Roadmap referenziert diese Owner. Sie kopiert deren Regeln oder Zustand nicht.

## 3. Architekturentscheidungen

### AD-1 — Programm- statt Mutationsautorität

`agdf-product-maturity-roadmap` ist ausschließlich Koordinations- und Aggregationsautorität.
Quellcodeänderungen werden nur einem separat genehmigten Folgerun zugerechnet.

Konsequenzen:

- kein Roadmap-Mega-TP mit Runtime-Dateien;
- kein Parent-Run als Bypass für Child-Gates;
- keine automatische Erstellung oder Freigabe von Folgeruns;
- der Parent verlinkt Ergebnisse, er repliziert sie nicht.

### AD-2 — Unabhängige Run-Grenzen

Ein Folgerun darf erst angelegt werden, wenn ein konkreter, evidenzierter Rest-Gap vorliegt. Seine
UR muss mindestens nennen:

- beobachtetes Verhalten oder fehlende Evidenz;
- kanonischen Owner;
- ausgeschlossene bestehende Runs und fremde Diffs;
- gewünschte Verbesserung und Schutzgrenze; sowie
- reproduzierbare Abnahmesignale.

Roadmap-, PRD- oder SD-Freigaben autorisieren weder Child-UR noch Child-Implementierung.

### AD-3 — Baseline-Register

Der Roadmap-Run führt ein kompaktes Baseline-Register als Artefakt. Jede Zeile enthält:

`baseline_id | existing_run | covered_requirements | state | evidence_class | limitation | next_action`

Zulässige Zustände:

- `accepted`
- `ready_for_user_decision`
- `evidence_limited`
- `superseded`
- `not_applicable`

Der Parent speichert nur Links und eine normalisierte Bewertung. Vollständige Evidenz bleibt beim
Owner-Run.

### AD-4 — Conformance zuerst

Der erste neue ausführbare Kandidat ist `agdf-live-host-conformance-matrix`.

Sein Scope:

- PMR-3-Pflichtfälle auf Codex, Claude Code und OpenCode;
- Host-/Version-/Evidenz-/Enforcement-Klassifikation;
- redigierte, reproduzierbare Beobachtungsprotokolle;
- Gap-Ausgabe ohne automatische Produktänderung.

Der Conformance-Run ist zunächst Diagnose- und Evidenzscope. Gefundene Produkt- oder Runtime-Lücken
werden nicht still im Testlauf repariert, sondern in einen klaren Folge-UR geroutet.

### AD-5 — Ein gemeinsames Messmodell

Die PRD-Begriffe bleiben die produktseitige Autorität:

- Evidence Class;
- Enforcement Class;
- Interaktionsbudget;
- Über-Governance;
- Unter-Governance;
- kritisches Missverständnis.

Technische Schemas werden erst im zuständigen Folgerun entworfen. Dabei gelten folgende Owner-Grenzen:

| Begriff | Kanonischer bestehender Owner | Zulässige Erweiterung |
|---|---|---|
| Evidence Classes und QA-Wirkung | `plugin/meta/contracts/quality.md` | gemeinsame Definition und Review-/QA-Konsum |
| Host-/Evaluator-Capability | bestehende Surface Capabilities und Adapter | surfacebezogene Fakten und direkte Evidenz |
| Delivery Path | `modes.md`, `gate-transition.md` | Klassifikationskriterien, keine zweite Mode-Tabelle |
| sichtbare Projektion | `interaction.md`, `interaction-presentation.js` | Progressive Disclosure und ehrliche Grenzen |
| Behavioral Benchmarks | bestehendes `evals/`-Manifest, Cases und Fixtures | neues Corpus innerhalb bestehender Eval-Infrastruktur |

Eine übergreifende Enforcement-Matrix ist eine abgeleitete Evidence View, keine zweite Policy-Quelle.

### AD-6 — Proportionalitäts-Benchmark

Der spätere Proportionalitäts-Run erweitert die bestehende Eval-Infrastruktur:

- mindestens 40 klassifizierte Real-Task-Fälle;
- getrennte Labels für erwarteten und tatsächlichen Delivery Path;
- Fehlerklassen `over_governance`, `under_governance`, `correct`, `ambiguous`;
- adversariale Grenzfälle;
- fail-closed Behandlung von `ambiguous`;
- Auswertung der PRD-Schwellenwerte.

Der Benchmark darf Gate-Legalität nicht selbst definieren. Erwartete Pfade werden gegen die
kanonischen Mode-/Gate-Owner validiert.

### AD-7 — Progressive-Disclosure-Journey

Eine spätere Journey-Änderung erweitert ausschließlich die bestehende Interaction Pipeline:

1. normalisierter effektiver Zustand aus kanonischen Ownern;
2. code-owned kompakte Standardprojektion;
3. optionale `Why?`-/Detailprojektion;
4. Host-Adapter oder exakter Text;
5. keine direkte State-Mutation durch die Darstellung.

Ein Dashboard kann nur als abgeleitete read-only View diskutiert werden. Es darf niemals
State-, Gate-, Scope- oder Approval-Autorität besitzen und gehört nicht zum genehmigten Scope.

### AD-8 — Enforcement Closure

Die Enforcement-Matrix wird zuerst aus bestehender Evidenz abgeleitet. Eine technische Änderung ist
nur zulässig, wenn:

- eine konkrete Matrixzelle einen Gap zeigt;
- der Host eine belastbare technische Grenze anbietet;
- ein bestehender Owner erweitert werden kann;
- negative Umgehungstests möglich sind; und
- die Änderung keinen Universalclaim aus einem surface-spezifischen Mechanismus ableitet.

`instruction_only`, `host_limited` und `not_enforceable` sind gültige ehrliche Endzustände, sofern
Grenze und Recovery sichtbar sind.

### AD-9 — Evidenzpromotion und Abschluss

Ein Folgerun-Ergebnis wird erst in den Roadmap-Status übernommen, wenn sein eigener kanonischer
Zustand es erlaubt:

- Repository-/Replay-Evidenz nach QA;
- Host-Beobachtung nach direkter protokollierter Ausführung;
- Nutzerakzeptanz erst nach exaktem UAT-Approval;
- Abschlussstatus erst nach OR.

Die Roadmap darf keine niedrigere Evidenzklasse hochstufen.

### AD-10 — Context Graph

Die Roadmap bleibt `link_only`. Neue Context-Graph-Knoten werden nur in einem Folgerun erstellt,
wenn dessen SD eine neue dauerhafte Autorität oder Invariante belegt. Roadmap-Fortschritt,
Testversionen und einzelne Host-Beobachtungen sind keine Graph-Knoten.

## 4. Ablauf und Abhängigkeiten

### Phase 0 — Baseline

1. `task-target-resolution-boundary` bis QA/UAT/OR führen oder Grenze dokumentieren.
2. `agdf-interaction-ownership-quick-path-ux` bis UAT/OR führen oder Grenze dokumentieren.
3. relevante OpenCode-Aktivierungs-/Hardening-Runs verlinken.
4. Baseline-Register erzeugen.

Phase 0 verändert keinen bestehenden Run und akzeptiert keine Freigabe stellvertretend.

### Phase 1 — Live Host Conformance

1. konkrete UR für den Conformance-Run;
2. Brownfield-Prüfung vorhandener Probes und Host-Adapter;
3. redigierte Matrix und Ausführungsplan;
4. direkte Host-Beobachtung;
5. Gap-Routing.

### Phase 2 — Proportionalität und Zeremonie

Start nur mit Conformance-Ergebnis und versionierter 40-Fall-Baseline.

### Phase 3 — Enforcement Closure

Start nur für konkrete technisch schließbare Matrix-Gaps.

### Phase 4 — Unified Journey

Start erst, wenn Ziel-, Routing- und Enforcement-Zustände stabil genug sind, um keine neue
Presentation-Semantik während der UX-Implementierung zu erfinden.

## 5. Daten- und Autoritätsfluss

```text
Existing run artefacts ─┐
Host observations ──────┼─> Redacted evidence classification
Eval benchmark ─────────┘              │
                                      v
                           Roadmap baseline/status links
                                      │
                                      v
                           Independent child-run UR
                                      │
                         exact approvals remain local
```

Der Roadmap-Status ist abgeleitet. Bei Widerspruch gewinnt immer der kanonische Child-Run.

## 6. Anforderungszuordnung

| PRD | Designentscheidungen | Primärer Lieferpfad |
|---|---|---|
| PMR-1 | AD-1, AD-6, AD-7 | Proportionalität/Zeremonie und Journey |
| PMR-2 | AD-5, AD-8, AD-9 | Enforcement Matrix und gezielte Closure |
| PMR-3 | AD-2, AD-4, AD-9 | Live Host Conformance |
| PMR-4 | AD-5, AD-6 | bestehende Eval-Infrastruktur |
| PMR-5 | AD-1, AD-7 | bestehender Interaction-/Presentation-Owner |
| PMR-6 | AD-4, AD-7, AD-9 | Host-Conformance und Journey-UAT |
| PMR-7 | AD-5, AD-8, AD-9 | Quality Contract und Child-QA |

## 7. Test- und Evidenzarchitektur

### Roadmap-Ebene

- Doctor und Delivery Map für Parent- und ausgewählte Child-Runs.
- Link-/Status-Konsistenz zwischen Baseline-Register und kanonischem Child-Zustand.
- Keine vererbten Approvals oder implizite Child-Autorität.
- Keine Runtime-Datei im Roadmap-eigenen TP-Scope.

### Folgerun-Ebene

- fokussierte Tests des jeweiligen kanonischen Owners;
- negative Drift-/Umgehungstests;
- vollständige relevante Smoke-/Integrity-/Eval-Kette;
- Task Plan Review, Clean Review, Code Review und QA;
- direkte sichtbare UAT für Host- oder Journey-Claims.

### Aggregierte Abnahme

- PMR-1 bis PMR-7 werden nur aus verlinkten pass-/approved-/accepted-Evidenzen erfüllt;
- `unverified` oder `evidence_limited` bleibt sichtbar;
- ein offener kritischer Unter-Governance- oder Autoritätsbefund blockiert Roadmap-QA.

## 8. Kompatibilität und Sicherheit

- Persistierte Mode-, Gate-, Approval- und Run-Werte bleiben unverändert.
- Existing Runs und fremde Worktree-Änderungen bleiben isoliert.
- Host-Protokolle werden redigiert; keine Secrets, Hidden Reasoning oder vollständigen privaten
  Prompts werden persistiert.
- Keine Registry-, Installations-, Release- oder VCS-Aktion wird aus der Roadmap abgeleitet.
- Surface-spezifische technische Grenzen erhalten keine globale Geltung.
- Ein fehlender oder widersprüchlicher Child-Status bleibt fail-closed.

## 9. Bewusst verworfene Alternativen

### Ein Mega-TP für alle fünf Punkte

Verworfen wegen Scope Drift, paralleler Owner-Risiken, langer Feedbackschleife und unklarer
Evidenzzuordnung.

### Zuerst eine neue Benutzeroberfläche bauen

Verworfen, weil ungeklärte Host- und Enforcement-Zustände sonst in einer zweiten Darstellung
modellseitig erfunden würden.

### Nur weitere deterministische Tests ergänzen

Verworfen, weil PMR-3 und PMR-6 direkte Host- beziehungsweise Nutzerbeobachtung verlangen.

### Einheitliche technische Garantie für alle Hosts

Verworfen, weil Host-Fähigkeiten unterschiedlich und teilweise instruktional sind.

## 10. Nächster Schritt

Solution Design prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: SD`
