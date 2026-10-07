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
Suche und Auswahlfeld. „Anderen Run wählen“ blendet die Auswahl bewusst ein. Der bisherige Run
bleibt ausgewählt, bis der Nutzer einen anderen auswählt. Auswahl und Kontextpakete werden
nicht aus URL oder Browser-Speicher wiederhergestellt.

## 3. Fachlicher Fokus in allen Ansichten

| Ansicht | Zweck und Verhalten |
|---|---|
| Kompakte Karte | Führt einspaltig mit gespeichertem Arbeitsstand, aktueller Kontrollaussage und einer Quellenaktion. Nachweise, Freigaben und Ziel/Run-ID sind zunächst geschlossen. „Run ansehen“ bleibt ein nachgeordneter Zugang zur größeren Ansicht. |
| Vorhaben-Übersicht | Liest ausschließlich gespeicherte Masterbacklog-Einträge. Die drei Bereichsschalter „Aktiv“, „Geplant“ und „Archiv“ zeigen die Anzahlen der jeweiligen Backlog-Abschnitte; „Archiv“ umfasst abgeschlossene und abgelöste Einträge. „Aktiv“ startet ausgewählt. Die einspaltige Liste führt mit Titel, gespeichertem Stand und nächstem Schritt beziehungsweise Ergebnis. Der Titel öffnet den konkreten Run für dessen aktuelle Core-Prüfung. |
| Run-Zusammenfassung | Bündelt aktuellen Arbeitsschritt, exakte Core-Aktion, Voraussetzungen und Nachweise. Ziel, ID und Kontrollgrundlage sind aufklappbar. |
| Run-Details | Zeigt zusätzliche Originalangaben und Quellen. Der Schiebeschalter „Zusammenfassung / Details“ ändert den Lesemodus innerhalb der größeren Ansicht. |
| Dokument | Führt mit einer vorhandenen deutschen Quellenkurzfassung, dem gespeicherten Dokumentstand und der getrennten aktuellen Core-Kontrollauswertung. Quellenangaben und unveränderter Originaltext starten geschlossen. Hier gibt es keinen Zusammenfassungs-/Details-Schalter. „Dokument schließen“ kehrt zum Run zurück und stellt den Fokus auf den öffnenden Quellenzugang wieder her. |

Das Cockpit schreibt weder kanonische Titel noch freigegebene Ziele um. Fachlich unklare
Originalangaben bleiben als solche sichtbar. Es erfindet keinen Fortschritt oder nächsten
Arbeitsschritt aus einer UI-Auswahl.

Die Übersicht ordnet Einträge nach ihrem gespeicherten Backlog-Abschnitt, nicht durch eine
zusätzliche Run-Auswertung oder automatische Statuskorrektur. Die Suche filtert den ausgewählten
Bereich nach Titel, Schlüssel oder gespeichertem Status; ein Bereichswechsel leert die Suche.
Bereich und Suchbegriff bleiben bei Rückkehr aus einem geöffneten Vorhaben erhalten, ebenso der
Tastaturfokus auf dessen Titel, sofern der Eintrag noch vorhanden ist. Es gibt keinen zweiten
identischen Öffnen-Button pro Zeile. Bekannte vorangestellte Scope-Tags werden im sichtbaren Titel
ausgeblendet; Originaltitel, Schlüssel, Scope, Priorität, vollständiger nächster Schritt und
Quellenangaben bleiben unverändert in zunächst geschlossenen Angaben verfügbar.

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

Die sichtbare kompakte Karte prüft den Datenstand alle fünf Sekunden und bei erneuter Sichtbarkeit.
Eine erkannte Quellenänderung lädt ihren bisherigen Run im Hintergrund neu, ohne den Fokus zu
übernehmen. Größere Leseansichten kennzeichnen Änderungen als veraltet und verlangen bewusstes
Neuladen. Frühere Inhalte bleiben als vorheriger Datenstand erkennbar. Verspätete Antworten
dürfen eine neuere Auswahl nicht überschreiben.

Die MCP-Lesesitzung läuft nach 30 Minuten Inaktivität oder spätestens nach acht Stunden ab.
Dann muss das Cockpit mit derselben expliziten Run-ID neu geöffnet werden. Ein temporärer
Lesefehler erhält dagegen die angefragte Route für den erneuten Versuch. Ein Austausch der
vorbereiteten Runtime benötigt eine frische Server-/Hostverbindung. „Transport closed“ belegt
keine aktuelle UI-Darstellung; Wiederverbindung und aktuelle Ressourcenidentität sind getrennt
zu prüfen.

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

Diese Nachweise ersetzen keine aktuelle native Host-Abnahme. Produktive Host-/Kontextprüfungen,
vollständige Reviews und die regulären QA-/UAT-/
Abschlussentscheidungen bleiben getrennte offene Pflichten. `CD+Tests` ist weiterhin in Arbeit.
Die Dokumentation verleiht dem Run keine neue Freigabe und schließt ihn nicht ab.
