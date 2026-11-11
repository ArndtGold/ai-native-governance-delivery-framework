# Codex Desktop: Werkstattroboter-Test, 10. November 2026

Arbeitsnotiz für den Werkstattroboter-Run `run-2da6862c-82fc-4a1a-8a07-d95d779baca7`. Beobachtet wurde ausschließlich der separate Test-Run `werkstattroboter-test` im Testprojekt `/private/tmp/agdf-werkstattroboter.VZMeta/projekt`. Diese Notiz trifft keine QA- oder Freigabeentscheidung.

## Kandidat und Beobachtung

- Installiertes Codex-Plugin: `0.31.0+codex.local-ab16a6ced3a3`.
- In der nativen MCP-Ansicht im rechten Codex-Panel zeigte die Info-Seite Version `0.31.0` und Server-Ressource `sha256:01349b7d15986d7776474d3f5c7f89ca6499d0edb64414135fcdc8805daabf65`. Der separat berechnete Hash der installierten `cockpit.html` stimmt überein. Das ist kein unabhängiger Nachweis der vom Host tatsächlich gerenderten Bytes.
- Der Nutzer bestätigte die sichtbare native Karte; im rechten Panel war der ausgewählte Test-Run mit Status „Überarbeitung nötig“ und roter Warnfigur sichtbar.
- Die vom Host gemeldete Kennung laut Verbindungshinweis war `chatgpt`, Version `26.1103.60933`, Anzeigemodus `fullscreen`. Der Header lautete nur „AGDF Cockpit“, nicht „AGDF Cockpit für Codex“. Befund: Die Host-Bezeichnung für Codex ist mit dieser Meldung noch nicht erfüllt; aus `chatgpt` allein wird hier keine Identität abgeleitet.
- Die Info-Seite öffnete sich. Ein synthetischer Klick auf „Info schließen“ schloss sie; der Fokus kehrte zum Info-Button zurück. Das ist eine Beobachtung des rechten Panels, keine Prüfung eines physischen Mausklicks oder der eingebetteten Chat-Ansicht.
- Nach einem manuellen Neuladen des unveränderten Test-Runs war derselbe Run wieder aktuell. Die `src`-Zeichenkette der Figur blieb vor und nach dem Refresh identisch; dadurch wurde hier keine neue Übergangsgeste im SVG ausgelöst. Der Refresh zeigte während des Ladens einen vorübergehend nicht aktuellen Stand.
- Im geladenen SVG war die zwölfsekündige Blinzelanimation vorhanden; die abgefragte Systemeinstellung für reduzierte Bewegung war aus. Ein tatsächlicher Blinzler wurde bei dieser Prüfung nicht visuell nachgewiesen.

## Offen

- Escape und physische Mausbedienung im nativen Panel und in der Chat-Karte; der verfügbare MCP-App-Zugriff unterstützt dort nur synthetische Klicks, keine native Tastatureingabe.
- Eine Warnbewegung bei einem erneuten echten Zustandswechsel desselben Test-Runs: Der Test-Run stand bereits auf „Überarbeitung nötig“; ein weiterer Wechsel wurde nicht fingiert. Die frühere Nutzerbeobachtung, dass die Warnbewegung nicht sichtbar war, bleibt ein offener Befund.
- Blinzeln tatsächlich beobachten; Umsetzung, ausstehende Freigabe und Abschluss einschließlich Gesten; reduzierte Bewegung aktiv prüfen; Chat-zu-Panel-Wechsel, alle Zustände, Themes und schmale Darstellung am identischen Kandidaten prüfen.
- Die offizielle Host-Zuordnung für die gemeldete Kennung `chatgpt` klären und die Codex-Bezeichnung anschließend nativ erneut prüfen.
- Claude Code auf dem anderen Rechner sowie Abgleich beider Hosts und Nachweise für T-003/T-007 bleiben offen. Der bestehende CD+Tests-Bericht wird durch diese Arbeitsnotiz nicht ersetzt und der Run wird dadurch nicht weitergeschaltet.

## Ergänzung: spätere Codex-Beobachtung

- Nach der Korrektur erschien im nativen Codex-Panel „AGDF Cockpit für Codex“. Das Info-Fenster ließ sich per synthetischem Klick schließen. Für den später installierten Kandidaten `0.31.0+codex.local-2264131155fa` stimmte der angezeigte Ressourcen-Hash mit dem Hash der installierten `cockpit.html` überein (`sha256:535751eac29dfb3128967398c9b9fb8e751f28cf120d6046634ce2bbfc2f4e73`). Die gerenderten Bytes sind damit nicht unabhängig vom Host attestiert.
- Der Nutzer bestätigte vor der Erweiterung der Auslöseregel auf alle Begleiter die offenen Sichtprüfungen in Codex Desktop, einschließlich Gesten, unveränderter Aktualisierung und reduzierter Bewegung. Dies ist eine Nutzerbestätigung; getrennte automatisierte Beobachtungen jeder einzelnen Geste liegen nicht vor. Sie ist nicht als Nachweis für den danach erstellten Kandidaten `0.31.0+codex.local-2264131155fa` zu werten.
- Für die spätere gemeinsame Auslöseregel bestanden die gezielten Companion-Logik- und Adaptertests sowie die TypeScript-Prüfung. Die beispielhaften Zustände wurden in einer lokalen Browservorschau betrachtet; eine unabhängige Sichtprüfung sämtlicher Gesten im installierten späteren Codex-Kandidaten ist weiterhin offen.
