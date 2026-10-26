# Ergebnis der MCP-Evaluation

**Beste geprüfte Variante: ein im Codex-Host vollständig sichtbares Schema und gebundene, nacheinander ausgeführte Leseaufrufe aus den vorhandenen Core-Ownern.** Die Umsetzung ist als isolierter Prototyp und als fertiger Produkt-Patch vorhanden. Main bleibt unverändert; AGDF wurde für diese Arbeit nicht aktiviert.

## Ergebnis mit echten Agenten

Alle vier Läufe des endgültigen Kandidaten verwenden nachweislich Codex CLI 0.163.0, gpt-6.1-sol und Reasoning low über das vorhandene ChatGPT-Konto. Zwei nutzen die unveränderte T7-Aufgabe, zwei vorab festgelegte deutsche/englische Formulierungsvarianten derselben Aufgabe.

| Variante | Beabsichtigte Freigabe | Streng qualifiziert | MCP-Aufrufe je Lauf | SDK-Eingabefehler |
|---|---:|---:|---:|---:|
| Frischer Main-Vergleich A1/A2 | 2/2 | 1/2 | 13 / 15 | 7 / 9 |
| Schema allein besser sichtbar B1/B2 | 0/2 | 0/2 | 6 / 8 | 3 / 4 |
| Erster geführter Prototyp | 1/1 | 0/1 | 5 | 0 |
| Endgültiger Kandidat | **4/4** | **4/4** | **je 4** | **je 0** |

Der endgültige Kandidat hat auch **null sonstige Fehlerergebnisse**, vollständige Traces, keine verbotenen Umwege und je genau eine tatsächliche UR-Freigabe der richtigen synthetischen Fassung. Die unveränderten strengen Prüfer wurden weder gelockert noch nachträglich umgedeutet. Insgesamt wurden in dieser Evaluation fünf von höchstens sechs neuen realen Sitzungen verwendet. Die alten A/B-Läufe gehören zur vorherigen Untersuchung und werden nicht als neue Sitzungen ausgegeben. Alle Fehlversuche bleiben erhalten.

## Ursache und Lösung

Die vollständige JSON-Schema-Validierung auf Main ist strenger als die Signatur, die Codex tatsächlich sieht: root allOf wird vor den danebenstehenden properties in Typen übersetzt. Im installierten Host blieben dadurch nur zwei Felder und zwei Operationen sichtbar; der Rest erschien als unknown. Ein Modell-freier Loopback-Versuch mit genau diesem Host belegt das. Die Bedingungen unter das ohnehin erforderliche operation zu verschieben macht alle 14 Felder und elf Operationen sichtbar, ohne die akzeptierten Eingaben zu ändern. Diese Änderung allein bestand die echte Aufgabenprüfung jedoch nicht.

Zusätzlich werden unzulässige Kombinationen klar beschrieben, insbesondere gate bei gate-check. Nach einer ausdrücklich gebundenen gate-check-Anfrage liefert der bestehende Core-Katalog konkrete nächste Leseaufrufe mit Ziel, Run, Modul und Revision. Sie stehen in einem separaten navigation-Envelope; der eigentliche CLI-Bericht bleibt identisch. Der Agent führt die Leseaufrufe nacheinander aus. Das ist sachlich erforderlich: gleichzeitige Leseaufrufe erzeugten im ersten Prototyp tatsächlich dispatch_busy.

Es gibt keine neue Schreibautorität, keine automatische Freigabe und keine implizite Auswahl des neuesten Dokuments. Der vorhandene Command-Owner prüft weiterhin jede tatsächlich angeforderte Freigabe und die konkrete menschliche Antwort. Historische Dokumente behalten ihre ursprüngliche Revision; aktuelle Vertragsabfragen behalten die aktuelle Revision.

## Anerkannte Quellen

- [OpenAI: Function Calling](https://developers.openai.com/api/docs/guides/function-calling): verständliche Parameter, bekannte Argumente im Code liefern und wiederkehrende Abläufe vereinfachen. Die lokale Umsetzung dieser Empfehlungen ist durch unsere eigenen Messungen begründet.
- [Anthropic: Writing effective tools for agents](https://www.anthropic.com/research/writing-tools-for-agents): aussagekräftige Werkzeugantworten, klare Grenzen und Evaluationen anhand tatsächlicher Aufgabenergebnisse. Deshalb zählen vorzeitig abgebrochene Läufe nicht als Effizienzgewinn.
- [MCP: Tools-Spezifikation](https://modelcontextprotocol.io/specification/2026-07-28/server/tools): Eingaben validieren, handlungsfähige Fehler liefern und Zustandsbezüge ausdrücklich behandeln. Unsere Ziel-/Run-/Revisionsregeln konkretisieren dies projektspezifisch.
- [Offizieller SDK-Tracker, Issue 2879](https://github.com/modelcontextprotocol/typescript-sdk/issues/2879): Eingabevalidierungsfehler entstehen vor dem Tool-Callback; der installierte SDK-Code bestätigt den privaten Fehlerpfad. Private SDK-Patches und das Abschalten der Validierung wurden verworfen.
- [Offizieller Codex-Typgenerator](https://github.com/openai/codex/blob/main/codex-rs/code-mode-protocol/src/json_schema_types.rs): Quellkontext zur Typ-Projektion; entscheidend für die konkrete Version ist zusätzlich unser Test des installierten CLI.

Ein vollständig nach Operationen verzweigtes Typschema wurde ebenfalls untersucht. Es benötigt 6630 Byte und scheidet an der unveränderten 5000-Byte-Grenze aus.

## Grenzen und Prüfung

- Inspect-Definition: **4992 / 5000 Byte**; bestehende Befehlsdefinitionen sowie Ein-/Ausgabegrenzen unverändert.
- Copilot: **397 Dateien, 3.509.443 / 3.509.461 Byte**, 18 Byte Reserve. Die Baseline wurde nicht geändert. Der erste zu große Prototyp wurde verworfen; doppelte Selektorabbildung und redundante Hilfetexte wurden im endgültigen Kandidaten zusammengeführt beziehungsweise gekürzt.
- **247.003 SDK-Validierungsfälle: null Unterschiede**; zusätzlich 160 Core-Übersetzungsfälle identisch. Alle 15 aufbewahrten ursprünglichen SDK-Fehler werden weiterhin abgelehnt.
- Negative MCP-Prüfungen: falsches Ziel, falsche Revision, mehrdeutiger Katalog, fehlende/beschädigte Präsentation und historische Freigaben sicher abgewiesen; keine Ersatzpräsentation und keine unerlaubte Mutation.
- Bestehende CLI-Berichtsparität, Auswahlregeln, Ausgabevalidierung, Vorschau und Schreibfreiheit geprüft. In einer temporären Kopie des bestehenden Tests wurde ausschließlich die alte Beschreibungserwartung aktualisiert. Die originalen Verhaltenserwartungen blieben unverändert.
- Originale MCP-Protokoll- und Befehlsgruppen-Suiten bestanden für die tatsächlichen STDIO-Pfade.
- Lokale p95-Latenz: frisch gestarteter MCP-Prozess nach Handshake **1246 ms / 1500 ms** (10 Messungen); bestehender Client **768 ms / 1000 ms** (20 Messungen). Runtime-Aufbau und Handshake sind aus dieser RPC-Messung ausgeschlossen.
- Main, alle vorgemerkten Git-Einträge, die fremden Dateien und die geschützten globalen Einstellungen sind unverändert.

Die vier erfolgreichen Agentenläufe belegen diesen Freigabe-Workflow. Sie beweisen keine Fehlerfreiheit aller elf Operationen, keine andere Host-Version und keine vollständige Release-Qualifikation. Zeit- und Tokenwerte stehen pro Lauf in summary.json; bei dieser kleinen Stichprobe werden keine statistischen Leistungs- oder Kostenversprechen abgeleitet.

## Nachweise

- [Produkt-Patch](final-candidate.patch)
- [Maschinenlesbares Ergebnis](summary.json)
- [Entscheidungen und verworfene Varianten](DECISION-NOTES.md)
- [Validierungsparität](parity-v2.json), [ursprüngliche Fehler](replay-v2.json)
- [Negative und lokale Warm-Prüfungen](protocol-v2-checks.json), [historische Bindungen](historical-v2.json), [Cold-Messung](cold-v2.json)
- [Copilot-Budget](copilot-v2-qualified-budget.json), [unveränderte Quellen und Regeln](v2-static-invariants.json)
- Vollständige Originalbeobachtungen, Ereignisse, Rollouts und SHA-256-Manifeste: evidence/v1-session-1 sowie evidence/v2-session-2 bis evidence/v2-session-5.
- Vorheriger A/B-Vergleich: /private/tmp/agdf-inspect-agent-ab/REPORT.md.
