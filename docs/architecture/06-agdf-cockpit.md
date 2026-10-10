# AGDF Cockpit: lokale MCP-App

Das Cockpit macht den Kontrollstand eines Vorhabens verständlich: Welcher Arbeitsschritt steht
an, was erlaubt oder blockiert seinen Beginn und wo lassen sich die offenen Nachweise prüfen?
Die kompakte Chat-Karte, die Run-Übersicht, die Run-Ansicht und die Dokumentansicht verwenden
dieselben lesenden Core-Dienste und dieselbe React-Anwendung.

**Stand: 7. Oktober 2026, Repository-Quelle und lokale Prüfungen.** Das Cockpit ist eine private,
lokal vorbereitete Entwicklungsintegration. Seine aktuelle native Darstellung in Codex ist noch
nicht vollständig qualifiziert. Die Implementierung ist kein Nachweis einer veröffentlichten
Funktion, einer Claude-Integration oder abgeschlossener QA/UAT.

Diese Seite beschreibt den Bestand. Sie ergänzt die [Systemarchitektur](01-systemarchitektur.md)
und die [Paketstruktur](05-paketstruktur.md). Die [UI-README](../../packages/control-ui/README.md)
enthält die technischen Vorbereitungsbefehle und Fehlergrenzen; die bestehenden Core-Verträge
bleiben Eigentümer der Daten- und Werkzeugsemantik.

## 1. Einordnung und Zuständigkeiten

Die separate lokale Verbindung `agdf-cockpit-local` stellt `agdf_cockpit` und
`agdf_cockpit_read` sowie die UI-Resource `ui://agdf/cockpit/v1.html` bereit. Der reguläre
AGDF-Server mit `agdf_dispatch` und `agdf_inspect` bleibt ein eigener Zugang zur Ablaufsteuerung.
Das Cockpit besitzt keine eigene Gate-Policy und keinen Writer für Freigaben oder Run-Zustand.

```text
Codex / MCP-App                         Lokaler Browser
  -> agdf_cockpit(run_id)                 -> geschützter HTTP-Lesezugang
  -> eingebettete React-Ansicht           -> dieselben React-Ansichten
  -> agdf_cockpit_read                    -> Core-Leseprojektion
       -> gebundene Cockpit-Sitzung und Core-Leseprojektion
       -> kanonischer Zustand und registrierte Quellen in .agdf/control/
```

| Verantwortung | Eigentümer |
|---|---|
| Werkzeugnamen, Eingabeschemas, UI-Resource und Sitzungsgrenzen | [cockpit-contract.js](../../packages/core/lib/control-inspect/cockpit-contract.js) |
| Lesende Kontrollprojektion und registrierte Dokumente | [cockpit.js](../../packages/core/lib/control-inspect/cockpit.js) |
| Unabhängige Lesesitzungen und exklusiver Kontext-Eigentümer je Verbindung | [cockpit-session.js](../../packages/core/lib/control-inspect/cockpit-session.js) |
| Exakte Run-eigene ContextGraph-Bezüge und Kontextzusammenstellung | [cockpit-context.js](../../packages/core/lib/control-inspect/cockpit-context.js) |
| Ansichten, Navigation, Aktualität und Fokus | [packages/control-ui/src/](../../packages/control-ui/src/) |
| Lokale Hostvorbereitung und Konfigurationsprojektion | [prepare-cockpit-local.mjs](../../scripts/prepare-cockpit-local.mjs) |
| Gemeinsames visuelles Design | [Pages-Designquellen](../../pages/src/design/tokens.json), [Schriften](../../pages/src/styles/fonts.css), [Flächen](../../pages/src/styles/surfaces.css) |

Die UI verändert keine Kontrolldateien. Ihre angezeigte Auswahl und ein übergebener Kontext
erteilen weder Arbeitsberechtigung noch eine Gate-Freigabe. Der Kontextweg hat eigene ephemere
und Host-Wirkungen; er ist deshalb eine bewusste Bedienhandlung, kein Nebenprodukt des Öffnens.

## 2. Run-Bindung beim Öffnen

Nennt die Anfrage einen Run oder ist dieser im Gespräch mit dem Nutzer eindeutig etabliert,
übergibt der Agent dessen `run_id` an `agdf_cockpit`. Das gilt auch für eine spätere kurze Bitte
wie „Cockpit öffnen“. Der Aufruf ohne Run-ID öffnet die Übersicht und ist für eine ausdrücklich
gewünschte Gesamtübersicht oder einen fehlenden eindeutigen Gesprächsbezug vorgesehen.
Bei mehreren möglichen gemeinten Runs muss die Auswahl geklärt werden. Arbeitsverzeichnis,
Zeitstempel und Inventarreihenfolge ersetzen diese Bindung nicht.

Der Server validiert die ID im gebundenen Projekt. Ein unbekannter, entfernter oder ungültiger
Run führt zu sichtbarer Rückmeldung mit der angefragten Identität; es wird kein anderer Run
automatisch ausgewählt. Diese Regel gehört zur [Werkzeugbeschreibung](../../packages/core/lib/control-inspect/cockpit-contract.js),
nicht zu einem zweiten Regelwerk in der UI.

Bei einem erfolgreich geladenen expliziten Run entfallen in der kompakten Karte Inventarzähler,
Suche und Vorhabenliste. „Anderen Run wählen“ blendet die aktive Liste bewusst ein. Der bisherige Run
bleibt ausgewählt, bis der Nutzer einen anderen auswählt. Auswahl und Kontextpakete werden
nicht aus URL oder Browser-Speicher wiederhergestellt.

## 3. Fachlicher Fokus in allen Ansichten

| Ansicht | Zweck und Verhalten |
|---|---|
| Kompakte Karte | Führt einspaltig mit gespeichertem Arbeitsstand, aktueller Kontrollaussage und einer Quellenaktion. Nachweise, Freigaben und Ziel/Run-ID sind zunächst geschlossen. „Run ansehen“ bleibt ein nachgeordneter Zugang zur größeren Ansicht. |
| Vorhaben-Übersicht | Startet ausschließlich mit gespeicherten Masterbacklog-Einträgen und lädt UR-Überschriften nur für sichtbare Zeilen nach. Die drei Bereichsschalter „Aktiv“, „Geplant“ und „Archiv“ zeigen die Anzahlen der jeweiligen Backlog-Abschnitte; „Archiv“ umfasst abgeschlossene und abgelöste Einträge. „Aktiv“ startet ausgewählt. Die Liste führt mit Titel, gespeichertem Stand und nächstem Schritt beziehungsweise Ergebnis. Ab 1000px Breite des Lesebereichs stehen die Einträge in zwei Spalten; schmalere Ansichten bleiben einspaltig. Der Titel öffnet den konkreten Run für dessen aktuelle Core-Prüfung. |
| Run-Zusammenfassung | Bündelt aktuellen Arbeitsschritt, exakte Core-Aktion, Voraussetzungen und Nachweise. Ziel, ID und Kontrollgrundlage sind aufklappbar. |
| Run-Details | Zeigt zusätzliche Originalangaben und Quellen. Der Schiebeschalter „Zusammenfassung / Details“ ändert den Lesemodus innerhalb der größeren Ansicht. |
| Dokument | Führt mit einer vorhandenen deutschen Quellenkurzfassung, dem gespeicherten Dokumentstand und der getrennten aktuellen Core-Kontrollauswertung. Quellenangaben und unveränderter Originaltext starten geschlossen. Hier gibt es keinen Zusammenfassungs-/Details-Schalter. „Dokument schließen“ kehrt zum Run zurück und stellt den Fokus auf den öffnenden Quellenzugang wieder her. |

Das Cockpit schreibt weder kanonische Titel noch freigegebene Ziele um. Fachlich unklare
Originalangaben bleiben als solche sichtbar. Es erfindet keinen Fortschritt oder nächsten
Arbeitsschritt aus einer UI-Auswahl.

Die Übersicht ordnet Einträge nach ihrem gespeicherten Backlog-Abschnitt, nicht durch eine
zusätzliche Run-Auswertung oder automatische Statuskorrektur. Innerhalb jedes Bereichs steht
der letzte gespeicherte Tabelleneintrag zuerst; daraus wird kein Erstellungsdatum abgeleitet.
Die Suche filtert nach gespeichertem Backlog-Titel, Schlüssel und gespeichertem Status.
Ergänzende UR-Überschriften verändern die Treffer nicht. Der Suchumfang wird in der Ansicht erklärt;
ein Bereichswechsel leert die Suche. Bereich, Suchbegriff und beobachtete Titel bleiben bei der
Rückkehr aus einem Vorhaben erhalten, solange sich die Backlog-Grundlage nicht geändert hat.
Der Tastaturfokus kehrt zu dessen auswählbarem Titel zurück, sofern er im aktuellen Ausschnitt
sichtbar ist. Andernfalls erhält die Listenüberschrift den Fokus mit einer passenden Rückmeldung.
Es gibt keinen zweiten identischen Öffnen-Button pro Zeile.

Die Chat-Vorschau zeigt höchstens drei Treffer ohne internen Scrollbereich. Titel und gespeicherter
Stand, Phase/offene Aufgabe, vollständiger nächster Schritt und Einschränkung bleiben direkt sichtbar
und umbrechen ohne Zeilenbegrenzung. Originalangaben und Quellen sind zusätzlich aufklappbar.
„Alle Vorhaben öffnen“ vergrößert die Ansicht unter Beibehaltung der Suche. Hinweise zur Lesbarkeit
beziehen sich hier auf den aktiven Bereich; ein Fehler in Geplant oder Archiv erzeugt keine
pauschale Warnung über den aktiven Bestand. Die große Übersicht zeigt alle Treffer in einem eigenen, per Tastatur bedienbaren Scrollbereich.
Die Liste füllt den verbleibenden Platz unter Kopfzeile, Bereichsauswahl, Suche und Zählern; diese
Bedienelemente bleiben beim Scrollen sichtbar. Bei sehr geringer Höhe bleibt zusätzlich das
Scrollen der Gesamtansicht möglich, damit keine Bedienelemente unerreichbar werden.

### Gemeinsame Core-Listenprojektion

`packages/core/lib/control-inspect/cockpit-list.js` enthält die gemeinsame reine Listenlogik
für kompakte Karte und große Übersicht. Sie arbeitet ohne Dateisystem, Netzwerk oder React
mit bereits geprüften Lesedaten. Die vorhandene Transportstruktur bleibt unverändert und in
Quellreihenfolge; nur die Darstellung kehrt den gewählten Abschnitt um. Core besitzt Bereiche,
Titelherkunft, Suche, Identität und Vollständigkeit. React besitzt Eingabe, Navigation und Darstellung.

Kompakt erscheint ausschließlich „Active Backlog“, höchstens drei Treffer nach Suche im gesamten
lesbaren Abschnitt. Der letzte gespeicherte Eintrag steht zuerst. „Aktiv“ ist die Bereichszugehörigkeit,
keine neue Lifecycle-Regel; gespeichertes Completed bleibt dort sichtbar. Geplant und Archiv sind
in der großen Übersicht erreichbar. Vergrößern erhält die aktive Suche; Bereichswechsel löscht sie.
Eine Rückkehr aus einem anderen Bereich nach kompakt setzt Aktiv mit leerer Suche.

Gesucht wird unabhängig von Großschreibung nach getrimmter Zeichenfolge getrennt in Originaltitel,
Schlüssel und gespeichertem Status. UR-Überschriften verändern weder primären Titel noch Treffer.
Bekannte Scope-Präfixe entfallen nur in der Anzeige. Gemeinsame passive Zeilen umbrechen Titel und
zeigen den vollständigen nächsten Schritt und Quellenbeschränkungen direkt. Originalangaben und
Herkunft bleiben zusätzlich aufklappbar. Bereich, Treffer
und kompakter Ausschnitt haben getrennte Zähler. Teilbestände behaupten keine vollständigen
Nulltreffer; nicht verfügbare Bereiche besitzen keine numerische Anzahl.

Die Darstellungsidentität bindet Backlog-Digest, ursprüngliche Position, Bereich und Schlüssel.
Sie ersetzt keine beobachtungsgebundenen Lese-Selektoren. Rückkehr erhält Bereich/Suche und den
exakten sichtbaren Fokus. Entfernte Einträge werden von solchen außerhalb des Fünfer-Ausschnitts
unterschieden; es wird kein benachbarter Run ausgewählt. Quellenänderungen in der Übersicht
markieren vorherige Daten als veraltet, bis bewusst neu geladen wird. Run-, Dokument-, Kontext-
und Sitzungsgrenzen behalten ihre bestehenden Zuständigkeiten.

### Überschriften verlinkter Anforderungen

Die erste Übersicht liest nur `MASTER_BACKLOG.md`. Der separate Lesevorgang `backlog_titles`
nimmt ausschließlich eine Sitzungs-/Snapshot-Bindung und ein bis zwölf eindeutige, vom Server
ausgestellte Zeilenkennungen entgegen. Die Oberfläche fordert sichtbare Einträge und höchstens
einen benachbarten Eintrag an, bündelt Anfragen und führt je Ansicht nur eine gleichzeitig aus.
Eine unsichtbare Ansicht startet keine neue Titelanfrage. Dabei werden weder alle Runs gesucht
noch ihre Gates ausgewertet.

Core verwendet den ausdrücklich gespeicherten `[UR](relativer-pfad)`-Verweis. Gleiche Ziele
werden zusammengeführt; fehlende oder widersprüchliche Verweise machen nur die ergänzende Überschrift unverfügbar.
Nur enthaltene Markdown-Dateien unter `.agdf/control/artefacts/` werden gelesen. Externe oder
absolute Ziele, kodierte Umgehungen und symbolische Links werden abgewiesen. Ein OR-Verweis
oder der Schlüssel genügt nicht, um eine UR abzuleiten. Die erste echte H1 außerhalb von
Frontmatter, Kommentaren und Codeblöcken wird als passiver Text angezeigt; nur das führende
`UR:` entfällt in der ergänzenden Titelbeobachtung. Primärer Listentitel bleibt der gespeicherte Backlog-Titel; Originalüberschrift und Backlog-Titel bleiben aufklappbar.

Der Status steht ausdrücklich als „Gespeicherter Stand laut Backlog“ in der Liste; auch
der nächste Schritt beziehungsweise das Ergebnis stammt ausschließlich aus dem Masterbacklog.
UR-Metadaten ändern diese Angaben nicht. Die Titelherkunft steht in den zunächst geschlossenen
Quellenangaben. Erst das Öffnen des Vorhabens prüft seinen aktuellen Arbeitsstand und seine
Voraussetzungen; veraltete Backlog-Angaben werden dadurch nicht automatisch umgeschrieben.

Die regulären Core-Schreibwege (`run-approve`, `control approve`, `run-update`,
`run-step` einschließlich Nachweiserfassung sowie PRD-Wiederöffnung) führen Status und
nächsten Schritt des zugeordneten aktiven Backlog-Eintrags aus der gemeinsamen Core-Zusammenfassung nach.
Run- und Backlog-Sperre werden in dieser Reihenfolge gehalten. Bei Änderungen beider Dateien
ist die versiegelte Run-Revision der Commit-Punkt; das vorhandene Transaktionsjournal hält
den Backlog-Schritt nachholbar. Die Wiederholung einer Freigabe schließt zunächst eine
ausstehende Transaktion ab und bestätigt deren ursprünglichen Beleg ohne zweite Freigabe.
Die vollständige Freigabeprüfung läuft vor dem Journal unter beiden Sperren; unmittelbar
vor dem Commit werden Run-Ausgangsstand, Quelldigests und Präsentationsbeleg erneut geprüft.

Eine Freigabe hängt nicht von der Form des Backlogs ab. Lässt sich die Zeile für `run-approve`,
`control approve` oder `run-update` nicht nachführen (nicht unterstütztes Layout, doppelte
Identität, Backlog-Datei als Symlink oder kein reguläres File), gilt die Run-Änderung trotzdem.
Das Backlog bleibt dann unverändert, und das Ergebnis meldet `backlog: skipped` mit
`backlog_reason` (`backlog_layout_unsupported`, `backlog_identity_ambiguous` oder
`backlog_path_invalid`); den Zustand des Backlogs selbst meldet `doctor`. Eine ausstehende
Transaktion eines anderen Runs blockiert weiterhin, weil alle Schreibwege dasselbe
Backlog-Journal teilen.

Ein ausdrückliches `run-update` kann einen veralteten Backlog-Zeiger eines gültig versiegelten
Runs korrigieren, ohne Run-Inhalt, Revision oder Freigaben zu ändern. Es aktualisiert
Status, nächsten Schritt und Prüfvermerk der eindeutig zugeordneten aktiven Zeile; Titel, Links, Reihenfolge
und andere Vorhaben bleiben erhalten. Kompakte und bestehende ältere 13-spaltige Tabellen werden
bei dieser Zeigerkorrektur unterstützt; veraltete Revisionen und ausstehende fremde
Transaktionen verhindern den Schreibzugriff.

`run-step`-Schritte, die eine kompakte Zeile neu schreiben (`artefact`, `ur`, `route`, `review`,
`closeout`), lassen in einer älteren 13-spaltigen Tabelle Titel und Link-Spalten unverändert.
Status und nächster Schritt einer vorhandenen Zeile folgen dem Run; ein Abschluss verschiebt
die Zeile dort nicht. Das Ergebnis meldet in diesem Fall `backlog_reason: backlog_layout_legacy`.
Andere nicht unterstützte Layouts lehnt `run-step` weiterhin mit `backlog_layout_unsupported` ab.
Dies ist keine Migration historischer Einträge und verschiebt keine Vorhaben ins Archiv.
Direkte Dateiänderungen außerhalb der Core-Writer umgehen weiterhin deren Schreibvertrag.


### Arbeitsstand, Quellen und Aktualisierung

`control-evaluation/run-work-summary.js` verfeinert die bestehende Run-Policy und den
Next-Action-Owner ausschließlich für die Beschreibung. QA-Follow-up validiert dieselben
registrierten Berichte und normalisierten Findings wie bisher; seine Berechtigungsprüfung
bleibt unverändert. React und HTTP/MCP werten keine Gates oder Findings selbst aus.

| Gespeicherte Bedeutung | Aussage und Folge |
|---|---|
| Phase work pending / Awaiting PRD, SD, TP | Arbeit in der benannten Phase; der Prüfvermerk unterscheidet Entwurf und offene menschliche Freigabe. |
| QA report pending | Der einschlägige QA-Bericht fehlt noch. |
| QA evidence open | QA verlangt konkrete Nachweise und danach erneute QA. |
| QA correction open | QA verlangt eine Korrektur innerhalb der freigegebenen Umsetzung und danach erneute QA. |
| QA source decision required | Zuerst muss der benannte vorgelagerte Owner entscheiden; mehrere Findings folgen der bestehenden restriktiven Route. |
| QA blocked / Source unconfirmed | Blockiert oder Bericht/Quellenbezug nicht verlässlich; keine positive Qualitätsaussage. |
| Awaiting QA / Awaiting UAT / Awaiting OR | QA-pass, menschliche Freigabe, UAT und formaler Abschluss bleiben getrennt. |
| Completed | Der ausdrücklich abgeschlossene Lifecycle; ein vorhandener QA-Bericht allein reicht nicht. |

Eine Tabellenzeile bleibt sieben- beziehungsweise dreizehnspaltig. Ihr privater Prüfvermerk steht
als eigene Kommentarzeile **nach** der zusammenhängenden Markdown-Tabelle, mit Leerzeile davor:
`<!-- agdf-backlog-summary-v1 BASE64 -->`. BASE64 ist Standard-Base64 von kanonischem UTF-8-JSON.
Version 1 enthält genau `schema_version`, `target_id`, `run_id`, `section`, `row_digest`,
`revision_id`, `observed_at`, `kind`, `phase`, `qa_outcome`, `lifecycle`, `recorded_approvals`,
`decisive_obligation`, `open_obligation_count`, `display_action`, `sources`, `limitations`
und `authorizes: false`. `open_obligation_count` zählt offene normalisierte Befundzeilen
aus registrierten Berichten. Derselbe Sachverhalt kann in mehreren Berichten erscheinen;
die Anzeige benennt deshalb Berichtsbefunde und behauptet keine Anzahl verschiedener Aufgaben.
Die Run-Ansicht zeigt diesen Core-Wert auch in der Nachweisklappe. Die separate Liste
`evaluation.missing_evidence` zählt ausschließlich im Run-Dokument gespeicherte Nachweislücken;
eine leere Liste bedeutet nicht, dass QA- und Review-Berichte keine offenen Befunde enthalten.
Die optionale entscheidende Aufgabe enthält `id`, `routing_target`,
`action`, `source_path`; jede Quelle enthält `path`, `digest`, `state: available`.

`control-state/backlog-summary-shape.js` besitzt die gemeinsame reine Formprüfung für Core und
UI; `backlog-summary.js` besitzt Kodierung und Zeilenbindung. Der Row-Digest umfasst Bereich
und tatsächlich serialisierte Zellen. Target, Run, resultierende Revision, Beobachtungszeit und
beobachtete run-lokale Quelldigests bleiben prüfbar. Der Vermerk ist keine kryptografische
Beglaubigung, Freigabe oder Behauptung aktueller Vollständigkeit. Grenzen: 64 KiB JSON pro
Vermerk, 64 Quellen/offene Aufgaben, 256 KiB je Reviewquelle und 2 MiB Backlog. Zu große
Zusammenfassungen werden ausdrücklich eingeschränkt; entscheidende Aktionen werden nicht
still gekürzt. Ungültige/mehrdeutige/fremde Vermerke erhalten die ursprüngliche Zeile mit
sichtbarer Einschränkung. Alte Zeilen bleiben lesbar und unbestätigt; es gibt keine Migration.
Ein nicht zuordenbarer beschädigter Kommentar wird nicht durch einen Writer gelöscht.

Normale Writer wählen die tatsächliche neue Run-Revision einmal vor der Planung. Zeile und
Prüfvermerk bilden einen gemeinsamen Backlog-Schritt im bestehenden Journal; die versiegelte
Run-Revision bleibt Commit-Punkt. Bereits konsumierte QA-/Reviewquellen werden vor Commit
gegen ihre Digests geprüft. Recovery übernimmt die erfassten Journalbytes, statt spätere
Quellen mit einem älteren Run zu mischen. Identisches gezieltes Nachführen eines unveränderten
Runs erhält Revision, Beobachtungszeit und sämtliche Dateibytes; eine echte neue Revision
aktualisiert den Vermerk auch bei identischem sichtbarem Wortlaut.

Relationship Correction und Run Recovery behalten ihre eigenen Run-/Journal-Owner. Ihr
Ergebnis meldet den ausstehenden Backlog-Abgleich und nennt ausdrücklich ein auf genau diesen
Run und dessen aktuelle Revision gebundenes `run-update`. Ein solcher Sonderweg behauptet
keinen bereits synchronisierten Backlog. Unsupported/ambiguous/path-invalid bleibt bei den
bereits dokumentierten erlaubten Writer-Operationen ein begründetes `skipped`; die strikten
run-step-Wege behalten ihre Fehlergrenzen. Historische Freigaben werden nicht wiederholt.

Die Übersicht liest weiterhin ausschließlich den gespeicherten Backlog. `saved_summary` ist
ein optionales DTO-Feld; alte DTOs bleiben gültig, vorhandene ungültige neue Felder werden
abgewiesen. Quellen im Vermerk werden niemals als Dateiselektoren verfolgt. Erst bewusstes
Öffnen des einzelnen Runs erfasst dessen aktuelle registrierte Quellen im selben unveränderlichen
Read-Snapshot und liefert `work_summary` sowie `backlog_comparison`: `matching`, `different`
oder `unavailable`. Übereinstimmung benötigt gültige Run-Versiegelung, eindeutigen gültigen
Prüfvermerk, dieselbe Revision und dieselbe Quellen-/Arbeitsbeschreibung. Fehlende oder
ungeprüfte Quellen erlauben keine positive Übereinstimmung. Lesen verändert weder Zeile noch
Run; abweichende Beobachtungen verlangen bewussten Abgleich, keine automatische Freigabe.

Browser-/Quellen-/Protokollprüfungen und native Hostbeobachtung sind getrennte Evidenz. Die
Quellfassung vom 9. Oktober 2026 besitzt Browsernachweise; die noch offene native Beobachtung
mit frischer Resource-/Runtime-/UI-Identität ist in
`.agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/evidence/NATIVE_OBSERVATION.md`
gebunden. Ein alter offener App-Stand qualifiziert diese neue Fassung nicht.

Jede gültige Anfrage verwirft den vorherigen Quelldatenstand und erfasst Backlog plus angefragte
URs erneut als unveränderliche Beobachtung. Die Backlog-Grundlage muss übereinstimmen; andernfalls
verlangt die Ansicht ein bewusstes Neuladen. Neue Zeilenkennungen gelten nur für den neuen Snapshot.
Eine UR darf höchstens 2 MiB umfassen, die Überschrift höchstens 512 Unicode-Zeichen beziehungsweise
2 KiB UTF-8. Fehlende, gesperrte, ungeeignete oder zu große Einzelquellen behalten ihre Zeile mit
gekennzeichnetem Backlog-Titel. Fehler der gesamten Erfassung liefern keine gemischte Beobachtung.

Die Ansicht hält höchstens 128 Titelbeobachtungen und 256 KiB serialisierte UTF-8-Metadaten im
Arbeitsspeicher. Dieser LRU-Speicher enthält keine Dokumentkörper oder wiederverwendbaren
Ressourcenkennungen. Pfad, vollständiger Quelldigest, Beobachtungszeit und Backlog-Digest bleiben
sichtbar aufklappbar. Frühere Titel sind ausdrücklich Beobachtungen, keine aktuell erfassten
Kontextquellen. Bewusstes Neuladen, eine geänderte Backlog-Grundlage, unbestätigte Aktualität oder
eine neue beziehungsweise geschlossene Sitzung verwerfen sie. Fehlgeschlagene Einzelquellen
werden bis dahin nicht automatisch wiederholt. Titelanfragen übertragen keinen Chat-Kontext,
senden keine Frage und verändern keine Kontrolldatei.

Bekannte vorangestellte Scope-Tags werden nur beim Backlog-Rücktitel ausgeblendet; Originaltitel,
Schlüssel, Scope, Priorität, vollständiger nächster Schritt und Quellenangaben bleiben unverändert
in zunächst geschlossenen Angaben verfügbar.

Zähler sind keine Aussage über aktuell erlaubte Arbeit. Nicht auswertbare oder fehlende Abschnitte
zeigen „Nicht verfügbar“ statt Null; Eintragshinweise kennzeichnen betroffene Bereichszähler als
eingeschränkt. Ein einzelner, zunächst geschlossener Lesehinweis nennt die betroffenen Bereiche;
lesbare Einträge bleiben zugänglich. Lange nächste Schritte werden visuell auf zwei Zeilen
begrenzt, ihr Original bleibt vollständig aufklappbar. Schrift, Farben, Flächen und Abstände
verwenden die bestehenden Pages-Tokens in Hell/Dunkel; der Branding-Kopf bleibt erhalten.

Die Dokumentkurzfassung verwendet ausschließlich den ersten vollständigen Absatz einer
eindeutig vorhandenen `AGDF Approval Summary (de; source=en)` aus der gelesenen Markdownquelle.
Codebeispiele und mehrfach vorhandene oder zu große Deklarationen liefern keine Kurzfassung;
die Oberfläche meldet fehlende Kurzfassungen ausdrücklich. Es gibt keine automatische Übersetzung,
inhaltliche Synthese oder zweite Zusammenfassungsablage. Das Original bleibt vollständig passiv lesbar.

Der Dokumentstand wird aus der passenden Artefaktzeile des Run-Stands gezeigt, nicht aus einer
Freigabe desselben Gate-Namens oder den Metadaten im Dokument. Ziel, Snapshot, Run, registrierte
Ressourcenidentität und Quellenverweis müssen zum gleichzeitig gelesenen Run passen. Fehlt diese
Bindung, bleibt der Dokumentstand unbestätigt. Veraltete Beobachtungen werden als zuletzt gespeichert
beschrieben; sie bestätigen keine aktuelle Weiterarbeit. Abweichende `draft`-/`open`-Angaben im
unveränderten Original ersetzen weder den Run-Stand noch die Core-Kontrollauswertung.

Die Dokumentansicht bündelt Titel, Lesehinweise, Einordnung, Quellen und Kontextzugang auf einer gemeinsamen neutralen Pages-Lesefläche. Sie ist einschließlich Innenabständen auf 80ch begrenzt und symmetrisch zentriert. Texte und Anschlussaktionen teilen dieselbe Innenkante. Der Kontextzugang bleibt eine mindestens 44px hohe, per Tastatur erreichbare Textaktion; seine Inhalte öffnen innerhalb der Lesefläche. Originale erhalten darin keinen zusätzlichen Kartenrahmen oder Schatten. Der Branding-Kopf bleibt unverändert.

### Eine zusammenhängende Arbeitseinheit

Die Phase und die zuletzt gespeicherte Entscheidung geben zuerst Orientierung. Davon getrennt
steht die aktuelle Kontrollaussage. Core projiziert dafür die bereits ausgewertete Gate-Entscheidung
als `control_assessment`; diese Leseprojektion erteilt keine Berechtigung und führt keine neuen
Gate-Regeln ein. Eine allgemeine Doctor-Warnung ist kein zusätzlicher UI-Blocker: ihre Auswirkungen
hat der bestehende Gate-Evaluator bereits berücksichtigt.

- **Weiterarbeit offen:** die aktuelle Core-Projektion weist den aktiven Run als offen aus.
  Die genaue nächste Aktion steht darunter; der freigegebene Umfang bleibt maßgeblich.
- **Vor der Weiterarbeit klären:** Core nennt einen Blocker oder eine ausstehende Freigabe.
  Der Klärungsbedarf wird zusammengefasst; exakte Gründe sind aufklappbar.
- **Aktuelle Voraussetzungen nicht bestätigt:** die Projektion fehlt, bestätigt den Stand nicht
  oder die Beobachtung ist veraltet beziehungsweise widersprüchlich. Gespeicherte Angaben bleiben
  erhalten und bestätigen keine aktuelle Weiterarbeit.
- **Vorhaben abgeschlossen:** der gespeicherte Lebenszyklus lautet abgeschlossen. Daraus folgt
  keine Berechtigung für neue Arbeit.
- **Nachweise und offene Punkte:** zunächst geschlossener, gezählter Zugang mit lesbarer
  Quellenbeschreibung und nächstem Schritt vor den separat aufklappbaren Originalangaben.
- **Gespeicherte Freigaben:** zunächst geschlossen; verständlicher Dokumentname vor dem
  separat aufklappbaren Freigabenachweis. Freigaben ersetzen keine aktuelle Kontrollauswertung.

Eine Hauptaktion öffnet eine exakt registrierte Quelle des ausgewählten Runs. Bei offener
Weiterarbeit führt die Quelle des aktuellen Schritts; bei Klärungsbedarf oder unbestätigtem Stand
führt Run State. Ein fehlender Zugang wird sichtbar gemeldet. Die Quellenaktion fordert eine
größere Hostansicht an; bleibt der Host inline, zeigt die Karte das Dokument mit Rückkehr zum
Arbeitsstand. Run, Snapshot und Quellenbindung bleiben erhalten.

„Keine offenen Nachweise ausgewiesen“ ist eine Beobachtung und kein Nachweis der Arbeits- oder
Abschlussreife. Unbekannte Nachweisformen, Auswirkungen und erforderliche nächste Schritte
bleiben erhalten. Die UI entscheidet nicht selbst, ob ein offener Nachweis den Beginn blockiert.

### Platz, Branding und Bedienung

Inter, JetBrains Mono, Farbrollen, Flächen und Komponentenrezepte stammen aus `pages`.
Das AGDF-Logo und das dezente Race-Control-Bild geben allen Ansichten einen gemeinsamen Kopf.
Der Header bleibt beim Scrollen sichtbar; sein Aktualisieren-Symbol hat einen transparenten
Hintergrund. Neutrale Kartenflächen und erkennbare Ränder trennen Inhalt vom Hintergrund in
Hell und Dunkel. Die türkise Kante markiert den Arbeitsfokus und keine Freigabe oder Erfolgsmeldung.

Die native Ansicht nutzt die Hostbreite. In der größeren Run-Ansicht wird der Modusschalter erst
ab 720 Pixeln verfügbarer Arbeitsbereichsbreite angeboten. Unterhalb davon fällt die Ansicht auf
Zusammenfassung zurück; beim erneuten Verbreitern wird Details nicht automatisch aktiviert.
Ein Wechsel zur Zusammenfassung fordert keinen Wechsel der Host-Anzeigegröße an. Dokumente
behalten ihren eigenen Lesemodus. Die Arbeitseinheit bleibt auch bei großer Breite einspaltig;
die Übersichtssuche kann ab 640 Pixeln neben der Run-Auswahl stehen. Schmale Listen
werden gestapelt; Originaltabellen in Dokumenten können innerhalb ihres Bereichs scrollen.

## 4. Aktualität und Lebenszyklus

Serverprozess, UI-Ansicht und Cockpit-Lesesitzung haben verschiedene Lebenszyklen. Run-Wechsel,
Dokumentnavigation und Aktualisierung benötigen keinen Serverneustart. Je MCP-Verbindung läuft
ein Server mit höchstens vier unabhängigen Lesesitzungen. Ein neuer Render-Aufruf öffnet eine
weitere Sitzung, ohne eine sichtbare ältere Ansicht zu ersetzen. Jede besitzt ihren eigenen
Datenstand, registrierte Quellen, Zeitgrenzen und einen bei Bedarf gestarteten Lese-Worker.
Sitzungen, deren Worker noch beendet werden, zählen weiter mit. Eine fünfte Ansicht erhält eine
Kapazitätsmeldung; bestehende Ansichten bleiben erhalten.

Nur eine neuere Initialisierung derselben UI-Ansicht ersetzt deren eigene vorherige Sitzung.
Transport und Kontextsteuerung bleiben fest an die empfangene Sitzungs-ID gebunden; verspätete
Antworten oder das Aufräumen der alten Sitzung dürfen keine neuere oder fremde Sitzung schließen.
Schließen, Ablauf und Lese-Worker-Fehler betreffen die eigene Lesesitzung. Das Beenden einer
Verbindung sperrt zunächst neue Zugänge und wartet dann auf das Aufräumen ihrer Worker.

| Grenze | MCP-Verbindung | Lokaler Browser |
|---|---|---|
| Erfasste Quelldaten | 64 MiB je Ansicht; bei vier Ansichten höchstens 256 MiB | 256 MiB |
| Worker-Aufträge | Einer aktiv und einer wartend je Ansicht; höchstens acht insgesamt | Einer aktiv und einer wartend |
| Worker-Speicheroption | 256 MiB alte Generation je Worker | 768 MiB alte Generation |
| Einzeldatei / Vorschau / Antwort | 32 MiB / 2 MiB / 8 MiB | Unverändert dieselben Grenzen |
| Lese-Auftrag / Inaktivität / absolute Lebensdauer | 10 Sekunden / 30 Minuten / 8 Stunden | Bestehender Browser-Lebenszyklus |

Die Speicheroption ist keine Obergrenze des gesamten Prozessspeichers. Ein Ersatz-Worker startet
erst nach dem Ende seines Vorgängers. Abgewiesene fremde Kennungen verlängern keine Sitzung;
Aktivität in einer Ansicht hält eine andere nicht am Leben.

Sichtbare Ansichten warten auf Änderungssignale aus dem Core. Der Dateiwächter beobachtet die
Abhängigkeiten des erfassten Lesestands, bündelt Ereignisse und bestätigt eine Änderung durch
die vorhandene Quellenprüfung. Ein Dateisystemereignis allein bestätigt keinen neuen Status.
Atomarer Dateiaustausch wird über Verzeichniswächter erkannt; fremde Prozesse benötigen keine
gemeinsame In-Memory-Ereignisinstanz. Die Prüfung alle fünf Sekunden bleibt bei verlorenen
Ereignissen oder nicht verfügbaren Wächtern als Rückfall bestehen.

MCP transportiert das Signal als `agdf_cockpit_read`, Operation `changes`, gebunden an
`session_id` und `snapshot_id`. Eine Anfrage wartet höchstens acht Sekunden; pro Lesesitzung
ist nur ein wartender Empfänger erlaubt. Sie belegt keinen Worker-Leseauftrag und liefert nur
`changed`, keine Freigabe oder neue Quellenauswertung. HTTP verwendet dieselbe Core-Funktion
über das authentifizierte `GET /api/changes?snapshot=…`. Alte Snapshots und fremde Sitzungen
bleiben abgewiesen. Navigation, Ausblenden und Schließen beenden die wartende Anfrage; die
bestehende absolute Lebensdauer wird nicht verlängert. Host-spezifische Weiterleitung von
MCP-Ressourcenbenachrichtigungen ist für diesen Weg nicht erforderlich.

Run-Ansichten lesen ihren bisherigen Zielstand im Hintergrund neu; offene Nachweise,
Lesemodus, Fokus und Scrollposition bleiben dabei erhalten.
Backlog-Ansichten behalten den bisherigen Stand bis zum bewussten Aktualisieren; neue
Run-Auswahl bleibt währenddessen gesperrt. Suchfilter und Bereich bleiben beim Neuladen
erhalten; die Quellenangaben der neu beobachteten Zeilen starten geschlossen.
Ein blauer Punkt am transparenten Refresh-Button zeigt bestätigte Quellenänderungen an;
während des Lesens dreht sich das Symbol. Nach erfolgreichem Laden verschwindet der Punkt.
Tooltip und Screenreader benennen den Zustand, bei reduzierter Bewegung bleibt das Symbol ruhig.
Geöffnete Originaldokumente behalten ihren Text und zeigen „Quelle geändert · Neu laden“ am
Refresh-Button bis zum bewussten Neuladen. Ein gelber Veraltet-Hinweis entfällt für diesen
normalen Änderungsfall. Header, Fehlerhinweis und Fußzeile nutzen dieselbe Zustandsdarstellung:
„Neuer Stand verfügbar“ bei bestätigter Änderung, „Aktualisierung fehlgeschlagen“ bei einem
Lesefehler mit vorhandenem Altstand und „Lesefehler“ ohne vorherige Daten. Der vorhandene
Altstand bleibt mit „Vorheriger Datenstand bleibt sichtbar“ gekennzeichnet. Abgelaufene oder
ungültige Sitzungen werden ausdrücklich benannt und bestätigen keinen aktuellen Stand.
Verspätete
Antworten dürfen eine neuere Auswahl nicht überschreiben. Änderungssignale und Aktualisierung
publizieren keinen Kontext und senden keine Chatfrage; eine frühere Kontextübergabe wird über
den bestehenden Besitzerpfad invalidiert.

Die MCP-Lesesitzung läuft nach 30 Minuten Inaktivität oder spätestens nach acht Stunden ab.
Dann muss das Cockpit mit derselben expliziten Run-ID neu geöffnet werden. Ein temporärer
Lesefehler erhält dagegen die angefragte Route für den erneuten Versuch. Ein Austausch der
vorbereiteten Runtime benötigt eine frische Server-/Hostverbindung. „Transport closed“ belegt
keine aktuelle UI-Darstellung; Wiederverbindung und aktuelle Ressourcenidentität sind getrennt
zu prüfen.

Die lokale Runtime für Änderungssignale, Aktualisierungspunkt und einheitliche Statusmeldungen liegt separat unter
`dist/local/codex-cockpit-reading-status/`; der projektbezogene Eintrag `agdf-cockpit-local`
verweist auf ihren geprüften Einstiegspunkt. Die vorherige Runtime bleibt für den Rückbau
erhalten. `activation.json` unterscheidet die konfigurierte Verbindung von einem tatsächlich
geprüften nativen Host. Bereits laufende Server und eingebettete Dokumente werden dadurch
nicht im Speicher ersetzt: Codex muss die Verbindung neu aufbauen und das Cockpit neu öffnen.

## 5. Quellen und ContextGraph

Dokumente werden ausschließlich über registrierte, an Run und Datenstand gebundene Ressourcen
gelesen. Die UI übergibt eine opaque Ressourcen-ID statt eines frei wählbaren Dateipfads.
Originaltext wird passiv gerendert; HTML, externe Inhalte und Dokumentanweisungen erhalten keine
Ausführungs- oder Freigabebefugnis.

„Verknüpfter Kontext ansehen“ löst nur die ausdrücklich im Run gepflegten exakten
`CG-...`-Bezüge auf. Fehlende, mehrdeutige oder nicht lesbare Bezüge bleiben sichtbar.
Es gibt keine rekursive Graphsuche und keine aus Titeln abgeleitete Relevanz.

Der native Kontextweg verlangt zunächst ein geprüftes Dokument und eine bewusste Auswahl von
höchstens 16 verfügbaren Graphknoten. Nicht verfügbare Bezüge müssen ausdrücklich ausgeschlossen
werden. Der Server erstellt ein begrenztes Paket mit Originalen und Herkunft; es wird nichts
still gekürzt. Erst nach bestätigter Kontextübernahme durch den Host ist eine separate bewusste
Frage zu diesen Quellen möglich. Fehlende Host-Fähigkeiten deaktivieren diese Aktionen.
Quellenwechsel, Aktualisierung, Veralten und Sitzungswechsel invalidieren die Übergabe.
Fragen werden nicht automatisch wiederholt. Eine Host-Bestätigung beweist weder eine Antwort
noch die Richtigkeit der Quelle oder eine Freigabe. Der lokale Browser bietet diesen Hostweg nicht.

### Exklusive Übergabe bei unabhängigem Lesen

Lesen und Kontextübergabe haben unterschiedliche Zuständigkeiten. Im bestehenden Core-Sitzungsdienst
hält genau eine Ansicht je Verbindung den temporären Kontext-Eigentümer. Sie reserviert ihn bereits
vor der asynchronen Paketvorbereitung. Eine andere Ansicht erhält bei einer konkurrierenden
Übergabe eine Belegt-Meldung und kann weiter lesen. Scheitert die Vorbereitung, bevor ein Paket
zurückgegeben werden konnte, wird nur diese Reservierung freigegeben.

Ein zurückgegebenes Paket bleibt exklusiv bis zum bestätigten Abschluss der eigenen Entwertung:

1. `invalidate_context` entwertet das eigene Server-Paket und liefert eine temporäre
   `invalidation_id`; der Kontext-Eigentümer bleibt belegt.
2. Die Ansicht übergibt den Entwertungsvermerk an den Host und wartet auf dessen Bestätigung.
3. `complete_context_invalidation` mit derselben Sitzung und genau dieser ID bestätigt den
   Abschluss im Core. Erst dann kann eine andere Ansicht ein Paket vorbereiten.

Eine Nicht-Eigentümerin erhält beim ersten Schritt `host_publication_required: false` und sendet
keine Host-Aktualisierung. Ein fehlgeschlagener erster Schritt erlaubt ebenfalls keine solche
Aktualisierung. Wiederholter Beginn liefert dieselbe noch offene ID; nach abgeschlossenem
Beginn ohne neue Übergabe entsteht keine erneute Host-Entwertung. Pro lebender Sitzung bleibt
höchstens ein Abschlussbeleg erhalten. Geht nur die letzte Serverantwort verloren, wird allein
der Server-Abschluss wiederholt, niemals die bereits bestätigte Host-Aktualisierung.

Unbestätigte Host-Entwertung, Verlust des Eigentümers oder Worker-Verlust ohne bestätigten
Abschluss sperren weitere Übergaben. Andere Quellen bleiben lesbar, und frei gewordene
Lesekapazität bleibt nutzbar. Ein noch aktiver Eigentümer kann seinen bereits begonnenen,
Host-bestätigten Abschluss beenden; nach Eigentümerverlust sind eine neue Verbindung und eine
tatsächliche Host-Kontextprüfung erforderlich. Zeitablauf erlaubt keine Übernahme. Diese
kooperative Bestätigung erteilt keine menschliche Freigabe und löscht keine früheren Chat-Inhalte.

## 6. Vorbereitung, Nachweise und offene Grenzen

Die aktuelle lokale Vorbereitung ist auf Codex ausgerichtet. Das Profil unter
`dist/local/codex-cockpit/` und der projektbezogene Eintrag `agdf-cockpit-local` bleiben von
globaler Konfiguration und regulärer AGDF-Laufzeit getrennt. Die [UI-README](../../packages/control-ui/README.md#embedded-codex-reader-and-context-handoff)
beschreibt Build, Registrierung, Wiederverbindung und begrenzten Rollback. Eine Claude-Nutzung
ist damit noch nicht implementiert oder im Host nachgewiesen.

Die [Umsetzungsnachweise zur Arbeitseinheit](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/WORK_STEP_HIERARCHY-02.md)
und das [Prüfprotokoll](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/WORK_STEP_HIERARCHY_VERIFICATION-02.json)
halten den geprüften Stand fest: 71 UI-Tests, fünf Dienstprüfungen, zehn Browserprüfungen,
responsive Hell-/Dunkel-Beobachtungen, Builds und zwei tatsächliche stdio-Protokollversionen.
Browserbeobachtungen des realen Repository-Runs sind enthalten; die dunkle Browseransicht
verwendet eine ausgewiesene HTML-Theme-Fixture mit unveränderten Produktionsassets.

Die [erneute native Mindestprüfung](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/HOST_FEASIBILITY-05.md)
weist die aktuelle Resource, zwei unabhängige Leseansichten sowie bestätigte synthetische
Kontext-/Nachrichtenmethoden nach. Sie wurde vor der vollständigen Implementierung des exklusiven
Kontext-Eigentümers durchgeführt; deren produktiver Host-Test bleibt offen. Die späteren
Core-/UI-Prüfungen prüfen Eigentum, Entwertungsreihenfolge und Fehlerfälle separat.

Die [erneute Qualifikation](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/RENEWED_QUALIFICATION-26.md)
erfasst 57 qualifizierte Core-Fälle (50 unveränderte Erstläufe plus sieben korrigierte Fälle,
kein gemeinsamer 57-Fälle-Neulauf), 113 UI-Fälle, 15 Browserprüfungen mit festen Assets in
Hell/Dunkel und vier Breiten sowie Writer- und stdio-Regressionen. Der spätere
[native Zwei-Ansichten-Test](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/HOST_SESSION_HANDOFF-27.md)
belegt auf seinem exakten Server-/UI-Stand unabhängiges Lesen, die belegte Veröffentlichung,
Nicht-Eigentümer-Rückkehr ohne Kontextlöschung und bestätigte Entwertung mit anschließender
Übernahme. Im reinen App-Prüffenster blieben 3577 Kontrolldateien bytegleich.

Die beiden separat bewusst ausgelösten Quellenfragen sind anschließend auch tatsächlich
beim Modell angekommen und beantwortet worden. Die
[Empfangsbelege](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/MODEL_RECEIPT-28.json)
unterscheiden UR samt gewähltem Graph-Knoten aus Ansicht A und PRD ohne Graph-Knoten aus B.
Auch die nachfolgenden Entwertungsvermerke erreichten das Modell. Die Pakete bleiben historische
Quellenstände; weder Empfang noch Antwort erteilen eine Freigabe.

Der [Abschlussprüfstand](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/CLOSING_CHECKPOINT-28.md)
benennt die noch offene aktuelle Rückbau-/Wiederverbindungsprüfung und den vollständigen
Abschlussreview. Die später geschlossene native Verbindung hebt die dokumentierten früheren
Beobachtungen nicht auf, belegt aber keine aktuelle Verfügbarkeit. Die projektbezogene
Registrierung und der zugehörige Runtime-Pfad dürfen nur gezielt und mit geprüfter Eigentümerschaft
zurückgenommen werden; parallele Einrichtungsänderungen müssen vor diesem Test geklärt sein.

Der neuere [Prüfstand 29](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/CLOSING_CHECKPOINT-29.md)
weist den tatsächlichen gezielten Rückbau und die bytegleiche Wiederherstellung der eigenen
Registrierung und aller 1449 Runtime-Dateien nach, auch auf der zuletzt gebauten Version.
Ein während der Titelladung ausgewähltes Vorhaben erhält jetzt eine frische, ausdrücklich an
seine Run-ID gebundene Aufnahme: Eine abgebrochene Antwort kann eine bereits ersetzte
Server-Aufnahme nicht zurückholen. Die Navigation verwendet daher deren alte Selektoren nicht
weiter. Umfang, Leselimits und Kontrollautorität bleiben bei den vorhandenen Besitzern.

Die [zugehörigen Belege](../../.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/closing-evidence-29/verification.json)
halten 114 UI-Fälle, sechs HTTP-Dienstprüfungen, TypeScript/Builds und getrennte stdio-Protokollversionen
fest. Fünfzehn Browserpfade sind durch vierzehn erfolgreiche Läufe plus den korrigierten
Einzellauf qualifiziert. Bei diesem Einzellauf wurde eine künstliche Ein-Pixel-Verkleinerung
durch Chromiums vollständige Screenshot-Aufnahme vermieden; alle Quellen-, Navigations-,
Fokus- und Unverändertheitsprüfungen bleiben erhalten. Der erzwungene echte HTTP-Übergang
zwischen Titelladung und Run-Auswahl besteht in Hell/Dunkel und vier Breiten.

Code- und Strukturreview bestehen für diesen geprüften Umfang. Der Planreview hält die
native Wiederverbindung offen: Der neue Modulstand ist lokal eingerichtet und per Protokoll
geprüft, der bisherige Codex-Kanal meldet weiterhin `Transport closed`. Frühere native
Zwei-Ansichten- und Modellempfangsbelege bleiben ihrem damaligen Build zugeordnet.
Die Verbindung muss im Host neu geöffnet und ihre geladene Identität geprüft werden;
bereits angenommene Quellenfragen werden dabei nicht automatisch erneut gesendet.

Die kooperativen Plan-, Struktur- und Code-Reviews ersetzen keine QA-Entscheidung oder menschliche
UAT. `CD+Tests` bleibt in Arbeit; QA/UAT/OR und der reguläre Abschluss bleiben getrennte Pflichten.
Die Dokumentation verleiht dem Run keine neue Freigabe und schließt ihn nicht ab.


### Native Wiederverbindung nach dem Rückbau (Checkpoint 30)

Die zuvor offene Wiederverbindung ist am 7. Oktober 2026 tatsächlich in der vergrößerten nativen Codex-App geprüft. Geladenes Modul und Styles stimmen mit dem vorbereiteten finalen Build aus Checkpoint 29 überein. Der explizit angeforderte Run öffnet seine registrierte Run-State-Quelle; die Rückkehr erhält die Ansicht und stellt den Quellenfokus wieder her. Alle 3.630 Dateien des gemessenen Kontrollbestands bleiben unverändert. Das initiale Öffnen und spätere Agenten-Buchhaltung liegen außerhalb dieses Messfensters.

Der tatsächliche Rückbau und die unveränderte Wiederherstellung stammen aus Checkpoint 29. Zwei unabhängige Ansichten, Kontextbesitz und Modellzustellung sind datierte Nachweise aus 27/28; ihre unveränderten angrenzenden Quellbereiche wurden erneut abgeglichen. Es wurden keine angenommenen Quellenfragen wiederholt. Der neue Nachweis bestätigt Wiederverbindung und Dokumentnavigation im finalen Modul, keine neue Kontextpublikation oder Claude-Unterstützung.

Nachweise: `.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/HOST_RECONNECTION-30.md`, `native-reconnection-evidence-30/verification.json` und `TASK_PLAN_REVIEW-30.md`. Planerfüllung und Code-/Strukturreviews sind Evidenzdimensionen; QA entscheidet die Qualitätsbereitschaft. Menschliche QA/UAT-Freigaben, OR und Release bleiben eigenständige Schritte.

## Gebundene Entwurfsprüfung

Im ausgewählten Vorhaben bietet das Cockpit eine bewusst ausgelöste Autorenprüfung für den aktuellen unterstützten UR-, PRD-, SD- oder TP-Entwurf an. Auch noch unregistrierte kanonische Entwürfe erhalten einen beobachteten Quellenbezug; daraus entsteht keine Dokumentregistrierung. Bestanden bezeichnet ausschließlich die bestehenden Autorenregeln. Semantische Ableitung, Registrierung, Präsentation, menschliche Freigabe und QA bleiben im bestehenden Ablauf.

Der additive `agdf_cockpit_read`-Aufruf `artifact_readiness` akzeptiert ausschließlich Sitzung, Snapshot, Run, Gate und erwartete Revision. Der authentifizierte Browser-Adapter `/api/draft-check/<run>` verlangt jeweils genau einen `snapshot`-, `gate`- und `expected_revision`-Parameter. Ziel und Dateipfad werden intern abgeleitet; allgemeine Inspect-/Datei-/Writer-Aufrufe sind ausgeschlossen. Beide Wege nutzen denselben Autorenprüfkern aus `artifact-readiness.js` im bestehenden Quellen-Snapshot.

Die Entwurfsdatei beziehungsweise ihre Abwesenheit wird bereits bei Auswahl erfasst. Der Prüfaufruf validiert die alte Auswahl, erstellt über den bestehenden Leser einen neuen Lesestand und prüft vor Veröffentlichung erneut Revision, Gate, Dateiidentität und Quellenfrische. Sitzung, Worker, Pool, Ressourcen und Beobachter übernehmen diesen Stand gemeinsam; bestehende Kontextbereinigung und Quarantäne bleiben wirksam. Dateiänderungen bei gleicher Run-Revision entwerten Ergebnisse ebenfalls.

Eine gemeinsame App-Komponente zeigt ungeprüft, laufend, bestanden, Korrekturen und begrenzte Nichtverfügbarkeit an. Originalbefunde und Quellenbezug bleiben aufklappbar. Eine kurzlebige Anfrage koordiniert Abbruch, Frische und Kontextbereinigung; ausschließlich der zentrale Lesezustand übernimmt eine aktuelle Antwort. Verspätete Antworten dürfen keine frühere Prüfung als aktuell installieren. Ressourcenwechsel erhalten logischen Fokus, Quellenklappen und Leseposition. Neuladen prüft nicht automatisch.

Alte Leseoperationen bleiben kompatibel. Ein alter Server ohne Quellenbeschreibung zeigt die Nichtverfügbarkeit der Prüfung, während Lesen weiterhin möglich ist. Core-/Protokoll-/Browserprüfungen und ein Paket-Build belegen keine neue native MCP-App-Beobachtung; diese benötigt den exakt gebauten und tatsächlich geladenen Host-Stand.

### Dokumentliste und nachgewiesene Fassung

Die Liste „Dokumente“ zählt die tatsächlich registrierten UR-, PRD-, SD-, TP-, QA- und UAT-Ressourcen des ausgewählten Runs. Dateien und gespeicherte Freigaben erzeugen keine zusätzlichen Zeilen. Analysen und Run State behalten ihre bisherigen Quellenwege. Zwei Gruppen zeigen Dokumentname mit Symbol und lesbarem Status sowie genau einen kontextbezogenen Dokumentlink. Bei wenig Platz werden dieselben Gruppen untereinander angeordnet; die logische Zeile bleibt erhalten. Die Übersicht besitzt keine eigenen aufklappbaren Freigabeeinträge und keinen separaten Freigabeleser.

Core liefert optional `Detail.document_states`; ein gelesener verfügbarer Gate-Text trägt denselben Eintrag in `DocumentData.document_state`. Ein Eintrag enthält `schema_version: "1"`, `authorizes: false`, Ressourcen-ID, Run, Revision, Typ, registrierte Referenz, `source_state`, rohen SHA-256 `content_digest` ohne Präfix, `state`, `version_kind`, `reason`, ursprüngliche `recorded_approval` oder null und zutreffende `check` oder null. `check` enthält die bestehende Prüfquelle, den unveränderten Autorenbericht, dessen beschreibende Anzeige und den rohen Digest. Die bestehende kanonisch normalisierte `artifact_digest` bleibt getrennt von den tatsächlich gelesenen Bytes.

Die Zustände sind `approved`, `draft`, `draft_checked`, `revision_required`, `check_unavailable`, `approval_unconfirmed` und `unavailable`. `version_kind` ist `approved`, `draft`, `current` oder `unavailable`; Quellen können `available`, `missing`, `blocked`, `unsupported` oder `unavailable` sein. Eine bestätigte Fassung verlangt bestehende Run-/Quellenintegrität und die exakte Zuordnung über `inspectApprovedArtefact` im bisherigen Freigabeprüfkern zu den zurückgegebenen Rohbytes. `exactApprovedArtefacts` nutzt denselben Kern und behält seine bisherigen Legacy-, Beleg-, Ableitungs- und historischen Regeln. Die bestehende UAT-Ausnahme des Sammelprüfers beweist kein UAT-Dokument; der einzelne Prüfer bestätigt UAT daher nicht.

Eine frühere gespeicherte Freigabe bleibt als Originalnachweis sichtbar, auch wenn die aktuelle Fassung nicht bestätigt ist. Nur `approved` erhält den typbezogenen Link „Freigegebenes … ansehen“; Entwürfe erhalten „Entwurf ansehen“, unbestätigte lesbare Fassungen „Aktuelle Fassung ansehen“. Fehlende und gesperrte Quellen erhalten keinen funktionierenden Link. Der große vorhandene Dokumentleser zeigt Status, zutreffende Korrekturen und den ursprünglichen Freigabetext. Nicht strukturiert bestätigte Angaben zu Zeitpunkt, Person und Grundlage werden ausdrücklich als nicht verfügbar ausgewiesen.

### Kurzlebiger Prüfbezug und Grenzen

Ein Leser hält höchstens einen flüchtigen Core-Prüfbezug von maximal 256 KiB serialisierten UTF-8-JSON-Bytes. Ziel, Run, Gate, Revision, Pfad, kanonischer Digest und roher Digest müssen bei frischer Erfassung übereinstimmen. Navigation zum Dokument, verknüpftem Kontext und zurück zum selben Run darf den Bezug nach erneuter Validierung erhalten; neue Snapshots und Ressourcen-IDs bleiben ausschließlich beim bisherigen Leser. Es gibt keinen App-Prüfcache, Schreibpfad oder automatische Listen-/Sammelprüfung.

Ein expliziter Snapshot/Reload, Übersicht oder anderer Run, beobachtete Änderungen an Quelle, Revision, Gate, Lebenszyklus oder Integrität, fehlgeschlagene Erfassung, `source_changed`, ungültiger aktueller Stand und Sitzungsabbau löschen den Bezug. Vor der Erfassung abgewiesene ungültige Selektoren verändern die legitime Ansicht nicht. Die Beschreibungen aller Dokumente zusammen haben ebenfalls eine harte Grenze von 256 KiB; vorhandene Datei-, Vorschau-, Antwort-, Zeit- und Ressourcenlimits bleiben bestehen. Überschreitung liefert die bestehende begrenzte Nichtverfügbarkeit, kein gekürztes positives Ergebnis.

`describeArtifactReadiness` beschreibt ausschließlich tatsächliche Befunde des bisherigen Autorenprüfers. Frühe `artifact_gate_not_ready`-Berichte dürfen konkrete Korrekturen anzeigen, wenn aktuelles Gate, bekannte UR-/PRD-/SD-/TP-Autorenursache und nichtleere strukturierte offene Punkte zusammenpassen. Andere Voraussetzungen, unbekannte Ursachen oder technische Fehler bleiben „Prüfung nicht verfügbar“. Der Originalbericht wird nicht verändert und erteilt keine Freigabe.

HTTP und STDIO MCP übertragen diese optionalen Angaben über ihre bestehenden Leser. Die gemeinsame App-Grenze prüft Form, Mitgliedschaft, Revision, Quellenbezug, rohen Digest und Gleichheit von Run- und Dokumentbeschreibung, ohne Freigabe oder Autorenregeln selbst auszuwerten. JSON-Schlüsselreihenfolge ist unerheblich. Fehlende Zusatzfelder alter Server bleiben kompatibel und unsicher; vorhandene fehlerhafte oder fremde Zusatzfelder werden als `dto_invalid` abgewiesen. Kontextübergabe, Generation, Abbruch, Fokus, Frische, Quarantäne und Teardown bleiben bei den bisherigen Eigentümern.
