![Intro : AI-native Governance & Delivery Framework](assets/intro.png)

# AI-native Governance & Delivery Framework

Ein deutschsprachiges Control-Framework für Softwareentwicklung mit KI-Agenten — Codex-first als Plugin, zusätzlich nutzbar mit Claude Code und GitHub Copilot.

## Language note

AGDF is German-first by design.

The framework discusses governance, responsibility, approval, evidence and delivery control in the language in which many of the underlying enterprise, product and accountability conversations happen for this project. English software-delivery terms are used where they are established, but the primary reasoning language remains German to preserve nuance around control, responsibility and decision-making.

The plugin surfaces and operational commands are kept usable for Codex, Claude Code and GitHub Copilot. Selected runtime-facing parts may become bilingual where that improves adoption without weakening the original concepts.

## Zentrale Frage

Wie bleibt Softwareentwicklung kontrollierbar, wenn KI-Agenten nicht nur Code schreiben, sondern auch planen, prüfen,
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

Wenn du schnell verstehen willst, worum es geht:

1. Lies die Kernaussage im [Manifest](docs/00-manifest.md).
2. Schau dir den Ablauf in [Gates](docs/02-gates.md) an.
3. Lies das [Beispiel für einen kleinen Brownfield Change](examples/sample-delivery-flow.md).

Installation und Setup für Codex, Claude Code, GitHub Copilot oder kombinierte Oberflächen stehen in [INSTALL.md](INSTALL.md).

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
konkrete Repository-Artefakte für Run-Status, Backlog-Zeiger, Source-of-Truth-Registry, Context Graph und wiederverwendbare Qualitätsverträge.

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
│  ├─ .claude-plugin/
│  ├─ .codex-plugin/
│  ├─ control/
│  ├─ hooks/      # SessionStart lifecycle config for Codex and Claude Code
│  ├─ meta/
│  └─ skills/
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

Die Root-`AGENTS.md` steuert die Bearbeitung dieses Repositories.
Die installierbaren Router-Instruktionen werden zentral in `plugin/meta/agdf-agent-router.md` gepflegt und pro Zielsystem gerendert.
Das Skill-Routing wird nicht je Oberfläche gepflegt: `plugin/meta/agdf-plugin.definition.json` enthält `skillSet.slug`, `useFor` und `boundary`; der sichtbare Skillname entsteht aus `surface.skillPrefix + slug`.

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

AGDF ist nicht nur ein Diskussionsentwurf, sondern auch als operative Laufzeit nutzbar:

- für **Codex** als Plugin
- für **Claude Code** als Plugin
- für **GitHub Copilot** über Repository-Instruktionen und Repo-Skills

Die operativen Einstiege, Bootstrap-Pfade und Verifikationsschritte stehen in [INSTALL.md](INSTALL.md).

Das Plugin liefert zusätzlich einen Control-Scaffold unter `plugin/control/`.
Dieser Scaffold macht den praktischen Arbeitsstand sichtbar:

Die Templates sind keine neue Theorie, sondern operationalisieren die Konzepte aus den Dokumenten:

- aktueller Run-Status und nächste erlaubte Aktion: aus [Gates](docs/02-gates.md), besonders Gate-Status, Gate-Entscheidung und nächster Schritt
- Master-Backlog als lebender Steuerungszeiger: aus [Artefakten](docs/03-artefakte.md), besonders Artefaktstatus, Referenzen und Artefaktliste als Fallback
- Source-of-Truth-Registry gegen parallele Wahrheiten: aus dem [Manifest](docs/00-manifest.md), besonders „Eine verbindliche Quelle für Produktabsicht“
- Context Graph für dauerhaft relevante Brownfield-Erkenntnisse: aus [Wissen nutzbar halten](docs/04-wissen-nutzbar-halten.md) und [Delivery-Lagebild](docs/06-vom-notizzettel-zum-delivery-lagebild.md)
- Quality Contracts als wiederverwendbare Block-, Revise- und Warnsignale: aus [Vom Mythos zur Prüfung](docs/05-vom-mythos-zur-pruefung.md), besonders ausführbare Qualitätsverträge und ihre Wirkung

Für Ziel-Repositories gibt es dafür einen ausführbaren Kontrollpfad:

```bash
npm create agdf@latest init
npm create agdf@latest doctor
```

`init` legt live Control-Dateien unter `.agdf/control/` an. `doctor` prüft, ob aktuelles Gate, nächste erlaubte Aktion, Evidenz, Backlog-Zeiger, Source-of-Truth-Registry, Context-Graph-Hygiene und Quality Contracts überhaupt prüfbar sind.

## Lizenz

Lizenziert unter [Apache-2.0](LICENSE).
