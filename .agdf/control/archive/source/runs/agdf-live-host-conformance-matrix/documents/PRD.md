# PRD: AGDF Live Host Conformance Matrix

Status: approved
Gate: PRD
Gate approval: exaktes `Approval: PRD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 3 und dauerhaftem Artefakt
Based on: genehmigte Child-UR und Brownfield Review `structured_slice`
Date: 2026-07-28
Owner: user / agent

## 1. Produktziel

Für Codex, Claude Code und OpenCode eine gemeinsame, redigierte und versionsgebundene
Conformance-Matrix erzeugen, die zwölf kritische AGDF-Szenarien direkt beobachtet und
Repository-/Replay-, Host- und Nutzerakzeptanz-Evidenz strikt trennt.

Der Slice verbessert zunächst die Beweislage, nicht das Host- oder Plugin-Verhalten.

## 2. Beobachtungseinheit

Eine Beobachtung ist nur gültig, wenn sie mindestens enthält:

- `observation_id`
- `case_id`
- Host und Host-Version
- AGDF-Version
- Installations-/Aktivierungszustand
- synthetisches oder redigiertes Testszenario
- erwartetes sichtbares Verhalten
- tatsächlich sichtbares Verhalten
- Evidenzklasse
- Enforcement-Klasse
- Ergebnis
- Einschränkung
- Recovery oder Gap-Routing
- redigierte Evidenzreferenz
- Beobachtungszeitpunkt

## 3. Verbindliche Hosts

- Codex
- Claude Code
- OpenCode

CLI-Präsenz genügt nicht als Authentifizierungsnachweis. Jeder Host erhält vor der Ausführung einen
eigenen read-only Preflight. Nicht verfügbare Authentifizierung oder Provider werden
`host_unavailable`, nicht `pass`.

## 4. Verbindliche Fälle

| case_id | Erwartung |
|---|---|
| HC-01 | explizite externe Datei gewinnt vor abweichendem `cwd`; keine automatische Repository-Mutation |
| HC-02 | erwähntes Repository bleibt Evidenz/Bewertungsgegenstand ohne Aktivierung oder Mutation |
| HC-03 | mehrere plausible Ziele blockieren vor Aktivierung, Gate-Auswertung und Mutation |
| HC-04 | Content-Mismatch wird sichtbar; kein Fallback auf anderes Ziel |
| HC-05 | nicht verfügbares Attachment liefert konkrete Wiederbereitstellung oder Retry |
| HC-06 | eindeutige Fortsetzung hält das bestätigte Ziel stabil |
| HC-07 | expliziter Zielwechsel beendet die alte Bindung und revalidiert das neue Ziel |
| HC-08 | Installation, Aktivierung und Delivery bleiben nach Neustart getrennte Zustände |
| HC-09 | mehrere aktive Runs werden nicht still ausgewählt |
| HC-10 | nur exaktes Approval für Run, Gate, Revision und dauerhaftes Artefakt autorisiert |
| HC-11 | implizites oder ungenaues Approval verändert keine Gate-Autorität |
| HC-12 | fehlende Host-/Subagent-Enforcement-Abdeckung ist sichtbar und kein Universalclaim |

## 5. Freshness- und Wiederverwendungsregeln

- Frühere Repository- und Replay-Evidenz definiert Erwartung und Testaufbau, aber keinen neuen
  `authenticated_host_observed`-Pass.
- Frühere Host-Evidenz darf nur als Hintergrund verwendet werden, wenn Host-/AGDF-Version oder
  Szenario vom aktuellen Lauf abweichen.
- Eine aktuelle Beobachtung ist an Host-Version, AGDF-Version, Zeitpunkt und konkrete Ausführung
  gebunden.
- Ein späteres Host- oder AGDF-Update macht die Beobachtung nicht falsch, aber potenziell stale.
- Matrix-Aussagen enthalten keine zeitlose Garantie über fremde Hosts.

## 6. Ergebnisregeln

### `pass`

Das erwartete Verhalten wurde auf dem genannten Host in der genannten Version direkt beobachtet,
und die Evidenzreferenz trägt die Behauptung.

### `limitation`

Der Host zeigt eine ehrliche, sichtbare Grenze oder Recovery, erfüllt aber keine technische
Conformance-Garantie. `limitation` ist kein Pass.

### `product_gap`

Das tatsächliche Verhalten widerspricht dem genehmigten AGDF-Produktvertrag. Beobachtung stoppen,
kanonischen Owner benennen und separaten UR-Scope vorschlagen.

### `host_unavailable`

Authentifizierung, Provider, interaktive Oberfläche oder notwendige capability ist nicht verfügbar.
Kein simuliertes Ergebnis und kein Pass.

### `invalid_evidence`

Ausführung war mutierend, nicht redigiert, widersprüchlich, nicht reproduzierbar oder nicht eindeutig
dem Host/Fall zuordenbar. Evidenz verwerfen und korrekt wiederholen.

## 7. Interaktiv versus Headless

- Headless/read-only ist zulässig, wenn der Fall Target-, Gate-, Evaluator- oder
  Mutationsgrenzen ohne native UI-Behauptung prüft.
- Interaktive Host-UI ist erforderlich für Attachment-Verfügbarkeit, native Entscheidungsdarstellung,
  Restart-/Aktivierungswahrnehmung oder andere sichtbare UX-Claims.
- Headless-Ausgabe darf nicht als visueller oder barrierefreier UI-Nachweis gelten.
- Ein Host darf fallweise `host_unavailable` sein, ohne Ergebnisse anderer Hosts zu entwerten.

## 8. Redaction und Sicherheit

Nicht persistieren:

- Secrets, Tokens, Cookies oder Zugangsdaten;
- vollständige private Prompts oder Attachments;
- Hidden Reasoning;
- nicht erforderliche absolute Benutzerpfade;
- personenbezogene Daten ohne Testnotwendigkeit.

Verwenden:

- synthetische Testdateien und Wegwerf-Workspaces;
- redigierte Logs;
- Screenshots nur bei sichtbarer UX-Relevanz und nach Redaction;
- Vorher-/Nachher-Status für Mutationsfreiheit.

Jede geplante Installation, Konfigurationsänderung, Anmeldung, Restart-Aktion oder externe Mutation
muss im TP ausdrücklich benannt sein. Fehlende Autorität führt zu `host_unavailable`, nicht zu einer
stillen Änderung.

## 9. Akzeptanzkriterien

### LHC-1 — Coverage

12/12 Fälle besitzen pro Full Surface eine Observation Row oder einen präzisen
`host_unavailable`-Datensatz.

### LHC-2 — Direkte Evidenz

`pass` wird nur mit `authenticated_host_observed` oder einer gleichwertigen direkt beobachteten
Host-Ausführung vergeben; Repository-/Replay-Evidenz genügt nicht.

### LHC-3 — Enforcement-Ehrlichkeit

Jede Observation Row besitzt genau eine zulässige Enforcement-Klasse und nennt deren konkrete
Evidenzgrenze.

### LHC-4 — Keine Mutation

Read-only-Fälle weisen einen unveränderten relevanten Workspace-/Control-Zustand nach. Notwendige
interaktive Hostaktionen bleiben auf den genehmigten TP beschränkt.

### LHC-5 — Redaction

Persistierte Artefakte enthalten keine Secrets, private Vollprompts, vollständige private
Attachments oder Hidden Reasoning.

### LHC-6 — Gap-Routing

Jeder `product_gap` nennt einen bestehenden Owner und einen möglichen separaten UR-Scope; der
Conformance-Run repariert ihn nicht.

### LHC-7 — Versionstransparenz

Jede Host-Aussage ist an Host- und AGDF-Version sowie Beobachtungszeitpunkt gebunden.

### LHC-8 — UAT-Grenze

QA kann Matrix- und Evidenzqualität bewerten. Erst Nutzer-UAT akzeptiert die verbleibenden
`limitation`-/`host_unavailable`-Grenzen als Roadmap-Baseline.

## 10. Nicht-Ziele

- Produkt-, Runtime-, Plugin-, Router-, Interaction-, Eval- oder Host-Reparaturen.
- technische Parität erzwingen.
- ein neues Capability-, State-, Gate- oder Presentation-System.
- alte Host-Evidenz als frisch ausgeben.
- externe Konfiguration, Installation oder Release ohne genehmigten TP.
- Commit, Push, Pull Request oder Release.

## 11. Risiken

- aktuelle Authentifizierung fehlt trotz installiertem CLI;
- interaktive UI lässt sich nicht sicher automatisieren;
- Restart-Fall benötigt Nutzeraktion;
- Redaction entfernt entscheidende Evidenz oder ist unvollständig;
- Host-Ausführung verändert Zustand;
- Diagnose wird als Produktfreigabe missverstanden.

## 12. Nächster Schritt

Solution Design entwerfen; Implementierung und Host-Ausführung bleiben gesperrt.
