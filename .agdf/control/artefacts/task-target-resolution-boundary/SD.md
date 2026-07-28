# SD: Task Target Resolution Boundary

Status: approved
Gate: SD
Gate approval: `Approval: SD` accepted on 2026-07-28 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: PRD (approved 2026-07-28)
Date: 2026-07-28
Owner: user / agent

## 1. Lösungsüberblick

AGDF erhält einen fokussierten normativen Contract `task-target-resolution.md`, der logisch vor
Repository-Aktivierung, Scope Classification und Gate-Auswertung liegt. Der Contract definiert die
Target-Autorität, die Trennung von Arbeitsziel und Evidenz sowie die fail-closed Zustände.

Der Agent Router und `gate-check` konsumieren diesen Contract vor ihren heutigen repositorybezogenen
Schritten. Die bestehende Scope Classification bleibt allein für Modus-, Boundary- und
UR-Trigger-Auswertung zuständig. Die bestehende Interaktionsdarstellung projiziert Target-Zustand
kompakt und nicht-autorisierend; sie wird weder Evaluator noch State Store.

Es entsteht keine neue globale Persistenz. Bei einem aktiven Run kann die bereits vorhandene
run-scoped Source-/Scope-Sektion das bestätigte Ziel als Evidenz führen. Außerhalb eines Runs gilt
die explizite aktuelle Anfrage beziehungsweise eine eindeutig revalidierte Gesprächsfortsetzung.

## 2. Ownership und Source of Truth

| Verantwortungsbereich | Kanonischer Owner | Entscheidung |
|---|---|---|
| Task-Target-Semantik und Reihenfolge | neuer Contract `plugin/meta/contracts/task-target-resolution.md` | einziger normativer Owner für `primary_target`, `evidence_sources`, `working_directory`, `governance_target`, Präzedenz und fail-closed Zustände |
| Router-Einstieg | `plugin/meta/agdf-agent-router.md` | verweist vor Mode Selection auf Target Resolution; enthält nur kurze operative Routing-Regeln |
| Gate- und Repository-Scope | `plugin/meta/contracts/gate-transition.md` | bleibt alleiniger Owner für Gate-Reihenfolge, Repository-Workstate und Scope-Ambiguität nach Target Resolution |
| Operative Anwendung | `plugin/skills/gate-check/SKILL.md` | revalidiert das Task Target vor Repository-Kontrollzustand und konsumiert Contract sowie kanonische Presentation |
| Sichtbare Darstellung | `plugin/meta/contracts/interaction.md` und `create-agdf/lib/interaction-presentation.js` | bestehender Contract- und Code-Owner; keine Target-Entscheidung im Renderer |
| Runtime-Manifest | `plugin/meta/agdf-runtime-contract.md` | indexiert den neuen Contract als Kompatibilitätsmanifest |
| Propagation | `create-agdf/scripts/sync-package-assets.js` und bestehende Plugin-Synchronisation | nimmt das neue Contract-Modul in die bestehende Contract-Liste auf; keine neue Sync-Pipeline |
| Drift- und Ownership-Prüfung | `plugin/scripts/check-runtime-integrity.mjs` | prüft Modulpräsenz, Router-/Skill-Verweise, Reihenfolge und Single Ownership |
| Verhaltens-Evidenz | `evals/cases/gate-check.json` und bestehende Eval-Infrastruktur | deckt eindeutige, mehrdeutige, adversariale und Mehrturn-Fälle ab |
| Dauerhafte Wissensbeziehung | `.agdf/control/CONTEXT_GRAPH.md` | erhält nach genehmigtem SD einen neuen Target-Authority-Knoten; kein neuer Graph-Owner |

## 3. Architekturentscheidungen

### AD-1: Vorgelagerte Auflösungsreihenfolge

Für jede neue Arbeitsanfrage wird vor AGDF-Repository-Aktivierung bestimmt:

1. `primary_target`: explizit benannte Datei, Artefakt oder Repository im aktuellen Turn;
2. andernfalls ein zuvor bestätigtes Ziel, wenn der aktuelle Turn eindeutig dieselbe Aufgabe
   fortsetzt;
3. andernfalls `cwd` nur als Zielkandidat, wenn die Anfrage ausdrücklich oder deiktisch Arbeit am
   aktuellen Projekt/Repository verlangt;
4. andernfalls `unresolved_target`.

Ein explizites Ziel, das nicht verfügbar ist oder dessen Inhalt der beauftragten Änderung
widerspricht, darf nicht durch `cwd` oder eine Evidenzquelle ersetzt werden.

### AD-2: Getrennte Rollen

Das normalisierte Resolution-Ergebnis trägt:

- `resolution_state`: `resolved | unresolved`;
- `reason_code`: `explicit_target | continued_target | multiple_plausible_targets |
  target_content_mismatch | target_unavailable | no_reliable_target`;
- `primary_target`: genau ein Arbeitsziel bei `resolved`, sonst leer;
- `evidence_sources`: null bis viele gelesene oder erwähnte Quellen ohne Mutation Authority;
- `working_directory`: Laufzeitkontext ohne eigene Zielautorität;
- `governance_target`: das Repository, dessen AGDF-Kontrollzustand für `primary_target` gilt,
  andernfalls leer;
- `target_changed`: sichtbarer Zielwechselhinweis;
- `next_action`: Klärungs-, Bereitstellungs- oder Retry-Aktion bei `unresolved`.

`governance_target` wird ausschließlich aus dem aufgelösten primären Ziel oder einer expliziten
Nutzerzuordnung abgeleitet. Ein nur erwähntes oder als Evidenz inspiziertes Repository darf diese
Rolle nicht erhalten.

### AD-3: Fail-closed ohne stilles Fallback

`multiple_plausible_targets`, `target_content_mismatch`, `target_unavailable` und
`no_reliable_target` sperren Mutation, Repository-Aktivierung und Gate-Auswertung. Die nächste
Aktion ist ausschließlich Klärung, erneute Bereitstellung oder Retry. Der Agent darf keine
benachbarte Datei und kein erwähntes Repository als Ersatz auswählen.

### AD-4: Stabile Fortsetzung ohne globale State Authority

Eine Gesprächsfortsetzung darf ein bestätigtes Ziel verwenden, wenn Handlung, Gegenstand und
Scope eindeutig fortgesetzt werden. Neue explizite Zielangaben gewinnen immer. Entsteht
Ambiguität, endet die implizite Bindung fail-closed.

Bei vorhandenem AGDF-Run wird die bestehende Source-/Scope-Sektion als dauerhafte Evidenz genutzt.
Ohne Run bleibt die Bindung transient im Gesprächskontext. Es wird weder eine globale Target-Datei
noch ein zweiter Run-State eingeführt.

### AD-5: Eine bestehende Presentation Authority

`interaction.md` definiert eine nicht-autorisierende Task-Target-Orientierung. Der bestehende
`interaction-presentation.js` erhält einen fokussierten Renderer für das normalisierte Ergebnis.
Dieser Renderer:

- entscheidet kein Ziel und leitet kein Governance Target ab;
- trägt `authorizes: false`;
- zeigt bei relevanter Zieltrennung `primary_target`, `governance_target`, `evidence_sources` und
  `working_directory` kompakt;
- zeigt bei fail-closed Zuständen Reason Code und nächste Aktion;
- zeigt `target_changed`, wenn ein Zielwechsel sonst missverständlich wäre;
- liefert bei fehlenden oder widersprüchlichen Pflichtfeldern `null`, worauf der Agent fail-closed
  klärt;
- verwendet den bestehenden Locale-Registry- und English-Fallback-Mechanismus.

Bei ungated Fresh Scopes erscheint die Target-Orientierung vor der bestehenden Scope
Classification Card. Bei gated Runs erscheint sie nur, wenn Zieltrennung, Zielwechsel oder ein
Blocker sichtbar gemacht werden muss. Sie ersetzt weder Run Status Card noch Gate Transition Card.

### AD-6: Keine Änderung der Gate-Semantik

Task Target Resolution entscheidet nur, *welches* Arbeits- und Governance-Ziel gilt. Erst danach
entscheiden die bestehenden Owner über Read-only Orientation, Scope Classification, Modus und
Gates. Approval-Werte, Gate-Reihenfolge, Ready-Gate-Envelope und UAT bleiben unverändert.

### AD-7: Bestehende Propagation erweitern

Das neue Contract-Modul wird den bestehenden `contractModules`-Listen in
`sync-package-assets.js` und `check-runtime-integrity.mjs` hinzugefügt. Die vorhandene rekursive
Plugin-Synchronisation verteilt Router, Skill, Interaction Contract und Renderer. Es entsteht keine
zweite Surface-spezifische Regelkopie.

## 4. Integrationspunkte

| Integrationspunkt | Änderung | Datenfluss |
|---|---|---|
| `agdf-agent-router.md` | neuer Abschnitt vor Mode Selection; neuer Runtime-Contract-Verweis | Nutzeranfrage → Task Target Resolution → Repository-Aktivierung/Mode Selection |
| `task-target-resolution.md` | neues fokussiertes Contract-Modul | Anfrage- und Kontextsignale → normalisiertes Resolution-Ergebnis |
| `gate-check/SKILL.md` | neuer Contract-Input und erster Workflow-Schritt | Resolution-Ergebnis → Governance Target → bestehender Doctor/Gate Check |
| `interaction.md` | Presentation-Semantik, Aktivierungs- und Nicht-Duplikationsregeln | Resolution-Ergebnis → sichtbare nicht-autorisierende Orientierung |
| `interaction-presentation.js` | Renderer im bestehenden Owner | validiertes Ergebnis + Locale Registry → Markdown oder `null` |
| Locale Registry | neue `taskTargetResolution`-Keys für `en`/`de` | bestehende Locale-Auflösung → vollständige einsprachige Projektion |
| Runtime Contract Manifest | neue Indexzeile | Contract-Discovery und Kompatibilität |
| Sync/Integrity | Contract-Liste und konkrete Assertions | Source Assets → generierte Oberflächen; Drift → Fehler |
| Behavioral Evals | neue Gate-check-Fälle einschließlich Mehrturn-Dialog | Prompt-/Turn-Sequenz → erwartetes Ziel, Blocker und verbotene Mutation |
| Context Graph | neuer Knoten nach SD-Freigabe | Design-Invariante → Closeout-Reconciliation |

## 5. Constraints und Kompatibilität

- Bestehende Gate-Transition- und Scope-Classification-Semantik bleibt unverändert.
- Kein neuer User Gate, Approval-Wert oder persistenter globaler State.
- `cwd` bleibt Kontext, niemals alleinige Autorität.
- Evidence Access erteilt keine Mutation Authority.
- Alle Blocker sind vor Mutation und Gate-Auswertung wirksam.
- Bestehender Presentation- und Locale-Owner wird erweitert, nicht dupliziert.
- Generierte Codex-, Claude-Code-, OpenCode- und Copilot-Oberflächen müssen semantisch synchron sein.
- Alte aktive Runs ohne neue Source-/Scope-Felder bleiben lesbar; fehlende Felder werden nicht
  rückwirkend als bestätigtes Target interpretiert.
- Repository-/Unit-Evidenz darf nicht als Live-Host-Nachweis ausgegeben werden.

## 6. Test- und Evidenzstrategie

| Evidenz | Deckt ab |
|---|---|
| Renderer-Unit-Tests für resolved, changed, mismatch, unavailable und invalid input | TTR-7 bis TTR-9; `authorizes: false`; `null` bei widersprüchlichen Inputs |
| Locale-Parity- und Unit-Fallback-Tests | vollständige `en`/`de`-Darstellung ohne Sprachmischung |
| Runtime-Integrity-Assertions | neuer Contract in Manifest/Sync/Runtime, Router-Reihenfolge, Skill-Verweis, kein zweiter Semantik- oder Presentation-Owner |
| Gate-check Behavioral Evals | explizite Datei vor `cwd`, Evidenz-vs.-Mutation, Governance-Aktivierung nach Resolution, Mehrziel-Ambiguität, Inhalts-Mismatch, Nichtverfügbarkeit |
| Mehrturn-Evals | bestätigte Fortsetzung, expliziter Zielwechsel und Ambiguität nach zuvor stabilem Ziel |
| Sync- und Package-Smoke | Parität der generierten Oberflächen und installierbares Layout |
| `doctor`, `gate-check`, Runtime Integrity und `git diff --check` | Kontrollzustand, Gate-Bereitschaft und mechanische Integrität |
| spätere TP-, Clean-, Code- und QA-Reviews | vollständige TTR-1…TTR-10-Coverage und Brownfield Fit |

## 7. Risiken und offene Fragen

- Host-Anhänge besitzen nicht immer stabile Dateipfade. Die Implementierung muss fehlende
  Host-Evidenz als `target_unavailable` behandeln und darf keine Verfügbarkeit behaupten.
- Ein Modell kann Fortsetzungssemantik falsch einschätzen. Mehrturn-Evals müssen deshalb positive
  und adversariale Übergänge enthalten; Unsicherheit führt zu `unresolved_target`.
- Zu häufige Orientierung erzeugt Chat-Rauschen. Die Presentation erscheint bei relevanter
  Zieltrennung, Blockern und Zielwechseln, nicht als redundante Karte in jedem eindeutigen Turn.
- Runtime-Integrity kann normative Reihenfolge und Text-Ownership prüfen, aber kein reales
  Modellverhalten vollständig erzwingen. Behavioral Evals und ehrliche Host-Evidenzgrenzen bleiben
  erforderlich.
- Die Context-Graph-Promotion erfolgt erst nach SD-Freigabe und wird bei Closeout reconciliiert.

## 8. Nächster Schritt

Dieses Solution Design prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: SD`
