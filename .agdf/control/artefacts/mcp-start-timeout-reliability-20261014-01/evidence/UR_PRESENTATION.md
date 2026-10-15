## Nutzeranforderungen prüfen und entscheiden

UR: Reliable MCP startup and bounded command execution

- Ziel: Die tatsächlichen Ursachen reproduzierbar eingrenzen und in den bestehenden Zuständigkeiten dauerhaft beheben. Herkunftsprüfung, begrenzte Laufzeit, Abbruch, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Vorschlag: Start, Paketveröffentlichung, Claims, Worker und Ausführung getrennt untersuchen; bestätigte Ursachen korrigieren und ihre Regressionen samt Kalt-/Warmstart, Konkurrenz, Abbruch und Antwortverlust prüfen. Den finalen Kandidaten unterstützt lokal installieren und tatsächlich über CLI/STDIO qualifizieren.
- Risiken und offene Punkte: Noch ungeklärte Ursachen; Zeitlimit kann bereits ausgeführte Arbeit betreffen. Native Modell-/UI-/andere Plattformprüfung bleibt getrennt. Nur Zeitlimits zu erhöhen oder Fehler durch Wiederholung zu verdecken erfüllt das Ziel nicht.

Bestehende Owner prüfen und den angemessenen Lieferweg wählen; die Implementierung bleibt gesperrt.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: UR.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Problem: Die installierte MCP-Laufzeit zeigte vereinzelte Startfehler und Antwortzeitlimits mit unklarer Wirkung. Wiederholungen funktionierten, die Ursachen sind aber noch nicht nachgewiesen oder behoben.
- Ziel: Die tatsächlichen Ursachen reproduzierbar eingrenzen und in den bestehenden Zuständigkeiten dauerhaft beheben. Herkunftsprüfung, begrenzte Laufzeit, Abbruch, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Betroffene: Das Plugin unterstützt Coding-Agenten; der Nutzer soll keine unnötigen Unterbrechungen und Wiederholungen erleben. Maintainer brauchen konkrete sichere Fehlerdiagnosen.
- Umfang: Start, Paketveröffentlichung, Claims, Worker und Ausführung getrennt untersuchen; bestätigte Ursachen korrigieren und ihre Regressionen samt Kalt-/Warmstart, Konkurrenz, Abbruch und Antwortverlust prüfen. Den finalen Kandidaten unterstützt lokal installieren und tatsächlich über CLI/STDIO qualifizieren.
- Nicht-Ziele: Keine zweite Laufzeit- oder Freigabeautorität, abgeschwächte Prüfung, unbegrenzte Zeit, neue mutierende UUID bei unklarer Wirkung, automatische Neustarts, Hostausweitung, historische Änderung oder Git-/Veröffentlichungsaktion.
- Akzeptanz: Jede Fehlerfamilie erhält belegte Ursachen oder Gegenbeweise; Regressionen versagen vor dem Fix und bestehen danach. Messbare Betriebsgrenzen, unveränderte Schutzprüfungen, sichere Diagnosen und wiederholte Prüfung des exakten installierten Kandidaten sind erforderlich. Reviews und neue QA/UAT-Freigaben bleiben gebunden.
- Quellen: Bestehende MCP-Lifecycle-/Claim-, Worker-/Transport- und Core-Operationsbesitzer sowie die erhaltenen Logs des abgeschlossenen Inhaltsfixes; keine Freigaben werden übertragen.
- Risiken: Noch ungeklärte Ursachen; Zeitlimit kann bereits ausgeführte Arbeit betreffen. Native Modell-/UI-/andere Plattformprüfung bleibt getrennt. Nur Zeitlimits zu erhöhen oder Fehler durch Wiederholung zu verdecken erfüllt das Ziel nicht.
- Nächster Schritt: Approval: UR erlaubt Brownfield Review und die Auswahl des passenden Delivery-Pfads. Die neue Produktionskorrektur ist noch nicht implementiert.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Nutzeranforderungen · Revision: `6cd50a89-0d80-40c3-be34-97f68369361e`

SHA-256: `sha256:3b48e11c830b2617345b246852d76b75460058da3f10551a5dd5c29fc9bc49f8`

</details>
