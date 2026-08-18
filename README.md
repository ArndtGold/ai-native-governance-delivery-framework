![Intro : AI-native Governance & Delivery Framework](assets/intro.png)

# AI native Governance and Delivery Framework

AGDF ist ein installierbares, kontrollorientiertes Plugin für Codex, Claude Code und OpenCode. Zugleich ist es ein deutschsprachiger Diskussionsentwurf für kontrollierbare Softwareentwicklung mit KI Agenten.

## Installieren und prüfen

Im normalen Betrieb gibt es keine zwei konkurrierenden Bedienoberflächen:

1. **Chat und Skills** sind die primäre Interaktion für Entscheidungen und nächste Schritte.
2. **`.agdf/control/`** ist die dauerhafte Quelle für Scope, Freigaben und Nachweise.
3. **Die CLI** validiert diesen Zustand, rendert entscheidungsreife Karten deterministisch und liefert Automationsnachweise.

`npx ...@latest` ist für Installation, Bootstrap und bewusste Aktualisierung gedacht. Wer wiederholt lokale Prüfungen ausführt, kann einmalig `npm install -g @agdf/cli` verwenden und danach beispielsweise `agdf gate-check --approval-envelope` aufrufen.

Für Codex ist der primäre Einstieg:

```bash
npx --yes @agdf/cli@latest codex
```

Nach Abschluss zeigt die Installation Version, Installationsbereich, Prüfergebnis, erforderlichen Neustart und genau einen nächsten Schritt.

Claude Code und OpenCode verwenden dieselbe Befehlsfamilie:

```bash
npx --yes @agdf/cli@latest claude
npx --yes @agdf/cli@latest opencode
```

Alle Befehle für Installation, Statusprüfung, Deaktivierung und Entfernung stehen in [INSTALL.md](INSTALL.md).
Beginne mit dem [Coding Agent Handbuch](docs/agenten-handbuch/README.md) und nutze den [Banking Flow](examples/sample-banking-flow.md) als vollständiges Beispiel für eine strukturierte Auslieferung.

AGDF ist ein unabhängiges Projekt und kein verbindlicher Standard. Die installierbare Runtime ersetzt weder Produktverantwortung noch Engineering, Security, Test oder Abnahmeentscheidungen.

### Öffentliche ChatGPT-/Codex-Distribution

Das Repository erzeugt einen deterministischen **Skills-only**-Kandidaten für das gemeinsame
OpenAI-Plugin-Verzeichnis. Der Verzeichnisname ist **AGDF**; die vollständige Produktidentität bleibt
**AI Governance & Delivery Framework (AGDF)**. Die erste Fassung betreibt keinen AGDF-MCP-Server,
kein AGDF-Konto, keine Telemetrie und keinen gehosteten AGDF-Dienst.

Der erzeugte Kandidat, seine Prüfsumme und sein Readiness-Bericht belegen ausschließlich Repository-
und Bundle-Zustand. Sie belegen weder ChatGPT-/Codex-Verhalten noch verifizierte Entwickleridentität,
Portalstatus, Einreichung oder Veröffentlichung. Der aktuelle Publisher- und Verfügbarkeitsstatus
bleibt bis zu einem beobachteten, ausdrücklich autorisierten Portal-Schritt `unverified` bzw.
`pending`.

- [Privacy](PRIVACY.md)
- [Terms](TERMS.md)
- [Support](SUPPORT.md)

#### Passt AGDF überhaupt zu meinem Vorhaben?

AGDF hilft, wenn KI gestützte Änderungen an bestehenden Systemen nachvollziehbare Entscheidungen zu Scope, Freigaben, Nachweisen und Verantwortung erfordern oder wenn sichtbar werden soll, welchen überprüfbaren Beitrag die KI zum Projektergebnis geleistet hat. Technische Nutzungswerte zeigen Aktivität, aber noch keinen nachgewiesenen Beitrag zum Projektergebnis.

Bei kleinen, risikoarmen oder explorativen Aufgaben kann ein einfacherer Arbeitsweg sinnvoller sein als zusätzlicher Governance Aufwand.

Prüfe die Eignung vor der Installation oder vor Beginn einer gesteuerten Umsetzung mit diesem Prompt:

```text
Prüfe vor einer Implementierung, ob AGDF für dieses Repository und die konkrete Anforderung angemessen ist.

Erläutere den Zweck und den praktischen Nutzen von AGDF. Stelle den zusätzlichen Steuerungsaufwand dem Ausführungsrisiko gegenüber.

Empfehle den einfachsten geeigneten Arbeitsweg. Rate ausdrücklich von AGDF ab, wenn der erwartbare Prozessaufwand größer ist als der praktische Mehrwert.
```

Die Einschätzung dient der Orientierung. Sie ist weder eine Freigabe zur Umsetzung noch ein Ersatz für menschliche Verantwortung.


## Dieser Diskussionsentwurf in einem Satz 

KI-Agenten brauchen nicht nur Prompts und Tools.
Sie brauchen einen nachvollziehbaren Arbeitsrahmen aus Gates, Artefakten, Projektwissen und Nachweisen.

Der Mensch bleibt verantwortlich.
Der Agent kann unterstützen.
Der Arbeitslauf muss belegbar bleiben.

## Status

Dieses Repository ist ein öffentlicher Diskussionsentwurf mit einer installierbaren Plugin- und
CLI-Runtime. AGDF ist kein Pflichtprozess und kein Standard; die Runtime bleibt ein sich
entwickelndes Produkt und ihre Fähigkeiten unterscheiden sich je Coding-Agent-Oberfläche.

Ziel ist zuerst, die Beobachtung zu prüfen:

Je stärker KI-Agenten in Softwareentwicklung eingebunden werden, desto wichtiger werden Scope, Freigabe,
Nachvollziehbarkeit, Projektwissen und Qualitätsnachweise.

## Erste 5 Minuten

Wenn du schnell verstehen willst, worum es geht:

1. Lies die Kernaussage im [Manifest](docs/00-manifest.md).
2. Schau dir den Ablauf in [Gates](docs/02-gates.md) an.
3. Lies das [Beispiel für einen kleinen Brownfield Change](examples/sample-delivery-flow.md).

Danach solltest du beantworten können:

- Warum reicht ein guter Agenten-Output allein nicht?
- Welche Entscheidung stoppt oder erlaubt den nächsten Schritt?
- Welche Nachweise braucht ein Team, damit ein Agentenlauf vertrauenswürdig wird?

## Warum es dieses Projekt gibt

Viele Diskussionen über KI in der Softwareentwicklung drehen sich um Geschwindigkeit.
Wie schnell kann ein Agent Code schreiben?
Wie viel Arbeit kann automatisiert werden?
Welches Tool ist am besten?

Diese Fragen sind wichtig.
Sie reichen aber nicht.

Ein Agent kann schnell ein plausibles Ergebnis erzeugen.
Trotzdem kann offen bleiben:

- War die Anforderung richtig verstanden?
- War der Scope freigegeben?
- Wurde bestehendes Verhalten geschützt?
- Wurden Tests wirklich ausgeführt?
- Sind fehlende Nachweise sichtbar?
- Darf der nächste Schritt überhaupt beginnen?

Ein Board zeigt, woran gearbeitet wird.
Dieser Entwurf fragt, warum daran gearbeitet werden darf.

Der Entwurf beschreibt nicht nur, wie man KI-Agenten nutzt.
Er fragt, wie verhindert wird, dass Agentenarbeit unbemerkt Scope, Architektur oder Projektwissen verschiebt.

## Was der Entwurf vorschlägt

Der Entwurf arbeitet mit vier Bausteinen.

Gates:
bewusste Haltepunkte, an denen entschieden wird, ob Arbeit weitergehen darf.

Artefakte:
gespeicherte Arbeitsstände wie Bedarf, Produktvertrag, Design, Aufgaben, Tests und Nachweise.

Projektwissen:
ein projektnahes Gedächtnis, das nicht allein in Chatverläufen oder Tool-Memory liegt.

Qualitätsverträge:
prüfbare Regeln für Agentenläufe, Reviews und Nachweise.

## Warum Brownfield wichtig ist

Viele KI-gestützte Vorhaben entstehen nicht auf der grünen Wiese.
Sie treffen auf bestehende Systeme, bestehende Verantwortung, technische Schulden und oft unvollständige Tests.

Gerade dort reicht schnelle Code-Erzeugung nicht aus.
Ein kleiner neuer Wunsch kann bestehendes Verhalten verändern.
Ein Agent kann lokal plausibel arbeiten und trotzdem eine zweite Struktur oder eine zweite Wahrheit erzeugen.

Deshalb behandelt dieser Entwurf Brownfield nicht als Sonderfall.
Brownfield ist der Normalfall, an dem sich der Ansatz bewähren muss.

## Schnell ausprobieren

Ein Team kann den Entwurf klein testen:

1. Einen echten kleinen Brownfield Change auswählen.
2. In einem Absatz das User Requirement formulieren.
3. Prüfen, ob bestehendes Verhalten betroffen ist.
4. Drei bis fünf Akzeptanzkriterien festhalten.
5. Einen kurzen Task und Test Plan schreiben.
6. Nach der Umsetzung Nachweise sammeln.
7. Am Ende prüfen, ob Ergebnis und Agentenlauf ausreichend belegt sind.


## Dokumente

Empfohlene Reihenfolge:

1. [00 - Manifest](docs/00-manifest.md)
2. [01 - Überblick](docs/01-framework-ueberblick.md)
3. [02 - Gates](docs/02-gates.md)
4. [03 - Artefakte](docs/03-artefakte.md)
5. [04 - Wissen nutzbar halten](docs/04-wissen-nutzbar-halten.md)
6. [05 - Vom Mythos zur Prüfung](docs/05-vom-mythos-zur-pruefung.md)
7. [06 - Das Delivery-Lagebild](docs/06-vom-notizzettel-zum-delivery-lagebild.md)
8. [07 - Domain Driven Delivery](docs/07-domain-driven-delivery.md)
9. [Glossar](docs/glossar.md)

## Projektstruktur

```text
/
├─ README.md
├─ INSTALL.md
├─ docs/
│  ├─ 00-manifest.md
│  ├─ 01-framework-ueberblick.md
│  ├─ 02-gates.md
│  ├─ 03-artefakte.md
│  ├─ 04-wissen-nutzbar-halten.md
│  ├─ 05-vom-mythos-zur-pruefung.md
│  ├─ 06-vom-notizzettel-zum-delivery-lagebild.md
│  ├─ 07-domain-driven-delivery.md
│  ├─ agenten-handbuch/
│  │  ├─ README.md
│  │  └─ 01-schnellstart.md … 06-fehlerbehebung.md
│  └─ glossar.md
├─ ...
```

## Welche Fragen sind interessant?

Besonders interessant sind Fragen wie:

- Ist ein Produktvertrag der richtige Anker für Arbeit mit KI-Agenten?
- Wie viel Steuerung hilft, bevor sie zu schwergewichtig wird?
- Wie lassen sich Tickets, Boards und Pull Requests mit fachlicher Nachvollziehbarkeit verbinden?
- Welche Nachweise sind nötig, damit ein Agentenlauf vertrauenswürdig wird?
- Wie lässt sich der Ansatz in Brownfield-Projekten anwenden?
- Was muss menschliches Review und menschliche Verantwortung bleiben?

Beiträge sind willkommen:
Diskussionen, Issues, Gegenargumente, Beispiele aus realen Projekten und Pull Requests.

## Community und Beiträge

- [Code of Conduct (English)](CODE_OF_CONDUCT.md)
- [Contributing Guide (English)](CONTRIBUTING.md)
- [Security Policy (English)](SECURITY.md)
- [Support and issue routing (English)](SUPPORT.md)
- [Project Governance (English)](GOVERNANCE.md)
- [Issues](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues/new/choose) für reproduzierbare Fehler, Runtime-Kompatibilität, Dokumentationslücken und umsetzungsreife Vorschläge
- [Discussions](https://github.com/ArndtGold/ai-native-governance-delivery-framework/discussions) für Fragen, frühe Ideen, Gegenargumente und best-effort Community-Support

Deutsch ist die primäre Projektsprache; Meldungen und Beiträge auf Englisch sind ebenfalls willkommen. Vermutete Sicherheitslücken dürfen nicht öffentlich eingereicht werden und gehören ausschließlich auf die privaten Wege in [SECURITY.md](SECURITY.md).

## Language note

AGDF is German-first by design.

The framework discusses governance, responsibility, approval, evidence and delivery control in the
language in which many of the underlying enterprise, product and accountability conversations happen
for this project. English software-delivery terms are used where they are established, but the
primary reasoning language remains German to preserve nuance around control, responsibility and
decision-making.

The plugin surfaces and operational commands are kept usable for Codex, Claude Code, GitHub Copilot
and OpenCode. Selected runtime-facing parts may become bilingual where that improves adoption
without weakening the original concepts.

AGDF is an independent project and is not affiliated with, endorsed by, or sponsored by OpenAI,
Anthropic, GitHub or OpenCode.

## Lizenz

Lizenziert unter [Apache-2.0](LICENSE).

## Marken

AGDF(TM) und AI Governance & Delivery Framework(TM) sind Marken von Arndt Gold.
Die Nutzung von Name, Logo und Projektmarken ist in [TRADEMARKS.md](TRADEMARKS.md) beschrieben.
Weitere Hinweise stehen in [NOTICE](NOTICE).
