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

Das [UI-Zielkonzept für Hub und Run-Cockpit](07-ui-konzept.md) beschreibt die Weiterentwicklung
aus Anwendersicht: alle Runs im Hub finden, mit der aktuellen Entscheidungsfrage im Chat einsteigen und
denselben Run in einer vom Host bereitgestellten großen Appfläche mit dauerhafter Orientierung,
Dokumenten und Verlauf bearbeiten. Die Position dieser Fläche und das Gespräch bleiben Host-Aufgaben.
Die dort beschriebene visuelle Zusammenführung von Lesen und Entscheiden erhält die getrennten
technischen Zuständigkeiten. Die Oberfläche verwendet Aufgaben wie „Ziel und Umfang klären“,
„Verhalten festlegen“ und „Lösung planen“; die technischen Kürzel stehen in Details.
Die folgenden Abschnitte bleiben die Referenz des Bestands.

## Orientierung auf dieser Seite

| Deine Frage | Abschnitt |
|---|---|
| Wie arbeiten UI und Core zusammen? | [Einordnung und Zuständigkeiten](#1-einordnung-und-zuständigkeiten) |
| Wie bleiben Vorhaben, Quellen und aktuelle Fassung zusammen? | [Run-Bindung](#2-run-bindung-beim-öffnen), [Ansichten](#3-fachlicher-fokus-in-allen-ansichten) und [Aktualität](#4-aktualität-und-lebenszyklus) |
| Wie wird die App im Plugin ausgeliefert? | [Codex-Integration vom 16. Oktober](#plugin-integration-in-codex-entwicklungsstand-vom-16-oktober-2026) |
| Welche Eigenschaften sind tatsächlich geprüft? | [Vorbereitung und Nachweise](#6-vorbereitung-nachweise-und-offene-grenzen) |

Die Neuordnung vom 26. Oktober 2026 ändert die Reihenfolge der Erklärung; die datierten
Implementierungs- und Host-Beobachtungen behalten ihren jeweiligen Geltungsbereich.

## 1. Einordnung und Zuständigkeiten

Im historischen verzeichnisgebundenen Aufbau stellt die separate lokale Verbindung `agdf-cockpit-local` `agdf_cockpit` und
`agdf_cockpit_read` sowie die UI-Resource `ui://agdf/cockpit/v1.html` bereit. Der reguläre
AGDF-Server bleibt ein eigener Zugang zur Ablaufsteuerung und zu begrenzten Core-Operationen.
Neben `agdf_dispatch` und `agdf_inspect` enthält sein nachgeführter Repository-Entwicklungsstand
fünf konfigurierbare Befehlsgruppen. Die getrennte Decision App bindet eine Entscheidung an eine
exakte Präsentation; ihre Aktionen und native Qualifizierung erklärt der
[Befehlsfluss](core-mcp-command-flow.md#3-wie-der-mensch-die-gebundene-entscheidung-sieht).
Das allgemeine Cockpit besitzt keine eigene Gate-Policy und keinen Writer für Freigaben oder Run-Zustand.
Dieser Quellabgleich vom 11. Oktober 2026 aktualisiert nicht die oben abgegrenzten Host-Nachweise.

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

## 3. Run-Übersicht, Altbestand und Schreibgrenzen

Die Standardübersicht verwendet `readRunInventory` und dessen reine Inventarregeln. Aktiv enthält
aktive Runs und berücksichtigte ungültige Einträge, Historie abgeschlossene/abgelöste/abgebrochene
Runs. Beide Oberflächen verwenden dieselbe Gruppierung, Reihenfolge und Suche über den angezeigten
Inventartitel, Run-ID und gespeicherten Status. Aufmerksamkeit, Aktivität aus Belegen/Freigaben und
Run-ID bestimmen die vorhandene Reihenfolge; Dateizeit oder nachgeladenes UR-Heading verändern sie
nicht. Rückfalltitel, unbekannte Aktivität, beobachtete Revision und eingeschränkte Abdeckung bleiben
sichtbar. Zähler/keine Treffer versprechen keinen vollständigen Bestand bei Lesefehlern.

Die Liste liest Run-Dateien und Verzeichnismitgliedschaft über den begrenzten bestehenden Read-View,
keine Einzelprüfung sämtlicher Artefakte, Git-Historie oder rekursive Worktree-Suche. Auswahl eines
bestimmten Runs verwendet die bestehende aktuelle Gate-, Siegel-, Quellen- und Freigabeprüfung.
Gespeicherte Lebenszyklen und gültige Siegel sind keine Liefer-/Freigabeentscheidung. Geänderte
Quellen machen Selektoren ungültig. Fehlgeschlagene Aktualisierung behält sichtbar den vorherigen
Stand, Wiederholung ersetzt ihn zusammenhängend; entfernte Runs behalten ihre Identität und bieten
Rückkehr zur Übersicht. Keine benachbarte Auswahl und keine Reparatur durch Lesen.

`view: legacy` öffnet einen eigenen optionalen Snapshot des ursprünglichen Masterbacklogs.
Zeilen/Bereiche/Quellen/Provenienz bleiben lesbar und getrennt von Run-Zählern; Ideen ohne Run werden
nicht in Runs umgewandelt. Fehlendes, fehlerhaftes oder zu großes Legacy-Material betrifft nur diese
Ansicht. Der vorhandene Parser und begrenztes `backlog_titles` gehören ausschließlich dorthin.
Normale Run-Details benötigen keinen Vergleich mit dem Altbestand.

Der Cockpit-Umschlag verwendet `schema_version: 2` und die passende Ressource
`ui://agdf/cockpit/v2.html`. HTTP/MCP, Parser und gebaute große/kompakte Oberfläche werden zusammen
qualifiziert. Neue UI lehnt alte/unbekannte Umschläge ab; verschachtelte Run-, Dokument-, Kontext-
und Freigabe-Nachweisformate behalten ihre Version. Alte generationgebundene Sitzungen bleiben alte
Beobachtungen. Dies ist keine automatische Hostinstallation.

Neue Erstellung/Erfassung/Freigaben/Updates/Quellrevisionen/Abschlüsse schreiben und sperren das
Backlog nicht. Bestehende Schreiber führen Run-lokale Ausgaben, exakte Quellen/Materialien, Revision,
Siegel, Wiederholung und atomaren Run-Commit mit `backlog: null` fort. Unabhängige neue Runs müssen
nicht wegen eines anderen Run-lokalen Journals warten. Alte Journale Version 1–5 behalten ihre
Originalausgaben: nur ausdrückliche unterstützte Recovery darf eine gespeicherte alte Backlog-
Verpflichtung unter Run-dann-Backlog-Sperre und ursprünglichen Konfliktprüfungen abschließen.
Normale Operationen fordern diese Recovery an und erfinden keine neue Synchronisierung.

Frische Einrichtung erzeugt kein erforderliches Live-Backlog. Bestehende Daten bleiben erhalten;
Doctor/Gates/Beziehungen verwenden Run- und registrierte Quellen statt Backlog-Zeiger. Andere
Pflichtkontrollen bleiben wirksam. Vor einer Umstellung alle Schreiber dieses Ziels anhalten,
Nachweise einschließlich unversionierter Dateien sichern, alte Transaktionen ausdrücklich
wiederherstellen und schreibende Laufzeiten gemeinsam umstellen. Keine gemischten alten/neuen
Schreiber. Nach neuen Schreibvorgängen braucht ein Rückwechsel einen konkreten Kompatibilitätsnachweis
auf einer Kopie; andernfalls lesend erhalten und vorwärts korrigieren. Keine erfundenen historischen
Zeilen, übertragenen Freigaben oder Neuversiegelung. Native Host-Nachweise bleiben von Browser-
und Protokolltests getrennt.

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
Run- und ausdrückliche Legacy-Ansichten behalten den bisherigen Stand bis zum bewussten Aktualisieren; neue
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

### SDK-Diagnose einer eingebetteten Cockpit-Ansicht

Unter „Host-Verbindung prüfen“ kann für eine frische Ansicht „SDK-Nachweis aufzeichnen“
gestartet werden. Der öffentliche SDK-Transport puffert zunächst nur Öffnen und Initialisierung.
Ab der Diagnoseaktion erfasst er die tatsächlich empfangenen und erfolgreich gesendeten
JSON-RPC-Nachrichten dieser Ansicht, einschließlich Leseantworten und gegebenenfalls Teardown.
Der Puffer ist auf 256 Ereignisse und 1 MiB begrenzt;
ein überschrittenes Limit wird ausdrücklich als `truncated` ausgewiesen. Er ersetzt weder
Protokollhandler noch Quellenprüfung oder Sitzungsbesitz. Fehler der Diagnoseausgabe ändern
den Transportausgang nicht.

Erst die Diagnoseaktion gibt den Puffer und spätere Ereignisse mit `AGDF_SDK_TRACE` an die
Konsole und, bei gemeldeter Logging-Fähigkeit, über `App.sendLog` an den Host aus. Die
Konsole erhält nur Initialisierung, Kontextübergabe und -entwertung sowie Schließung mit
ihren zugehörigen Antworten. Polling füllt dadurch nicht das begrenzte Warnprotokoll des
Hosts. Der begrenzte SDK-Puffer und `App.sendLog` behalten den vollständigen erfassten Strom.
Die
Nachrichten können gelesene Originalquellen enthalten. Es gibt keinen zusätzlichen externen
Sammler und keinen Modellaufruf. Die erfolgreiche Übergabe an die Logging-Schnittstelle
garantiert keine dauerhafte Speicherung: Export, Vollständigkeit und tatsächliche Host-Dateien
müssen separat geprüft werden. Geschlossene Ansichten lassen sich nicht nachträglich aus
diesem flüchtigen Puffer auslesen.

Nach Beginn der Aufzeichnung führt „Sitzung beenden und Host schließen lassen“ einmalig
den vorhandenen Kontextentwertungsablauf aus und wartet auf dessen Bestätigung. Erst danach
schließt die Ansicht ihre unveränderlich gebundene Core-Sitzung und prüft deren Antwort.
Währenddessen wird die Arbeitsansicht entfernt, damit keine neue Lese- oder Kontextübergabe
beginnt. Bei unbestätigter Bereinigung bleibt die Ansicht gesperrt; es gibt keine automatische
Wiederholung und keine Schließanforderung an den Host.

Nach bestätigter Bereinigung folgt der öffentliche SDK-Aufruf `App.requestTeardown()`.
Er sendet `ui/notifications/request-teardown`; der Host entscheidet, ob er mit
`ui/resource-teardown` antwortet oder die Karte weiter anzeigt. Sichtbarkeit bestätigt daher
keine Ressourcenfreigabe. Ein nachfolgendes Host-Teardown nutzt denselben Schließvorgang,
ohne die Sitzung doppelt zu schließen. Bei erzwungenem Host-Teardown bleibt die vorhandene
Core-Quarantäne für einen unbestätigten Kontextverlust erhalten.

Der Codex-Plugin-Server ergänzt Werkzeugantworten um `_meta["agdf/provider"]`. Dessen
`connection_id` wird einmal je tatsächlicher SDK-Serverinstanz erzeugt; der STDIO-Einstieg
bindet diese Instanz an die Verbindung. Render- und Leseantworten derselben Verbindung
tragen dieselbe Kennung. `server_module` bezeichnet das tatsächlich geladene Servermodul.
`_meta["agdf/peer"]` enthält die am vorhandenen SDK-Einstieg beobachtete Client-Identität
und dessen tatsächlich deklarierte Fähigkeiten, einschließlich einer vorhandenen
`io.modelcontextprotocol/ui`-Erweiterung. Das ist beobachteter SDK-Zustand; es ist keine
Kopie der zugrunde liegenden STDIO-Bytes.
Diese Angaben sind kooperative Laufzeitbeobachtungen mit `authorizes: false`, keine vom Host
vergebene Kennung, Namensraumgarantie oder Freigabe. Die Zuordnung verlangt zusätzlich
beobachteten Werkzeugursprung und geprüfte Installations-/Runtime-Identität. Eine neue
Instrumentierungsfassung benötigt neue passende native Nachweise; der Übergangsvalidator
und die Bedingungen für die Legacy-Abschaltung bleiben unverändert.

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

## Plugin-Integration in Codex: Entwicklungsstand vom 16. Oktober 2026

Der aktuelle Codex-Laufzeitbuild liefert das **Cockpit** im AGDF-Plugin mit. Intern gehören
`agdf` und `agdf-cockpit` zum selben Plugin; sie verwenden denselben Launcher und geprüften
Paketbestand, behalten aber eigene Verbindungen und Sitzungszustände. Die normale Codex-Paketierung
enthält die exakten geprüften UI-Dateien. Die folgenden historischen Hostnachweise qualifizieren
diesen neuen Stand nicht automatisch.

Der Codex-Plugin-Server liefert seine Werkzeugbeschreibungen bereits bei der Discovery,
auch wenn diese Anfrage noch keine MCP-App-UI-Fähigkeit meldet. Erst so kann der Host den
passenden UI-Aufruf auswählen. Das Anzeigen der Beschreibungen öffnet keine Ansicht:
Rendern, Lesen und Zugriff auf die UI-Ressource prüfen weiterhin die deklarierte UI-Fähigkeit
der tatsächlichen Anfrage. Ohne sie wird kein Ansichtsplatz angelegt. Die bestehende
Discovery-Sperre des optionalen Claude-Profils bleibt erhalten.

Beim Plugin-Aufruf von `agdf_cockpit` sind `working_directory`, `target_source` und `primary_target`
verpflichtend. Core prüft das bestätigte Projekt und bindet es unveränderlich an die neue Ansicht.
`run_id` bleibt der explizite optionale Run-Selektor. Die vier Ansichtsplätze und der exklusive
Kontext-Eigentümer gelten gemeinsam über alle Projekte einer Verbindung. Nachfolgende Leseaufrufe
akzeptieren weiterhin nur die vorhandenen Sitzungs-/Snapshot-Selektoren. Alte verzeichnisgebundene
Codex-/Claude-Aufrufe behalten ihr Schema; das Plugin führt keine aktuelle globale Projektauswahl ein.

Der sichtbare Name ist Cockpit, die technische Kennung `agdf-cockpit`. Unverändert bleiben
`agdf_cockpit`, `agdf_cockpit_read` und `ui://agdf/cockpit/v1.html`. Pluginzugehörigkeit allein
beweist keine Namensisolierung im Host. Deklarationsherkunft, mögliche Namensangleichungen und
tatsächliche Verbindungs-/Werkzeugzuordnung müssen beobachtet werden. Das allgemeine Cockpit
ersetzt den begrenzten Decision-App-Reader des `agdf`-Servers nicht.

Die bestehende Lifecycle-Verwaltung prüft konkurrierende lokale Kennungen vor Veröffentlichung
des Installationskandidaten. Zur Ablösung braucht sie exakte Besitz-/Laufzeitnachweise, den
unveränderten Konfigurationsstand und passende native Discovery-, UI-Initialisierungs-, Rendering-,
Interaktions- und Teardown-Beobachtungen. Bei vorhandenem Altzugang behält der Installer seinen bestehenden Paket-Rückstand im eigenen Journal bis zur nativen Qualifikation; eine weitere Installation darf ihn nicht verwerfen. Es entsteht keine zweite Migrationsdatenbank. Der Abschluss desselben Journals verlangt den normalen nativen Kontext und die beobachtete Abwesenheit des alten Providers. Die eigene alte Sektion wird gezielt auf `enabled = false`
gesetzt; Konfiguration und Laufzeit bleiben als Rückweg erhalten. Bei gleicher Kennung ist zuerst
ein unterstützter isolierter nativer Kontext für dasselbe Projekt erforderlich. Ein fehlender
Nachweis lässt die alte Verbindung bestehen. Der Rückweg prüft zuerst den früheren Pluginzustand
und danach die unveränderte deaktivierte Sektion; fremde oder zwischenzeitlich geänderte Bytes
werden nicht überschrieben. Der abschließende normale frische Hostkontext muss genau einen
eindeutig zugeordneten Cockpit-Zugang samt sichtbarer Interaktion zeigen.

Die normale Nutzung verlangt keine separate Einrichtung. Agenteninterne Wartungsoptionen und
Grenzen stehen in [INSTALL.md](../../INSTALL.md#cockpit-in-the-codex-plugin-development-integration).
Öffnen/Lesen schreibt weder Hostkonfiguration noch kanonischen Kontrollzustand. Fehlende
UI-Unterstützung, unklare Herkunft und ausstehender Neustart bleiben benannte Grenzen; Quell- und
Protokollprüfungen gelten nicht als native Codex-Qualifikation oder Veröffentlichung.

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
