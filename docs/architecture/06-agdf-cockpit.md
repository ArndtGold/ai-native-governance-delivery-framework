# AGDF Cockpit: lokale MCP-App

Das Cockpit macht den Kontrollstand eines Vorhabens verständlich: Welcher Arbeitsschritt steht
an, was erlaubt oder blockiert seinen Beginn und wo lassen sich die offenen Nachweise prüfen?
Die kompakte Chat-Karte, die Run-Übersicht, die Run-Ansicht und die Dokumentansicht verwenden
dieselben lesenden Core-Dienste und dieselbe React-Anwendung.

**Stand: 6. Oktober 2026, Repository-Quelle und lokale Prüfungen.** Das Cockpit ist eine private,
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
| Ephemere Sitzung, erfasster Datenstand und Kontextpaket | [cockpit-session.js](../../packages/core/lib/control-inspect/cockpit-session.js) |
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
| Kompakte Karte | Zeigt das ausgewählte Vorhaben, den nächsten Arbeitsschritt, seine Voraussetzungen und den Zugang zu Nachweisen. „Run ansehen“ führt in eine unterstützte größere Ansicht; eine fehlende Host-Fähigkeit bleibt sichtbar. |
| Run-Übersicht | Führt mit dem kanonischen Titel, Ziel, verständlicher Phase und gemeldeten offenen Punkten. Die Run-ID bleibt zur Zuordnung sichtbar. Suche filtert vorübergehend nach Titel, ID oder Gate. Eingeschränkte Einträge bleiben mit ihren Quellen erkennbar. |
| Run-Zusammenfassung | Bündelt aktuellen Arbeitsschritt, exakte Core-Aktion, Voraussetzungen und Nachweise. Ziel, ID und Kontrollgrundlage sind aufklappbar. |
| Run-Details | Zeigt zusätzliche Originalangaben und Quellen. Der Schiebeschalter „Zusammenfassung / Details“ ändert den Lesemodus innerhalb der größeren Ansicht. |
| Dokument | Zeigt Dokumenttyp, zugehöriges Vorhaben und passive Originalquelle. Hier gibt es keinen Zusammenfassungs-/Details-Schalter. „Dokument schließen“ kehrt zum Run zurück und stellt den Fokus auf den öffnenden Quellenzugang wieder her. |

Das Cockpit schreibt weder kanonische Titel noch freigegebene Ziele um. Fachlich unklare
Originalangaben bleiben als solche sichtbar. Es erfindet keinen Fortschritt oder nächsten
Arbeitsschritt aus einer UI-Auswahl.

### Eine zusammenhängende Arbeitseinheit

Die Phase bildet die Hauptüberschrift der Arbeitseinheit. Darunter steht die genaue nächste
Aktion aus der Core-Auswertung. Voraussetzungen und Nachweise bilden einen gemeinsamen
unterstützenden Bereich:

- **Beginn offen:** aktueller Datenstand, aktiver Run, offene Auswertung, bestandene
  Kontrollprüfung und kein ausgewiesener Blocker oder ausstehende Freigabe.
- **Beginn blockiert:** die aktuelle Auswertung nennt einen Blocker oder eine fehlende Freigabe;
  der konkrete Grund bleibt unmittelbar sichtbar.
- **Beginn unklar:** der Kontrollstand bestätigt den Beginn nicht vollständig. Bei veralteten
  Daten werden frühere Blocker und Freigaben ausdrücklich als vorherige Beobachtung bezeichnet.
- **Kontrollgrundlage:** aufklappbare gespeicherte Entscheidung, Gate, Qualifikation, Freigaben
  und deren registrierte Quellen. Freigaben allein bestätigen keine vollständigen Voraussetzungen.
- **Nachweise:** ein gezählter Zugang zu den offenen Originalangaben und direkte Quellenlinks.
  Die registrierte Quelle des aktuellen Schritts führt; Run State bleibt ein separater Zugang.

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
behalten ihren eigenen Lesemodus. Die Unterstützungsbereiche der Arbeitseinheit stehen ab
560 Pixeln eigener Komponentenbreite nebeneinander, darunter untereinander. Schmale Listen
werden gestapelt; Originaltabellen in Dokumenten können innerhalb ihres Bereichs scrollen.

## 4. Aktualität und Lebenszyklus

Serverprozess, UI-Ansicht und Cockpit-Lesesitzung haben verschiedene Lebenszyklen. Run-Wechsel,
Dokumentnavigation und Aktualisierung benötigen keinen Serverneustart. Ein neuer Render-Aufruf
ersetzt die bisherige ephemere Lesesitzung; die ältere Ansicht darf deren Selektoren nicht weiter
verwenden. Das ist derzeit eine gemeinsame Sitzung pro Serverlaufzeit, keine unabhängige
Sitzung je gleichzeitig geöffneter Karte.

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

Diese Nachweise ersetzen keine aktuelle native Host-Abnahme. Native Ressourcenidentität und
Darstellung, weitere Host-/Kontextprüfungen, vollständige Reviews und die regulären QA-/UAT-/
Abschlussentscheidungen bleiben getrennte offene Pflichten. `CD+Tests` ist weiterhin in Arbeit.
Die Dokumentation verleiht dem Run keine neue Freigabe und schließt ihn nicht ab.
