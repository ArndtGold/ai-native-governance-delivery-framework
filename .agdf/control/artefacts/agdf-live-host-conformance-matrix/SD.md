# SD: AGDF Live Host Conformance Matrix

Status: approved
Gate: SD
Gate approval: exaktes `Approval: SD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 4 und dauerhaftem Artefakt
Based on: genehmigtes Child-PRD
Date: 2026-07-28
Owner: user / agent

## 1. Lösungsziel

Die zwölf genehmigten Conformance-Fälle werden als kleiner, rein diagnostischer Evidence-Slice
über Codex, Claude Code und OpenCode beobachtet. Die Lösung erzeugt run-eigene, redigierte und
versionsgebundene Evidenz, ohne Plugin-, Runtime-, Host- oder Produktverhalten zu verändern.

## 2. Systemgrenze

Der Slice besitzt keinen neuen Produkt-, Contract-, Runtime-, Adapter- oder Presentation-Owner.
Kanonische AGDF-Contracts und bestehende Host-Oberflächen bleiben unverändert. Der Child-Run
besitzt nur seine Beobachtungsdaten und den daraus abgeleiteten Bericht:

- `HOST_CONFORMANCE_MATRIX.json`: primäre strukturierte Lauf-Evidenz;
- `HOST_CONFORMANCE_REPORT.md`: menschenlesbare Projektion der Matrix;
- `OBSERVATION_SCHEMA.json`: run-spezifische Schema- und Enum-Validierung, nicht normativ;
- `evidence/`: ausschließlich redigierte, fallbezogene Belege;
- optionaler Preflight-Abschnitt innerhalb der Matrix für Host-, Versions- und Capability-Zustand.

Es wird kein wiederverwendbares Produktions-Harness und kein paralleles Host-Capability-System
eingeführt. Ergibt der TP, dass ausführbarer neuer Code erforderlich wäre, muss SD/TP vor dieser
Erweiterung revidiert werden.

## 3. Beobachtungsarchitektur

Jede Kombination aus zwölf Fällen und drei Hosts erhält genau eine Observation Row. Zulässige
Ausführungsmodi sind:

1. `headless_read_only`: für Target-, Gate-, Evaluator- und Mutationsgrenzen ohne UI-Claim;
2. `interactive_observation`: für Attachment-, native Entscheidungs-, Restart- und sichtbare
   Aktivierungs-Claims;
3. `host_unavailable`: wenn Authentifizierung, Provider, Oberfläche oder Capability fehlt.

Headless-Evidenz darf keinen interaktiven oder visuellen Claim tragen. Eine teilweise verfügbare
Oberfläche wird fallweise klassifiziert; sie entwertet keine belastbaren Beobachtungen anderer
Hosts.

## 4. Host-Preflight

Vor jeder Host-Serie wird read-only erfasst:

- Host und Host-Version;
- AGDF-Version sowie Installations- und Aktivierungszustand;
- Authentifizierungs-/Provider-Verfügbarkeit ohne Account- oder Secret-Daten;
- verfügbare Headless- und interaktive Beobachtungswege;
- geplanter Beobachtungsmodus und dessen konkrete Grenze.

CLI-Präsenz wird nicht als Authentifizierung ausgelegt. Unsichere oder zu ausführliche
Preflight-Ausgabe wird nicht persistiert. Sichere konkrete Probe-Befehle und zulässige Felder
werden erst im TP festgelegt und vor Ausführung geprüft.

## 5. Isolations- und Mutationsschutz

- Alle synthetischen Fälle laufen in expliziten Wegwerf-Workspaces.
- Nutzerprojekte, fremde Runs, Home-Verzeichnis, globale Konfiguration und bestehende
  Installationen sind keine Testziele.
- Read-only-Fälle erhalten einen relevanten Vorher-/Nachher-Nachweis für Workspace- und
  Control-Zustand.
- Installation, Anmeldung, Konfigurationsänderung, Restart, Task-Erzeugung und externe Mutation
  sind nur zulässig, wenn der genehmigte TP die konkrete Aktion, das Ziel und die Recovery nennt.
- Fehlt diese Autorität oder sichere Isolation, lautet das Ergebnis `host_unavailable` oder
  `invalid_evidence`, nicht eine stille Änderung.

Die aktuelle Codex-Aufgabe wird nicht automatisch zu einer Testoberfläche umfunktioniert.
Erforderliche interaktive Beobachtungen werden später über einen ausdrücklich vorgesehenen,
dedizierten und sicher beobachtbaren Host-Pfad ausgeführt.

## 6. Datenmodell

Eine Observation Row enthält mindestens:

- `observation_id`, `case_id`, `host`;
- `host_version`, `agdf_version`, `observed_at`;
- `installation_state`, `activation_state`, `authentication_state`;
- `observation_mode`;
- `expected_behavior`, `actual_behavior`;
- `evidence_class`, `enforcement_class`;
- `result`, `limitation`, `recovery_or_gap_route`;
- `evidence_refs`;
- `mutation_guard` mit Vorher-/Nachher-Ergebnis.

Zulässige Ergebnisse sind ausschließlich `pass`, `limitation`, `product_gap`,
`host_unavailable` und `invalid_evidence`. Ein `pass` verlangt direkte, frische und der konkreten
Host-/AGDF-Version zuordenbare Evidenz.

## 7. Evidenz- und Redaction-Pipeline

1. Synthetisches Szenario und erwartetes Verhalten festlegen.
2. Sicheren Preflight ausführen und Modus bestätigen.
3. Vorher-Zustand des isolierten Ziels erfassen.
4. Genau einen begrenzten Fall beobachten.
5. Nachher-Zustand erfassen und Mutation ausschließen oder Evidenz verwerfen.
6. Rohbeobachtung sofort auf eine Positivliste zulässiger Felder reduzieren.
7. Redigierten Beleg referenzieren und Matrixzeile klassifizieren.
8. Markdown-Bericht aus der strukturierten Matrix ableiten und auf Parität prüfen.

Nicht persistiert werden Secrets, Tokens, Cookies, Account-Kennungen, private Vollprompts,
vollständige Attachments, Hidden Reasoning und nicht erforderliche absolute Benutzerpfade.
Screenshots sind nur bei notwendiger UI-Evidenz zulässig und müssen vor Aufnahme in `evidence/`
redigiert sein.

## 8. Fall-zu-Modus-Zuordnung

| Fälle | Primärer Modus | Begründung |
|---|---|---|
| HC-01 bis HC-04 | `headless_read_only` | Target-Bindung, Ambiguität und Mismatch ohne UI-Claim |
| HC-05 | `interactive_observation` | Attachment-Verfügbarkeit und sichtbare Recovery |
| HC-06 bis HC-07 | `headless_read_only`, bei sichtbarem Mehrturn-Claim interaktiv ergänzen | Fortsetzung und expliziter Zielwechsel |
| HC-08 | `interactive_observation` | sichtbare Trennung von Installation, Aktivierung und Delivery nach Restart |
| HC-09 | `headless_read_only` | mehrere aktive Runs und Auswahlgrenze |
| HC-10 bis HC-11 | `headless_read_only`; native Darstellung nur interaktiv bewerten | exakte versus implizite Approval-Autorität |
| HC-12 | `headless_read_only` | Enforcement-Klasse und sichtbare Abdeckungsgrenze |

Die endgültige Host-/Fall-Ausführbarkeit wird im TP anhand sicherer Preflights festgelegt.

## 9. Gap-Routing

`product_gap` stoppt die betroffene Beobachtungslinie. Die Matrix nennt den bestehenden
kanonischen Owner und skizziert einen separaten UR-Scope; der Child-Run repariert den Befund nicht.
Host-spezifische Grenzen bleiben `limitation` oder `host_unavailable` und werden nicht als
universelle AGDF-Garantie formuliert.

## 10. Verifikation

Der spätere TP muss mindestens folgende Nachweise planen:

- Schema- und Enum-Validierung;
- exakt 36 Host-/Fall-Zeilen oder präzise begründete Unverfügbarkeit;
- direkte Evidenzreferenz für jeden `pass`;
- Versions- und Freshness-Vollständigkeit;
- Redaction-Prüfung gegen verbotene Datenklassen;
- Vorher-/Nachher-Nachweis der Mutationsfreiheit;
- Parität zwischen JSON-Matrix und Markdown-Bericht;
- keine Änderungen außerhalb der genehmigten Child-Control-Artefakte und Wegwerfziele.

QA bewertet die Qualität der Matrix und Evidenz. UAT entscheidet erst danach, ob verbleibende
`limitation`- und `host_unavailable`-Grenzen als Roadmap-Baseline akzeptabel sind.

## 11. Akzeptanzabbildung

| PRD-Kriterium | SD-Entscheidung |
|---|---|
| LHC-1 | 36 eindeutige Observation Rows mit fallweiser Unverfügbarkeit |
| LHC-2 | direkte, frische Host-Evidenz als einzige Pass-Grundlage |
| LHC-3 | explizite Evidence-/Enforcement-Klassen mit konkreter Grenze |
| LHC-4 | Wegwerf-Workspaces und Vorher-/Nachher-Mutationsschutz |
| LHC-5 | Positivlisten-Redaction vor Persistenz |
| LHC-6 | Stop-and-route zum bestehenden Owner, keine Reparatur |
| LHC-7 | Host-, AGDF-Version und Zeitpunkt je Zeile |
| LHC-8 | getrennte QA- und Nutzer-UAT-Entscheidung |

## 12. Verworfene Alternativen

- ein gemeinsamer Simulator statt direkter Host-Beobachtung;
- frühere Evidenz als frischen Host-Pass wiederverwenden;
- ein neues persistiertes Test-Harness ohne nachgewiesenen Bedarf;
- Authentifizierung oder Konfiguration automatisch herstellen;
- gefundene Produktlücken innerhalb dieses Conformance-Runs beheben.

## 13. Nächster Schritt

Aufgaben- und Testplan entwerfen; Implementierung und Host-Ausführung bleiben gesperrt.
