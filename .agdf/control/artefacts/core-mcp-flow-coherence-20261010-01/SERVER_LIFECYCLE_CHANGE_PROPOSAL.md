# Serveraustausch: konkreter Änderungsvorschlag

Run: core-mcp-flow-coherence-20261010-01
Revision: 089a504e-29b4-42a9-8b1c-3558cfa34996
Status: Vorschlag, nicht umgesetzt und nicht freigegeben.

## Befund und Grenze

Der vorhandene AGDF-Startpfad bedient eine STDIO-Verbindung und schließt seinen eigenen Runtime-/Worker-Kontext. Die mehreren vom Host gestarteten Prozesse sind nicht automatisch Altprozesse; sie können verschiedenen Chats gehören. Ein globaler PID-Ring oder eine Auswahl nur nach Alter wäre keine zulässige Umsetzung. Die bisherige Diagnose beweist zudem nicht, dass die fehlende UI-Erweiterung durch Altprozesse verursacht wird.

Die genehmigte UR schließt automatische Wiederverbindung/Neustarts und einen neuen Orchestrierungsspeicher aus. T-009/SDD-012 behandeln Ansichts-/Entscheidungssitzungen; sie definieren keinen generationsübergreifenden Prozess-Pool. Daher ist UR die früheste geänderte Quelle. Die bisherigen UR/PRD/SD/TP und Umsetzungsnachweise bleiben bis zur expliziten Revisionsanwendung unverändert.

## Gewünschtes Verhalten

- Ein einziger eindeutig zugeordneter Besitzer je Host-Verbindung verwaltet deren zulässige Generationen. Keine fremde Verbindung und kein fremder Chat wird beendet. Prozessname, Repositorypfad oder Alter allein beweisen keine Eigentümerschaft.
- Eine neue Generation übernimmt neue Ansichten erst nach bestätigter Initialisierung, passender Runtime-/UI-Identität und tatsächlich deklarierter erforderlicher Fähigkeit. Bei Fehlern bleibt die bisherige Verbindung nutzbar.
- Bestehende Ansichten und laufende Entscheidungen bleiben an ihre ursprüngliche Generation gebunden. Ein abgeschickter Auftrag wird nicht automatisch auf einem anderen Server wiederholt; ursprüngliche UUID, bestätigter Effekt oder explizite Ungewissheit bleiben nachvollziehbar.
- Der älteste eindeutig eigene, nicht mehr benutzte Server wird über seinen Schließpfad beendet. Ein ausbleibender Close-Nachweis bleibt sichtbar. Ein aktiver Server darf durch die Altersreihenfolge nicht verdrängt werden.
- Es gibt eine feste Kapazitätsgrenze. Sind alle zulässigen Generationen aktiv oder noch nicht sicher schließbar, wird ein weiterer Austausch abgelehnt, statt aktive Sitzungen zu verlieren oder Prozesse unbegrenzt anzusammeln. Die konkrete Grenze und Ablauf-/Fehlersemantik gehören ins erneuerte PRD/SD.
- Sind Prozesswechsel ausschließlich im Codex-Host möglich, wird dies als echte externe Zuständigkeit ausgewiesen. Ein lokaler AGDF-Workaround darf Host-Unterstützung oder nativen Erfolg nicht vortäuschen. Keine Bearbeitung installierter Codex-Binärdateien und kein pauschales Abschalten anderer Chats.

## Erforderliche Tests

1. Erfolgreicher Austausch: neue Initialisierung vor neuem Verkehr, alte aktive Ansicht bleibt lesbar; erst nach ihrem tatsächlichen Ende wird der alte eigene Server geschlossen.
2. Fehlende UI-Fähigkeit/abweichender Kandidat/Startup-Fehler: keine Übernahme, bisherige Verbindung bleibt erhalten.
3. Mehrere Chats und gleichzeitige Wechsel: eindeutige Eigentümerschaft; kein fremder Shutdown und keine doppelte aktuelle Generation.
4. Laufende Freigabe mit verlorenem Ergebnis: keine neue Entscheidung, keine neue UUID, ursprünglicher kanonischer Effekt bleibt prüfbar.
5. Kapazität vollständig aktiv: konkrete Ablehnung, keine aktive Verdrängung.
6. Schließfehler/Neustart/Prozessende: geordnete Ende-Nachweise, keine reine PID-Annahme und keine offenen Worker/Transportleser im bestätigten Endzustand.
7. Echte native Ansicht: sichtbare Karte, tatsächliche UI-Aushandlung, Dokument/Rückkehr, Fokus und Teardown am genau geladenen Kandidaten. Source-/synthetische Prozessprüfungen ersetzen das nicht.

## Auswirkung der Revisionsanwendung

Derselbe Run kehrt zu UR zurück. UR/PRD/SD/TP-Freigaben und abhängige Quellen-/Präsentationsbindungen werden archiviert und im aktuellen Zustand zurückgesetzt. Brownfield Review und UX werden neu bewertet; Vorbereitung/Umsetzungs-/Review-Erfüllung müssen unter einem neuen TP erneut belegt werden. Bestehender Code, Tests und historische Nachweise werden erhalten. Es wird kein neuer Run angelegt, kein Git-Befehl ausgeführt und keine neue Gate-Freigabe aus der Änderungsanweisung abgeleitet.

Die genaue Revisionsauswirkung wird separat durch den bestehenden kanonischen Preview-Owner berechnet. Dieser Vorschlag selbst ändert keinen Gatezustand.
