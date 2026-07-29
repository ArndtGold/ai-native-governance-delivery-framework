# Solution Design: Structured Depth Positioning auf AGDF Pages

## Status

- status: approved
- gate: SD
- gate approval: `Approval: SD`
- approval date: 2026-07-29
- derived_from: `PRD.md`
- run: `agdf-pages-structured-depth-positioning`
- date: 2026-07-29

## Document Control

- work item: `agdf-pages-structured-depth-positioning`
- derived from: `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/PRD.md`
- canonical semantics owner: `plugin/meta/contracts/modes.md` `Structured Depth Decision`
- pages data owner: `pages/src/data/site.ts`
- pages render owner: `pages/src/pages/index.astro`

## 1. Design Decision

Erweitere `pages/src/data/site.ts` mit kanonischen Modewerten und einer neuen `depthChoice`-Datenstruktur für die Vergleichsfläche „How AGDF chooses depth". Rendere die Vergleichsfläche in `pages/src/pages/index.astro` als neue Section zwischen der bestehenden Requirement-Intake-Section (`#intake`) und der Workflow-Section (`#workflow`). Präzisiere die Gate-Map-Section (`#gate-flow`), um gleiche Gate-Kette und unterschiedlichen Artefakt-Tiefen-Hinweis zu zeigen. Ersetze oder rendere `gateModeMatrix` kanonisch, ohne eine parallele Struktur zu erzeugen.

Keine neue Route, kein neues Komponentensystem, kein neuer Runtime-Entscheidungspunkt. Wiederverwendung vorhandener `.surface`/`.card-glow`/`.gate-node`/Grid-Patterns und `data-reveal`-Konventionen.

## 2. Data Model Changes

### 2.1 `gateModeMatrix` — kanonische Modewerte

Ersetze die bestehenden nicht-kanonischen Labels durch kanonische Werte:

| Aktuell | Neu (kanonisch) |
|---|---|
| „Quick task" | „Quick Task / Compact Delivery" |
| „Bug lightweight" | „Narrow Bug Track" |
| „Bounded slice" | „Structured Slice" |
| „Structured delivery" | „Structured Delivery" |
| „Blocked" | „Blocked / Depth Unresolved" |

Füge einen neuen Eintrag für `verified_change` hinzu:

```ts
{
  mode: "Verified Change",
  use: "Bounded user-visible change, one canonical owner, deterministic propagation and validation, clean baseline, structured escalation target.",
  skip: "Full PRD/SD/TP/QA/UAT chain when every eligibility condition is machine-validated.",
  decision: "Use only when the compact record proves all five conditions; escalates on any failure.",
}
```

Aktualisiere `decision`-Texte, um kanonische Semantik zu spiegeln (Wirkungsbasiert, Proxy-Verbot, `depth_unresolved`).

### 2.2 Neue `depthChoice`-Datenstruktur

```ts
export const depthChoice = {
  modesContractOwner: "plugin/meta/contracts/modes.md",
  projection: "Pages explains, does not re-author.",
  compactPaths: [
    {
      mode: "Quick Task / Compact Delivery",
      trigger: "Narrow local change without new product semantics.",
      evidence: "Brownfield Review selects quick_task after impact check.",
    },
    {
      mode: "Verified Change",
      trigger: "Bounded user-visible change with one canonical owner and deterministic proof.",
      evidence: "Compact record proves all five eligibility conditions.",
    },
  ],
  structuredPaths: {
    sharedGateChain: "UR -> Brownfield Review -> Mode/Slice Decision -> PRD -> SD -> TP -> Brownfield Analysis -> CD+Tests -> CR -> QA -> UAT -> OR",
    sliceVsDelivery: "Same gate sequence; difference is artefact depth, not gates.",
    structuredSlice: {
      mode: "Structured Slice",
      whenChosen: "All seven bounded-slice checks pass and no full-depth trigger applies.",
      boundedChecks: [
        "One coherent outcome with clear acceptance boundary.",
        "Known authority, no new trust/policy/security boundary.",
        "Owners and consumers identified, coordination inside the slice.",
        "No architecture, runtime, persistence, data, external API, public CLI, release or cross-host full-depth impact.",
        "Migration and propagation bounded, compatible, testable, locally reversible.",
        "Failure, recovery and rollback controllable inside the slice.",
        "Independent acceptance signals; no hidden later work as prerequisite.",
      ],
    },
    structuredDelivery: {
      mode: "Structured Delivery",
      whenChosen: "Any one evidenced full-depth trigger applies because of its effect, not a numeric count.",
      fullDepthFamilies: [
        "Authority, policy or security boundary change.",
        "Architecture or runtime change beyond a local slice.",
        "Persistence, data or migration with irreversible or coordinated state transition.",
        "External or public contract: API, CLI, protocol, file format or compatibility-sensitive integration.",
        "Release, deployment or cross-host rollout, rollback or feature-flag plan.",
        "Unbounded consumer or owner coordination; cannot be delivered as one reversible slice.",
      ],
    },
  },
  depthUnresolved: {
    mode: "Blocked / Depth Unresolved",
    meaning: "A decisive fact is missing or conflicting and no evidenced full-depth trigger already supports structured_delivery.",
    action: "Persist block, name missing facts and evidence owner, link Brownfield Review, re-evaluate after evidence completion.",
    noDefault: "Unknown facts never default to structured_delivery.",
  },
  proxyProhibition: "File, owner, consumer, task or derived-path counts are not a decision proxy and never a threshold for either structured mode.",
}
```

### 2.3 `requirementPaths` — kanonische Erweiterung

Ersetze „Controlled Delivery" durch zwei kanonische Einträge:

- „Structured Slice" mit kanonischem Trigger und Pfad
- „Structured Delivery" mit kanonischem Trigger und Pfad

Behalte „Quick Task" und „Narrow Bug Track" bei. Füge „Verified Change" als fünfte Karte hinzu oder als Hinweis in „Narrow Bug Track" (bestehende Outcome-Zeile referenziert Verified Change bereits). Die Entscheidung fällt im TP auf Basis der Rendering-Komplexität; PRD-04 verlangt Verified Change sichtbar.

### 2.4 `gateMapPaths.structured` — Tiefenunterscheidung

Erweitere `gateMapPaths.structured` um einen Tiefen-Hinweis:

```ts
structured: {
  label: "Structured path",
  note: "Structured Slice and Structured Delivery use the same gate sequence. Their difference is artefact depth, not gates.",
  depthHint: "Slice: bounded artefact depth for one coherent outcome. Delivery: full depth for every affected boundary.",
  steps: [ /* bestehende Gate-Kette unverändert */ ],
}
```

### 2.5 `workflowSteps` und `gateFlow` — kanonische Werte

Aktualisiere `workflowSteps[2].desc` und `gateFlow[2].desc`, um `verified_change` und `depth_unresolved` zu nennen.

## 3. Render Changes

### 3.1 Neue Section „How AGDF chooses depth"

Platziere zwischen `#intake` und `#workflow`:

```text
Requirement Intake (#intake)
        |
        v
How AGDF chooses depth (#depth-choice)   <-- NEU
  - Compact paths vs structured paths
  - Structured Slice vs Structured Delivery (wirkungsbasiert)
  - Six full-depth families (Marketingtiefe)
  - Seven bounded-slice checks (Kriterien, keine Vollkopie)
  - Depth Unresolved als block
  - Proxy-Verbot
  - Modes-Contract-Abgrenzung
        |
        v
Workflow (#workflow)
```

Render `depthChoice` mit vorhandenen `.surface`/Grid-Patterns:

- Überschrift mit `data-reveal` und `font-mono`-Eyebrow „Mode selection"
- Zwei Spalten: Compact Paths (links) vs Structured Paths (rechts)
- Structured Paths: Shared-Gate-Chain-Hinweis, Slice vs Delivery Vergleich, sechs Wirkungsfamilien als Badge-Liste, sieben Bounded-Slice-Checks als nummerierte Liste
- Depth Unresolved als eigener Block mit `border-red-500/30`-Styling
- Proxy-Verbot als Hinweis-Block mit `border-yellow-500/30`-Styling
- Modes-Contract-Abgrenzung als Footer-Hinweis: „Canonical owner: modes.md. Pages explains, does not re-author."

### 3.2 Gate-Map-Section-Präzisierung (`#gate-flow`)

Füge unter der bestehenden `gateMapPaths.structured`-Darstellung den `depthHint`-Text als Hinweis-Block hinzu, der erklärt, dass Slice und Delivery dieselbe Gate-Kette mit unterschiedlicher Artefakttiefe verwenden.

### 3.3 `gateModeMatrix`-Rendering

`gateModeMatrix` wird nicht als separate Tabelle gerendert (PRD-09: keine parallele Struktur). Stattdessen fließen seine kanonischen Modewerte in `depthChoice` und die präzisierten `requirementPaths` ein. `gateModeMatrix` bleibt als Datenstruktur erhalten oder wird durch `depthChoice` ersetzt; die Entscheidung fällt im TP. Keine Duplikation.

## 4. Copy Contract

### 4.1 Modes-Contract-Abgrenzung

Jede Section, die Depth-Semantik erklärt, nennt den Modes Contract als alleinigen Owner:

> Canonical owner: `plugin/meta/contracts/modes.md`. Pages explains, does not re-author.

### 4.2 Full-Depth-Wirkungsfamilien (Marketingtiefe)

Die sechs Familien werden als kompakte Badge-Liste gerendert, nicht als Trigger-Bedingung-Vollkopie. Jede Familie wird in einem Satz erklärt:

- „Authority, policy or security boundary change."
- „Architecture or runtime change beyond a local slice."
- „Persistence, data or migration with irreversible or coordinated state transition."
- „External or public contract: API, CLI, protocol, file format or compatibility-sensitive integration."
- „Release, deployment or cross-host rollout, rollback or feature-flag plan."
- „Unbounded consumer or owner coordination; cannot be delivered as one reversible slice."

Zusatz: „A single trigger is decisive because of its effect, never because of a numeric count."

### 4.3 Bounded-Slice-Checks (Kriterien, keine Vollkopie)

Die sieben Checks werden als nummerierte Liste gerendert mit dem Hinweis: „All seven must pass as evidenced and no full-depth trigger may apply."

### 4.4 Depth Unresolved

> When a decisive fact is missing or conflicting and no evidenced full-depth trigger already supports structured_delivery, the result is `depth_unresolved`. This is not a mode. AGDF persists `block`, names missing facts and evidence owner, links the Brownfield Review and re-evaluates after evidence completion. Unknown facts never default to `structured_delivery`.

### 4.5 Proxy-Verbot

> File, owner, consumer, task or derived-path counts are not a decision proxy and never a threshold for either structured mode.

## 5. Ownership And Propagation

| Concern | Owner | Change |
|---|---|---|
| Public copy/data | `pages/src/data/site.ts` | `gateModeMatrix` kanonisch, `depthChoice` neu, `requirementPaths` erweitert, `gateMapPaths.structured` mit `depthHint`, `workflowSteps`/`gateFlow` aktualisiert. |
| Page composition | `pages/src/pages/index.astro` | Neue Section `#depth-choice`, Gate-Map-Präzisierung, keine neue Route/Komponente. |
| Canonical semantics | `plugin/meta/contracts/modes.md` | Read-only; keine Änderung. |
| Eval evidence | `pages/src/data/evaluationEvidence.ts` | Konsistenzprüfung; keine semantische Änderung erwartet. |
| Validation | `pages/package.json` | `astro check`, `astro build`. |

## 6. Layout And Compatibility

- Wiederverwendung vorhandener `max-w`, Spacing, Border, Background, Typography und `data-reveal`-Konventionen.
- Responsive Grids: `sm:grid-cols-2`, `lg:grid-cols-2` für Compact-vs-Structured-Vergleich; Bounded-Slice-Checks als `sm:grid-cols-2`-Liste; Wirkungsfamilien als `flex flex-wrap gap-2`-Badge-Liste.
- Mobile: Vergleichsfläche muss auf kleinen Screens lesbar bleiben — Spalten stapeln unter `sm`, Badge-Listen bleiben flex-wrap.
- Preserve existing section IDs and navigation anchors (`#intake`, `#workflow`, `#gate-flow`).
- Neue Section-ID `#depth-choice`; optionaler Nav-Link, falls das bestehende Nav-Layout Platz bietet (decision im TP).
- Semantisches HTML: `<section>`, `<h2>`/`<h3>`, `<ul>`/`<ol>` für Listen, `<span>` für Badges.
- Kontrast: bestehende Dark-Theme-Palette (`text-dark-200`, `text-agdf-300`, `border-agdf-500/30`); keine neue Farbpalette.
- Tastatur: `<section>`-Fokus, keine interaktiven Elemente erforderlich (statische Content-Section).

## 7. Verification Design

1. Rendered-Pages-Inspection der neuen `#depth-choice`-Section: kanonische Modewerte, sechs Wirkungsfamilien, sieben Bounded-Slice-Checks, `depth_unresolved`, Proxy-Verbot, Modes-Contract-Abgrenzung sichtbar.
2. Rendered-Pages-Inspection der präzisierten Gate-Map: `depthHint`-Hinweis sichtbar.
3. Rendered-Pages-Inspection der `requirementPaths`: Verified Change sichtbar, „Controlled Delivery" ersetzt.
4. Daten-Diff-Review: `gateModeMatrix` kanonisch oder durch `depthChoice` ersetzt, keine parallele Struktur.
5. Responsive Browserprüfung: Desktop, Tablet, mobile viewport; Vergleichsfläche lesbar.
6. Accessibility-Prüfung: Tastatur-Tab-Reihenfolge, Kontrast, semantisches HTML.
7. `npm --prefix pages run check` (astro check).
8. `npm --prefix pages run build` (astro build).
9. `git diff --check`.
10. `node ~/.config/opencode/agdf/bin/agdf-local.js doctor --json`.

## 8. Risks And Handling

| Risk | Impact | Handling |
|---|---|---|
| `depthChoice` und `gateModeMatrix` duplizieren sich. | medium | PRD-09: `gateModeMatrix` kanonisch in `depthChoice` aufgehen lassen oder ersetzen, nicht beides rendern. |
| Vergleichsfläche wird zu detailliert für Marketingseite. | medium | Marketingtiefe für Wirkungsfamilien und Bounded-Slice-Checks; keine Trigger-Vollkopie. |
| Responsive Darstellung auf kleinen Screens unleserlich. | medium | Spalten stapeln unter `sm`; Badge-Listen `flex-wrap`; Bounded-Slice-Checks `sm:grid-cols-2`. |
| `requirementPaths` mit fünf Karten bricht bestehendes Layout. | medium | TP entscheidet: fünf Karten in `sm:grid-cols-2 lg:grid-cols-3` oder Verified Change als Hinweis in Narrow Bug Track. |
| Nav-Layout bietet keinen Platz für `#depth-choice`-Link. | low | Section-ID reicht; Nav-Link optional. |

## 9. Implementation Boundary

Nur `pages/src/data/site.ts` und `pages/src/pages/index.astro` dürfen geändert werden. Keine Änderung an `plugin/**`, `create-agdf/**`, `evals/**`, Runtime-Contracts, Skills oder ausführbarem Code. Keine neue Route, kein neues Komponentensystem, kein neuer Runtime-Entscheidungspunkt. `evaluationEvidence.ts` nur Konsistenzprüfung, keine semantische Änderung.

## 10. Non-Goals

- Keine UX-Intent-Definition (UI/UX-Impact `low`, Intent eindeutig; Brownfield Review `ux_intent_definition_required: no`).
- Keine Änderung an Runtime-Contract-Semantik, Agent-Routing, Approvals oder Skill-Verhalten.
- Keine neue Produktpolicy in Pages.
- Keine Behauptung garantierter semantischer Modellbefolgung auf Live-Hosts.
- Kein vollständiges Pages-Redesign.

## 11. Required Next Step

Dieses Solution Design prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: SD`

Danach folgt Task/Test Plan in Slice-Tiefe (Task-IDs, Evidence-Plan, Test-Matrix für Copy/Daten/Render/Build/Accessibility). Es ist noch keine Implementierung erlaubt.
