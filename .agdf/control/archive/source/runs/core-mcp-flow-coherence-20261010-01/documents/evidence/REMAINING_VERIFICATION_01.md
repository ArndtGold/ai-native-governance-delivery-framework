# Ergebnis der weiteren Prüfungen

Run: core-mcp-flow-coherence-20261010-01  
Revision: 089a504e-29b4-42a9-8b1c-3558cfa34996  
Stand: 2026-10-11. CD+Tests fortgesetzt; keine formale QA-Entscheidung.

## Bestanden

- Die zehn zusätzlichen Core-Suiten und drei generierten MCP-Flow-Suiten sind in FINAL_SOURCE_SCENARIO_CHECK_01.json und FINAL_TRANSPORT_SCENARIO_CHECK_01.json dokumentiert. Sie gelten für den dort erfassten Stand vor dem zusätzlichen UAT-Lesefix.
- Die vom UAT-Fix betroffenen endgültigen Core-Sitzungs- sowie MCP-Dokument-/strukturierten Flow-Tests bestehen: UAT_READING_SOURCE_FINAL_01.json und UAT_READING_TRANSPORT_FINAL_01.json. Beide Transportvarianten und beide strukturierten Modi sind geprüft; Lesen erzeugt keine Entscheidung, veränderte Quellen oder Run-Siegel und fremde Selektoren werden zurückgewiesen.
- Der UAT-Lesepfad öffnet exakt die vorgelegte Evidenzzusammenfassung mit deren Digest. Er ersetzt sie nicht durch das heutige QA-Dokument. Das bestehende Antwortgrößenlimit wird auch nach der Projektion eingehalten; UAT_READING_RESPONSE_BUDGET_01.json belegt die Zurückweisung am Limit mit ausdrücklich synthetischer Polsterung.
- NATIVE_GATE_MATRIX_PREFLIGHT_04.json: 96/96 stabile, nacheinander ausgeführte Prüfungen über UR/PRD/SD/TP/QA/UAT, en/de und beide Transportvarianten. Geprüft sind originale Präsentationskennung, wiederholtes exaktes Lesen, kanonischer Host-Anzeigepfad, Core-Leser/Schreiber- und CLI/MCP-Parität, explizites Schließen sowie abgewiesener späterer Zugriff bei unverändertem Run. Das sind generierte STDIO-Nachweise, keine nativen Klick- oder Host-Teardown-Nachweise.
- Geschützte Referenzdateien, freigegebene UR/PRD/SD/TP und fremde Backlog-Zeilen bleiben unverändert. Die bereits festgestellte historische Git-Index-Abweichung wird nicht zurückgesetzt oder uns zugeschrieben.

## Befunde und offene Nachweise

Die erste UAT-Dokumentprüfung scheiterte und führte zum bestehenden Sitzungsbesitzer-Fix. Fehlende deutsche Zusammenfassungen waren Fehler der synthetischen Prüfdaten; die Schutzregel wurde nicht gelockert. Ein bestandener QA-Bericht wird nicht als editierbarer Entwurf behandelt: Die zurückgewiesene Änderung wurde wiederhergestellt, und vollständige neue Wegwerf-Fassungen wurden vor ihrer ersten Erfassung vorbereitet.

Beide parallelen Matrixversuche liefern source_changed bei drei gleichzeitig geöffneten Testpfaden; der allein weiterlaufende Pfad besteht. Original-UUID-Replay reproduziert das. Der bestehende Präsentationsbesitzer hält auch dabei einen Run-Dateilock; der Snapshotbesitzer prüft beobachtete Verzeichnissignaturen. Das ist ein konkreter Zusammenhang zur weiteren Besitzerprüfung, noch kein vollständig bewiesener Ursachenpfad oder bestandener Parallelfall. Die Fehler bleiben in PREFLIGHT_02/03 und im Nachweisindex erhalten.

Der alte native englische Ablehnungsfall weist nach mehr als 30 Minuten Snapshot und Originaldokument mit session_expired zurück; Run und Entscheidungszahl bleiben unverändert. Mehrere Serverprozesse und fehlende alte Instanzkorrelation verhindern aber den Nachweis, dass dies der natürliche Ablauf genau der ursprünglichen Instanz war. NATIVE_DECIDED_IDLE_EXPIRY_01.json markiert diese Grenze. Der neue Prüfserver protokolliert PID und Startzeit je Ereignis; keine Produktionszeitgrenze, kein Heartbeat und kein zusätzlicher MCP-Endpunkt wurden eingeführt.

Es fehlen weiterhin die erforderlichen finalen nativen Gate-/Sprach-/Bedien-/Berechtigungs- und Instanzablaufnachweise, die vollständige kontrollierte Vorher-/Nachher-Flow-Bewertung und die anschließenden formalen Reviews. Frühere SD-Beobachtungen bleiben ihrem tatsächlichen Kandidaten zugeordnet. Weder synthetische Entscheidungen noch fehlende Toolabfragen ersetzen diese Nachweise. Kein schwächeres Modell wurde damit als verbessert qualifiziert.

## Nächster konkreter Schritt

Der geprüfte temporäre Server ist NATIVE_PROBE_CANDIDATE_GATE_MATRIX_05.json. Nur der bereits genehmigte Eintrag agdf-decision-probe wurde umgestellt (NATIVE_PROBE_GATE_CONFIGURATION_01.json); sonstige Konfiguration blieb exakt erhalten. Codex muss durch den Nutzer neu gestartet werden. Anschließend zuerst die native UAT-Leseansicht am neuen Server prüfen und die übrigen erforderlichen Beobachtungen eindeutig mit dessen Instanz binden.

QA bleibt offen. Es gibt keine CD+Tests-, Review-, QA-/UAT-, Produktionsqualifikation-, Release- oder Git-Freigabe aus diesem Bericht.
