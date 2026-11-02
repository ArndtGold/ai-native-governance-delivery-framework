## Lösungsdesign prüfen und entscheiden

SD: Reliable MCP runtime and coherent Codex host setup

- Vorschlag: Bestehende Launcher-, Paket-/Claim-, Worker- und Codex-Lifecycle-Owner erweitern. Sichere Phasenmessung trennt Start, Herkunftsprüfung, Ausführung, Commit und Antwort. Keine zweite Registry, Laufzeit oder Freigabeautorität.

Den Aufgaben- und Testplan entwerfen; die Implementierung bleibt gesperrt.

Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.

Fragen und Änderungswünsche kannst du im Chat besprechen. Freigeben kannst du diese Fassung im Chat mit Approval: SD.

<details><summary>Details und Nachweise</summary>

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Lösung: Bestehende Launcher-, Paket-/Claim-, Worker- und Codex-Lifecycle-Owner erweitern. Sichere Phasenmessung trennt Start, Herkunftsprüfung, Ausführung, Commit und Antwort. Keine zweite Registry, Laufzeit oder Freigabeautorität.
- Ursachenbeleg: Ein isolierter Versuch bestätigt, dass eine lebende Veröffentlichungssperre als ungültiger Claim gemeldet wird. Das beweist den Mechanismus, nicht die Ursache jedes früheren Vorfalls; weitere Pflichtursachen bleiben Untersuchungsaufgaben.
- SDD-001: Sichere Phasen-/Ursachendiagnose an den bestehenden Owners; keine privaten Payloads oder erfundene historische Ursache.
- SDD-002: Lebende Claim-Konkurrenz begrenzt behandeln, echte Integritätsfehler weiter verweigern. Gleiche Sperre, frische Prüfung und unveränderte Gesamtgrenzen; kein Löschen unklarer Claims.
- SDD-003: Frischen isolierten Worker und volle Laufzeitprüfung erhalten. Kapazität erst nach bestätigtem Ende freigeben; nur belegte redundante Arbeit innerhalb eines Aufrufs optimieren, keine neue Queue oder Anfrage-übergreifende Prüf-Caches.
- SDD-004: Host-Zustand aus vorhandenen Plugin-/Projekt-/Benutzerquellen und tatsächlichen Beobachtungen ableiten. Deklarierte, wirksame, alte und unbekannte Werte bleiben getrennt.
- SDD-005: Bestehende Codex-Transaktionen mit geschlossenen Rollen und exakter Vorher-/Nachher-Prüfung verwenden. Fremde Regeln, Scope und Standard-Pluginbetrieb erhalten; kein allgemeiner Konfigurationswriter.
- SDD-006: Optionales projektgebundenes Cockpit bleibt getrennt, damit Zielbindung und Öffner erhalten bleiben. Neuer verwalteter Produkt-ID agdf-cockpit; Alt-ID nur geprüft überführen. Bei unklaren Verbrauchern/alten Sitzungen sichtbar erhalten, keine Doppelregistrierung; Ende der Ausnahme durch geprüften Wechsel und bewusste Sitzungsaktualisierung.
- SDD-007: Tests verwenden agdf-test-* und exakte Deskriptoren. Bestehende Probe-/Setup-Owner sichern Aktivierung, Abschluss, Abbruch und wiederholten Cleanup. Alte Testnamen oder Temp-Pfade allein erlauben keine Löschung.
- SDD-008: Bestehende App-Fähigkeits-, Sitzungs- und Qualifizierungsprüfung erhalten. Serververbindung, Ressourcen und tatsächliche App-Darstellung getrennt; Text-/Dokumentfallback bleibt gebunden. Gemeinsame Host-App-Daten bleiben geschützt.
- SDD-009: Normaler Build, unterstützte Vorbereitung/Installation und Vorwärmung qualifizieren den exakten finalen Stand. Alte beanspruchte Generationen/Sitzungen erhalten; keine Cache-Handpatches, Neustarts oder freien Budgeterhöhungen.
- SDD-010: PRD-Kriterien, Core-Belege, alleinige QA und neue QA/UAT/OR bleiben die vorhandene Autorität. Keine alten Freigaben übertragen oder unklare Wirkung mit neuer UUID wiederholen.
- Entscheidungen: Architektur, Zuständigkeiten, Cockpit-Trennung, Namenswechsel-Bedingungen, Cleanup und Nachweisgrenzen sind entschieden. TP konkretisiert begrenzte Claim-Wartezeit, Messlast, Regressionen und genaue installierte/native Belegspuren vor Umsetzung.
- Grenzen und Risiken: Restliche historische Ursachen sind offen; Alt-Probe-Ownership kann fehlen. Hostwerte und alte Sitzungen können abweichen. Konservativer Claim-Erhalt bleibt; fremde Einstellungen, gemeinsame Prozesse und App-Daten werden nicht pauschal bereinigt. Native Aussagen brauchen frische direkte Belege.
- Nächster Schritt: Approval: SD erlaubt Task/Test Plan. Der neue Produktionsfix und die Hostbereinigung sind noch nicht umgesetzt.

</details>

<details><summary>Fassung und Quellen</summary>

Run: `mcp-start-timeout-reliability-20261014-01` · Lösungsdesign · Revision: `f9a3bc2b-808f-4a15-8252-14f2b74a0d41`

SHA-256: `sha256:15fef0ba382f1cada5ebe8a50165bf8ab8adc6b9cf93f7668c5994afcb9c6ff2`

</details>
