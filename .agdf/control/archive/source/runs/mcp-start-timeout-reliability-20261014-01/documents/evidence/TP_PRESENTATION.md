## Aufgaben- und Testplan prüfen und entscheiden

TP: Reliable MCP runtime and coherent Codex host setup

- Ziel: Den freigegebenen MCP-/Host-Fix im bestehenden Produktionspfad umsetzen und am exakten installierten Kandidaten prüfen.
- Vorschlag: Elf Aufgaben: Vorbereitung; Ursachen-/Phasendiagnose; Claim-Konkurrenz; Worker-Abschluss; abgeleiteter Hoststatus; sichere Konfigurationstransaktionen; optionales Cockpit; Test-Lifecycle/Cleanup; App/Fallback; Build/Installation/Qualifizierung; Reviews und QA/UAT/OR. Alle 14 PRD-Kriterien und zugehörigen zehn SD-Entscheidungen sind mit konkreten Szenarien und Belegen verknüpft.
- Änderungen: Claim-Warten höchstens 5,55 Sekunden, zusätzlich durch das verbleibende unveränderte 30-Sekunden-Veröffentlichungsbudget begrenzt. Grundlage sind 20 echte Claim-Aufrufe einer vollständig geprüften Kopie der installierten Laufzeit: Maximum 896 ms, p95 826 ms; geplant sind sechs Claim-Holds im Burst aus drei Clients. Worker bleibt bei 10 Sekunden; keine längeren Gesamtbudgets.
- Risiken und offene Punkte: Die Messung beweist keine historischen Timeout-Ursachen oder native Hostleistung. Ungeklärte erforderliche Fehler, verfehlte Messgrenzen und unsichere Transaktionen verhindern QA. Kein automatischer Neustart, fremder Prozessabbau, gemeinsamer App-Cache-Purge, zweite Registry, schwächere Herkunftsprüfung oder Git-/Releaseaktion.

Die Brownfield-Analyse vor der Implementierung durchführen; die Implementierung startet nur nach bestandenem Ergebnis.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: TP.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Ziel: Den freigegebenen MCP-/Host-Fix im bestehenden Produktionspfad umsetzen und am exakten installierten Kandidaten prüfen.
- Umfang: Elf Aufgaben: Vorbereitung; Ursachen-/Phasendiagnose; Claim-Konkurrenz; Worker-Abschluss; abgeleiteter Hoststatus; sichere Konfigurationstransaktionen; optionales Cockpit; Test-Lifecycle/Cleanup; App/Fallback; Build/Installation/Qualifizierung; Reviews und QA/UAT/OR. Alle 14 PRD-Kriterien und zugehörigen zehn SD-Entscheidungen sind mit konkreten Szenarien und Belegen verknüpft.
- Änderungen: Claim-Warten höchstens 5,55 Sekunden, zusätzlich durch das verbleibende unveränderte 30-Sekunden-Veröffentlichungsbudget begrenzt. Grundlage sind 20 echte Claim-Aufrufe einer vollständig geprüften Kopie der installierten Laufzeit: Maximum 896 ms, p95 826 ms; geplant sind sechs Claim-Holds im Burst aus drei Clients. Worker bleibt bei 10 Sekunden; keine längeren Gesamtbudgets.
- Prüfungen: Baseline-versagt/Kandidat-besteht am Produktionsowner; gültige Konkurrenz und echte Integritätsfehler; verzögertes/unbestätigtes Worker-Ende; Abbruch, Antwortverlust und ursprüngliche UUID-Wiederholung. 20 Kalt-/Warmmessungen sowie zehn Drei-Client- und getrennte Diagnose-Wellen. Bestehende p95-Grenzen bleiben; direkt installierter Start/Tool zusätzlich p95 höchstens 5 Sekunden und Maximum 10 Sekunden, keine normalen Timeouts.
- Host und Cleanup: Plugin-/Projekt-/Benutzerquellen, Konflikte, Teilfehler, Wiederholung, gemeinsame Referenzen und Rollback prüfen. Optionales Cockpit behält Ziel/Öffner; Alt-ID nur mit belegtem Verbraucherwechsel migrieren, sonst sichtbar erhalten. Testnamen agdf-test-* mit exakten Deskriptoren; Abschluss und Abbruch gezielt bereinigen. Unbewiesene Alt-Probe-Ownership erlaubt keine Entfernung.
- Nachweise: Normaler Build und unveränderte Budgets; unterstützte serielle Installation/Vorwärmung; genaue Quellen-/Paket-/Cache-/konfigurierte Laufzeitidentität; tatsächliche installierte CLI/STDIO-Prüfung. Konfiguration, Start, Discovery, App-Darstellung und Interaktion bleiben separate Belegstufen. Native Aussagen verlangen frische direkte Nachweise; sonst unobserved/unsupported und erhaltener Fallback.
- Risiken: Die Messung beweist keine historischen Timeout-Ursachen oder native Hostleistung. Ungeklärte erforderliche Fehler, verfehlte Messgrenzen und unsichere Transaktionen verhindern QA. Kein automatischer Neustart, fremder Prozessabbau, gemeinsamer App-Cache-Purge, zweite Registry, schwächere Herkunftsprüfung oder Git-/Releaseaktion.
- Nächster Schritt: Approval: TP erlaubt zuerst die Umsetzungsvorbereitung und danach den gebundenen Fix. Der neue Produktionsfix und die Hostbereinigung sind noch nicht umgesetzt; neue QA/UAT-Freigaben und OR folgen nach den Prüfungen.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Aufgaben- und Testplan · Revision: `32d19bf0-73a3-4df4-a36d-dd8b65234f06`

SHA-256: `sha256:037cd122afde2502b59cebc0fd36774fab85ccbe28cce0fa09953c6612662154`

</details>
