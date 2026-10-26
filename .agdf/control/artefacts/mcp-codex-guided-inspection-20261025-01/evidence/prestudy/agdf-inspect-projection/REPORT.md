# Modellfreier Inspect-Signaturtest

Stand: 2026-10-25. Repository main: 5046858826f3bca7922c14ef402b095feca8b6fb.
Produktdateien und Git-Index sind unverändert; fremde unversionierte Inhalte sind erhalten.
Kein AGDF-Aufruf, kein Login, kein Modellaufruf und keine Installation wurde für diesen Test ausgeführt.

## Ergebnis

| Prüfung | Bisheriges Schema | Isolierte Variante |
|---|---|---|
| Sichtbare Eingabefelder in Codex 0.163.0 | 2 von 14 | 14 von 14 |
| Sichtbare Operationswerte | 2 von 11 | 11 von 11 |
| unknown in der Eingabesignatur | 4 | 0 |
| Vollständige MCP-Definitionsgröße | 4998 Byte | 4994 Byte |
| SDK-Annahme/Ablehnung in 247003 Prüffällen | Referenz | 0 Abweichungen |
| Erhaltene ursprüngliche SDK-Fehlaufrufe | 15 | weiterhin alle 15 abgewiesen |

Die bisherige Signatur wurde durch den tatsächlich installierten Codex-Client exakt so erzeugt wie in den beiden erhaltenen nativen Fehlerspuren. Damit ist der Signaturverlust ohne Modell reproduziert. Bei der Variante werden auch die drei gemeinsamen Pflichtfelder als Pflichtfelder sichtbar. Bedingte Pflichtfelder bleiben im SDK verbindlich, auch wenn die TypeScript-Darstellung ihre Abhängigkeiten nicht vollständig ausdrückt.

## Mechanismus und Variante

Der Codex-Renderer behandelt anyOf/oneOf/allOf vor danebenstehenden Objektfeldern. Beim bisherigen Inspect-Schema rendert er deshalb nur die allOf-Zweige und verliert die gemeinsamen properties/required. Vier if/then-Zweige erscheinen als unknown.

Die isolierte Variante verschiebt dieselbe allOf-Liste unter dependentSchemas.operation. operation ist am Wurzelobjekt ohnehin verpflichtend. Für jeden ansonsten zulässigen Eingang wird die verschobene Bedingung daher weiterhin ausgewertet; fehlt operation, verweigern beide Schemata den Eingang bereits aufgrund derselben Wurzelpflicht. Referenzziele, Werttypen, zusätzliche Felder, Ziel-Paarung und operationsabhängige Regeln bleiben erhalten.

Zwei kurze Feldbeschreibungen wurden in der temporären Variante um insgesamt 18 Zeichen gekürzt, um das unveränderte Limit von 5000 Byte einzuhalten. Die Validierungsregeln dieser Felder wurden nicht geändert. Die ungekürzte Variante misst 5012 Byte und ist als eigener fehlender Budgetnachweis erhalten; sie wäre in dieser Form nicht zulässig.

Die offizielle Renderer-Implementierung ist unter https://github.com/openai/codex/blob/main/codex-rs/code-mode-protocol/src/json_schema_types.rs einsehbar. Die entscheidenden Ergebnisse stammen aus dem installierten Codex 0.163.0, nicht aus einer nachgebauten Renderer-Funktion oder der Annahme, dass upstream main dieselbe Version sei.

## Prüfaufbau

probe.py startet den installierten Codex-App-Server mit einer dynamischen Testwerkzeugdefinition. Diese trägt exakt das jeweilige Inspect-Eingabeschema. Der Client erzeugt seine echte Code-Mode-Toolbeschreibung; sie wird am lokalen Responses-Endpunkt vor jeder Modellverarbeitung aufgezeichnet. Ein fester SSE-Antwortsatz beendet den Turn. Es wird kein Modell bereitgestellt oder aufgerufen.

Jede Variante hat ein eigenes temporäres CODEX_HOME und ein leeres Arbeitsverzeichnis. API-Key-Umgebungsvariablen sind entfernt, der Testprovider benötigt keine OpenAI-Anmeldung. Ein macOS-Prozessprofil sperrt ausgehendes Netzwerk mit Ausnahme von localhost. Der HTTP-Stub bindet ausschließlich an 127.0.0.1. Die Baseline und die zulässige Variante liefen jeweils mit genau einer lokalen Stub-Anfrage erfolgreich durch.

parity.mjs prüft mit dem unveränderten AjvJsonSchemaValidator des installierten MCP-SDK alle Kombinationen der Feldanwesenheit für die elf unterstützten und vier zusätzliche ungültige Operationswerte sowie gezielte Typ-/Null-/Fremdfeldvarianten. 247003 Fälle: 160 angenommen, 246843 abgewiesen, keine Abweichung. Dies ist ein breiter endlicher Korpus; die strukturelle Gleichwertigkeit der Verschiebung folgt zusätzlich aus dem unveränderten verpflichtenden operation-Feld.

replay.mjs prüft alle 24 erhaltenen Inspect-Aufrufe der zwei vorherigen nativen Sitzungen. Alle 15 vom SDK abgewiesenen Eingaben bleiben abgewiesen; keine Annahmeentscheidung ändert sich. Die Fehlerspuren und die ursprünglichen Bewertungen wurden nicht bearbeitet.

Erhaltene Vorlaufprobleme: Im eingeschränkten Ausführungssandbox konnte der lokale TCP-Port nicht gebunden werden. Danach verweigerte macOS zunächst die IP-Schreibweise im Netzwerkprofil; das Profil akzeptiert dort localhost. Beide Versuche scheiterten vor einer Responses-Anfrage. Diese Testumgebungsfehler sind in den Werkzeugausgaben dieses Chats nachvollziehbar; die späteren erfolgreichen Durchläufe haben eigene Request- und Protokollaufzeichnungen. Die Vorlaufprobleme belegen weder Produkterfolg noch ein Produktproblem.

## Dateien

- summary.json: kompakte Ergebnisse und Nachweisgrenzen.
- baseline.json / baseline/signature.ts / baseline/requests.json: ursprüngliches Schema und tatsächlich aufgezeichnete Codex-Darstellung.
- conditions_nested_budget.json / conditions_nested_budget/signature.ts / conditions_nested_budget/requests.json: isolierte Variante und tatsächliche Darstellung.
- parity.json / replay.json: detaillierte Validierungsnachweise.
- probe.py / parity.mjs / replay.mjs: reproduzierbarer Testaufbau.
- protocol/: vom installierten Codex erzeugte Protokollschemas.

## Grenzen und nächster Schritt

Der Test belegt die Wiederherstellung der sichtbaren Eingaben im tatsächlichen Codex-Renderer. Er belegt keine verbesserte Erfolgsquote, kürzere Agentenlaufzeit, neue native MCP-Installation oder Unterstützung anderer Hosts. Das Testwerkzeug wurde nicht ausgeführt; die SDK-Eingabeprüfung wurde separat geprüft.

Die Produktänderung ist noch nicht vorgenommen. Der konkrete Reparaturweg wäre dieselbe kleine Umstrukturierung im bestehenden Core-Vertrag mit dauerhaften Prüfungen für SDK-Parität, Definitionsbudget und tatsächlich sichtbare Host-Signatur. Danach wäre eine separat autorisierte Agentenevaluation für die praktische Fehlerquote nötig.
