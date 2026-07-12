![Intro : AI-native Governance & Delivery Framework](assets/intro.png)

# AI-native Governance & Delivery Framework

Ein deutschsprachiges Control-Framework für Softwareentwicklung mit KI-Agenten — Codex-first als
Plugin, zusätzlich nutzbar mit Claude Code, GitHub Copilot und OpenCode.

Für folgenreiche Planungsentscheidungen kann die optionale **Delivery Path Search** mehrere
zulässige nächste Schritte vergleichen. Sie nutzt einen portablen Search Core, kennzeichnet die
Durchsetzungsstärke jeder Agent-Oberfläche und liefert nur eine Empfehlung. Der normale AGDF Gate
Check entscheidet weiterhin, ob dieser Schritt ausgeführt werden darf. Die erste Version ist
bewusst begrenzte Best-First-Suche und kein Monte-Carlo-Tree-Search-Verfahren (MCTS).
Optional kann sie auf Codex und Claude Code einen begrenzten, technisch schreibgeschützten
Generierungsschritt ergänzen. Er ersetzt niemals die deterministischen Kandidaten; Vorschläge werden
vor der Bewertung deterministisch auf Gate-Legalität, Scope, Duplikate und materielle Unterschiede geprüft.

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

## Zentrale Frage

Wie bleibt Softwareentwicklung kontrollierbar, wenn KI-Agenten nicht nur Code schreiben, sondern
auch planen, prüfen,
ändern und zusammenfassen?

### In einem Satz

KI-Agenten brauchen nicht nur Prompts und Tools, sondern eine überprüfbare Arbeitsordnung:
Gates, Artefakte, Projektwissen, Nachweise und klare Stoppsignale.

Der Mensch bleibt verantwortlich.
Der Agent kann Arbeit beschleunigen.
Der Arbeitslauf muss kontrollierbar, nachvollziehbar und belegbar bleiben.

## Worum geht es praktisch?

AGDF beantwortet während eines Agentenlaufs immer wieder dieselben Kontrollfragen:

- Was ist fachlich erlaubt?
- Welche Freigabe liegt wirklich vor?
- Welche Quelle der Wahrheit gilt?
- Welche Evidenz belegt den nächsten Schritt?
- Wo muss der Agent stoppen, statt plausibel weiterzumachen?

Darum ist AGDF zuerst ein **Kontrollsystem** und erst danach ein technisches Plugin.

## Erste 5 Minuten

Wähle den Einstieg, der zu deinem Ziel passt:

**AGDF verstehen**

1. Lies die Kernaussage im [Manifest](docs/00-manifest.md).
2. Schau dir den Ablauf in [Gates](docs/02-gates.md) an.
3. Lies das [Beispiel für einen kleinen Brownfield Change](examples/sample-delivery-flow.md).

Danach solltest du beantworten können:

- Warum reicht ein guter Agenten-Output allein nicht?
- Welche Entscheidung stoppt oder erlaubt den nächsten Schritt?
- Welche Nachweise braucht ein Team, damit ein Agentenlauf vertrauenswürdig wird?

## Was schlägt AGDF vor?

AGDF arbeitet mit fünf Bausteinen.

Gates:
bewusste Haltepunkte, an denen entschieden wird, ob Arbeit weitergehen darf.

Artefakte:
gespeicherte Arbeitsstände wie Bedarf, Produktvertrag, Design, Aufgaben, Tests und Nachweise.

Projektwissen:
ein projektnahes Gedächtnis, das nicht allein in Chatverläufen oder Tool-Memory liegt.

Qualitätsverträge:
prüfbare Regeln für Agentenläufe, Reviews und Nachweise.

Control-Scaffold:
konkrete Repository-Artefakte für Run-Status, Backlog-Zeiger, Source-of-Truth-Registry, Context
Graph und wiederverwendbare Qualitätsverträge.

## Warum Brownfield wichtig ist

Viele KI-gestützte Vorhaben entstehen nicht auf der grünen Wiese.
Sie treffen auf bestehende Systeme, bestehende Verantwortung, technische Schulden und oft
unvollständige Tests.

Gerade dort reicht schnelle Code-Erzeugung nicht aus.
Ein kleiner neuer Wunsch kann bestehendes Verhalten verändern.
Ein Agent kann lokal plausibel arbeiten und trotzdem eine zweite Struktur oder eine zweite Wahrheit
erzeugen.

Deshalb behandelt dieser Entwurf Brownfield nicht als Sonderfall.
Brownfield ist der Normalfall, an dem sich der Ansatz bewähren muss.

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
10. [AGDF mit ChatGPT Codex, Claude Code oder OpenCode nutzen](docs/agenten-handbuch/README.md)
11. [Glossar](docs/glossar.md)

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

## Runtime und Setup

### AGDF mit einem Coding Agent anwenden

Installation und Einrichtung für Codex, Claude Code, GitHub Copilot und kombinierte Oberflächen findest du in [INSTALL.md](INSTALL.md).

Danach kannst du direkt einsteigen:

1. Beginne mit dem [Coding Agent Handbuch](docs/agenten-handbuch/README.md).
2. Nutze den [Banking Flow](examples/sample-banking-flow.md) als vollständiges Beispiel für eine strukturierte Auslieferung.

## Lizenz

Lizenziert unter [Apache-2.0](LICENSE).

## Marken

AGDF(TM) und AI Governance & Delivery Framework(TM) sind Marken von Arndt Gold.
Die Nutzung von Name, Logo und Projektmarken ist in [TRADEMARKS.md](TRADEMARKS.md) beschrieben.
Weitere Hinweise stehen in [NOTICE](NOTICE).
