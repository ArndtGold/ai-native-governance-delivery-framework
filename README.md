![Intro : AI-native Governance & Delivery Framework](assets/intro.png)

# AI-native Governance & Delivery Framework

Ein deutschsprachiger Diskussionsentwurf für Softwareentwicklung mit KI-Agenten — jetzt als Claude-Code-Plugin und mit GitHub-Copilot-Unterstuetzung ueber Repository-Instruktionen.

Der Entwurf fragt:

Wie bleibt Softwareentwicklung kontrollierbar, wenn KI-Agenten nicht nur Code schreiben, sondern auch planen, prüfen,
ändern und zusammenfassen?

## In einem Satz

KI-Agenten brauchen nicht nur Prompts und Tools.
Sie brauchen einen nachvollziehbaren Arbeitsrahmen aus Gates, Artefakten, Projektwissen und Nachweisen.

Der Mensch bleibt verantwortlich.
Der Agent kann unterstützen.
Der Arbeitslauf muss belegbar bleiben.

## Status

Dieses Repository enthält zwei Layer:

1. **Framework-Dokumentation** (`docs/`): Ein öffentlicher Diskursentwurf, der Beobachtungen und Prinzipien beschreibt.
2. **AGDF Runtime** (`plugin/`, `AGENTS.md`, `.github/`): Ein installierbares Claude Code Plugin mit 7 Core-Workflow-Skills, Constitution und Hooks sowie GitHub-Copilot-Unterstuetzung ueber Repository-Instruktionen und sichtbare Repo-Skills.

Die Runtime ist die operative Umsetzung der Framework-Prinzipien: Gate-Enforcement, Brownfield-Analyse, Quality Contracts und auditable Delivery-Workflows.

## Erste 5 Minuten

Wenn du schnell verstehen willst, worum es geht:

1. Lies die Kernaussage im [Manifest](docs/00-manifest.md).
2. Schau dir den Ablauf in [Gates](docs/02-gates.md) an.
3. Lies das [Beispiel für einen kleinen Brownfield Change](examples/sample-delivery-flow.md).

Installation und Setup fuer GitHub Copilot, Claude Code oder beide Oberflaechen stehen in [INSTALL.md](INSTALL.md).

Danach solltest du beantworten können:

- Warum reicht ein guter Agenten-Output allein nicht?
- Welche Entscheidung stoppt oder erlaubt den nächsten Schritt?
- Welche Nachweise braucht ein Team, damit ein Agentenlauf vertrauenswürdig wird?

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
10. [Beispiel - Kleiner Brownfield Change](examples/sample-delivery-flow.md)
11. [Beispiel - Banking Flow](examples/sample-banking-flow.md)

## Projektstruktur

```text
/
├─ README.md
├─ INSTALL.md
├─ AGENTS.md
├─ .github/
├─ create-agdf/
├─ .claude-plugin/
├─ plugin/
├─ docs/
│  ├─ 00-manifest.md
│  ├─ 01-framework-ueberblick.md
│  ├─ 02-gates.md
│  ├─ 03-artefakte.md
│  ├─ 04-wissen-nutzbar-halten.md
│  ├─ 05-vom-mythos-zur-pruefung.md
│  ├─ 06-vom-notizzettel-zum-delivery-lagebild.md
│  ├─ 07-domain-driven-delivery.md
│  └─ glossar.md
├─ examples/
├─ assets/
└─ pages/
```

## Diskussion erwünscht

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

AGDF ist nicht nur ein Diskussionsentwurf, sondern auch als operative Laufzeit nutzbar:

- für **Claude Code** als Plugin
- für **GitHub Copilot** über Repository-Instruktionen und Repo-Skills

Die operativen Einstiege, Bootstrap-Pfade und Verifikationsschritte stehen in [INSTALL.md](INSTALL.md).

## Lizenz

Lizenziert unter [Apache-2.0](LICENSE).