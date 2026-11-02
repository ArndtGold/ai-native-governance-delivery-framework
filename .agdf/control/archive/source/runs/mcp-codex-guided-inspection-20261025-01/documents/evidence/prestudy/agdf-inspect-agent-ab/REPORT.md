# Echte Agenten: Inspect-Signatur A/B-Test

Datum: 2026-10-25. Ausgangspunkt: main @ 5046858826f3bca7922c14ef402b095feca8b6fb.

## Ergebnis

Die isolierte Schema-Variante ist durch diesen Agententest nicht als Verbesserung der Bedienbarkeit bestätigt. Beide Varianten-Agenten haben die angeforderte Fixture-UR-Freigabe nicht gespeichert. Weniger Aufrufe und geringere Laufzeiten sind hier mit einem frühen Aufgabenabbruch verbunden und kein Effizienzgewinn.

| Reihenfolge | Variante | Fixture-Aufgabe abgeschlossen | Vollständig nach bisherigem Prüfer qualifiziert | MCP-Aufrufe | SDK-Eingabefehler | isError insgesamt | Sitzungszeit |
|---|---|---|---|---:|---:|---:|---:|
| A1 | Bisheriges Schema | ja | ja | 13 | 7 | 9 | 82,841 s |
| B1 | Schema-Variante | nein | nein | 6 | 3 | 4 | 39,223 s |
| B2 | Schema-Variante | nein | nein | 8 | 4 | 6 | 56,966 s |
| A2 | Bisheriges Schema | ja | nein: Wrapper nicht verifiziert | 15 | 9 | 10 | 143,199 s |

A2 hat den Fixture-Effekt tatsächlich erzielt, bleibt aber nach dem unveränderten strengen Prüfer unqualifiziert. Neun Code-Mode-Wrapper verwenden lokale Objektmutationen wie delete, Zuweisungen und Object.assign außerhalb des vom bisherigen Prüfer bestätigten Teils der Sprache. Die vollständige Spur und unveränderte Einstellungen sind belegt; eine vollständige Qualifikation wird daraus nicht nachträglich abgeleitet. Der Prüfer wurde nicht geändert und kein Versuch ersetzt.

## Kontrollierter Vergleich

- Vier ausdrücklich angeforderte echte Sitzungen, höchstens vier, keine Wiederholung und kein Resume.
- Reihenfolge A-B-B-A; zwei frische Sitzungen pro Variante.
- In allen vier Sitzungen tatsächlich beobachtet: Codex CLI 0.163.0, gpt-6.1-sol, Reasoning low.
- Unveränderter T7-Prompt: Die bereits vorgelegte UR für demo-run-01 mit der gegebenen Antwort Approval: UR über MCP erfassen.
- Dasselbe Fixture-/Erfolgsprüfer-/Redaktions-/Schreibschutz-Verfahren. Nur Inspect-Schema und zwei verkürzte Feldbeschreibungen unterscheiden die Produktquellen der Varianten.
- Beide Testpakete wurden in temporären HEAD-Klonen mit dem bestehenden Core-Projektor und dem kanonischen Assembly-Owner aufgebaut. Identische generierte Ressourcen wurden aus dem vorher überprüften Build übernommen. Dies ist ein Experimentalaufbau, keine neue vollständige Paket-/Releasequalifikation.
- Beide tatsächlichen STDIO-Vorläufe bestanden mit null Modellaufrufen. Tatsächliche Definitionsgrößen: A 4998 Byte, B 4994 Byte; das Limit bleibt 5000 Byte.
- Normale Nutzung des bestehenden ChatGPT-Kontos; keine Credential-Kopie, kein API-Key-Fallback, keine Installation. Dollar-Kosten sind nicht verfügbar; Token-/Cachewerte stehen in den Originalbeobachtungen und summary.json.
- Keine AGDF-Steuerung des echten Repositorys. Die getesteten AGDF-MCP-Aufrufe betreffen ausschließlich die wegwerfbaren Test-Fixtures. Der abgeschlossene echte Run und seine historischen Nachweise bleiben unverändert.

## Konkrete Fehlerursache in B

Beide B-Agenten versuchen zunächst gate-check mit gate: UR. Das Feld gate ist laut vorhandenem Vertrag nur bei artifact-readiness, operation-contract und Präsentationslesevorgängen zulässig. Bei gate-check ist es verboten.

Der SDK-Fehler lautet unter anderem data/operation must be equal to one of the allowed values. Der Operationswert gate-check ist jedoch gültig; die Meldung stammt aus der vom zusätzlichen gate-Feld ausgelösten Applicability-Bedingung. Sie benennt das eigentliche Problem nicht verständlich.

Beispiel B1: Nach Ergänzung von primary_target sind Zielpaar, Run und Sprache vollständig, doch gate bleibt gesetzt. Der Aufruf scheitert weiter. Der Agent versucht danach andere Reads und erklärt schließlich, die Schnittstelle lehne gate-check ab. Die Freigabe fehlt.

Die Gegenprüfung in error-counterexamples.json entfernt nur das unzulässige gate-Feld und ergänzt, wo nötig, das bereits verlangte Zielpaar. Derselbe SDK-Validator nimmt den korrigierten Aufruf sowohl unter A als auch B an. Diese Gegenprüfung ist offline; sie ist kein nachträglicher Modelllauf, kein nachgeholter Fixture-Effekt und keine neue Erfolgsevidenz.

Weitere beobachtete Hürden bleiben fehlende Ziel-/Revisionswerte, unvollständige Modulnamen, die Kopplung der Inspect-Hilfe an agdf_prepare/presentation.prepare und die Verwechslung von Runtime-Vertragsmodulen mit Werkzeugverträgen.

## Interpretation

Der vorige modellfreie Nachweis bleibt gültig: B macht 14 Felder und elf Operationen statt zwei Feldern/zwei Operationswerten sichtbar; vier unknown-Blöcke verschwinden. Auch die damaligen 247003 Paritätsfälle bleiben korrekt. Die sichtbare flache Signatur erklärt aber noch nicht, welche Felder bei welcher Operation erlaubt oder verpflichtend sind. Sie begünstigt in diesen zwei Sitzungen die falsche Kombination gate-check plus gate.

Damit sind Schema-Sichtbarkeit, formal unveränderte Validierung und tatsächliche Aufgabenerfüllung getrennte Nachweise. Zwei Sitzungen je Variante erlauben eine konkrete Diagnose, keine statistische oder hostübergreifende Überlegenheitsaussage. Die Baseline ist wegen der vielen Fehlaufrufe und der Auditgrenze ebenfalls kein gutes ergonomisches Ziel.

## Erhaltene Nachweise und Grenzen

- experiment.json: vor dem ersten Modellstart festgehaltener Vergleichsplan und Schutzmanifeste.
- native-launches.json: vier vor dem jeweiligen Start reservierte Sitzungen; kein Retry.
- preflights.json und Vorlaufbeobachtungen: beide tatsächlichen modellfreien Vorläufe.
- source-bindings.json: genaue Quellenbindungen beider Kandidaten.
- native-results.json und summary.json: ursprüngliche Entscheidungen und zusammengefasste Werte.
- evidence/A1, B1, B2, A2: Originalbeobachtungen, Events, Rollouts und finale Agentenantworten mit Aufbewahrungsmanifesten.
- error-counterexamples.json: konkrete Fehler und rein offline geprüfte Korrekturen.

Alle vier Spuren sind vollständig, alle Modelle/Efforts stimmen, und alle drei Manifeststufen pro Sitzung sind gleich. Der Konfigurationsschutz ist identisch. Die vor dem Experiment festgehaltenen persönlichen Einstellungen sind nachher unverändert. Der ursprüngliche Arbeitsbaum, Git-Index und fremde Inhalte wurden nicht verändert.

Die anfänglichen Assembly-/Vorbereitungsfehler wegen noch fehlender generierter Projektressourcen sind separat in den Assembly- und Setup-Logs erhalten und traten vor jedem echten Modellstart auf. Die Reparatur dieser temporären Testvorbereitung wurde nicht als Produktänderung oder Agentenerfolg gezählt.

## Konsequenz

Die Schema-Variante allein nicht als fertige Reparatur übernehmen. Der nächste gezielte Entwurf muss zusätzlich die zulässigen Feldkombinationen pro Operation sichtbar machen, passende gebundene Leseaufrufe aus den bestehenden Core-Eigentümern liefern und den konkreten Feldkonflikt verständlich zurückmelden. Die strenge SDK-/Core-Validierung bleibt erhalten. Ein anschließender neuer Agententest wäre eine neue Ausführung; diese vier Sitzungen werden nicht nachgebessert oder wiederholt.
