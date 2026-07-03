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
2. **AGDF Runtime** (`plugin/`, `AGENTS.md`, `.github/`): Ein installierbares Claude Code Plugin mit 7 Core-Workflow-Skills, Constitution und Hooks sowie GitHub-Copilot-Unterstuetzung ueber Repository-Instruktionen.

Die Runtime ist die operative Umsetzung der Framework-Prinzipien: Gate-Enforcement, Brownfield-Analyse, Quality Contracts und auditable Delivery-Workflows.

## Erste 5 Minuten

Wenn du schnell verstehen willst, worum es geht:

1. Lies die Kernaussage im [Manifest](docs/00-manifest.md).
2. Schau dir den Ablauf in [Gates](docs/02-gates.md) an.
3. Lies das [Beispiel für einen kleinen Brownfield Change](examples/sample-delivery-flow.md).

Wenn du AGDF in ein neues Repository bootstrapen willst:

```bash
# GitHub Copilot
npm create agdf@latest copilot

# Claude Code
npm create agdf@latest claude

# Beide Oberflaechen
npm create agdf@latest both
```

Wenn du AGDF in Claude Code direkt ausprobieren willst:

```bash
# Plugin installieren
claude plugin add arndtgold/ai-native-governance-delivery-framework

# In Claude Code verwenden
/agdf-gate-check
```

Wenn du GitHub Copilot CLI oder den Copilot Coding Agent verwenden willst:

```text
# Repo-Instruktionen anzeigen
/instructions

# Danach einen AGDF-Check per Prompt ausloesen
Run an AGDF gate check for this request.
```

Danach solltest du beantworten können:

- Warum reicht ein guter Agenten-Output allein nicht?
- Welche Entscheidung stoppt oder erlaubt den nächsten Schritt?
- Welche Nachweise braucht ein Team, damit ein Agentenlauf vertrauenswürdig wird?

## The AGDF Runtime

AGDF (Agentic Governance & Delivery Framework) turns the framework principles into operational runtime guidance:

- **Constitution**: Loads the operating model at session start: Uncertainty Reduction → Evidence → Artefacts → Verification → Outcome, plus gate, Brownfield, and Quality Contract discipline.
- **7 Core Skills**: Gate Check, Brownfield Analysis, Task Plan Review, Clean Implementation Review, QA Gate, Release OR, Delivery Closeout.
- **Fail-closed enforcement**: Exact approval formula `Approval: <GateName>`; implicit consent is not enough. Legacy German `Freigabe: <GateName>` may be interpreted, but new artefacts use `Approval:`.
- **Claude Code surface**: Installable plugin from `plugin/` with skills, constitution, and hooks.
- **GitHub Copilot surface**: Repository instructions via `AGENTS.md` and `.github/copilot-instructions.md`.

Plugin runtime validation:

```bash
node plugin/scripts/check-runtime-integrity.mjs
```

### Skills

| Skill | Family | Purpose |
|---|---|---|
| `/agdf-gate-check` | Governance | Determine the earliest blocking gate |
| `/agdf-brownfield-analysis` | Analysis | Analyze existing artefacts and reuse strategy before implementation |
| `/agdf-task-plan-review` | Review | Verify whether the Task Plan was actually fulfilled |
| `/agdf-clean-implementation-review` | Review | Surface solution integrity, fallbacks, and workarounds |
| `/agdf-qa-gate` | Governance | Formal QA decision: pass / revise / block |
| `/agdf-release-or` | Delivery | Orchestration Report as auditable closeout |
| `/agdf-delivery-closeout` | Delivery | Operational delivery handoff with Git summary |

### Gate Flow

```text
UR → Brownfield Review → PRD → SD → TP → Brownfield Analysis → CD+Tests → Task Plan Review → QA → OR
```

Every gate ends with exactly one status: `pass` / `revise` / `block`.

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

## Website

Die Projekt-Website liegt unter `pages/` und ist eine Astro-Single-Page-Application.

```bash
cd pages
npm install
npm run dev      # Entwicklung
npm run build    # Produktion
```

## Project Structure

```text
/
├─ README.md
├─ AGENTS.md                         # Agent Operating System
├─ .github/
│  └─ copilot-instructions.md        # GitHub Copilot repository instructions
├─ create-agdf/                      # npm create agdf bootstrap package
├─ LICENSE.txt
├─ .claude-plugin/
│  └─ marketplace.json               # Plugin Marketplace Definition
├─ plugin/                           # AGDF Plugin
│  ├─ .claude-plugin/
│  │  └─ plugin.json
│  ├─ hooks/
│  │  ├─ hooks.json                  # SessionStart Hook
│  │  └─ session-start.sh
│  ├─ meta/
│  │  ├─ agdf-constitution.md        # Operating Model, Gate/Brownfield/Quality Discipline
│  │  ├─ agdf-tenets.md             # Principles plus Brownfield/Quality/Delivery Tenets
│  │  └─ agdf-runtime-contract.md   # Compact skill runtime for outputs, gates and Context Graph
│  ├─ scripts/
│  │  └─ check-runtime-integrity.mjs # Checks English runtime layer and skill contract references
│  └─ skills/                        # 7 core workflow skills
│     ├─ agdf-gate-check/
│     ├─ agdf-brownfield-analysis/
│     ├─ agdf-qa-gate/
│     ├─ agdf-task-plan-review/
│     ├─ agdf-clean-implementation-review/
│     ├─ agdf-release-or/
│     └─ agdf-delivery-closeout/
├─ docs/                             # German-first framework documentation
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
│  ├─ sample-delivery-flow.md
│  └─ sample-banking-flow.md
├─ assets/                           # Diagrams
└─ pages/                            # Astro-Website (agdf.tools)
   ├─ package.json
   ├─ astro.config.mjs
   ├─ tailwind.config.mjs
   ├─ src/
   │  ├─ pages/index.astro
   │  ├─ layouts/BaseLayout.astro
   │  ├─ data/skills.ts, site.ts
   │  └─ styles/global.css
   └─ public/
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

## Lizenz

Licensed under [Apache-2.0](LICENSE).
