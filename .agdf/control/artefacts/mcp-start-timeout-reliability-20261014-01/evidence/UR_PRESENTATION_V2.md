## Nutzeranforderungen prüfen und entscheiden

UR: Reliable MCP startup and bounded command execution

- Ziel: Tatsächliche Ursachen dauerhaft beheben und einen klaren Produktbetrieb schaffen: grundsätzlich AGDF, ein separates AGDF Cockpit nur bei belegter technischer Notwendigkeit. Tests sind ausdrücklich temporär. Herkunft, begrenzte Laufzeit, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Vorschlag: Start, Paketveröffentlichung, Claims, Worker und Ausführung untersuchen und bestätigte Ursachen korrigieren. Regulären Einzelbetrieb, mehrere Produktclients und Diagnoseaufbauten getrennt prüfen. Produktnamen und Registrierung über bestehende Owner schärfen; verifizierte AGDF-Testeinträge gezielt bereinigen und künftige Aktivierung, Abbruch und Abschluss samt Cleanup absichern. Den finalen Kandidaten unterstützt installieren und tatsächlich über CLI/STDIO prüfen.
- Risiken und offene Punkte: Ursachen offen; mehrere Clients beweisen kein Prozessleck. Cleanup braucht genaue Besitzprüfung, Namensmigration muss technische IDs erhalten oder sicher überführen. Host-Start-, Host-Tool- und Workerlimit sind getrennt. Native Modell-/UI-/andere Plattformprüfung bleibt offen; größere Zeitlimits oder versteckte Wiederholungen reichen nicht.

Bestehende Owner prüfen und den angemessenen Lieferweg wählen; die Implementierung bleibt gesperrt.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: UR.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Problem: Die installierte MCP-Laufzeit zeigte Startfehler und Antwortzeitlimits mit unklarer Wirkung. Daneben laufen separate Cockpit-Prüfbauten und ein temporärer Decision-Probe; ihre Testnamen und Registrierung wirken wie ein Entwicklungsaufbau. Mehrere Prozesse sind bestätigt, ihre Rolle als Fehlerursache ist offen.
- Ziel: Tatsächliche Ursachen dauerhaft beheben und einen klaren Produktbetrieb schaffen: grundsätzlich AGDF, ein separates AGDF Cockpit nur bei belegter technischer Notwendigkeit. Tests sind ausdrücklich temporär. Herkunft, begrenzte Laufzeit, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Betroffene: Das Plugin unterstützt Coding-Agenten; der Nutzer soll keine unnötigen Unterbrechungen und Wiederholungen erleben. Maintainer brauchen konkrete sichere Fehlerdiagnosen.
- Umfang: Start, Paketveröffentlichung, Claims, Worker und Ausführung untersuchen und bestätigte Ursachen korrigieren. Regulären Einzelbetrieb, mehrere Produktclients und Diagnoseaufbauten getrennt prüfen. Produktnamen und Registrierung über bestehende Owner schärfen; verifizierte AGDF-Testeinträge gezielt bereinigen und künftige Aktivierung, Abbruch und Abschluss samt Cleanup absichern. Den finalen Kandidaten unterstützt installieren und tatsächlich über CLI/STDIO prüfen.
- Nicht-Ziele: Keine zweite Laufzeit-/Freigabeautorität, abgeschwächte Prüfung, unbegrenzte Zeit, neue mutierende UUID, automatische Neustarts, Hostausweitung oder Git-/Veröffentlichungsaktion. Keine pauschale MCP-Löschung, fremde Temp-Datei-Löschung oder ungeprüfte Prozessbeendigung; reine Umbenennung genügt nicht.
- Akzeptanz: Belegte Ursachen oder Gegenbeweise, Regressionen vor/nach Fix, messbare Betriebsgrenzen und unveränderte Schutzprüfungen. Normalbetrieb zeigt klare Produktrollen; Tests haben bewusste Aktivierung, Testnamen, Ownership und wiederholbar sicheren Cleanup auch nach Abbruch. Migration erzeugt keine Doppelregistrierung und erhält fremde Einstellungen. Exakter installierter Stand und getrennte Timeout-Schichten werden geprüft; Reviews und neue QA/UAT bleiben gebunden.
- Quellen: Bestehende Lifecycle-/Claim-, Host-Konfigurations-, Worker-/Transport- und Core-Operationsbesitzer; erhaltene Fehlerlogs sowie die konkret beobachteten lokalen und benutzerweiten Testregistrierungen. Keine zweite Registry und keine übertragenen Freigaben.
- Risiken: Ursachen offen; mehrere Clients beweisen kein Prozessleck. Cleanup braucht genaue Besitzprüfung, Namensmigration muss technische IDs erhalten oder sicher überführen. Host-Start-, Host-Tool- und Workerlimit sind getrennt. Native Modell-/UI-/andere Plattformprüfung bleibt offen; größere Zeitlimits oder versteckte Wiederholungen reichen nicht.
- Nächster Schritt: Approval: UR erlaubt Brownfield Review und die Auswahl des passenden Delivery-Pfads. Die neue Produktionskorrektur ist noch nicht implementiert.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Nutzeranforderungen · Revision: `5da58af1-6b7b-4f0f-9188-359680e565c2`

SHA-256: `sha256:8268552843d5277b56a13b4b2cb4129dc23240b836067354d1dde374e6df4058`

</details>
