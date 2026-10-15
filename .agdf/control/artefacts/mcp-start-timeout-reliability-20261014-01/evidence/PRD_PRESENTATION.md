## Produktanforderungen prüfen und entscheiden

PRD: Reliable MCP runtime and coherent Codex host setup

- Ziel: Start- und Timeout-Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen. AGDF ist der reguläre Einstieg; separates AGDF Cockpit nur technisch begründet. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben erhalten.
- Vorschlag: Ursachenanalyse und dauerhafte Korrektur, klare Produkt-/Testrollen, bestehender Lifecycle für Plugin-/Projekt-/Benutzereinträge sowie abgeleitete Host-Zustandsnachweise. Diagnoseeinsatz und Cleanup sind bewusst und besitzgebunden. Finalen installierten Kandidaten tatsächlich prüfen.

Das Lösungsdesign entwerfen; die Implementierung bleibt gesperrt.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: PRD.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Ziel: Start- und Timeout-Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen. AGDF ist der reguläre Einstieg; separates AGDF Cockpit nur technisch begründet. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben erhalten.
- Umfang: Ursachenanalyse und dauerhafte Korrektur, klare Produkt-/Testrollen, bestehender Lifecycle für Plugin-/Projekt-/Benutzereinträge sowie abgeleitete Host-Zustandsnachweise. Diagnoseeinsatz und Cleanup sind bewusst und besitzgebunden. Finalen installierten Kandidaten tatsächlich prüfen.
- AC-001: Beide Startfehler und dispatch_timeout erhalten belegte Ursachen oder konkrete Gegenbeweise; unaufgeklärte erforderliche Fehler bleiben Lücken.
- AC-002: Bestätigte Defekte werden im bestehenden Produktionsowner behoben; dieselbe Regression versagt vorher und besteht danach.
- AC-003: Kalt-/Warmstart und wiederholte Einzel-/Mehrclient-Aufrufe halten vor Umsetzung festgelegte Messgrenzen ein; keine unbegründete Deadline-Erhöhung.
- AC-004: Herkunfts-/Claim-Prüfung, begrenzter Abbruch und Transaktionen bleiben erhalten; unklare Wirkung verlangt ursprüngliche UUID und Belegprüfung ohne zweite Änderung.
- AC-005: Fehler zeigen eine sichere Phase/Ursache und einen erlaubten nächsten Schritt; keine Geheimnisse oder erfundenen Ursachen.
- AC-006: Der unterstützt installierte finale Kandidat entspricht der eingefrorenen Quelle und besteht tatsächliche positive, negative, Stress- und Belegwiederholungsfälle.
- AC-007: Betroffene Tests, normaler Build und bestehende Budgets bestehen; Reviews, alleinige QA, neue QA/UAT-Freigaben und OR bleiben exakt gebunden.
- AC-008: AGDF ist der reguläre Einstieg; separates AGDF Cockpit nur begründet. Steuerung, Lesen und Cockpit-Öffnen bleiben erhalten; keine doppelte Produktregistrierung.
- AC-009: Diagnoseeinsatz ist bewusst, ausdrücklich als Test benannt und besitzgebunden. Abschluss, Abbruch und wiederholter Cleanup erhalten fremde und gemeinsam genutzte Zustände.
- AC-010: Produkt allein, mehrere Produktclients und Diagnoseaufbauten werden getrennt geprüft; Host-Start-, Host-Tool- und Workerlimit sowie Erzeuger bleiben unterscheidbar.
- AC-011: Eine abgeleitete Sicht zeigt Herkunft, Scope, Rolle, Owner und Laufzeit sowie getrennte Konfigurations-/Start-/Discovery-/App-Nachweise; unbekannte wirksame Werte bleiben unbekannt.
- AC-012: Bestehende Einrichtung, Update, Deaktivierung, Reaktivierung, Migration und Entfernung sind wiederholbar sicher; Konflikte, Teilfehler und gemeinsame Referenzen führen nicht zu Datenverlust oder Scope-Ausweitung.
- AC-013: Serververbindung und UI-Ressourcen beweisen keine App-Darstellung. Native Aussagen verlangen frische direkte Nachweise; Text-/Dokumentfallback erhält die Entscheidungsbindung.
- AC-014: Registrierung entfernen, Sitzung beenden und Host-App-Daten löschen sind getrennte Wirkungen. Alte Sitzungen bleiben sichtbar; kein automatischer Neustart oder gemeinsamer Cache-Purge.
- Entscheidungen: Produktrollen, Host-/AGDF-Zuständigkeit, gezielter Test-Cleanup und begrenzte Nachweis-/Releasewirkung sind aus der freigegebenen UR geklärt. SD entscheidet Ursachen-/Ausführungsdesign, sichere Zusammenführung/Migration und wirksame Hostbeobachtung; TP legt Messgrenzen und konkrete Test-/Nachweismatrix fest. Kein ungeklärter erforderlicher Defekt wird als bestanden behandelt.
- Grenzen und Risiken: Ursachen noch nicht nachgewiesen; mehrere Clients beweisen kein Leck. Cleanup braucht exakte Ownership. Wirksame Hostwerte und laufende alte Sitzungen können von Dateien abweichen. Keine zweite Registry, schwächere Schutzprüfung, breitere Rechte, automatische Neustarts, pauschale Löschung, gemeinsame App-Datenbereinigung oder Git-/Veröffentlichung.
- Nachweise: Brownfield Review und erforderliche UX-Analyse sind erfasst; der neue Fix ist noch nicht umgesetzt. Quellen-/Paket-/installierte Tests und native App-Nachweise bleiben getrennte spätere Belege.
- Nächster Schritt: Approval: PRD erlaubt die Solution Design für diese Fassung; Implementation und Hostbereinigung bleiben bis SD/TP und Vorbereitung gesperrt.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Produktanforderungen · Revision: `2b921dc7-9e10-4e99-b247-5342b7e438b2`

SHA-256: `sha256:94f5e006ae2323da487f1223b5571bc73b0f83feb974f507598de54bbba356af`

</details>
