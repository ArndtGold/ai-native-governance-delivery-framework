# Task/Test Plan: Klare nächste Schritte in AGDF-Karten

Status: draft
Gate: TP
Gate approval: open
Based on: approved SD revision 10
Date: 2026-09-28
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## Task List

| task_id | task |
|---|---|
| T-STATE-CARDS | Die kanonischen Ziel-, Setup- und Run-Statuskarten aus den vorhandenen Resolver-, Doctor- und Gate-Zuständen rendern; Akteur, Wartezustand, tatsächliche Blocker und erlaubte nächste Aktion getrennt und belegt darstellen. |
| T-ACTION-LOCALIZATION | Bekannte Run-Aktionen über den bestehenden Locale-Katalog abbilden und unbekannte oder widersprüchliche Aktionen in jeder registrierten Sprache sicher und gezielt klären lassen. |
| T-APPROVAL-SUMMARY | Sprachspezifische Gate-Zusammenfassungen im jeweiligen kanonischen Artefakt auswählen und deren Kriterienabdeckung, Vollständigkeit, Revision und Digest vor der Freigabe validieren. |
| T-CANONICAL-INTEGRATION | Bestehende Renderer und Interaktionsvertrag zusammenführen; Markdown unverändert an Hosts übergeben und bestehende Ziel-, Run-, Gate- und Freigabeautorität erhalten. |
| T-REGRESSION-AND-PACKAGE | Regressionsevidenz an den zuständigen bestehenden Teststellen ergänzen, danach die vorhandene Asset-Generierung ausführen und die resultierenden Paket- und Runtime-Flächen auf Kohärenz prüfen. |
| T-FOUR-HOST-EVIDENCE | Für Codex, Claude, Copilot und OpenCode frische Sitzungen mit den vereinbarten Kartenfällen prüfen und jede Hostsicht mit Datum, Host/Version und sichtbarer Ausgabe einzeln belegen. |

## Dependencies And Risks

- T-STATE-CARDS und T-ACTION-LOCALIZATION verwenden ausschließlich die bestehenden strukturierten Resolver-, Doctor- und Gate-Ergebnisse sowie den registrierten Locale-Katalog. Fehlende Zustandsdetails führen zu einer gezielten Klärung, nicht zu einer abgeleiteten Aktion.
- T-APPROVAL-SUMMARY benötigt stabile Kriterien- und Entscheidungs-IDs im aktuellen Gate-Artefakt. Bei fehlender, doppelter, unbekannter oder unvollständiger Sprachzusammenfassung wird keine Freigabepräsentation vorbereitet.
- T-CANONICAL-INTEGRATION folgt der vorhandenen Asset-Generierungsreihenfolge. Hostadapter erhalten exakt denselben Markdown-Inhalt; neue Hostvorlagen, Zustandsfelder oder Freigabepfade sind ausgeschlossen.
- T-REGRESSION-AND-PACKAGE wird nach den Änderungen an den kanonischen Quellen ausgeführt. Die Paketprüfung folgt der Synchronisierung und belegt Quell-/Paketkohärenz, nicht das Verhalten einer geladenen Host-Sitzung.
- T-FOUR-HOST-EVIDENCE setzt voraus, dass jede frische Sitzung tatsächlich die geprüfte Revision konsumiert. Ein veralteter Host-Cache oder nicht verfügbare Oberfläche bleibt für diesen Host ein offener Evidenzpunkt; Installieren, Aktualisieren, Aktivieren, Vertrauen oder Neustarten von Host-Plugins ist außerhalb dieses Umfangs.
- Die semantische Treue einer übersetzten Zusammenfassung wird vom Owner am vollständigen Quellartefakt geprüft. Automatische ID- und Digestprüfungen allein belegen keine Übersetzungsqualität.

## Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-STATE-CARDS | SCN-TARGET-REASON-CODES | Für jeden registrierten ungelösten Zielgrund nennt die Karte in jeder registrierten Sprache genau die fehlende Pfad-, URL- oder Run-ID-Angabe samt passendem Beispiel; Zielauflösung, Runwahl und Mutation bleiben aus. | Resolver-Fälle und gerenderte Ausgaben aus `create-agdf/scripts/task-target-resolution-test.js` und `create-agdf/scripts/interaction-presentation-test.js`, getrennt nach Grundcode und Locale. |
| AC-001 | SDD-004 | T-FOUR-HOST-EVIDENCE | SCN-TARGET-FOUR-HOSTS | Jede der vier frischen Host-Sitzungen zeigt die kanonische ungelöste Zielkarte mit gleicher konkreter Eingabeaufforderung; kein Host leitet Autorität aus cwd oder Belegen ab. | Vier datierte Direktbeobachtungen oder Ausgabenerfassungen für Codex, Claude, Copilot und OpenCode; je Host Session-/Versionsangabe und Karteninhalt. |
| AC-002 | SDD-001 | T-STATE-CARDS | SCN-SETUP-AUTHORIZE-CANCEL | Die lokalisierten Antworten zum Autorisieren und Abbrechen zeigen ihre konkreten Setupfolgen; Abbruch richtet nichts ein, Autorisierung erzeugt keine UR- oder Gate-Freigabe. | Antwort-/Zustandsassertionen und gerenderte Setupkarte aus `create-agdf/scripts/install-setup-interaction-test.js` und `create-agdf/scripts/control-state-test.js` für jede registrierte Sprache. |
| AC-002 | SDD-004 | T-FOUR-HOST-EVIDENCE | SCN-SETUP-FOUR-HOSTS | Alle vier frischen Host-Sitzungen zeigen dieselben expliziten Setup- und Abbruchoptionen ohne implizite Freigabe. | Datiertes Setupkartenprotokoll je Host mit sichtbarem Wortlaut und Antwortwirkung; Abgleich mit kanonischem Markdown. |
| AC-003 | SDD-001 | T-STATE-CARDS | SCN-ACTOR-WAIT-BLOCKED-MATRIX | Nutzeraktion, Agentenaktion, keine Antwort nötig und wartende Gateentscheidung werden aus kanonischen Zustandsfeldern korrekt unterschieden; nur echte Blocker erhalten „Blockiert durch“. | Zustandsfixtures, nicht-autorisierende Envelope-Assertions und gerenderte Karten aus `create-agdf/scripts/interaction-presentation-test.js` und `create-agdf/scripts/operational-localization-test.js` in jeder registrierten Sprache. |
| AC-004 | SDD-002 | T-ACTION-LOCALIZATION | SCN-UNKNOWN-RUN-ACTION | Eine bekannte Aktion erscheint lokalisiert; eine unbekannte oder widersprüchliche Aktion wird als konkrete Klärung gezeigt und nie durch eine sachfremde Standardaktion ersetzt. | Positive, unbekannte und widersprüchliche Aktionsfälle in `create-agdf/scripts/operational-localization-test.js`; Vergleich kanonischer Aktion, Locale-Ausgabe und Statuskarte für en und de. |
| AC-005 | SDD-002 | T-ACTION-LOCALIZATION | SCN-LOCALE-AUTHORITY-LITERALS | Menschlich lesbarer Kartentext folgt der gewählten registrierten Sprache; `Approval: PRD`, Run-IDs, Pfade und Diagnosecodes bleiben exakt, und jede Kartenhülle bleibt `authorizes: false`. | Locale-Katalog- und Envelope-Assertions in `create-agdf/scripts/interaction-catalog-test.js`, `create-agdf/scripts/operational-localization-test.js` und `create-agdf/scripts/control-state-test.js`. |
| AC-005 | SDD-003 | T-APPROVAL-SUMMARY | SCN-CROSS-LANGUAGE-SUMMARY | Eine englische Quelle erhält für deutsche Darstellung eine vollständige deutsche Zusammenfassung mit allen Kriterien und Entscheidungsinhalten; fremdsprachige Auszüge oder Feldnamen werden nicht unmarkiert übernommen. | Englisches Mehrkriterien-Artefakt, deutsche und englische `run-present`-Ausgaben sowie Kriterien-ID-Abgleich; neue Regressionsevidenz an `create-agdf/scripts/control-state-test.js`. |
| AC-005 | SDD-004 | T-CANONICAL-INTEGRATION | SCN-CANONICAL-MARKDOWN-PASSTHROUGH | Alle Hostadapter transportieren denselben kanonischen Markdown-Inhalt ohne Übersetzung, Neuaufbau oder Auslassung; Freigabeautorität bleibt beim bestehenden `run-approve`. | Byte-/Digestvergleich zwischen kanonischer Präsentation und Adaptereingabe sowie unveränderte Freigabeassertionen; Paketbelege aus `create-agdf/scripts/package-build-test.js`. |
| AC-006 | SDD-004 | T-FOUR-HOST-EVIDENCE | SCN-FOUR-HOST-FRESH-SESSION-MATRIX | Codex, Claude, Copilot und OpenCode zeigen in je einer frischen Sitzung Zielklärung, Setup, repräsentativen Run-Status und Gate-Freigabekarte mit gleichem Akteur, nächster Aktion, Wiederherstellung und Autoritätsgrenze. | Je Host ein datierter Fallnachweis mit Host-/Versionsangabe, sichtbarer Ausgabe und beobachteter Artefakt-/Runtime-Revision; Lücken werden pro Host separat offengelegt. |
| AC-007 | SDD-001 | T-STATE-CARDS | SCN-READINESS-VS-EVIDENCE-BLOCKER | PRD-Bereitschaft, fehlende Kontrolle und mindestens ein konkreter Evidenzblocker nennen Ursache, betroffene Punkte, verantwortlichen Akteur und erlaubten nächsten Schritt; eine freigabebereite Gatekarte zeigt stattdessen „Wartet auf“ plus exakte Entscheidung. | Gerenderte positive und negative Gate-Fälle aus `create-agdf/scripts/gate-check-missing-control-test.js` und `create-agdf/scripts/control-state-test.js` für en und de; Vergleich mit strukturierten Findings. |
| AC-008 | SDD-003 | T-APPROVAL-SUMMARY | SCN-APPROVAL-SUMMARY-COVERAGE-DIGEST | Englische und deutsche Freigabekarten fassen Ziel, Umfang, jedes Kriterium und offene/gelöste Entscheidungen verständlich zusammen; fehlende, doppelte, unbekannte, ausgelassene oder abgeschnittene IDs sowie veraltete Revision/Digests verhindern eine bindbare Freigabe. | Mehrkriterien-Artefakt mit mehreren Entscheidungen; gerenderte en/de-Präsentationen, Negativfälle für jede ID-Abweichung, exakte Artefakt-/Revisions-/Summary-Digests und `authorizes: false` in `create-agdf/scripts/control-state-test.js`. |

## Execution Order

1. Nach Freigabe dieses TP die kanonischen Status-/Zielkarten und Aktionslokalisierung implementieren; Zustands- und Autoritätsbesitzer unverändert lassen.
2. Eingebettete Sprachzusammenfassungen samt Kriterienabdeckung, Fail-closed-Verhalten und Digestbindung ergänzen.
3. Interaktionsvertrag und bestehende Hostübergabe synchronisieren; vorhandene Generatorreihenfolge verwenden.
4. Die gezielten Renderer-, Zustands-, Locale-, Integritäts- und Paketprüfungen aus der Traceability ausführen und Abweichungen beheben.
5. Erst mit der synchronisierten, tatsächlich geladenen Revision die vier getrennten frischen Host-Sitzungen durchführen und die Belege je Host sichern.

## Approval

Dieser Aufgaben- und Testplan leitet sich aus dem freigegebenen SD Revision 10 und dessen PRD-Traceability ab. Implementierung und geplante Prüfungen dürfen erst nach Freigabe dieser TP-Revision beginnen. Zur Freigabe dieser konkreten Revision:

`Approval: TP`
