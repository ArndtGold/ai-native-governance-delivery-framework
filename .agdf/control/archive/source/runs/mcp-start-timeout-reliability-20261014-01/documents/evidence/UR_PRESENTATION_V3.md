## Nutzeranforderungen prüfen und entscheiden

UR: Reliable MCP runtime and coherent Codex host setup

- Ziel: Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen: AGDF als regulärer Einstieg, separates AGDF Cockpit nur bei technischer Notwendigkeit, Tests ausdrücklich temporär. Konfiguriert, gestartet, Werkzeuge verfügbar und App tatsächlich dargestellt werden unterschieden. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Vorschlag: Ursachen und Einzel-/Mehrclient-/Diagnosebetrieb prüfen. Bestehende Owner führen Produktnamen, Plugin-/Projekt-/Benutzereinträge sowie Einrichtung, Update, Deaktivierung, Migration und Entfernung zusammen. Herkunft, Scope, Laufzeitstand, Berechtigungen, Timeout-Schichten und Sitzungsfrische nachvollziehbar anzeigen. Verifizierte Tests gezielt bereinigen und künftigen Cleanup absichern. Finalen installierten Kandidaten und wirksame Konfiguration prüfen; App-Nachweise gesondert erfassen.
- Risiken und offene Punkte: Ursachen offen; mehrere Clients beweisen kein Leck. Effektive Hostwerte können von Rohdateien abweichen; alte Sitzungen können alten Code nutzen. Cleanup verlangt Besitzprüfung, Zusammenführung muss den Cockpit-Öffner erhalten. Serveraktivierung beweist keine App-Darstellung. Native Modell-/UI-/andere Plattformprüfung bleibt ausdrücklich begrenzt.

Bestehende Owner prüfen und den angemessenen Lieferweg wählen; die Implementierung bleibt gesperrt.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: UR.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Problem: Startfehler und Antwortzeitlimits treffen auf eine verteilte Host-Konfiguration: Plugin-AGDF, projektbezogene Cockpit-Prüfbauten und benutzerweiter temporärer Decision-Probe. Gemeinsame Zuständigkeit für Einrichtung, Update und Entfernung fehlt als geprüfter Ablauf. Mehrere Prozesse sind belegt, ihre Rolle als Fehlerursache ist offen.
- Ziel: Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen: AGDF als regulärer Einstieg, separates AGDF Cockpit nur bei technischer Notwendigkeit, Tests ausdrücklich temporär. Konfiguriert, gestartet, Werkzeuge verfügbar und App tatsächlich dargestellt werden unterschieden. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Betroffene: Das Plugin unterstützt Coding-Agenten; der Nutzer soll keine unnötigen Unterbrechungen und Wiederholungen erleben. Maintainer brauchen konkrete sichere Fehlerdiagnosen.
- Umfang: Ursachen und Einzel-/Mehrclient-/Diagnosebetrieb prüfen. Bestehende Owner führen Produktnamen, Plugin-/Projekt-/Benutzereinträge sowie Einrichtung, Update, Deaktivierung, Migration und Entfernung zusammen. Herkunft, Scope, Laufzeitstand, Berechtigungen, Timeout-Schichten und Sitzungsfrische nachvollziehbar anzeigen. Verifizierte Tests gezielt bereinigen und künftigen Cleanup absichern. Finalen installierten Kandidaten und wirksame Konfiguration prüfen; App-Nachweise gesondert erfassen.
- Nicht-Ziele: Keine zweite Registry oder Lifecycle-Implementierung, neue Freigabeautorität, schwächere Schutzprüfung, unbegrenzte Zeit, automatische Neustarts, breitere Hostrechte oder Git-/Veröffentlichungsaktion. Keine pauschale MCP-/Temp-Datei-Löschung, ungeprüfte Prozessbeendigung, fremde App-Kontoänderung oder Löschung gemeinsamer MCP-App-Daten.
- Akzeptanz: Ursachenbelege, Vorher-/Nachher-Regressionen und gemessene Grenzen. Wiederholbare Einrichtung, Update und Entfernung über bestehende Owner erhalten fremde Konfiguration, technische IDs und erforderliche Fähigkeiten. Keine Doppelregistrierung oder stille Scope-Erweiterung. Zustandsnachweise trennen Konfiguration, Start, Discovery und App-Darstellung; Tests haben sicheren Cleanup auch nach Abbruch. Exakter installierter Kandidat, Schutzprüfungen sowie Reviews und neue QA/UAT bleiben gebunden.
- Quellen: Bestehende Lifecycle-/Claim-, Host-Konfigurations-, Worker-/Transport-, App-Ressourcen- und Core-Operationsbesitzer; konkrete Konfiguration, Fehlerlogs und tatsächlicher Toolkatalog. Codex bleibt Autorität für wirksame Einstellungen, Rechte, Sitzungen und App-Darstellung. Keine zweite Registry oder übertragenen Freigaben.
- Risiken: Ursachen offen; mehrere Clients beweisen kein Leck. Effektive Hostwerte können von Rohdateien abweichen; alte Sitzungen können alten Code nutzen. Cleanup verlangt Besitzprüfung, Zusammenführung muss den Cockpit-Öffner erhalten. Serveraktivierung beweist keine App-Darstellung. Native Modell-/UI-/andere Plattformprüfung bleibt ausdrücklich begrenzt.
- Nächster Schritt: Approval: UR erlaubt Brownfield Review und die Auswahl des passenden Delivery-Pfads. Die neue Produktionskorrektur ist noch nicht implementiert.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Nutzeranforderungen · Revision: `653ba1e6-2af5-48fe-9e1f-d32bfd3bf89c`

SHA-256: `sha256:6f0c8a1ac4e7c83fd39369c4f9478624f513dcbf0736c42f247d27615fb9f630`

</details>
